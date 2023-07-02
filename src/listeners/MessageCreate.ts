import { Client, Message } from "discord.js";
import { handleDiscussionCreation } from "../pieces/discussion/scoring/handleDiscussionCreation";

export default (client: Client): void => {
    
    client.on("messageCreate", async (message: Message) => {
        
        await handleDiscussionCreation(message);
        
    });
};