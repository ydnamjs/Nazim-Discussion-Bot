import { ChannelType, Message, ThreadChannel } from "discord.js";
import { Course } from "../../../generalModels/Course";
import { DATABASE_ERROR_MESSAGE, getCourseByDiscussionChannel, getCourseByName, overwriteCourseDiscussionSpecs } from "../../../generalUtilities/CourseUtilities";
import { sendDismissableMessage } from "../../../generalUtilities/DismissableMessage";
import { scoreNewComment, sendDiscussionScoreNotification } from "./RealTimeScoringUtilities";
import { SCORING_ERROR_MESSAGE } from "./scoreActionUtilities";

export async function handleDiscussionCreation(message: Message) {
    
    const discussionMessageData = await getDiscussionMessageData(message)
    
    if(!discussionMessageData)
        return
    
    if(!discussionMessageData.course.discussionSpecs)
        return

    if(discussionMessageData.isPost)
        console.log("isPost"); // TODO: replace me with post scoring functionality
    else {
        handleNewComment(message, discussionMessageData.course.name, discussionMessageData.thread.ownerId)
    }
}

// HELPERS
async function getDiscussionMessageData(message: Message): Promise<undefined | DiscussionMessageData> {
    
    const thread = message.channel;

    // if the channel of the message isn't a thread the message isnt a discussion post or comment
    if((thread.type !== ChannelType.PublicThread) && (thread.type !== ChannelType.PrivateThread))
        return undefined
    
    // if the parent of thread doesn't exist it isn't in a forum meaning it isn't a discussion thread and thus the message isnt a discussion post or comment
    if(thread.parentId === null)
        return undefined

    const postCourse = await getCourseByDiscussionChannel(thread.parentId) 
    
    // if the thread's parent doesn't belong to a course then the message isnt a discussion post or comment
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

async function handleNewComment(message: Message, courseName: string, posterId: string | null) {

    const course = await getCourseByName(courseName)

    if(!course || !course.discussionSpecs) {
        
        sendDismissableMessage(message.author, "Message: " + message.url + " could not be scored. Reasons: " + DATABASE_ERROR_MESSAGE) // TODO: constantify these
        return;
    }

    const commentScoreData = scoreNewComment(message, course.discussionSpecs, posterId)

    if(!commentScoreData) {
        
        sendDismissableMessage(message.author, "Message: " + message.url + " could not be scored. Reasons: " + SCORING_ERROR_MESSAGE) // TODO: constantify these
        return
    }

    const databaseErrors = await overwriteCourseDiscussionSpecs(courseName, course.discussionSpecs)

    if(databaseErrors !== "") {
        
        sendDismissableMessage(message.author, "Message: " + message.url + " could not be scored. Reasons: " + DATABASE_ERROR_MESSAGE) // TODO: constantify these
        return
    }

    await sendDiscussionScoreNotification(message, commentScoreData)
}