import { Guild, InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { Course, courseModel } from "../../../../generalModels/Course";
import { ROLES_GUILD } from "../../../../secret";

/**
 * @function updates a menu so that it is now a staff menu
 * @param {string} courseTitle - the title of the course whose students are to be viewed
 * @param {Message} message - the message to have the menu be replaced on
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 */
export async function updateToViewStudentsMenu(courseTitle: string, message: Message, componentInteraction: MessageComponentInteraction) {

    // get the ids of all students in the course
    let course: Course | null = null;
    try {
        course = await courseModel.findOne({name: courseTitle});
    }
    catch(error: any) {
        console.error(error);
    }

    // if the course was not found there was a problem getting it from the database
    if(!course) {
        componentInteraction.reply("Database error. Please message admin");
        return;
    }

    // get userIds of every student in the course
    const guild = componentInteraction.client.guilds.cache.get(ROLES_GUILD) as Guild;
    const studentIds =  guild.members.cache.filter((member) => {
        return [...member.roles.cache.keys()].includes(course?.roles.student as string)
    })

    // generate a list of student data from student Ids
    const studentData: DiscussionStudentData[] = []
    studentIds.forEach((student) => {
        studentData.push({
            username: student.user.username
        })
    })

    // replace the old menu with the view students menu
    const viewStudentsMenu = new ViewStudentsMenu(courseTitle, studentData);
    componentInteraction.update(viewStudentsMenu.menuMessageData as InteractionUpdateOptions);
    viewStudentsMenu.collectMenuInteraction(componentInteraction.user, message);
}

/** 
 * @interface basic information about a student in a discussion course. Intended to be used in view students menu
 * @property {string} username - username of the student
*/
export interface DiscussionStudentData {
    username: string,
}

export class ViewStudentsMenu extends NavigatedMenu {
    constructor(courseTitle: string, studentData: DiscussionStudentData[]) {
        
        // generate the fields of basic info for each course and the select menu options
        let fields: { name: string; value: string; }[] = [];
        studentData.forEach(student => {
            fields.push({
                name: student.username,
                value: "replace me too" //TODO: Add interesting info once more is done for sage user / our own discussion student
            })
        });

        // data to be fed into super class navigated menu
        const menuData: NavigatedMenuData = {
            title: courseTitle.toUpperCase(),
            description: "replace me",
            fields: fields,
            additionalComponents: [],
            additionalComponentBehaviors: [],
        }

        super(menuData, 0);
    }
}