import { ButtonStyle } from "discord.js";
import { makeActionRowButton } from "../../../../generalUtilities/MakeActionRow";
import { CustomNavOptions } from "../NavigatedMenu";
import { ComponentBehavior } from "../BaseMenu";
import { updateToStaffMenu } from "./DiscussionStaffMenu";

// CONSTANTS
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

export const customNavOptions: CustomNavOptions = {
    prevButtonOptions: {},
    nextButtonOptions: {},
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

// NAVIGATION ROW BEHAVIOR

const BACK_BUTTON_BEHAVIOR: ComponentBehavior = {
    filter: (customId) => {
        return customId === BACK_BUTTON_ID;
    },
    resultingAction: (message, componentInteraction) => {
        updateToStaffMenu(message, componentInteraction);
    }

}

// SCORING ROW BEHAVIOR

// PEOPLE ROW BEHAVIOR

// EXPORTS
export const COURSE_MENU_ADDITIONAL_COMPONENTS = [SCORE_BUTTON_ROW, PEOPLE_BUTTON_ROW];
export const COURSE_MENU_ADDITIONAL_BEHAVIORS = [
    BACK_BUTTON_BEHAVIOR,
]