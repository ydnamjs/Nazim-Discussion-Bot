import { APIEmbedField, ButtonStyle, InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { makeActionRowButton } from "../../../../generalUtilities/MakeActionRow";
import { ComponentBehavior } from "../../../menu/BaseMenu";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../../../menu/NavigatedMenu";
import { updateToStaffCoursesMenu } from "./StaffCoursesMenu";
import { updateToViewStudentsMenu } from "./ViewStudentsMenu";
import { updateToManagePeriodsMenu } from "./manageScorePeriods/ManageScorePeriodsMenu";
import { updateToManagePostScoringMenu } from "./managePostScoring/ManagePostScoringMenu";

// BUTTON CONSTANTS
const BACK_BUTTON_ID = "discussion_staff_menu_button";
const BACK_BUTTON_LABEL = "Back To My Courses";
const BACK_BUTTON_DISABLED = false;
const BACK_BUTTON_STYLE = ButtonStyle.Secondary

const GET_SCORES_BUTTON_ID = "discussion-get-scores-button";
const GET_SCORES_BUTTON_LABEL = "Get Scores";
const GET_SCORES_BUTTON_DISABLED = true;
const GET_SCORES_BUTTON_STYLE = ButtonStyle.Primary

const MANAGE_POST_SCORING_BUTTON_ID = "discussion-manage-post-scoring";
const MANAGE_POST_SCORING_BUTTON_LABEL = "Post Scoring";
const MANAGE_POST_SCORING_BUTTON_DISABLED = false;
const MANAGE_POST_SCORING_BUTTON_STYLE = ButtonStyle.Secondary

const MANAGE_COMMENT_SCORING_BUTTON_ID = "discussion-manage-comment-scoring";
const MANAGE_COMMENT_SCORING_BUTTON_LABEL = "Comment Scoring";
const MANAGE_COMMENT_SCORING_BUTTON_DISABLED = true;
const MANAGE_COMMENT_SCORING_BUTTON_STYLE = ButtonStyle.Secondary

const MANAGE_SCORE_PERIODS_BUTTON_ID = "discussion-manage-score-periods";
const MANAGE_SCORE_PERIODS_BUTTON_LABEL = "Score Periods";
const MANAGE_SCORE_PERIODS_BUTTON_DISABLED = false;
const MANAGE_SCORE_PERIODS_BUTTON_STYLE = ButtonStyle.Secondary

const VIEW_STUDENTS_BUTTON_ID = "discussion-view-students";
const VIEW_STUDENTS_BUTTON_LABEL = "View Students";
const VIEW_STUDENTS_BUTTON_DISABLED = false;
const VIEW_STUDENTS_BUTTON_STYLE = ButtonStyle.Secondary

const VIEW_STAFF_BUTTON_ID = "discussion-view-staff";
const VIEW_STAFF_BUTTON_LABEL = "View Staff";
const VIEW_STAFF_BUTTON_DISABLED = true;
const VIEW_STAFF_BUTTON_STYLE = ButtonStyle.Secondary

// NAVIGATION ROW

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

// SCORING ROW

const GET_SCORES_BUTTON_DATA = {
    custom_id: GET_SCORES_BUTTON_ID,
    label: GET_SCORES_BUTTON_LABEL,
    disabled: GET_SCORES_BUTTON_DISABLED,
    style: GET_SCORES_BUTTON_STYLE
};

const MANAGE_POST_SCORING_BUTTON_DATA = {
    custom_id: MANAGE_POST_SCORING_BUTTON_ID,
    label: MANAGE_POST_SCORING_BUTTON_LABEL,
    disabled: MANAGE_POST_SCORING_BUTTON_DISABLED,
    style: MANAGE_POST_SCORING_BUTTON_STYLE
}

const MANAGE_COMMENT_SCORING_BUTTON_DATA = {
    custom_id: MANAGE_COMMENT_SCORING_BUTTON_ID,
    label: MANAGE_COMMENT_SCORING_BUTTON_LABEL,
    disabled: MANAGE_COMMENT_SCORING_BUTTON_DISABLED,
    style: MANAGE_COMMENT_SCORING_BUTTON_STYLE
}

const MANAGE_SCORE_PERIODS_BUTTON_DATA = {
    custom_id: MANAGE_SCORE_PERIODS_BUTTON_ID,
    label: MANAGE_SCORE_PERIODS_BUTTON_LABEL,
    disabled: MANAGE_SCORE_PERIODS_BUTTON_DISABLED,
    style: MANAGE_SCORE_PERIODS_BUTTON_STYLE
}

const SCORE_BUTTON_ROW = makeActionRowButton([GET_SCORES_BUTTON_DATA, MANAGE_POST_SCORING_BUTTON_DATA, MANAGE_COMMENT_SCORING_BUTTON_DATA, MANAGE_SCORE_PERIODS_BUTTON_DATA])

// PEOPLE ROW

const VIEW_STUDENTS_BUTTON_DATA = {
    custom_id: VIEW_STUDENTS_BUTTON_ID,
    label: VIEW_STUDENTS_BUTTON_LABEL,
    disabled: VIEW_STUDENTS_BUTTON_DISABLED,
    style: VIEW_STUDENTS_BUTTON_STYLE
}

const VIEW_STAFF_BUTTON_DATA = {
    custom_id: VIEW_STAFF_BUTTON_ID,
    label: VIEW_STAFF_BUTTON_LABEL,
    disabled: VIEW_STAFF_BUTTON_DISABLED,
    style: VIEW_STAFF_BUTTON_STYLE
}

const PEOPLE_BUTTON_ROW = makeActionRowButton([VIEW_STUDENTS_BUTTON_DATA, VIEW_STAFF_BUTTON_DATA]);

// UPDATE FUNCTION
export async function updateToManageCourseMenu(name: string, componentInteraction: MessageComponentInteraction) {

    const manageCourseMenu = new ManageCourseMenu(name);
    await componentInteraction.update(manageCourseMenu.menuMessageData as InteractionUpdateOptions);
    manageCourseMenu.collectMenuInteraction(componentInteraction.message);
}

// MENU TEXT CONSTANTS
const COURSE_NAME_PREFIX = "CISC ";
const COURSE_NAME_SUFFIX = " - COURSE MENU";
const MENU_DESCRIPTION = "**Welcome to the course expanded menu! Below this you will find a description of each button in the menu. Please read the descriptions and click the button that corresponds to the action you would like to take**";

const GET_SCORES_CSV_DESCRIPTION = "Click the \"" + GET_SCORES_BUTTON_LABEL + "\" button to open a modal for recieving scores as a comma separated values file";
const MANAGE_POST_SCORING_DESCRIPTION = "Click the \"" + MANAGE_POST_SCORING_BUTTON_LABEL + "\" button to open a menu for managing the points, requirements, and awards settings for posts";
const MANAGE_COMMENT_SCORING_DESCRIPTION = "Click the \"" + MANAGE_COMMENT_SCORING_BUTTON_LABEL + "\" button to open a menu for managing the points, requirements, and awards settings for comments";
const MANAGE_SCORE_PERIODS_DESCRIPTION = "Click the \"" + MANAGE_SCORE_PERIODS_BUTTON_LABEL + "\" button to open a menu for viewing and editing the score periods for the course";
const VIEW_STUDENTS_DESCRIPTION = "Click the \"" + VIEW_STUDENTS_BUTTON_LABEL + "\" button to open a menu for viewing a list of students with various stats about them";
const VIEW_STAFF_DESCRIPTION = "Click the \"" + VIEW_STAFF_BUTTON_LABEL + "\" button to open a menu for viewing a list of staff members with various stats about them";

const menuFields: APIEmbedField[] = [
    {
        name: GET_SCORES_BUTTON_LABEL,
        value: GET_SCORES_CSV_DESCRIPTION
    },
    {
        name: MANAGE_POST_SCORING_BUTTON_LABEL,
        value: MANAGE_POST_SCORING_DESCRIPTION
    },
    {
        name: MANAGE_COMMENT_SCORING_BUTTON_LABEL,
        value: MANAGE_COMMENT_SCORING_DESCRIPTION
    },
    {
        name: MANAGE_SCORE_PERIODS_BUTTON_LABEL,
        value: MANAGE_SCORE_PERIODS_DESCRIPTION
    },
    {
        name: VIEW_STUDENTS_BUTTON_LABEL,
        value: VIEW_STUDENTS_DESCRIPTION
    },
    {
        name: VIEW_STAFF_BUTTON_LABEL,
        value: VIEW_STAFF_DESCRIPTION
    }
]

const ADDITIONAL_COMPONENTS = [SCORE_BUTTON_ROW, PEOPLE_BUTTON_ROW];

class ManageCourseMenu extends NavigatedMenu {
    
    constructor(courseTitle: string) {

        const menuData: NavigatedMenuData = {
            title: COURSE_NAME_PREFIX + courseTitle.toUpperCase() + COURSE_NAME_SUFFIX,
            description: MENU_DESCRIPTION,
            fields: menuFields,
            additionalComponents: ADDITIONAL_COMPONENTS,
            additionalComponentBehaviors: generateBehaviors(courseTitle)
        }

        super(menuData, 0, customNavOptions);
    }
}

function generateBehaviors(courseName: string): ComponentBehavior[] {
    
    return [
        {
            filter: (customId) => {
                return customId === BACK_BUTTON_ID;
            },
            resultingAction: (componentInteraction) => {
                updateToStaffCoursesMenu(componentInteraction);
            }
        },
        {
            filter: (customId) => {
                return customId === GET_SCORES_BUTTON_ID;
            },
            resultingAction: (componentInteraction) => {
                // TODO: IMPLEMENT ME ONCE MENU IS COMPLETE
            }
        },
        {
            filter: (customId) => {
                return customId === MANAGE_POST_SCORING_BUTTON_ID;
            },
            resultingAction: (componentInteraction) => {
                updateToManagePostScoringMenu(courseName, componentInteraction, true)
            }
        },
        {
            filter: (customId) => {
                return customId === MANAGE_COMMENT_SCORING_BUTTON_ID;
            },
            resultingAction: (componentInteraction) => {
                // TODO: IMPLEMENT ME ONCE MENU IS COMPLETE
            }
        },
        {
            filter: (customId) => {
                return customId === MANAGE_SCORE_PERIODS_BUTTON_ID;
            },
            resultingAction: (componentInteraction) => {
                updateToManagePeriodsMenu(courseName, componentInteraction, true);
            }
        },
        {
            filter: (customId) => {
                return customId === VIEW_STUDENTS_BUTTON_ID;
            },
            resultingAction: (componentInteraction) => {
                updateToViewStudentsMenu(courseName, componentInteraction);
            }
        },
        {
            filter: (customId) => {
                return customId === VIEW_STAFF_BUTTON_ID;
            },
            resultingAction: (componentInteraction) => {
                // TODO: IMPLEMENT ME ONCE MENU IS COMPLETE
            }
        },
    ]
}