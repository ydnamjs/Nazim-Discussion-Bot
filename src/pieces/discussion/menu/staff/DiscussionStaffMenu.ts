import { ActionRowBuilder, ButtonStyle, Client, InteractionUpdateOptions, Message, MessageComponentInteraction, StringSelectMenuBuilder, ThreadChannel, User } from "discord.js";
import { Course, courseModel } from "../../../../generalModels/Course";
import { getRolesOfUserInGuild as getRolesOfUser } from "../../../../generalUtilities/GetRolesOfUser";
import { GUILDS } from "../../../../secret";
import { ComponentBehavior } from "../BaseMenu";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { updateToManageCourseMenu } from "./ManageCourseMenu";
import { ScorePeriod, StudentScoreData } from "../../../../generalModels/DiscussionScoring";
import { sendDismissableReply } from "../../../../generalUtilities/DismissableMessage";

/**
 * @function updates a menu so that it is now a staff menu
 * @param {Message} message - the message to have the menu be replaced on
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 */
export async function updateToStaffMenu(message: Message, componentInteraction: MessageComponentInteraction) {

    const staffsCourses = await getStaffsDiscussionCourses(componentInteraction.client, componentInteraction.user);

    const guild = componentInteraction.client.guilds.cache.get(GUILDS.MAIN)

    if(!guild){
        await sendDismissableReply(componentInteraction.message, "Error fetching discord server. Please try again or message admin");
        await componentInteraction.message.delete();
        return;
    }

    let discussionCoursesData: DiscussionCourseBasicData[] = [];
    for (const course of staffsCourses) {
        
        if(!course || course.discussionSpecs === null)
            continue;

        const studentRole = await guild.roles.fetch(course.roles.student);

        const totals = getTotalPostsComments(course.discussionSpecs.scorePeriods);

        discussionCoursesData.push({
            name: course.name,
            numStudents: studentRole ? studentRole.members.size : 0,
            numPosts: totals.totalPosts,
            numComments: totals.totalComments
        });
    }

    const staffMenu = new StaffMenu(discussionCoursesData);
    componentInteraction.update(staffMenu.menuMessageData as InteractionUpdateOptions);
    staffMenu.collectMenuInteraction(componentInteraction.user, message);
}

async function getStaffsDiscussionCourses(client: Client, user: User) {
    
    const roles = await getRolesOfUser(client, user);

    let staffsCourses: Course[] = [];
    try {
        staffsCourses = await courseModel.find({'roles.staff': {$in: roles}, 'channels.discussion': {$ne: null}});
    }
    catch(error: any) {
        console.error(error);
    }

    staffsCourses.forEach((course) => {
        
        // we do this because mongo db doesn't store maps as maps, it stores them as objects so in order to actually use the scores as a map,
        // we have to convert it from object to map
        course?.discussionSpecs?.scorePeriods.forEach((scorePeriod)=> {
            scorePeriod.studentScores = new Map<string, StudentScoreData>(Object.entries(scorePeriod.studentScores))
        })
    })

    return staffsCourses
}

function getTotalPostsComments(scorePeriods: ScorePeriod[]) {
    
    let totalPosts = 0;
    let totalComments = 0;

    scorePeriods.forEach((scorePeriod) => {
        [...scorePeriod.studentScores.values()].forEach(studentScore => {
            totalPosts += studentScore.numPosts;
            totalComments += studentScore.numComments;
        });
    })

    return {totalPosts, totalComments}
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
        resultingAction: (componentInteraction: MessageComponentInteraction) => {
            // TODO: Implement functionality once modal has been created
        }
    },
    {
        // drop down menu
        filter: (custom_id: string) => {
            return custom_id === DROP_DOWN_ID;
        },
        resultingAction: (componentInteraction: MessageComponentInteraction) => {
            if(componentInteraction.isStringSelectMenu()){
                updateToManageCourseMenu(componentInteraction.values[0], componentInteraction);
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
            prevButtonOptions: { exists: true },
            nextButtonOptions: { exists: true },
            specialMenuButton: { 
                customId: EXPAND_COURSE_BUTTON_ID,
                label: EXPAN_COURSE_BUTTON_LABEL,
                disabled: true,
                style: ButtonStyle.Primary
            }
        };
        
        super(menuData, 0, customNavOptions);
    }
}