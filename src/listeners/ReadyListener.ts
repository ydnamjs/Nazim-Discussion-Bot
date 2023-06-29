import { Client, Guild } from "discord.js";
import { GUILDS } from "../secret";


/**
 * @function Creates a ready listener for the client given
 * @param {Client} client - the client to create the ready listener for
 */
export default (client: Client): void => {
    client.once("ready", async () => {
        
        if (!client.user || !client.application) {
            return;
        }
        
        console.log("fetching members");
        
        // we fetch all of the members here so that we dont have issue pulling from the cache of members anywhere else
        const guild = client.guilds.cache.get(GUILDS.MAIN) as Guild;
        await guild.members.fetch();
        
        console.log("all members fetched");
        console.log(`${client.user.username} is online!`);
    });
};

//code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript