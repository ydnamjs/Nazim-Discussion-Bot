import { Command } from "./Command";
import { addCourse } from "../pieces/courseManagement/Addcourse";
import { DiscussionMenu } from "../pieces/discussion/menu/DiscussionMenu";
import { removeCourse } from "../pieces/courseManagement/RemoveCourse";
import { testScore } from "../pieces/discussion/tracking/testScoreCommand";

export const commandList: Command[] = [ addCourse, removeCourse, DiscussionMenu, testScore];

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript