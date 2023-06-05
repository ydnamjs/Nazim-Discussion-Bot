//command interface
import { Command } from "./Command";

//import command from its respective file
import { DiscussionMenu } from "../commands/DiscussionMenu";
import { RegisterDiscussionCourse } from "../commands/RegisterDiscussionCourse";
import { testCourseStudentMenu } from "../commands/TestCourseStudentsMenu";

//list of all the available commands
export const CommandList: Command[] = [DiscussionMenu, RegisterDiscussionCourse, testCourseStudentMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript