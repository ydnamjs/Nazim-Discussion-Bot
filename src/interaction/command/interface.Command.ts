import { CommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";

/**
 * @interface {Command} command
 * 
 * @description Interface that extends discords default ChatInputApplicationCommandData
 * useful because we can specify a run property so that we can declare command behavior with the definition of the command
 * 
 * @property {Function} run - the function to be run when the command is called
 * 
 *
 */
export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: CommandInteraction) => void;
}

//code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript