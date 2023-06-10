import { Client, Guild } from "discord.js";
import { GUILDS } from "./secret";


/**
 * @function Creates a ready listener for the client given
 * 
 * @param {Client} client - the client to create the ready listener for
 */
export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }
        // TODO: idk how bad this is but it seems essential if discussions are to be able to get info about people who havent interacted with the bot since its last restart
        console.log("fetching members");
        const guild = client.guilds.cache.get(GUILDS.MAIN) as Guild;
        await guild.members.fetch();
        console.log("all members fetched");
        console.log(`${client.user.username} is online!`);
    });
};

//code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript