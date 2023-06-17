import { InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";

/**
 * @function updates a menu so that it is now a staff menu
 * @param {Message} message - the message to have the menu be replaced on
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 */
export async function updateToViewStudentsMenu(courseTitle: string, message: Message, componentInteraction: MessageComponentInteraction) {

    const studentData: DiscussionStudentData[] = [
        {
            username: "fred"
        },
    ]

    // replace the old menu with the view students menu
    const viewStudentsMenu = new ViewStudentsMenu(courseTitle, studentData);
    componentInteraction.update(viewStudentsMenu.menuMessageData as InteractionUpdateOptions);
    viewStudentsMenu.collectMenuInteraction(componentInteraction, message);
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