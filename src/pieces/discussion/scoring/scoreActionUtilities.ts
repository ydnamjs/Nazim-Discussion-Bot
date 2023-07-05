import { Message } from "discord.js";
import { ScorePeriod } from "../../../generalModels/DiscussionScoring";
import { MessageScoreData } from "./scoringUtilities";

export const SCORING_ERROR_MESSAGE = "Scoring Error; Contact Admin";

// SECTION TEXT TODO: Rename me
export function findMessagePeriod(message: Message, periods: ScorePeriod[]): ScorePeriod | undefined {
    return periods.find( (period) => { return message.createdAt.valueOf() > period.start.valueOf() && message.createdAt.valueOf() < period.end.valueOf() })
}

// SECTION TEXT TODO: Rename me
export function addPostScoreToPeriod(postScoreData: MessageScoreData, period: ScorePeriod, posterId: string ) {
        
    let studentScoreData = period.studentScores.get(posterId)
        
    if(studentScoreData) {
    
        studentScoreData.score = Math.min(studentScoreData.score + postScoreData.score, period.maxPoints);
        studentScoreData.numPosts += 1;
        studentScoreData.numIncomPost += isIncomplete(postScoreData) ? 1 : 0;
        studentScoreData.awardsRecieved += postScoreData.numAwards;
        studentScoreData.penaltiesRecieved+= postScoreData.numPenalties;
        return
    }
        
    period.studentScores.set(posterId,
        {
            score: postScoreData.score,
            numPosts: 1,
            numIncomPost: isIncomplete(postScoreData) ? 1 : 0,
            numComments: 0,
            numIncomComment: 0,
            awardsRecieved: postScoreData.numAwards,
            penaltiesRecieved: postScoreData.numPenalties
        }
    )
}

export function addCommentScoreToPeriod(commentScoreData: MessageScoreData, period: ScorePeriod, commenterId: string ) {
        
    let studentScoreData = period.studentScores.get(commenterId)
        
    if(studentScoreData) {
    
        studentScoreData.score = Math.min(studentScoreData.score + commentScoreData.score, period.maxPoints);
        studentScoreData.numComments += 1;
        studentScoreData.numIncomComment += isIncomplete(commentScoreData) ? 1 : 0;
        studentScoreData.awardsRecieved += commentScoreData.numAwards;
        studentScoreData.penaltiesRecieved+= commentScoreData.numPenalties;
        return
    }
        
    period.studentScores.set(commenterId,
        {
            score: commentScoreData.score,
            numPosts: 0,
            numIncomPost: 0,
            numComments: 1,
            numIncomComment: isIncomplete(commentScoreData) ? 1 : 0,
            awardsRecieved: commentScoreData.numAwards,
            penaltiesRecieved: commentScoreData.numPenalties
        }
    )
}

export function isIncomplete(scoreData: MessageScoreData): boolean {
    
    return (!scoreData.passedLength || !scoreData.passedLinks || !scoreData.passedParagraph)
}

// SECTION TEXT TODO: Rename me
export function addCommentToPosterScore(period: ScorePeriod, posterId: string, spawnedCommentPoints: number) {

    let studentScoreData = period.studentScores.get(posterId)
        
    if(studentScoreData) {
    
        studentScoreData.score = Math.min(studentScoreData.score + spawnedCommentPoints, period.maxPoints);
        return
    }
        
    period.studentScores.set(posterId,
        {
            score: Math.min(spawnedCommentPoints, period.maxPoints),
            numPosts: 0,
            numIncomPost: 0,
            numComments: 0,
            numIncomComment: 0,
            awardsRecieved: 0,
            penaltiesRecieved: 0
        }
    )
}