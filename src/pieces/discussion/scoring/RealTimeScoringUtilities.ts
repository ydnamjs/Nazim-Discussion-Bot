import { Message } from "discord.js";
import { DiscussionSpecs } from "../../../generalModels/DiscussionScoring";
import { sendDismissableMessage } from "../../../generalUtilities/DismissableMessage";
import { addCommentScoreToPeriod, addCommentToPosterScore, findMessagePeriod } from "./scoreActionUtilities";
import { MessageScoreData, scoreDiscussionContent } from "./scoringUtilities";

export function scoreNewComment(message: Message, discussionSpecs: DiscussionSpecs, posterId: string | null): MessageScoreData | undefined {
    
    const commentPeriod = findMessagePeriod(message, discussionSpecs.scorePeriods);

    if(!commentPeriod)
        return undefined
    
    const commentScoreData = scoreDiscussionContent(message.content, discussionSpecs.commentSpecs);

    addCommentScoreToPeriod(commentScoreData, commentPeriod, message.author.id);
    
    // TODO: add check to make sure commenter is not poster
    if(posterId !== null)
        addCommentToPosterScore(commentPeriod, posterId, discussionSpecs.postSpecs.commentPoints)

    return commentScoreData;
}

export async function sendDiscussionScoreNotification(message: Message, commentScoreData: MessageScoreData) {

    const incompleteReasons = handleRequirementChecking(commentScoreData);

    if(incompleteReasons !== "")
        await sendDismissableMessage(message.author, "Message: " + message.url + " earned 0 points. Reasons: " + incompleteReasons); // TODO: constantify these
    else
        await sendDismissableMessage(message.author, "Message: " + message.url + " successfully scored"); // TODO: constantify these
}

function handleRequirementChecking(messageScoreData: MessageScoreData) {

    let incompleteReasons = "";
    
    if(!messageScoreData.passedLength)
        incompleteReasons += "\n- Did not meet minimum length requirement"
    if(!messageScoreData.passedParagraph)
        incompleteReasons += "\n- Did not meet minimum paragraph requirement"
    if(!messageScoreData.passedLinks)
        incompleteReasons += "\n- Did not meet minimum link requirement"

    return incompleteReasons
}