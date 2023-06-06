//command interface
import { Command } from "./interface.Command";

//import command from its respective file
import { DiscussionMenu } from "./menu/Command.DiscussionMenu";
//import { RegisterDiscussionCourse } from "./menu/Command_RegisterDiscussionCourse";
import { testMenu } from "./menu/Command.TestMenu";

//list of all the available commands
export const CommandList: Command[] = [DiscussionMenu, testMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript