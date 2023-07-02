import { Message, ThreadChannel } from "discord.js";
import { GUILDS } from "../../../secret";
import { getCourseByDiscussionChannel } from "../../../generalUtilities/CourseUtilities";
import { Course } from "../../../generalModels/Course";

export async function getDiscussionPostData(message: Message): Promise<undefined | DiscussionPostData> {
    
    let thread = undefined
    
    try {
        
        thread = await message.client.guilds.cache.get(GUILDS.MAIN)?.channels.fetch(message.id);
    } catch {}

    if(!thread) // if the channel doesn't exist it isnt a new post
        return undefined

    if(!thread.parentId) // if the channel doesn't have a parent it isnt a new post
        return undefined
    
    const postCourse = await getCourseByDiscussionChannel(thread.parentId) 
    
    if(!postCourse) //if the channel's parent isnt a discussion channel, it isn't a new post
        return undefined

    // we dont return true or false because we can potentially save future discord and database fetches bu returning what we have here
    return {course: postCourse, thread: thread as ThreadChannel}
}

export interface DiscussionPostData {
    course: Course,
    thread: ThreadChannel
}