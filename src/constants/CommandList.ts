//command interface
import { Command } from "../interfaces/Command";

//import command from its respective file
import { DiscussionMenu } from "../commands/DiscussionMenu";
import { RegisterDiscussionCourse } from "../commands/RegisterDiscussionCourse";

//list of all the available commands
export const CommandList: Command[] = [DiscussionMenu, RegisterDiscussionCourse];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript