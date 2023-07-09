import { CommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";
import { CourseQueue } from "../pieces/discussion/scoring/courseQueue";

/**
 * @interface Interface that extends discords default ChatInputApplicationCommandData
 * @description useful because we can specify a run property so that we can declare command behavior with the definition of the command
 * @property {Function} run - the function to be run when the command is called
 */
export interface Command extends ChatInputApplicationCommandData {
    run: (interaction: CommandInteraction, courseQueues: Map<string, CourseQueue>) => void;
}

//code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript