import { ChannelType, Message, ThreadChannel } from "discord.js";
import { DATABASE_ERROR_MESSAGE, getCourseByDiscussionChannel, getCourseByName, overwriteCourseDiscussionSpecs } from "../../../generalUtilities/CourseUtilities";
import { Course } from "../../../generalModels/Course";
import { MessageScoreData, scoreComment, scoreDiscussionContent, scoreDiscussionMessage } from "./scoreFunctions";
import { sendDismissableMessage, sendDismissableReply } from "../../../generalUtilities/DismissableMessage";
import { DiscussionSpecs } from "src/generalModels/DiscussionScoring";

export async function handleDiscussionCreation(message: Message) {
    
    const discussionMessageData = await getDiscussionMessageData(message)
    
    if(!discussionMessageData)
        return
    
    if(!discussionMessageData.course.discussionSpecs)
        return

    if(discussionMessageData.isPost)
        console.log("isPost"); // TODO: replace me with post scoring functionality
    else {
        handleScoreComment(message, discussionMessageData.course.name)
    }
}

// HELPERS
async function getDiscussionMessageData(message: Message): Promise<undefined | DiscussionMessageData> {
    
    const thread = message.channel;

    // if the channel of the message isn't a thread it cant be a post or comment
    if((thread.type !== ChannelType.PublicThread) && (thread.type !== ChannelType.PrivateThread))
        return undefined
    
    // if the parent of thread doesn't exist it isn't in a forum meaning it isn't a discussion thread
    if(thread.parentId === null)
        return undefined

    const postCourse = await getCourseByDiscussionChannel(thread.parentId) 
    
    //if the channel's parent isnt a discussion channel, it isn't a discussion thread
    if(!postCourse)
        return undefined

    // The id of the first message in a thread has the same id as the thread (it's a discord thing)
    if (thread.id === message.id)  
        return {course: postCourse, thread: thread as ThreadChannel, isPost: true}

    return {course: postCourse, thread: thread as ThreadChannel, isPost: false}
}

interface DiscussionMessageData {
    course: Course,
    thread: ThreadChannel,
    isPost: boolean
}

async function handleScoreComment(message: Message, courseName: string) {

    const course = await getCourseByName(courseName)

    if(!course || !course.discussionSpecs) {
        
        sendDismissableMessage(message.author, "Message: " + message.url + " could not be scored. Reasons: " + DATABASE_ERROR_MESSAGE) // TODO: constantify these
        return;
    }
        
    const commentScoreData = scoreDiscussionContent(message.content, course.discussionSpecs.commentSpecs)

    updateCommenterScore(message, commentScoreData, course)

    await handleCommenterNotification(message, commentScoreData)
}

async function handleCommenterNotification(message: Message, commentScoreData: MessageScoreData) {

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

async function updateCommenterScore(message: Message, commentScoreData: MessageScoreData, course: Course) {
    
    // TODO: The whole flow of this should probably change when we rework score fucntions

    if(!course.discussionSpecs)
        return

    await scoreComment(message, course.discussionSpecs.scorePeriods, course.discussionSpecs.commentSpecs, course.roles.staff)

    overwriteCourseDiscussionSpecs(course.name, course.discussionSpecs)
}