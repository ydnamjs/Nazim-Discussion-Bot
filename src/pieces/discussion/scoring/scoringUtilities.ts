import { CommentSpecs, PostSpecs } from "../../../generalModels/DiscussionScoring";

export function scoreDiscussionContent(content: string, specs: CommentSpecs | PostSpecs): MessageScoreData {

    const contentNoWhiteSpace = content.replace(/[\s]+/g, '');

    let score = 0;

    const passedLength = contentNoWhiteSpace.length >= specs.minLength;
    const passedParagraph = countParagraphs(content) >= specs.minParagraphs;
    const passedLinks = countLinks(content) >= specs.minLinks;

    if(passedLength && passedParagraph && passedLinks) {
        score = specs.points;    
    }

    return {score, passedLength, passedParagraph, passedLinks, numAwards: 0, numPenalties: 0};
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

function countParagraphs(content: string):number {
    
    // replaces all substring of new lines with a single new line and removes all white space on the end ie "abc\n\n\ndef \n\n\n\ nghi \n\n" -> "abc\ndef \n ghi"
    const contentTrimmed = (content.replace(/[\r\n]+/g, '\n')).trim(); 

    const countArr =  contentTrimmed.match(/\n+/g || [])
    
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