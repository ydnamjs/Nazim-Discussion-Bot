import { ChannelType, Message, ThreadChannel } from "discord.js";
import { getCourseByDiscussionChannel } from "../../../generalUtilities/CourseUtilities";
import { Course } from "../../../generalModels/Course";

export async function handleDiscussionCreation(message: Message) {
    
    const discussionPostData = await getDiscussionMessageData(message)
    
    if(!discussionPostData)
        return
        
    console.log("is new post or comment")

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

export interface DiscussionMessageData {
    course: Course,
    thread: ThreadChannel,
    isPost: boolean
}

