// command interface
import { Command } from "./interface.Command";

// Imported commands
import { addCourse } from "../pieces/courseManagement/Command.addcourse";
import { DiscussionMenu } from "../pieces/discussion/menu/Command.DiscussionMenu";
import { removeCourse } from "../pieces/courseManagement/Command.RemoveCourse";

/**
 * @constant List of all the available commands
*/
export const commandList: Command[] = [ addCourse, removeCourse, DiscussionMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript