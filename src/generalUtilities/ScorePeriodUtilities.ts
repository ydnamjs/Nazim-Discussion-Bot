import loadDash from "lodash";
import { ScorePeriod, StudentScoreData } from "../generalModels/DiscussionScoring";

/**
 * @function sorts periods and returns the sorted periods. Not that sorting mutates the original array of periods as it uses the Array.sort function
 * @param {ScorePeriod[]} periods - the periods to be sorted
 * @returns {ScorePeriod[]} sorted periods - 
 */
export function sortPeriods(periods: ScorePeriod[]): ScorePeriod[] {

    return periods.sort((a, b) => {return a.start.valueOf() - b.start.valueOf()});
}

// Adding Score Period Arrays
export function addScorePeriodArrays(scorePeriodsA: ScorePeriod[], scorePeriodsB: ScorePeriod[]) {

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

export function addStudentScores(studentScoreA: StudentScoreData, studentScoreB: StudentScoreData, periodMax: number): StudentScoreData {

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