//command class
import { Command } from "./Command";
import { DiscussionMenu } from "./commands/DiscussionMenu";
import { RegisterDiscussionCourse } from "./commands/RegisterDiscussionCourse";

//import command from its respective file

//list of all the available commands
export const CommandList: Command[] = [DiscussionMenu, RegisterDiscussionCourse];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript