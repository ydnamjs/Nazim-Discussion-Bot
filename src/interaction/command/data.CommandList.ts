// command interface
import { Command } from "./interface.Command";

// Imported commands
import { addCourse } from "./courseManagement/Command.addcourse";
import { DiscussionMenu } from "./menu/Command.DiscussionMenu";
import { testMenu } from "./menu/Command.TestMenu";
import { removeCourse } from "./courseManagement/Command.RemoveCourse";

/**
 * @constant List of all the available commands
*/
export const commandList: Command[] = [ addCourse, removeCourse, DiscussionMenu, testMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript