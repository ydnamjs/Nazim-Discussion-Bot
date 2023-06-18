import { Message } from "discord.js";
import { CommentSpecs } from "src/generalModels/DiscussionScoring";

function scoreComment(comment: Message, commentSpecs: CommentSpecs): number {
    
    // remove multiple new lines in a row and newlines and spaces at the end
    const contentTrimmed = (comment.content.replace(/[\r\n]+/g, '\n')).trim();

    if(contentTrimmed.length >= commentSpecs.minLength && contentTrimmed.)
    
    return score;
}

/**
 * @function counts the number of links in a string
 * @param {string} content - the string to count the links of
 * @returns {number} - the number of links in the string
 */
function countLinks(content: string):number {
    const countArr =  content.match(/http/g || [])
    
    if(!countArr) {
        return 0;
    }
    
    return countArr.length;
}