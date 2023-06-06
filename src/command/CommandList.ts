//command interface
import { Command } from "./Command";

//import command from its respective file
import { DiscussionMenu } from "./DiscussionMenu";
import { RegisterDiscussionCourse } from "./RegisterDiscussionCourse";
import { testMenu } from "./TestMenu";

//list of all the available commands
export const CommandList: Command[] = [DiscussionMenu, RegisterDiscussionCourse, testMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript