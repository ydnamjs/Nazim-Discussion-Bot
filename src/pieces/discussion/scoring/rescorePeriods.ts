import { Client, ForumChannel, Message, MessageReaction, User } from "discord.js";
import loadDash from "lodash";
import { AwardSpecs, CommentSpecs, DiscussionSpecs, PostSpecs, ScorePeriod, StudentScoreData } from "../../../generalModels/DiscussionScoring";
import { userHasRoleWithId } from "../../../generalUtilities/RoleUtilities";
import { getChannelInMainGuild } from "../../../generalUtilities/getChannelInMain";
import { wait } from "../../../generalUtilities/wait";
import { addCommentScoreToPeriod, addCommentToPosterScore, addPostScoreToPeriod, findMessagePeriod } from "./scoreActionUtilities";
import { MessageScoreData, scoreDiscussionContent } from "./scoringUtilities";
import { addScorePeriodArrays } from "../../../generalUtilities/ScorePeriodUtilities";

export async function rescoreDiscussion(client: Client, forumId: string, discussionSpecs: DiscussionSpecs, staffId: string) {

    // TODO: Add before and after consideration to not fetch unnecessary thread messages
    const threads = await getAllDiscussionThreads(client, forumId);

    if(!threads)
        return

    let totalScorePeriods: ScorePeriod[] = loadDash.cloneDeep(discussionSpecs.scorePeriods);
    totalScorePeriods.forEach((scorePeriod) => {
        wipeStudentScores(scorePeriod);
    })

    let lockedThreads = [];
    for(let thread of threads) {
        lockedThreads.push(await thread.setLocked(true));
    }

    for(const thread of threads) {
        const threadScoresPeriods = await scoreThread(client, thread.id, discussionSpecs, staffId);
        totalScorePeriods = addScorePeriodArrays(totalScorePeriods, threadScoresPeriods);
    }

    for(const lockedThread of lockedThreads) {
        await lockedThread.setLocked(false);
    }

    return totalScorePeriods;
}

async function getAllDiscussionThreads(client: Client, channelId: string) {

    const forumChannel = await getChannelInMainGuild(client, channelId);

    if(!forumChannel || !(forumChannel instanceof ForumChannel)) {
        return undefined;
    }
    
    const forumThreads = [...forumChannel.threads.cache.values()];

    return forumThreads;
}

function wipeStudentScores(period: ScorePeriod) {
    period.studentScores = new Map<string, StudentScoreData>();
}

async function scoreThread(client: Client, threadId: string, discussionSpecs: DiscussionSpecs, staffId: string): Promise<ScorePeriod[]> {
    
    const clonedSpecs = loadDash.cloneDeep(discussionSpecs) // Make a deep copy so we dont overwrite when scoring multiple threads

    clonedSpecs.scorePeriods.forEach((period) => wipeStudentScores(period));

    // TODO: Add before and after consideration to not fetch unnecessary thread messages
    const messages = await getThreadMessages(client, threadId)

    //console.log(messages.length);

    const originalPost = await getPostMessage(client, threadId);

    await scoreComments(messages, clonedSpecs, staffId, originalPost?.author.id)

    if(originalPost) {
        await rescorePost(originalPost, clonedSpecs, staffId)
    }

    return clonedSpecs.scorePeriods;
}

// GET THREAD MESSAGES AND HELPERS
async function getThreadMessages(client: Client, threadId: string) {
    
    // LIMIT / (DELAY / 1000) = MESSAGES PER SECOND
    // we have to create some limit so that getting messages from a thread doesn't eat up all of the rate limit
    // Im not sure if it's possible but if we could make this depend on message count of a thread it might be faster to do many threads at once?
    // perhaps also a number that is passed in that keeps track of the number of requests made so that smaller threads dont eat up a whole thread delay for 3 messages?
    const MESSAGE_FETCH_LIMIT = 10; // this is the limit enforced by discord
    const MESSAGE_FETCH_DELAY = 100 // TODO: Make this not 0 when done testing 

    const ERROR_RETURN: never[] = [];

    const threadChannel = await getChannelInMainGuild(client, threadId)

    if(!threadChannel || !threadChannel.isTextBased())
        return ERROR_RETURN;

    let messages: Message[] = [];
    
    const fetchedMessages = [...(await threadChannel.messages.fetch({limit: MESSAGE_FETCH_LIMIT})).values()];
    messages.push(...fetchedMessages);
    let lastFetchedMessage = fetchedMessages.length !== 0 ? fetchedMessages[fetchedMessages.length - 1] : undefined;

    while (lastFetchedMessage) {
        
        await wait(MESSAGE_FETCH_DELAY)
        
        const fetchedMessages = [...(await threadChannel.messages.fetch({limit: MESSAGE_FETCH_LIMIT, before: lastFetchedMessage.id})).values()];
        messages.push(...fetchedMessages);

        /*
        // we catch the after here and stop early to prevent wasting fetches on messages that would be removed
        // we do have to remove messages between the end of the wave and start in case some of those are also after
        // TODO: we might be able to remove the need for this by fetching messages one at and breaking on the one that is in violation of the after
        if(options && lastFetchedMessage && options.after && lastFetchedMessage.createdAt.valueOf() < options.after.valueOf() ) {
            removeMessagesAfterDate(messages, options.after);
            break;
        }
        */

        lastFetchedMessage = fetchedMessages.length !== 0 ? fetchedMessages[fetchedMessages.length - 1] : undefined;
    }

    /*
    if(options && options.before) {
        removeMessagesBeforeDate(messages, options.before);
    }
    */

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

// GET POST MESSAGE
async function getPostMessage(client: Client, threadId: string) {
    
    const ERROR_RETURN = undefined;

    const threadChannel = await getChannelInMainGuild(client, threadId)

    if(!threadChannel || !threadChannel.isTextBased())
        return ERROR_RETURN;

    const post = await threadChannel.messages.fetch(threadId); // this works because the first message in a thread shares it's id with the thread

    return post;
}

// SCORE COMMENTS
async function scoreComments(messages: Message[], discussionSpecs: DiscussionSpecs, staffId: string, posterId: string | undefined) {   
    for (let message of messages) {
        await rescoreComment(message, discussionSpecs, posterId, staffId)
    }
}

// RESCORE POST OR COMMENT
async function rescoreComment(message: Message, discussionSpecs: DiscussionSpecs, posterId: string | undefined, staffId: string) {

    const commentPeriod = findMessagePeriod(message, discussionSpecs.scorePeriods);

    if(!commentPeriod)
        return undefined
    
    const commentScoreData = await rescoreDiscussionMessage(message, discussionSpecs.commentSpecs, staffId);

    addCommentScoreToPeriod(commentScoreData, commentPeriod, message.author.id);

    if(posterId && posterId !== message.author.id)
        addCommentToPosterScore(commentPeriod, posterId, discussionSpecs.postSpecs.commentPoints)
}

async function rescorePost(message: Message, discussionSpecs: DiscussionSpecs, staffId: string) {
    
    const commentPeriod = findMessagePeriod(message, discussionSpecs.scorePeriods);

    if(!commentPeriod)
        return undefined
    
    const commentScoreData = await rescoreDiscussionMessage(message, discussionSpecs.postSpecs, staffId);

    addPostScoreToPeriod(commentScoreData, commentPeriod, message.author.id);

}

// RESCORE POST OR COMMENT HELPERS
async function rescoreDiscussionMessage(message: Message, messageSpecs: CommentSpecs | PostSpecs, staffId: string): Promise<MessageScoreData> {
    
    const messageScoreData = scoreDiscussionContent(message.content, messageSpecs)

    const reactions = [...message.reactions.cache.values()];
    const awards = messageSpecs.awards;
    
    const awardScoreData = await scoreMessageAwards(reactions, awards, staffId);

    messageScoreData.score += awardScoreData.score;
    messageScoreData.numAwards += awardScoreData.numAwards;
    messageScoreData.numPenalties += awardScoreData.numPenalties;

    return messageScoreData;
}

async function scoreMessageAwards(reactions: MessageReaction[], awards: Map<string, AwardSpecs>, staffId: string): Promise<AwardScoreData> {
    
    let totalAwardScore = 0;
    let totalAwards = 0;
    let totalPenalties = 0;

    for (const reaction of reactions) {
        const awardScoreData = await processPotentialAward(reaction, awards, staffId)
        totalAwardScore += awardScoreData.score;
        totalAwards += awardScoreData.numAwards;
        totalPenalties += awardScoreData.numPenalties;
    }

    return {score: totalAwardScore, numAwards: totalAwards, numPenalties: totalPenalties};
}

async function processPotentialAward(reaction: MessageReaction, awards: Map<string, AwardSpecs>, staffId: string ): Promise<AwardScoreData> {
    
    const awardSpecs = awards.get(reaction.emoji.toString())

    if(awardSpecs && awardSpecs.trackStudents) {
        return await handleStudentAward(reaction, awardSpecs)
    }

    if(awardSpecs) {
        
        const reactors = [...(await reaction.users.fetch()).values()];
        
        return await handleStaffAward(awardSpecs, reactors, staffId)
    }
    
    return {score: 0, numAwards: 0, numPenalties: 0};
}

async function handleStudentAward(reaction: MessageReaction, awardSpecs: AwardSpecs) {
 
    const numGivers = [...(await reaction.users.fetch())].length;
    
    return {
        score: awardSpecs.points * numGivers, 
        numAwards: awardSpecs.points > 0 ? numGivers : 0, 
        numPenalties: awardSpecs.points < 0 ? numGivers : 0
    };
}

async function handleStaffAward(awardSpecs: AwardSpecs, reactors: User[], staffId: string) {
    
    let numStaffGivers = 0;

    for (const reactor of reactors) {
        if( await userHasRoleWithId(reactor, staffId)) {
            numStaffGivers++;
        }
    }

    return {
        score: awardSpecs.points * numStaffGivers, 
        numAwards: awardSpecs.points > 0 ? numStaffGivers : 0, 
        numPenalties: awardSpecs.points < 0 ? numStaffGivers : 0
    };
}

interface AwardScoreData {
    score: number,
    numAwards: number,
    numPenalties: number
}