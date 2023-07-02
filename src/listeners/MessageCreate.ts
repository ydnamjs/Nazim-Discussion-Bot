import { Client, Message } from "discord.js";
import { getDiscussionMessageData } from "../pieces/discussion/scoring/handleDiscussionCreation";

export default (client: Client): void => {
    
    client.on("messageCreate", async (message: Message) => {
        
        const discussionPostData = await getDiscussionMessageData(message)
    
        if(!discussionPostData) {
            console.log("not a new post or comment")
        }
        else {
            console.log("is new post or comment")
        }
    });
};