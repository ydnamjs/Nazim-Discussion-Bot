import { Message, MessageComponentInteraction, InteractionUpdateOptions, ButtonStyle } from "discord.js";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../class.NavigatedMenu";
import { Course, courseModel } from "../../../../models/Course";
import { getRolesOfUserInGuild } from "../../../../util.getRolesOfUserInGuild";

/**
 * @function updates a menu so that it is now a staff menu
 * @param {Message} message - the message to have the menu be replaced on
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 */
export async function updateToStaffMenu(message: Message, componentInteraction: MessageComponentInteraction) {
            
    // get the roles of the user in the guild
    const roles = await getRolesOfUserInGuild(componentInteraction);

    // get the courses from which they are staff
    let allCourses: Course[] = [];
    try {
        allCourses = await courseModel.find({'roles.staff': {$in: roles}});
    }
    catch(error: any) {
        console.error(error);
    }
    
    // convert the courses and data into data for the staff menu
    let courseInfo: DiscussionCourseBasicData[] = [];
    for(let i = 0; i < allCourses.length; i++) {
        courseInfo.push({
            name: allCourses[i].name,
            numStudents: 0,
            numPosts: 0,
            numComments: 0
        });
    }

    // replace the old menu with the staff menu
    const staffMenu = new StaffMenu(courseInfo);
    componentInteraction.update(staffMenu.menuMessageData as InteractionUpdateOptions);
    staffMenu.collectButtonInteraction(componentInteraction, message);
}

/** @interface basic information about a discussion course. intended to be made into a list and fed to staff menu so that it can be used to generate the list of courses */
export interface DiscussionCourseBasicData {
    name: string,
    numStudents: number,
    numPosts: number,
    numComments: number,
}

const STAFF_MENU_TITLE = "My Courses";
const STAFF_MENU_DESCRIPTION = "Below this you will find a list of all your courses and some basic info about them and their discussions. To access a specific course click the view course button and input the name of the course";

/**
 * @class menu that displays basic info about a user's courses
 * @param {DiscussionCourseBasicData[]} courseInfo - list of courses to display information about
 */
export class StaffMenu extends NavigatedMenu {
    constructor(courseInfo: DiscussionCourseBasicData[]) {
        
        let fields: { name: string; value: string; }[] = []
        courseInfo.forEach((course: DiscussionCourseBasicData)=>{
            fields.push(
                {
                    name: course.name,
                    value: "# of students: " + course.numStudents + "\n# of posts: " + course.numPosts + "\n# of comments: " + course.numComments
                }
            )
        })
        
        const menuData: NavigatedMenuData = {
            title: STAFF_MENU_TITLE,
            description: STAFF_MENU_DESCRIPTION,
            fields: fields,
            additionalComponents: [],
            additionalButtonBehaviors: []
        }
        const customNavOptions: CustomNavOptions = {
            prevButtonOptions: {},
            nextButtonOptions: {},
            specialMenuButton: { 
                customId: "discussion_staff_expand_button",
                label: "expand course view",
                disabled: true,
                style: ButtonStyle.Primary
            }
        };
        
        super(menuData, customNavOptions);
    }
}