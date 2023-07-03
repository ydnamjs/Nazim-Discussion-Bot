import { Client, ForumChannel, Message, MessageReaction, User } from "discord.js";
import loadDash from "lodash";
import { AwardSpecs, CommentSpecs, DiscussionSpecs, PostSpecs, ScorePeriod, StudentScoreData } from "../../../generalModels/DiscussionScoring";
import { userHasRoleWithId } from "../../../generalUtilities/RoleUtilities";
import { getChannelInMainGuild } from "../../../generalUtilities/getChannelInMain";
import { wait } from "../../../generalUtilities/wait";

export async function scoreAllThreads(client: Client, forumId: string, discussionSpecs: DiscussionSpecs, staffId: string) {

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

function addScorePeriodArrays(scorePeriodsA: ScorePeriod[], scorePeriodsB: ScorePeriod[]) {

    if(scorePeriodsA.length !== scorePeriodsB.length) {
        throw new Error("ERROR CANNOT ADD TWO SCORE PERIOD ARRAYS OF DIFFERENT LENGTH");
    }

    const combinedScorePeriods = scorePeriodsA.map((_scorePeriod, index) => {
        return addScorePeriods(scorePeriodsA[index], scorePeriodsB[index])
    })

    return combinedScorePeriods;
}

export function addScorePeriods(scorePeriodA: ScorePeriod, scorePeriodB: ScorePeriod) {
    
    const EMPTY_SCORE_VALUE: StudentScoreData = {
        score: 0,
        numPosts: 0,
        numIncomPost: 0,
        numComments: 0,
        numIncomComment: 0,
        awardsRecieved: 0,
        penaltiesRecieved: 0
    }

    let combinedScorePeriod = loadDash.cloneDeep(scorePeriodA);
    combinedScorePeriod.studentScores = new Map<string, StudentScoreData>();

    const periodAKeys = [...scorePeriodA.studentScores.keys()]
    const periodBKeys = [...scorePeriodB.studentScores.keys()]

    periodAKeys.forEach(key => {
        combinedScorePeriod.studentScores.set(key, EMPTY_SCORE_VALUE)
    });

    periodBKeys.forEach(key => {
        combinedScorePeriod.studentScores.set(key, EMPTY_SCORE_VALUE)
    });

    const unionedKeys = [...combinedScorePeriod.studentScores.keys()]

    unionedKeys.forEach((key) => {

        const aScoreData = scorePeriodA.studentScores.get(key)
        const bScoreData = scorePeriodB.studentScores.get(key)

        if(aScoreData) {
            combinedScorePeriod.studentScores.set(key, addStudentScores(combinedScorePeriod.studentScores.get(key) as StudentScoreData, aScoreData, combinedScorePeriod.maxPoints))
        }
        if(bScoreData) {
            combinedScorePeriod.studentScores.set(key, addStudentScores(combinedScorePeriod.studentScores.get(key) as StudentScoreData, bScoreData, combinedScorePeriod.maxPoints))
        }
    })

    return combinedScorePeriod;
}

function addStudentScores(studentScoreA: StudentScoreData, studentScoreB: StudentScoreData, periodMax: number): StudentScoreData {

    return {
        score: Math.min(studentScoreA.score + studentScoreB.score, periodMax),
        numPosts: studentScoreA.numPosts + studentScoreB.numPosts,
        numIncomPost: studentScoreA.numIncomPost + studentScoreB.numIncomPost,
        numComments: studentScoreA.numComments + studentScoreB.numComments,
        numIncomComment: studentScoreA.numIncomComment + studentScoreB.numIncomComment,
        awardsRecieved: studentScoreA.awardsRecieved + studentScoreB.awardsRecieved,
        penaltiesRecieved: studentScoreA.penaltiesRecieved + studentScoreB.penaltiesRecieved,
    }
}

/**
 * @interface - options for scoring a thread
 * @property {Date} before - the date which the post / all comments have to be made before to be counted in scoring
 * @property {Date} after - the date which the post / all comments have to be made after to be counted in scoring
 */
export interface ScoreThreadOptions {
    before: Date,
    after: Date
}

/**
 * @function scores every post and comment in a thread
 * @param {Client} client - the client performing the scoring functions
 * @param {string} threadId - the id of the thread being scored
 * @param {DiscussionSpecs} discussionSpecs - the specification used to score posts and comments
 * @param {string} staffId - the id of the role for staff members of the course
 * @param {Partial<ScoreThreadOptions>} options - **optional** custom options to alter how the thread is scored
 * @param {Date} options.before **optional** the date which the post / all comments have to be made before to be counted in scoring
 * @param {Date} options.after **optional** the date which the post / all comments have to be made after to be counted in scoring
 * @returns {Promise<ScorePeriod[]>}
 */
export async function scoreThread(client: Client, threadId: string, discussionSpecs: DiscussionSpecs, staffId: string, customPeriods?: ScorePeriod[], options?: Partial<ScoreThreadOptions>): Promise<ScorePeriod[]> {
    
    const postSpecs = discussionSpecs.postSpecs;
    const commentSpecs = discussionSpecs.commentSpecs;
    const periods = loadDash.cloneDeep(customPeriods ? customPeriods : discussionSpecs.scorePeriods) // Make a deep copy so we dont overwrite when scoring multiple threads

    periods.forEach((period) => wipeStudentScores(period));

    // FIXME: Currently this leads to some werid behavior with giving points for comments made in later score periods due to the options feature
    // still waiting to here back from nazim about how those points should be factored in (points go to post's score period or comment made's score period)
    // might just do a boolean value and let the user switch between as they please (if this fixme is fixed delete the one that is also on line 318-320)
    const messages = await getThreadMessages(client, threadId, options)

    //console.log(messages.length);

    const commentScoredPeriods = await scoreComments(messages, periods, commentSpecs, staffId)

    const originalPost = await getPostMessage(client, threadId, options);

    if(originalPost) {

        const postPeriod = commentScoredPeriods.find((period) => {
            return originalPost.createdAt.valueOf() > period.start.valueOf() && originalPost.createdAt.valueOf() < period.end.valueOf()
        })

        if(postPeriod){
            const postScoreData = await scorePost(originalPost, messages, postSpecs, staffId)
            handlePeriodScoreUpdate(postPeriod, originalPost.author.id, postScoreData, false)
        }
    }

    return periods;
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
    const MESSAGE_FETCH_LIMIT = 10; // this is the limit enforced by discord
    const MESSAGE_FETCH_DELAY = 1000 // TODO: Make this not 0 when done testing 

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

async function getPostMessage(client: Client, threadId: string, options?: Partial<ScoreThreadOptions>) {
    
    const ERROR_RETURN = undefined;

    const threadChannel = await getChannelInMainGuild(client, threadId)

    if(!threadChannel || !threadChannel.isTextBased())
        return ERROR_RETURN;

    const post = await threadChannel.messages.fetch(threadId); // this works because the first message in a thread shares it's id with the thread

    if(post && options && options.before && post.createdAt.valueOf() > options.before.valueOf())
        return undefined

    if(post && options && options.after && post.createdAt.valueOf() < options.after.valueOf())
        return undefined

    return post;
}

/**
 * @interface scoring information about a post or comment
 * @property {number} score - the amount of points awarded to the student for the post or comment
 * @property {boolean} passedLength - whether the post or comment met the length requirement specified in the course it belongs to
 * @property {boolean} passedParagraph - whether the post or comment met the paragraph requirement specified in the course it belongs to
 * @property {boolean} passedLinks - whether the post or comment met the link requirement specified in the course it belongs to
 * @property {number} numAwards - the number of awards the post recieved
 * @property {number} numPenalties - the number of penalties the post recieved
 */
export interface MessageScoreData { 
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

export async function scoreComment(message: Message, periods: ScorePeriod[], commentSpecs: CommentSpecs, staffId: string) {

    const author = message.author
    const scoreData = await scoreDiscussionMessage(message, commentSpecs, staffId);
    const createdAt = message.createdAt

    const properPeriod = periods.find((period) => {
        return createdAt.valueOf() > period.start.valueOf() && createdAt.valueOf() < period.end.valueOf()
    })

    if(properPeriod) {
        handlePeriodScoreUpdate(properPeriod, author.id, scoreData, true)
    }
}

async function scorePost(message: Message, comments: Message[], postSpecs: PostSpecs, staffId: string) {
    
    const postAuthor = message.author
    const scoreData = await scoreDiscussionMessage(message, postSpecs, staffId);

    // we wouldnt want posters to recieve extra points for comments they leave
    const commentsFiltered = comments.filter(comment => comment.author.id !== postAuthor.id)

    // FIXME: Currently this leads to some werid behavior with giving points for comments made in later score periods due to the options feature
    // still waiting to here back from nazim about how those points should be factored in (points go to post's score period or comment made's score period)
    // might just do a boolean value and let the user switch between as they please (if this fixme is fixed delete the one that is also on lines 159 - 161)
    scoreData.score += commentsFiltered.length * postSpecs.commentPoints;

    return scoreData;
}

/**
 * @function scores a post or comment based on the specs provided (DOES NOT SCORE POST COMMENT POINTS)
 * @param message - the post or comment to be scored
 * @param messageSpecs - the specifications to use when scoring
 * @param staffId - the role id of course staff members
 * @returns {MessageScoreData} messageScoreData - information about the scoring of the post or comment
 */
export async function scoreDiscussionMessage(message: Message, messageSpecs: CommentSpecs | PostSpecs, staffId: string): Promise<MessageScoreData> {
    
    const messageScoreData = scoreDiscussionContent(message.content, messageSpecs)

    const reactions = [...message.reactions.cache.values()];
    const awards = messageSpecs.awards;
    
    const awardScoreData = await scoreMessageAwards(reactions, awards, staffId);

    messageScoreData.score += awardScoreData.score;
    messageScoreData.numAwards += awardScoreData.numAwards;
    messageScoreData.numPenalties += awardScoreData.numPenalties;

    return messageScoreData;
}

function handlePeriodScoreUpdate(period: ScorePeriod, studentId: string, updateScoreData: MessageScoreData, isCommentUpdate: boolean) {
        
    let studentScoreData = period.studentScores.get(studentId)
        
    if(studentScoreData) {
    
        studentScoreData.score = Math.min(studentScoreData.score + updateScoreData.score, period.maxPoints);
        studentScoreData.numPosts += isCommentUpdate ? 0 : 1;
        if(isIncomplete(updateScoreData) && !isCommentUpdate) 
            studentScoreData.numIncomPost += 1;
        studentScoreData.numComments += isCommentUpdate ? 1 : 0;
        if(isIncomplete(updateScoreData) && isCommentUpdate) 
            studentScoreData.numIncomComment += 1;
        studentScoreData.awardsRecieved += updateScoreData.numAwards;
        studentScoreData.penaltiesRecieved += updateScoreData.numPenalties;
        return
    }
        
    period.studentScores.set(studentId,
        {
            score: updateScoreData.score,
            numPosts: isCommentUpdate ? 0 : 1,
            numIncomPost: isCommentUpdate ? 0 : isIncomplete(updateScoreData) ? 1 : 0,
            numComments: isCommentUpdate ? 1 : 0,
            numIncomComment: isCommentUpdate ? isIncomplete(updateScoreData) ? 1 : 0 : 0,
            awardsRecieved: updateScoreData.numAwards,
            penaltiesRecieved: updateScoreData.numPenalties
        }
    )
}

function isIncomplete(scoreData: MessageScoreData): boolean {
    
    return (!scoreData.passedLength || !scoreData.passedLinks || !scoreData.passedParagraph)
}

/**
 * @function calculates the score of the comment or post's content based on the requirements specified in the specs
 * @param {string} content - the content of the post or comment to be scored
 * @param {CommentSpecs | PostSpecs} specs - the specifications to score the comment or post with
 * @returns {MessageScoreData} messageScoreData - data containing information about the scoring of the comment or post
 * @returns {number} messageScoreData.score - the amount of points awarded to the student for the post or comment
 */
export function scoreDiscussionContent(content: string, specs: CommentSpecs | PostSpecs): MessageScoreData {

    const contentTrimmed = (content.replace(/[\r\n]+/g, '\n')).trim();
    const contentNoEmpty = contentTrimmed.replace(/[\s]+/g, '');

    let score = 0;

    const passedLength = contentNoEmpty.length >= specs.minLength;
    const passedParagraph = countParagraphs(contentTrimmed) >= specs.minParagraphs;
    const passedLinks = countLinks(contentTrimmed) >= specs.minLinks;

    if(passedLength && passedParagraph && passedLinks) {
        score = specs.points;    
    }

    return {score, passedLength, passedParagraph, passedLinks, numAwards: 0, numPenalties: 0};
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