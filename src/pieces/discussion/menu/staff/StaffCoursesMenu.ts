import { ActionRowBuilder, ButtonStyle, Client, InteractionUpdateOptions, Message, MessageComponentInteraction, StringSelectMenuBuilder, ThreadChannel, User } from "discord.js";
import { Course, courseModel } from "../../../../generalModels/Course";
import { getRolesOfUserInGuild as getRolesOfUser } from "../../../../generalUtilities/RoleUtilities";
import { GUILDS } from "../../../../secret";
import { ComponentBehavior } from "../../../menu/BaseMenu";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../../../menu/NavigatedMenu";
import { updateToManageCourseMenu } from "./ManageCourseMenu";
import { ScorePeriod, StudentScoreData } from "../../../../generalModels/DiscussionScoring";
import { sendDismissableInteractionReply, sendDismissableReply } from "../../../../generalUtilities/DismissableMessage";
import { CourseQueue } from "../../scoring/courseQueue";

/**
 * @function updates a menu so that it is now a staff menu
 * @param {Message} message - the message to have the menu be replaced on
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 */
export async function updateToStaffCoursesMenu(componentInteraction: MessageComponentInteraction, courseQueues: Map<string, CourseQueue>) {

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

    const staffMenu = new StaffCoursesMenu(discussionCoursesData, courseQueues);
    componentInteraction.update(staffMenu.menuMessageData as InteractionUpdateOptions);
    staffMenu.collectMenuInteraction(componentInteraction.message);
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
const STAFF_MENU_DESCRIPTION = "Below this you will find a list of all your courses and some basic info about them and their discussions. To manage the score period or scoring rules of a course select it from the drop down";
const NUM_STUDENTS_PREFIX = "# of students: ";
const NUM_POSTS_PREFIX = "\n# of posts: ";
const NUM_COMMENTS_PREFIX = "\n# of comments: ";

const SELECT_MENU_ERROR_MESSAGE = "An error occurred. Expected a select menu interaction with a selected value"

const DROP_DOWN_ID = "discussion-course-select";


/**
 * @class menu that displays basic info about a user's courses
 * @param {DiscussionCourseBasicData[]} courseInfo - list of courses to display information about
 */
export class StaffCoursesMenu extends NavigatedMenu {
    
    constructor(courseInfo: DiscussionCourseBasicData[], courseQueues: Map<string, CourseQueue>) {
        
        let fields: { name: string; value: string; }[] = [];
        let selectMenuOptions: {value: string, label: string}[] = []; 
        courseInfo.forEach((course: DiscussionCourseBasicData)=>{
            fields.push({
                name: course.name,
                value: NUM_STUDENTS_PREFIX + course.numStudents + NUM_POSTS_PREFIX + course.numPosts + NUM_COMMENTS_PREFIX + course.numComments
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

        const menuData: NavigatedMenuData = {
            title: STAFF_MENU_TITLE,
            description: STAFF_MENU_DESCRIPTION,
            fields: fields,
            additionalComponents: [courseSelectRow],
            additionalComponentBehaviors: generateBehaviors(courseQueues)
        }

        const customNavOptions: CustomNavOptions = {
            prevButtonOptions: { exists: true },
            nextButtonOptions: { exists: true },
        };
        
        super(menuData, 0, courseQueues, customNavOptions);
    }
}

function generateBehaviors(courseQueues: Map<string, CourseQueue>) {
    return [{
        filter: (custom_id: string) => {
            return custom_id === DROP_DOWN_ID;
        },
        resultingAction: async (componentInteraction: MessageComponentInteraction) => {
            if(componentInteraction.isStringSelectMenu() && componentInteraction.values.length > 0){
                updateToManageCourseMenu(componentInteraction.values[0], componentInteraction, courseQueues);
            }
            else {
                await sendDismissableInteractionReply(componentInteraction, SELECT_MENU_ERROR_MESSAGE);
            }
        }
    }]
}