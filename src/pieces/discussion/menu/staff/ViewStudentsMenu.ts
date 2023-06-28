import { Guild, InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { GUILDS } from "../../../../secret";
import { getCourseByName } from "../../../../generalUtilities/getCourseByName";
import { sendDismissableReply } from "../../../../generalUtilities/DismissableMessage";
import { ScorePeriod, StudentScoreData } from "../../../../generalModels/DiscussionScoring";
import { addScorePeriods } from "../../tracking/scoreFunctions";

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
        console.log("adding period")
        totalPeriod = addScorePeriods(totalPeriod, scorePeriod)
    })

    const guild = componentInteraction.client.guilds.cache.get(GUILDS.MAIN) as Guild;

    const studentsData: DiscussionStudentData[] = [];

    const students = [...guild.members.cache.values()].filter((member) => {
        return totalPeriod.studentScores.has(member.id)
    });

    for (const student of students) {
        studentsData.push({
            username: "username:" + student.user.username + student.nickname? "- server nickanme: " + student.nickname : ""
        })
    }

    // get userIds of every student in the course

    const studentIds =  guild.members.cache.filter((member) => {
        return [...member.roles.cache.keys()].includes(course?.roles.student as string)
    })

    // replace the old menu with the view students menu
    const viewStudentsMenu = new ViewStudentsMenu(courseName, studentsData);
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