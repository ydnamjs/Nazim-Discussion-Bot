//command interface
import { Command } from "./interface.Command";

//import command from its respective file
//import { DiscussionMenu } from "./menu/Command.DiscussionMenu"; // not currently in use but will be in the final version
import { testMenu } from "./menu/Command.TestMenu";

//list of all the available commands
export const commandList: Command[] = [testMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript