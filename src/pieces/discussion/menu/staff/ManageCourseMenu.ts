import { ButtonStyle, Component, InteractionUpdateOptions, Message, MessageComponentInteraction, messageLink } from "discord.js";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { makeActionRowButton } from "../../../../generalUtilities/MakeActionRow";
import { updateToStaffMenu } from "./DiscussionStaffMenu";
import { ComponentBehavior } from "../BaseMenu";
import { updateToViewStudentsMenu } from "./ViewStudentsMenu";
import { updateToManageScorePeriodsMenu } from "./manageScorePeriods/ManageScorePeriodsMenu";

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
const MANAGE_POST_SCORING_BUTTON_DISABLED = true;
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
export async function updateToManageCourseMenu(name: string, message: Message, componentInteraction: MessageComponentInteraction) {

    // replace the old menu with the manage course menu
    const manageCourseMenu = new ManageCourseMenu(name);
    componentInteraction.update(manageCourseMenu.menuMessageData as InteractionUpdateOptions);
    manageCourseMenu.collectMenuInteraction(componentInteraction, message);
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


export class ManageCourseMenu extends NavigatedMenu {
    constructor(courseTitle: string) {
        
        // generate the fields of basic info for each course and the select menu options
        let fields: { name: string; value: string; }[] = [
            // get scores csv button explanation
            {
                name: GET_SCORES_BUTTON_LABEL,
                value: GET_SCORES_CSV_DESCRIPTION
            },
            // manage post scoring button explanation
            {
                name: MANAGE_POST_SCORING_BUTTON_LABEL,
                value: MANAGE_POST_SCORING_DESCRIPTION
            },
            // manage comment scoring button explanation
            {
                name: MANAGE_COMMENT_SCORING_BUTTON_LABEL,
                value: MANAGE_COMMENT_SCORING_DESCRIPTION
            },
            // manage score periods button explanation
            {
                name: MANAGE_SCORE_PERIODS_BUTTON_LABEL,
                value: MANAGE_SCORE_PERIODS_DESCRIPTION
            },
            // view students button explanation
            {
                name: VIEW_STUDENTS_BUTTON_LABEL,
                value: VIEW_STUDENTS_DESCRIPTION
            },
            // view staff button explanation
            {
                name: VIEW_STAFF_BUTTON_LABEL,
                value: VIEW_STAFF_DESCRIPTION
            }
        ];

        // list of additional components
        const COURSE_MENU_ADDITIONAL_COMPONENTS = [SCORE_BUTTON_ROW, PEOPLE_BUTTON_ROW];
        
        // list of component behaviors
        const COURSE_MENU_ADDITIONAL_BEHAVIORS: ComponentBehavior[] = [
            // BACK TO MY COURSES BUTTON BEHAVIOR
            {
                filter: (customId) => {
                    return customId === BACK_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    updateToStaffMenu(message, componentInteraction);
                }
            },

            // GET SCORES CSV BUTTON BEHAVIOR
            {
                filter: (customId) => {
                    return customId === GET_SCORES_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    // TODO: IMPLEMENT ME ONCE MENU IS COMPLETE
                }
            },

            // MANAGE POST SCORING BUTTON BEHAVIOR
            {
                filter: (customId) => {
                    return customId === MANAGE_POST_SCORING_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    // TODO: IMPLEMENT ME ONCE MENU IS COMPLETE
                }
            },

            // MANAGE COMMENT SCORING BUTTON BEHAVIOR
            {
                filter: (customId) => {
                    return customId === MANAGE_COMMENT_SCORING_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    // TODO: IMPLEMENT ME ONCE MENU IS COMPLETE
                }
            },

            // MANAGE SCORE PERIODS BUTTON BEHAVIOR
            {
                filter: (customId) => {
                    return customId === MANAGE_SCORE_PERIODS_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    updateToManageScorePeriodsMenu(courseTitle, message, componentInteraction)
                }
            },

            // VIEW STUDENTS BUTTON BEHAVIOR
            {
                filter: (customId) => {
                    return customId === VIEW_STUDENTS_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    updateToViewStudentsMenu(courseTitle, message, componentInteraction);
                }
            },

            // VIEW STAFF BUTTON BEHAVIOR
            {
                filter: (customId) => {
                    return customId === VIEW_STAFF_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    // TODO: IMPLEMENT ME ONCE MENU IS COMPLETE
                }
            },
        ]

        // data to be fed into super class navigated menu
        const menuData: NavigatedMenuData = {
            title: COURSE_NAME_PREFIX + courseTitle.toUpperCase() + COURSE_NAME_SUFFIX,
            description: MENU_DESCRIPTION,
            fields: fields,
            additionalComponents: COURSE_MENU_ADDITIONAL_COMPONENTS,
            additionalComponentBehaviors: COURSE_MENU_ADDITIONAL_BEHAVIORS
        }

        super(menuData, 0, customNavOptions);
    }
}