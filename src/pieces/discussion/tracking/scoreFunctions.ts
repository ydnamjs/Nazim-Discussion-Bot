import { Message, ReactionEmoji } from "discord.js";
import { CommentSpecs } from "../../../generalModels/DiscussionScoring";
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

function scoreWholeComment(comment: Message, commentSpecs: CommentSpecs, staffId: string): {score: number, scoreChecks: ScoreChecks} {
    
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
    const reactions = [...comment.reactions.cache.values()]
    reactions.forEach(async (reaction) => {

        const awardSpecs = commentSpecs.awards.get(reaction.emoji.toString())

        // if the reaction is a valid award
        if(awardSpecs) {

            // award points for everyone if everyone can add
            if(awardSpecs.trackStudents){
                score += awardSpecs.points * [...(await reaction.users.fetch())].length
            }
            // award points only for staff members that reacted if only staff can react
            else {
                let numStaff = 0;
                [...(await reaction.users.fetch()).values()].forEach(async (user) => {
                    if( await userHasRoleWithId(user, staffId)) {
                        numStaff += 1;
                    }
                })
                score += awardSpecs.points * numStaff;
            }
        }
    })

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