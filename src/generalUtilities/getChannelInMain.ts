import { Client } from "discord.js";
import { GUILDS } from "../secret";

/**
 * @function fetches a channel from the main guild
 * @param {Client} client - the client performing the action
 * @param {string} channelId - the id of the channel to fetch
 * @returns {GuildBasedChannel | null} channel - the channel that was fetched or null if unsuccessful
 */
export async function getChannelInMainGuild(client: Client, channelId: string) {
    
    const guild = client.guilds.cache.get(GUILDS.MAIN);

    if(!guild) {
        return undefined;
    }

    const channel = await guild.channels.fetch(channelId)

    if(channel === null) {
        return undefined;
    }

    return channel;
}