import { Client } from "discord.js";
import { CommandList } from "../constants/CommandList";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        //registers the commands should be off unless commands need updated/added since discord limits how many can be registered in a day
        //await client.application.commands.set(CommandList, "931758776372068402");
        console.log(`${client.user.username} is online!`);
    });
};

//code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript