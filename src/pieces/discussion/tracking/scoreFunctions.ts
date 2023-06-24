import { ChannelType, Client, Message, MessageReaction } from "discord.js";
import { AwardSpecs, CommentSpecs, DiscussionSpecs, PostSpecs, ScorePeriod, StudentScoreData as StudentScoreData } from "../../../generalModels/DiscussionScoring";
import { userHasRoleWithId } from "../../../generalUtilities/GetRolesOfUserInGuild";
import { GUILDS } from "../../../secret";
import { wait } from "../../../generalUtilities/wait";

//TODO: JSDOC
export interface ScoreThreadOptions {
    before: Date,
    after: Date
}

//TODO: JSDOC
export async function scoreThread(client: Client, threadId: string, discussionSpecs: DiscussionSpecs, options: Partial<ScoreThreadOptions>): Promise<ScorePeriod[]> {
    
    const postSpecs = discussionSpecs.postSpecs;
    const commentSpecs = discussionSpecs.commentSpecs;
    const periods = [...discussionSpecs.scorePeriods]; // unpack the periods to make a deep copy so we dont overwrite the real ones in a shallow copy

    periods.forEach((period) => wipeStudentScores(period));

    return periods
}

function wipeStudentScores(period: ScorePeriod) {
    period.studentScores = new Map<string, StudentScoreData>();
}

// debatable whether this should have a separate options interface since in the future score thread may have different options
export async function getThreadMessages(client: Client, threadId: string, options?: Partial<ScoreThreadOptions>) {
    
    // LIMIT / (DELAY / 1000) = MESSAGES PER SECOND
    // we have to create some limit so that getting messages from a thread doesn't eat up all of the rate limit
    // Im not sure if it's possible but if we could make this depend on message count of a thread it might be faster to do many threads at once?
    // perhaps also a number that is passed in that keeps track of the number of requests made so that smaller threads dont eat up a whole thread delay for 3 messages?
    const MESSAGE_FETCH_LIMIT = 10; // this is the limit enforced by discord
    const MESSAGE_FETCH_DELAY = 1000 

    const ERROR_RETURN: never[] = []

    const guild = client.guilds.cache.get(GUILDS.MAIN);

    if(!guild) {
        return ERROR_RETURN;
    }

    const thread = await guild.channels.fetch(threadId)

    if(thread === null) {
        return ERROR_RETURN;
    }

    const threadChannel = await (await thread.fetch()).fetch()

    if(!threadChannel.isTextBased())
        return ERROR_RETURN;


    let messages: Message[] = [];
    
    const fetchedMessages = [...(await threadChannel.messages.fetch({limit: MESSAGE_FETCH_LIMIT})).values()];
    messages.push(...fetchedMessages);
    let lastFetchedMessage = fetchedMessages.length !== 0 ? fetchedMessages[fetchedMessages.length - 1] : undefined;

    while (lastFetchedMessage) {
        
        await wait(MESSAGE_FETCH_DELAY)
        
        const fetchedMessages = [...(await threadChannel.messages.fetch({limit: MESSAGE_FETCH_LIMIT, before: lastFetchedMessage.id})).values()];
        messages.push(...fetchedMessages);

        if(options && lastFetchedMessage && options.after && lastFetchedMessage.createdAt.valueOf() < options.after.valueOf() ) {
            removeMessagesAfterDate(messages, options.after);
            break;
        }
        
        lastFetchedMessage = fetchedMessages.length !== 0 ? fetchedMessages[fetchedMessages.length - 1] : undefined;
    }

    if(options && options.before) {
        removeMessagesBeforeDate(messages, options.before);
    }

    console.log(messages.map((message) => { return message.content }));
}

function removeMessagesAfterDate(messages: Message[], date: Date) {
    
    while(messages.length && messages[messages.length - 1].createdAt.valueOf() < date.valueOf()) {
        messages.pop()
    }

}

function removeMessagesBeforeDate(messages: Message[], date: Date) {
    while(messages.length && messages[0].createdAt.valueOf() > date.valueOf()) {
        messages.shift()
    }
}

/**
 * @interface scoring information about a post or comment
 * @property {number} score - the amount of points awarded to the student for the post or comment
 * @property {boolean} passedLength - whether the post or comment met the length requirement specified in the course it belongs to
 * @property {boolean} passedParagraph - whether the post or comment met the paragraph requirement specified in the course it belongs to
 * @property {boolean} passedLinks = whether the post or comment met the link requirement specified in the course it belongs to
 */
export interface ScoreData { 
    score: number,
    passedLength: boolean,
    passedParagraph: boolean,
    passedLinks: boolean
}

export async function scoreDiscussionItem(comment: Message, itemSpecs: CommentSpecs | PostSpecs, staffId: string): Promise<ScoreData> {
    
    const scoreData = scoreDiscussionContent(comment.content, itemSpecs)

    const reactions = [...comment.reactions.cache.values()];
    const awards = itemSpecs.awards;
    scoreData.score += await scoreAllAwards(reactions, awards, staffId);

    return scoreData;
}

/**
 * @function calculates the score of the comment or post's content based on the requirements specified in the specs
 * @param {string} content - the content of the post or comment to be scored
 * @param {CommentSpecs | PostSpecs} specs - the specifications to score the comment or post with
 * @returns {object} scoreInfo - object containing information about the scoring of the comment or post
 * @property {number} scoreInfo.score - the number of points that the content of the comment or post earned based on the scoring specification
 * @property {ScoreChecks} scoreInfo.scoreChecks - object containing information about which requirements the comment or post met (useful for giving feedback to students whose comments or posts did not meet the requirements) [see Scorechecks interface in scoreFunction.ts]
 */
export function scoreDiscussionContent(content: string, specs: CommentSpecs | PostSpecs): ScoreData {
    // remove multiple new lines in a row and newlines and spaces at the end
    const contentTrimmed = (content.replace(/[\r\n]+/g, '\n')).trim();
    // remove all empty spaces
    const contentNoEmpty = contentTrimmed.replace(/[\s]+/g, '');

    let score = 0;

    const passedLength = contentNoEmpty.length >= specs.minLength;
    const passedParagraph = countParagraphs(contentTrimmed) >= specs.minParagraphs;
    const passedLinks = countLinks(contentTrimmed) >= specs.minLinks;

    // if all the checks are met, award the points
    if(passedLength && passedParagraph && passedLinks) {
        score = specs.points;    
    }

    return {score, passedLength, passedParagraph, passedLinks}

}

function countParagraphs(content: string):number {
    const countArr =  content.match(/\n+/g || [])
    
    if(!countArr) {
        return 1;
    }
    
    return countArr.length + 1;
}

function countLinks(content: string):number {
    const countArr =  content.match(/http+/g || [])
    
    if(!countArr) {
        return 0;
    }
    
    return countArr.length;
}

async function scoreAllAwards(reactions: MessageReaction[], awards: Map<string, AwardSpecs>, staffId: string): Promise<number> {
    
    let totalAwardScore = 0;
    
     for (const reaction of reactions) {

        // get the award specs for the given award
        const awardSpecs = awards.get(reaction.emoji.toString())

        // if the award specs exist, then the reaction is a real award
        if(awardSpecs) {
            
            // if students can give the award, then every person who reacted counts
            if(awardSpecs.trackStudents){
                totalAwardScore += awardSpecs.points * [...(await reaction.users.fetch())].length;
            }

            // award points only for staff members that reacted
            else {
                const reactors = [...(await reaction.users.fetch()).values()];
                
                for (const reactor of reactors) {
                    if( await userHasRoleWithId(reactor, staffId)) {
                        totalAwardScore += awardSpecs.points;
                    }
                }
            }
        }
    }

    return totalAwardScore;
}