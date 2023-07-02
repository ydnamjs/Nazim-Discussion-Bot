import { Client, Message } from "discord.js";
import { getDiscussionPostData } from "../pieces/discussion/scoring/handlePostCreation";

export default (client: Client): void => {
    
    client.on("messageCreate", async (message: Message) => {
        
        const discussionPostData = await getDiscussionPostData(message)
    
        if(!discussionPostData) {
            console.log("not a new post")
        }
        else {
            console.log("is new post")
        }
    });
};