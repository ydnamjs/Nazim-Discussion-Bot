//command interface
import { Command } from "./Interface_Command";

//import command from its respective file
import { DiscussionMenu } from "./Command_DiscussionMenu";
import { RegisterDiscussionCourse } from "./Command_RegisterDiscussionCourse";
import { testMenu } from "./Command_TestMenu";

//list of all the available commands
export const CommandList: Command[] = [DiscussionMenu, RegisterDiscussionCourse, testMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript