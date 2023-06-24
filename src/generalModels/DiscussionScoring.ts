/**
 * @interface specifications for how rewards should behave
 * @property {string} reaction - the string that represents the emoji used as the award
 * @property {number} points - the number of points given to the maker of the post or comment
 * @property {boolean} trackStudents - whether students can give this award or not
 */
export interface AwardSpecs {
    points: number,
    trackStudents: boolean
}

/**
 * @interface specifications on how posts should be scored
 * @property {number} points - the number of points for a post that meets the minLength, minParagraphs, and minLinks requirements
 * @property {number} commentPoints - the number of points for a comment that is made on the post
 * @property {number} minLength - the minimum number of characters needed for a post to earn points
 * @property {number} minParagraphs - the minimum number of paragraphs needed for a post to earn points
 * @property {number} minLinks - the minimum number of links needed for a post to earn points
 * @property {Map<string, AwardSpecs>} awards - a map of all the awards (key is the to string of the emoji for the award. values are the specs for the award)
 */
export interface PostSpecs {
    points: number,
    commentPoints: number,
    minLength: number,
    minParagraphs: number,
    minLinks: number,
    awards: Map<string, AwardSpecs>,
}

/**
 * @interface specifications on how comments should be scored
 * @property {number} points - the number of points for a comment that meets the minLength, minParagraphs, and minLinks requirements
 * @property {number} minLength - the minimum number of characters needed for a comment to earn points
 * @property {number} minParagraphs - the minimum number of paragraphs needed for a comment to earn points
 * @property {number} minLinks - the minimum number of links needed for a comment to earn points
 * @property {Award[]} awards - a list of all the awards that comments are elligible to earn
 */
export interface CommentSpecs {
    points: number,
    minLength: number,
    minParagraphs: number,
    minLinks: number,
    awards: Map<string, AwardSpecs>,
}

/**
 * @interface a defined period of time for which points can be accumalted
 * @property {Date} start - the date and time that posts and comments have to be made after to be in this score period
 * @property {Date} end - the date and time that posts and comments have to be made before to be in this score period
 * @property {number} goalPoints - the number of points the instructor defined as the target to meet
 * @property {number} maxPoints - the maximum number of points that can be earned in a score period (should not be less than goalPoints)
 * @property {Map} studentScores - the score info of each student for that score periods stored in a map of discord ids to score info
 */
export interface ScorePeriod {
    start: Date,
    end: Date,
    goalPoints: number,
    maxPoints: number,
    studentScores: Map<string, StudentScoreData>
}

//TODO: JSDOCIFY
export interface StudentScoreData {
    score: number,
    numPosts: number,
    numIncomPost: number,
    numComments: number,
    numIncomComment: number,
    awardsRecieved: number,
    awardsGiven: number
}

/**
 * @interface the specifications for how discussion points should be tracked for a course
 * @property {PostSpecs} postSpecs - the specification on how posts should be scored
 * @property {CommentSpecs} commentSpecs - the specification on how comments should be scored
 * @property {ScorePeriod[]} scorePeriods - a list of score periods for when posts should be scored
 */
export interface DiscussionSpecs {
    postSpecs: PostSpecs,
    commentSpecs: CommentSpecs,
    scorePeriods: ScorePeriod[]
}