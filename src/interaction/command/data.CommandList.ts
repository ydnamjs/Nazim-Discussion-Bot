// command interface
import { Command } from "./interface.Command";

// Imported commands
import { addCourse } from "./Command.addcourse";
import { DiscussionMenu } from "./menu/Command.DiscussionMenu";
import { testMenu } from "./menu/Command.TestMenu";

/**
 * @constant List of all the available commands
*/
export const commandList: Command[] = [ addCourse, DiscussionMenu, testMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript