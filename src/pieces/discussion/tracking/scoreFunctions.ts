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
export async function scoreThread(client: Client, threadId: string, discussionSpecs: DiscussionSpecs, staffId: string, options: Partial<ScoreThreadOptions>): Promise<ScorePeriod[]> {
    
    const postSpecs = discussionSpecs.postSpecs;
    const commentSpecs = discussionSpecs.commentSpecs;
    const periods = [...discussionSpecs.scorePeriods]; // unpack the periods to make a deep copy so we dont overwrite the real ones in a shallow copy

    periods.forEach((period) => wipeStudentScores(period));

    const messages = await getThreadMessages(client, threadId, options)

    console.log(messages.length);

    const commentScores = await scoreComments(messages, periods, commentSpecs, staffId)

    console.log(commentScores[0].studentScores);

    //TODO: Implement adding of scores to periods
    return periods
}

function wipeStudentScores(period: ScorePeriod) {
    period.studentScores = new Map<string, StudentScoreData>();
}

// debatable whether this should have a separate options interface since in the future score thread may have different options
async function getThreadMessages(client: Client, threadId: string, options?: Partial<ScoreThreadOptions>) {
    
    // LIMIT / (DELAY / 1000) = MESSAGES PER SECOND
    // we have to create some limit so that getting messages from a thread doesn't eat up all of the rate limit
    // Im not sure if it's possible but if we could make this depend on message count of a thread it might be faster to do many threads at once?
    // perhaps also a number that is passed in that keeps track of the number of requests made so that smaller threads dont eat up a whole thread delay for 3 messages?
    const MESSAGE_FETCH_LIMIT = 100; // this is the limit enforced by discord
    const MESSAGE_FETCH_DELAY = 1 // TODO: Make this not 0 when done testing 

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

        // we catch the after here and stop early to prevent wasting fetches on messages that would be removed
        // we do have to remove messages between the end of the wave and start in case some of those are also after
        // TODO: we might be able to remove the need for this by fetching messages one at and breaking on the one that is in violation of the after
        if(options && lastFetchedMessage && options.after && lastFetchedMessage.createdAt.valueOf() < options.after.valueOf() ) {
            removeMessagesAfterDate(messages, options.after);
            break;
        }
        
        lastFetchedMessage = fetchedMessages.length !== 0 ? fetchedMessages[fetchedMessages.length - 1] : undefined;
    }

    if(options && options.before) {
        removeMessagesBeforeDate(messages, options.before);
    }

    return messages;
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
    passedLinks: boolean,
    numAwards: number,
    numPenalties: number
}

async function scoreComments(messages: Message[], periods: ScorePeriod[], commentSpecs: CommentSpecs, staffId: string): Promise<ScorePeriod[]> {
    
    for (let message of messages) {
        await scoreComment(message, periods, commentSpecs, staffId)
    }

    return periods;
}

async function scoreComment(message: Message, periods: ScorePeriod[], commentSpecs: CommentSpecs, staffId: string) {

    const author = message.author
    const scoreData = await scoreDiscussionItem(message, commentSpecs, staffId);
    const createdAt = message.createdAt

    const properPeriod = periods.find((period) => {
        return createdAt.valueOf() > period.start.valueOf() && createdAt.valueOf() < period.end.valueOf()
    })

    if(properPeriod) {
        handlePeriodCommentScoreUpdate(properPeriod, author.id, scoreData)
    }
}

export async function scoreDiscussionItem(comment: Message, itemSpecs: CommentSpecs | PostSpecs, staffId: string): Promise<ScoreData> {
    
    const scoreData = scoreDiscussionContent(comment.content, itemSpecs)

    const reactions = [...comment.reactions.cache.values()];
    const awards = itemSpecs.awards;
    
    const awardScoreData = await scoreAllAwards(reactions, awards, staffId);

    scoreData.score += awardScoreData.score;
    scoreData.numAwards += awardScoreData.numAwards;
    scoreData.numPenalties += awardScoreData.numPenalties;

    if(scoreData.score > 0)
        console.log(scoreData)

    return scoreData;
}

function handlePeriodCommentScoreUpdate(period: ScorePeriod, studentId: string, commentScoreData: ScoreData) {
    
    let studentScoreData = period.studentScores.get(studentId)
    
    if(studentScoreData) {

        studentScoreData.score += commentScoreData.score;
        studentScoreData.numComments += 1;
        if(isIncomplete(commentScoreData)) 
            studentScoreData.numIncomComment += 1;
        studentScoreData.awardsRecieved += commentScoreData.numAwards;
        studentScoreData.penaltiesRecieved += commentScoreData.numPenalties;
    }
    else {
        
        period.studentScores.set(studentId,
            {
                score: commentScoreData.score,
                numComments: 1,
                numIncomComment: isIncomplete(commentScoreData) ? 1 : 0,
                numPosts: 0,
                numIncomPost: 0,
                awardsRecieved: commentScoreData.numAwards,
                penaltiesRecieved: commentScoreData.numPenalties
            }
        )
    }
}

function isIncomplete(scoreData: ScoreData): boolean {
    return (!scoreData.passedLength || !scoreData.passedLinks || !scoreData.passedParagraph)
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

    return {score, passedLength, passedParagraph, passedLinks, numAwards: 0, numPenalties: 0}

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

interface AwardScoreData {
    score: number,
    numAwards: number,
    numPenalties: number
}

//TODO: CLEAN THIS MESS UP
async function scoreAllAwards(reactions: MessageReaction[], awards: Map<string, AwardSpecs>, staffId: string): Promise<AwardScoreData> {
    
    let totalAwardScore = 0;
    let numAwards = 0;
    let numPenalties = 0;

     for (const reaction of reactions) {

        // get the award specs for the given award
        const awardSpecs = awards.get(reaction.emoji.toString())

        // if the award specs exist, then the reaction is a real award
        if(awardSpecs) {
            
            // if students can give the award, then every person who reacted counts
            if(awardSpecs.trackStudents){
                const numGivers = [...(await reaction.users.fetch())].length;
                totalAwardScore += awardSpecs.points * numGivers;
                if(awardSpecs.points > 0)
                    numAwards += numGivers;
                if(awardSpecs.points < 0)
                    numPenalties += numGivers
            }

            // award points only for staff members that reacted
            else {
                const reactors = [...(await reaction.users.fetch()).values()];
                
                for (const reactor of reactors) {
                    if( await userHasRoleWithId(reactor, staffId)) {
                        totalAwardScore += awardSpecs.points;
                        if(awardSpecs.points > 0)
                            numAwards += 1;
                        if(awardSpecs.points < 0)
                            numPenalties += 1
                    }
                }
            }
        }
    }

    return {score: totalAwardScore, numAwards: numAwards, numPenalties: numPenalties};
}