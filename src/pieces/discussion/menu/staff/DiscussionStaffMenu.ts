import { Message, MessageComponentInteraction, InteractionUpdateOptions, ButtonStyle, ForumChannel, ThreadChannel, SelectMenuBuilder, StringSelectMenuBuilder, ActionRowBuilder } from "discord.js";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { Course, courseModel } from "../../../../generalModels/Course";
import { getRolesOfUserInGuild } from "../../../../generalUtilities/GetRolesOfUserInGuild";
import { GUILDS } from "../../../../secret";
import { ComponentBehavior } from "../BaseMenu";
import { updateToManageCourseMenu } from "./ManageCourseMenu";

/**
 * @function updates a menu so that it is now a staff menu
 * @param {Message} message - the message to have the menu be replaced on
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 */
export async function updateToStaffMenu(message: Message, componentInteraction: MessageComponentInteraction) {
            
    // get the roles of the user in the guild
    const roles = await getRolesOfUserInGuild(componentInteraction);

    // get the courses from which the user is a staff member of
    let allCourses: Course[] = [];
    try {
        allCourses = await courseModel.find({'roles.staff': {$in: roles}, 'channels.discussion': {$ne: null}});
    }
    catch(error: any) {
        console.error(error);
    }

    const guild = await componentInteraction.client.guilds.fetch(GUILDS.MAIN)
    const threads = guild.channels.cache.filter(x => x.isThread());

    // convert the courses into data for the staff menu
    let courseInfo: DiscussionCourseBasicData[] = [];
    for(let i = 0; i < allCourses.length; i++) {
                
        // TODO: Change this to user sage user class and database
        const studentRole = await guild.roles.fetch(allCourses[i].roles.student);

        const posts = [...threads.filter(thread => thread.parentId === allCourses[i].channels.discussion).values()] as ThreadChannel[];
        let numComments = 0;
        posts.forEach(post => numComments += post.messageCount as number)

        courseInfo.push({
            name: allCourses[i].name,
            numStudents: studentRole ? studentRole.members.size : 0,
            numPosts: posts.length,
            numComments: numComments
        });
    }

    // replace the old menu with the staff menu
    const staffMenu = new StaffMenu(courseInfo);
    componentInteraction.update(staffMenu.menuMessageData as InteractionUpdateOptions);
    staffMenu.collectMenuInteraction(componentInteraction, message);
}

/** 
 * @interface basic information about a discussion course. intended to be made into a list and fed to staff menu so that it can be used to generate the list of courses 
 * @property {string} name - name of the course
 * @property {number} numPosts - the number of posts the course has
 * @property {number} numComments - the number of comments the course has
*/
export interface DiscussionCourseBasicData {
    name: string,
    numStudents: number,
    numPosts: number,
    numComments: number,
}

const STAFF_MENU_TITLE = "My Courses";
const STAFF_MENU_DESCRIPTION = "Below this you will find a list of all your courses and some basic info about them and their discussions. To access a specific course select it from the drop down or click the view course button and input the name of the course";

const EXPAND_COURSE_BUTTON_ID = "discussion_staff_expand_button";
const EXPAN_COURSE_BUTTON_LABEL = "expand course view";

const DROP_DOWN_ID = "discussion-course-select";

const EXTRA_BEHAVIORS: ComponentBehavior[] = [
    {
        // expand course button
        filter: (custom_id: string) => {
            return custom_id === EXPAND_COURSE_BUTTON_ID;
        },
        resultingAction: (message: Message, componentInteraction: MessageComponentInteraction) => {
            // TODO: Implement functionality once modal has been created
        }
    },
    {
        // drop down menu
        filter: (custom_id: string) => {
            return custom_id === DROP_DOWN_ID;
        },
        resultingAction: (message: Message, componentInteraction: MessageComponentInteraction) => {
            if(componentInteraction.isStringSelectMenu()){
                updateToManageCourseMenu(componentInteraction.values[0], message, componentInteraction);
            }
            else {
                componentInteraction.reply("An error occurred. Expected a select menu event but recieved something different");
            }
        }
    }
]

/**
 * @class menu that displays basic info about a user's courses
 * @param {DiscussionCourseBasicData[]} courseInfo - list of courses to display information about
 */
export class StaffMenu extends NavigatedMenu {
    constructor(courseInfo: DiscussionCourseBasicData[]) {
        
        // generate the fields of basic info for each course and the select menu options
        let fields: { name: string; value: string; }[] = [];
        let selectMenuOptions: {value: string, label: string}[] = []; 
        courseInfo.forEach((course: DiscussionCourseBasicData)=>{
            fields.push({
                name: course.name,
                value: "# of students: " + course.numStudents + "\n# of posts: " + course.numPosts + "\n# of comments: " + course.numComments
            });
            selectMenuOptions.push({
                value: course.name,
                label: course.name,
            })
        })
        
        const courseSelect = new StringSelectMenuBuilder({
            custom_id: DROP_DOWN_ID,
            options: selectMenuOptions,
        });

        courseSelect.setMaxValues(1);
        courseSelect.setMinValues(1);

        const courseSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>({
            components: [courseSelect]
        })

        // data to be fed into super class navigated menu
        const menuData: NavigatedMenuData = {
            title: STAFF_MENU_TITLE,
            description: STAFF_MENU_DESCRIPTION,
            fields: fields,
            additionalComponents: [courseSelectRow],
            additionalComponentBehaviors: EXTRA_BEHAVIORS
        }

        const customNavOptions: CustomNavOptions = {
            prevButtonOptions: {},
            nextButtonOptions: {},
            specialMenuButton: { 
                customId: EXPAND_COURSE_BUTTON_ID,
                label: EXPAN_COURSE_BUTTON_LABEL,
                disabled: true,
                style: ButtonStyle.Primary
            }
        };
        
        super(menuData, customNavOptions);
    }
}