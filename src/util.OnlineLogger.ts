import { Client } from "discord.js";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        console.log(`${client.user.username} is online!`);
    });
};

//code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript