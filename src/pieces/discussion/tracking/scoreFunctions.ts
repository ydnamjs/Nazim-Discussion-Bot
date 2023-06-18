import { Message, MessageReaction, ReactionEmoji } from "discord.js";
import { AwardSpecs, CommentSpecs } from "../../../generalModels/DiscussionScoring";
import { userHasRoleWithId } from "src/generalUtilities/GetRolesOfUserInGuild";

/**
 * @interface collection of what requirements were met for a comment or post
 * @property {boolean} passedLength - whether the post or comment met the length requirement specified in the course it belongs to
 * @property {boolean} passedParagraph - whether the post or comment met the paragraph requirement specified in the course it belongs to
 * @property {boolean} passedLinks = whether the post or comment met the link requirement specified in the course it belongs to
 */
interface ScoreChecks {
    passedLength: boolean,
    passedParagraph: boolean,
    passedLinks: boolean
}

/**
 * @function calculates the entire score of a comment
 * @param {Message} comment - the discord message of the comment being scored
 * @param {CommentSpecs} commentSpecs - the specification used to score this comment (should be based on the course this comment was made for)
 * @param {string} staffId - the id that can give staff awards (should be based on the course this comment was made for)
 * @returns {object} scoreInfo - object containing information about the scoring of the comment
 * @property {number} scoreInfo.score - the number of points that the comment earned based on the scoring specification
 * @property {ScoreChecks} scoreInfo.scoreChecks - object containing information about which requirements the post met (useful for giving feedback to students whose comments did not meet the requirements) [see Scorechecks interface in scoreFunction.ts]
 */
export function scoreWholeComment(comment: Message, commentSpecs: CommentSpecs, staffId: string): {score: number, scoreChecks: ScoreChecks} {
    
    // remove multiple new lines in a row and newlines and spaces at the end
    const contentTrimmed = (comment.content.replace(/[\r\n]+/g, '\n')).trim();
    // remove all empty spaces
    const contentNoEmpty = contentTrimmed.replace(/[\s]+/g, '');

    let score = 0;
    const scoreChecks = {
        passedLength: contentNoEmpty.length >= commentSpecs.minLength,
        passedParagraph: countParagraphs(contentTrimmed) >= commentSpecs.minParagraphs,
        passedLinks: countLinks(contentTrimmed) >= commentSpecs.minLinks
    }

    // if all the checks are met, award the points
    if(scoreChecks.passedLength && scoreChecks.passedParagraph && scoreChecks.passedLinks) {
        score = commentSpecs.points;    
    }

    // count award points
    const reactions = [...comment.reactions.cache.values()];
    const awards = commentSpecs.awards;

    score += scoreAllAwards(reactions, awards, staffId);

    return {score: score, scoreChecks: scoreChecks};
}

/**
 * @function counts the number of paragraphs in a string
 * @param {string} content - the string to count the paragraphs of
 * @returns {number} - the number of paragraphs in the string
 */
function countParagraphs(content: string):number {
    const countArr =  content.match(/\n+/g || [])
    
    if(!countArr) {
        return 0;
    }
    
    return countArr.length;
}

/**
 * @function counts the number of links in a string
 * @param {string} content - the string to count the links of
 * @returns {number} - the number of links in the string
 */
function countLinks(content: string):number {
    const countArr =  content.match(/http+/g || [])
    
    if(!countArr) {
        return 0;
    }
    
    return countArr.length;
}

/**
 * @function calculates the score for the awards of a given post or comment
 * @param {MessageReaction[]} reactions - all of the reactions that exist on the post or comment whose awards are being calculated for
 * @param {Map<string, AwardSpecs>} awards - the map of awards to check for and score based on
 * @param {string} staffId - the id of the role that can give staff only awards
 * @returns {number} - the amount of points earned for all awards on a post
 */
function scoreAllAwards(reactions: MessageReaction[], awards: Map<string, AwardSpecs>, staffId: string): number {
    
    let totalAwardScore = 0;
    
    reactions.forEach(async (reaction) => {

        // get the award specs for the given award
        const awardSpecs = awards.get(reaction.emoji.toString())

        // if the award specs exist, then the reaction is a real award
        if(awardSpecs) {

            // if students can give the award, then every person who reacted counts
            if(awardSpecs.trackStudents){
                totalAwardScore += awardSpecs.points * [...(await reaction.users.fetch())].length
            }

            // award points only for staff members that reacted
            else {
                const reactors = [...(await reaction.users.fetch()).values()];
                
                reactors.forEach(async (user) => {
                    if( await userHasRoleWithId(user, staffId)) {
                        totalAwardScore += awardSpecs.points;
                    }
                })
            }
        }
    })

    return totalAwardScore;
}