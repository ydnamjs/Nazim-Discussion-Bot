import { Command } from "./Command";
import { addCourse } from "../pieces/courseManagement/Addcourse";
import { DiscussionMenu } from "../pieces/discussion/menu/DiscussionMenu";
import { removeCourse } from "../pieces/courseManagement/RemoveCourse";

export const commandList: Command[] = [ addCourse, removeCourse, DiscussionMenu];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript