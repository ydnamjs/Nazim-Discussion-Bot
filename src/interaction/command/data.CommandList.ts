// command interface
import { Command } from "./interface.Command";

// Imported commands
import { testMenu } from "./menu/Command.TestMenu";

/**
 * @constant List of all the available commands
*/
export const commandList: Command[] = [testMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript