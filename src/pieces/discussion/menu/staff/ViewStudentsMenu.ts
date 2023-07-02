import { APIEmbedField, ButtonStyle, Guild, GuildMember, InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { Course } from "../../../../generalModels/Course";
import { ScorePeriod, StudentScoreData } from "../../../../generalModels/DiscussionScoring";
import { sendDismissableReply } from "../../../../generalUtilities/DismissableMessage";
import { getCourseByName } from "../../../../generalUtilities/CourseUtilities";
import { GUILDS } from "../../../../secret";
import { addScorePeriods } from "../../scoring/scoreFunctions";
import { ComponentBehavior } from "../../../menu/BaseMenu";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../../../menu/NavigatedMenu";
import { updateToManageCourseMenu } from "./ManageCourseMenu";

const TITLE_COURSE_PREFIX = "Students of CISC ";
const MENU_DESCRIPTION = "replace me";

const STUDENT_USERNAME_PREFIX = "username: ";
const STUDENT_NICKNAME_PREFIX = " - server nickname: ";

const STUDENT_SCORE_PREFIX = "total score: ";
const STUDENT_SCORE_DIVIDER = " / ";
const STUDENT_SCORE_MAX_PREFIX = " ( max possible: ";
const STUDENT_SCORE_MAX_SUFFIX = ")";

const STUDENT_NUM_POSTS_PREFIX = "\n# posts: ";
const STUDENT_NUM_COMMENTS_PREFIX = "\n# comments: ";
const STUDENT_INCOMPLETE_PREFIX = " (";
const STUDENT_INCOMPLETE_SUFFIX = " incomplete)";

const STUDENT_NUM_AWARDS_PREFIX = "\n# awards recieved: ";
const STUDENT_NUM_PENALTIES_PREFIX = "\n# penalties recieved: ";

/**
 * @function updates a menu so that it is now a staff menu
 * @param {string} courseName - the name of the course whose students are to be viewed
 * @param {Message} message - the message to have the menu be replaced on
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 */
export async function updateToViewStudentsMenu(courseName: string, componentInteraction: MessageComponentInteraction) {

    let course = await getCourseByName(courseName)

    if(!course || !course.discussionSpecs) {
        await sendDismissableReply(componentInteraction.message, "Database error. Please message admin");
        await componentInteraction.message.delete()
        return;
    }

    let totalPeriod: ScorePeriod = {
        start: new Date(),
        end: new Date(),
        goalPoints: 0,
        maxPoints: Number.MAX_VALUE,
        studentScores: new Map<string, StudentScoreData>()
    }

    let totalGoalScore = 0;
    let totalMaxScore = 0;
    course.discussionSpecs.scorePeriods.forEach( (scorePeriod) => {
        totalGoalScore += scorePeriod.goalPoints;
        totalMaxScore += scorePeriod.maxPoints;
        totalPeriod = addScorePeriods(totalPeriod, scorePeriod)
    })

    const guild = componentInteraction.client.guilds.cache.get(GUILDS.MAIN) as Guild;

    const students = [...guild.members.cache.values()].filter((member) => {
        return (totalPeriod.studentScores.has(member.id) || member.roles.cache.has((course as Course).roles.student))
    });

    const studentsData: DiscussionStudentStats[] = [];
    for (const student of students) {
        studentsData.push(getTotalStudentData(student, totalPeriod));
    }

    const viewStudentsMenu = new ViewStudentsMenu(courseName, studentsData, totalGoalScore, totalMaxScore);
    componentInteraction.update(viewStudentsMenu.menuMessageData as InteractionUpdateOptions);
    viewStudentsMenu.collectMenuInteraction(componentInteraction.message);
}

function getTotalStudentData(student: GuildMember, totalPeriod: ScorePeriod): DiscussionStudentStats {
    const nickname = student.nickname !== null ? student.nickname : undefined;
    const scoreData = totalPeriod.studentScores.get(student.id);

    if(!scoreData) {
        return {
            username: student.user.username,
            nickname: nickname,
            score: 0,
            numPosts: 0,
            numIncomPosts: 0,
            numComments: 0,
            numIncomComments: 0,
            numAwardsRecieved: 0,
            numPenaltiesRecieved: 0
        }
    }

    return {
        username: student.user.username,
        nickname: nickname,
        score: scoreData.score,
        numPosts: scoreData.numPosts,
        numIncomPosts: scoreData.numIncomPost,
        numComments: scoreData.numComments,
        numIncomComments: scoreData.numIncomComment,
        numAwardsRecieved: scoreData.awardsRecieved,
        numPenaltiesRecieved: scoreData.penaltiesRecieved
    }
}

/** 
 * @interface basic information about a student in a discussion course. Intended to be used in view students menu
 * @property {string} username - username of the student
*/
export interface DiscussionStudentStats {
    username: string,
    nickname: string | undefined;
    score: number
    numPosts: number,
    numIncomPosts: number,
    numComments: number,
    numIncomComments: number,
    numAwardsRecieved: number,
    numPenaltiesRecieved: number 
}

const BACK_BUTTON_ID = "discussion_view_students_back_button";
const BACK_BUTTON_LABEL = "Back To Course";
const BACK_BUTTON_DISABLED = false;
const BACK_BUTTON_STYLE = ButtonStyle.Secondary

const customNavOptions: CustomNavOptions = {
    prevButtonOptions: {exists: true},
    nextButtonOptions: {exists: true},
    specialMenuButton: {
        customId: BACK_BUTTON_ID, 
        label: BACK_BUTTON_LABEL,
        disabled: BACK_BUTTON_DISABLED,
        style: BACK_BUTTON_STYLE
    }
};

export class ViewStudentsMenu extends NavigatedMenu {
    
    constructor(courseName: string, studentData: DiscussionStudentStats[], goalScore: number, maxScore: number) {

        let fields: APIEmbedField[] = [];
        studentData.forEach(student => {
            fields.push(makeStudentField(student, goalScore, maxScore))
        });

        const menuData: NavigatedMenuData = {
            title: TITLE_COURSE_PREFIX + courseName.toUpperCase(),
            description: MENU_DESCRIPTION,
            fields: fields,
            additionalComponents: [],
            additionalComponentBehaviors: generateBehaviors(courseName),
        }

        super(menuData, 0, customNavOptions);
    }
}

function makeStudentField(studentData: DiscussionStudentStats, goalScore: number, maxScore: number): APIEmbedField {

    return {
        name: STUDENT_USERNAME_PREFIX + studentData.username + (studentData.nickname ? STUDENT_NICKNAME_PREFIX + studentData.nickname : ""),
        value: STUDENT_SCORE_PREFIX + studentData.score + STUDENT_SCORE_DIVIDER + goalScore + STUDENT_SCORE_MAX_PREFIX + maxScore + STUDENT_SCORE_MAX_SUFFIX
            + STUDENT_NUM_POSTS_PREFIX + studentData.numPosts + STUDENT_INCOMPLETE_PREFIX + studentData.numIncomPosts + STUDENT_INCOMPLETE_SUFFIX
            + STUDENT_NUM_COMMENTS_PREFIX + studentData.numComments + STUDENT_INCOMPLETE_PREFIX + studentData.numIncomComments + STUDENT_INCOMPLETE_SUFFIX
            + STUDENT_NUM_AWARDS_PREFIX + studentData.numAwardsRecieved + STUDENT_NUM_PENALTIES_PREFIX + studentData.numPenaltiesRecieved
    }
}

function generateBehaviors(courseName: string): ComponentBehavior[] {
    
    const behaviors = [
        {
            filter: (customId: string) => {
                return customId === BACK_BUTTON_ID;
            },
            resultingAction: (componentInteraction: MessageComponentInteraction) => {
                updateToManageCourseMenu(courseName, componentInteraction);
            }
        }
    ]
    
    return behaviors
}