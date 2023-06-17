import { ButtonStyle, Component, InteractionUpdateOptions, Message, MessageComponentInteraction, messageLink } from "discord.js";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { makeActionRowButton } from "../../../../generalUtilities/MakeActionRow";
import { updateToStaffMenu } from "./DiscussionStaffMenu";
import { ComponentBehavior } from "../BaseMenu";

// BUTTON CONSTANTS
const BACK_BUTTON_ID = "discussion_staff_menu_button";
const BACK_BUTTON_LABEL = "back to my courses";
const BACK_BUTTON_DISABLED = false;
const BACK_BUTTON_STYLE = ButtonStyle.Secondary

const GET_SCORES_BUTTON_ID = "discussion-get-scores-button";
const GET_SCORES_BUTTON_LABEL = "Get Scores CSV";
const GET_SCORES_BUTTON_DISABLED = true;
const GET_SCORES_BUTTON_STYLE = ButtonStyle.Primary

const MANAGE_POST_SCORING_BUTTON_ID = "discussion-manage-post-scoring";
const MANAGE_POST_SCORING_BUTTON_LABEL = "Manage Post Scoring";
const MANAGE_POST_SCORING_BUTTON_DISABLED = true;
const MANAGE_POST_SCORING_BUTTON_STYLE = ButtonStyle.Secondary

const MANAGE_COMMENT_SCORING_BUTTON_ID = "discussion-manage-comment-scoring";
const MANAGE_COMMENT_SCORING_BUTTON_LABEL = "Manage Comment Scoring";
const MANAGE_COMMENT_SCORING_BUTTON_DISABLED = true;
const MANAGE_COMMENT_SCORING_BUTTON_STYLE = ButtonStyle.Secondary

const MANAGE_SCORE_PERIODS_BUTTON_ID = "discussion-manage-score-periods";
const MANAGE_SCORE_PERIODS_BUTTON_LABEL = "Manage Score Periods";
const MANAGE_SCORE_PERIODS_BUTTON_DISABLED = true;
const MANAGE_SCORE_PERIODS_BUTTON_STYLE = ButtonStyle.Secondary

const VIEW_STUDENTS_BUTTON_ID = "discussion-view-students";
const VIEW_STUDENTS_BUTTON_LABEL = "View Students";
const VIEW_STUDENTS_BUTTON_DISABLED = true;
const VIEW_STUDENTS_BUTTON_STYLE = ButtonStyle.Secondary

const VIEW_STAFF_BUTTON_ID = "discussion-view-staff";
const VIEW_STAFF_BUTTON_LABEL = "View Staff";
const VIEW_STAFF_BUTTON_DISABLED = true;
const VIEW_STAFF_BUTTON_STYLE = ButtonStyle.Secondary

// NAVIGATION ROW

const customNavOptions: CustomNavOptions = {
    prevButtonOptions: {exists: false},
    nextButtonOptions: {exists: false},
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

export class ManageCourseMenu extends NavigatedMenu {
    constructor(tempTitle: string) {
        
        // generate the fields of basic info for each course and the select menu options
        let fields: { name: string; value: string; }[] = [];

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
                    // TODO: IMPLEMENT ME ONCE MENU IS COMPLETE
                }
            },

            // VIEW STUDENTS BUTTON BEHAVIOR
            {
                filter: (customId) => {
                    return customId === VIEW_STUDENTS_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    // TODO: IMPLEMENT ME ONCE MENU IS COMPLETE
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
            title: tempTitle,
            description: "MANAGE COURSE TEMP DESC",
            fields: fields,
            additionalComponents: COURSE_MENU_ADDITIONAL_COMPONENTS,
            additionalComponentBehaviors: COURSE_MENU_ADDITIONAL_BEHAVIORS
        }

        super(menuData, 0, customNavOptions);
    }
}