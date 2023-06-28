import { Guild, InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { GUILDS } from "../../../../secret";
import { getCourseByName } from "../../../../generalUtilities/getCourseByName";
import { sendDismissableReply } from "../../../../generalUtilities/DismissableMessage";
import { ScorePeriod, StudentScoreData } from "../../../../generalModels/DiscussionScoring";
import { addScorePeriods } from "../../tracking/scoreFunctions";

const TITLE_COURSE_PREFIX = "Students of CISC ";
const MENU_DESCRIPTION = "replace me";
const STUDENT_USERNAME_PREFIX = "username: ";
const STUDENT_NICKNAME_PREFIX = " - server nickname: ";

/**
 * @function updates a menu so that it is now a staff menu
 * @param {string} courseName - the title of the course whose students are to be viewed
 * @param {Message} message - the message to have the menu be replaced on
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 */
export async function updateToViewStudentsMenu(courseName: string, message: Message, componentInteraction: MessageComponentInteraction) {

    let course = await getCourseByName(courseName)

    if(!course || !course.discussionSpecs || course.discussionSpecs.scorePeriods.length < 1) {
        sendDismissableReply(componentInteraction.message, "Database error. Please message admin");
        return;
    }

    let totalPeriod: ScorePeriod = {
        start: new Date(),
        end: new Date(),
        goalPoints: 0,
        maxPoints: 0,
        studentScores: new Map<string, StudentScoreData>()
    }

    course.discussionSpecs.scorePeriods.forEach( (scorePeriod) => {
        totalPeriod = addScorePeriods(totalPeriod, scorePeriod)
    })

    const guild = componentInteraction.client.guilds.cache.get(GUILDS.MAIN) as Guild;

    const studentsData: DiscussionStudentData[] = [];

    const students = [...guild.members.cache.values()].filter((member) => {
        return totalPeriod.studentScores.has(member.id)
    });

    for (const student of students) {

        const nickname = student.nickname !== null ? STUDENT_NICKNAME_PREFIX + student.nickname : "";

        studentsData.push({
            name: STUDENT_USERNAME_PREFIX + student.user.username + nickname 
        })
    }

    const viewStudentsMenu = new ViewStudentsMenu(courseName, studentsData);
    componentInteraction.update(viewStudentsMenu.menuMessageData as InteractionUpdateOptions);
    viewStudentsMenu.collectMenuInteraction(componentInteraction.user, message);
}

/** 
 * @interface basic information about a student in a discussion course. Intended to be used in view students menu
 * @property {string} username - username of the student
*/
export interface DiscussionStudentData {
    name: string,
}

export class ViewStudentsMenu extends NavigatedMenu {
    constructor(courseTitle: string, studentData: DiscussionStudentData[]) {
        
        // generate the fields of basic info for each course and the select menu options
        let fields: { name: string; value: string; }[] = [];
        studentData.forEach(student => {
            fields.push({
                name: student.name,
                value: "replace me too" //TODO: Add interesting info once more is done for sage user / our own discussion student
            })
        });

        // data to be fed into super class navigated menu
        const menuData: NavigatedMenuData = {
            title: TITLE_COURSE_PREFIX + courseTitle.toUpperCase(),
            description: MENU_DESCRIPTION,
            fields: fields,
            additionalComponents: [],
            additionalComponentBehaviors: [],
        }

        super(menuData, 0);
    }
}