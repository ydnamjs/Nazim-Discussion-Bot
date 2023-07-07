import { Client, Message } from "discord.js";
import { handleDiscussionCreation } from "../pieces/discussion/scoring/handleDiscussionCreation";
import { CourseQueue } from "../pieces/discussion/scoring/courseQueue";

export default (client: Client, courseQueues: Map<string, CourseQueue>): void => {
    
    client.on("messageCreate", async (message: Message) => {
        
        await handleDiscussionCreation(message, courseQueues);
        
    });
};