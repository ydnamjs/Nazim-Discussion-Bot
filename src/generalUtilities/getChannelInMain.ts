import { Client } from "discord.js";
import { GUILDS } from "../secret";

export async function getChannelInMainGuild(client: Client, channelId: string) {
    const guild = client.guilds.cache.get(GUILDS.MAIN);

    if(!guild) {
        return undefined;
    }

    const thread = await guild.channels.fetch(channelId)

    if(thread === null) {
        return undefined;
    }

    return (await thread.fetch()).fetch();
}