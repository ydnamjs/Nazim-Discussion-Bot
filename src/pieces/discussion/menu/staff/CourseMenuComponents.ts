import { ButtonStyle } from "discord.js";
import { makeActionRowButton } from "src/generalUtilities/MakeActionRow";
import { CustomNavOptions } from "../NavigatedMenu";
import { ComponentBehavior } from "../BaseMenu";
import { updateToStaffMenu } from "./DiscussionStaffMenu";

const BACK_BUTTON_ID = "discussion_staff_menu_button";

// NAVIGATION ROW BUTTONS

export const customNavOptions: CustomNavOptions = {
    prevButtonOptions: {},
    nextButtonOptions: {},
    specialMenuButton: {
        customId: BACK_BUTTON_ID, 
        label: "back to my courses",
        disabled: false,
        style: ButtonStyle.Secondary
    }
};

// SCORING ROW BUTTONS

const GET_SCORES_BUTTON_DATA = {
    label: "Get Scores CSV",
    custom_id: "discussion-get-scores-button",
    disabled: true,
    style: ButtonStyle.Primary
};

const MANAGE_POST_SCORING_BUTTON_DATA = {
    label: "Manage Post Scoring",
    custom_id: "discussion-manage-post-scoring",
    disabled: true,
    style: ButtonStyle.Secondary
}

const MANAGE_COMMENT_SCORING_BUTTON_DATA = {
    label: "Manage Comment Scoring",
    custom_id: "discussion-manage-comment-scoring",
    disabled: true,
    style: ButtonStyle.Secondary
}

const MANAGE_SCORE_PERIODS_BUTTON_DATA = {
    label: "Manage Score Periods",
    custom_id: "discussion-manage-score-periods",
    disabled: true,
    style: ButtonStyle.Secondary
}

export const SCORE_BUTTON_ROW = makeActionRowButton([GET_SCORES_BUTTON_DATA, MANAGE_POST_SCORING_BUTTON_DATA, MANAGE_COMMENT_SCORING_BUTTON_DATA, MANAGE_SCORE_PERIODS_BUTTON_DATA])

// NAVIGATION ROW BEHAVIOR

export const BACK_BUTTON_BEHAVIOR: ComponentBehavior = {
    filter: (customId) => {
        return customId === BACK_BUTTON_ID;
    },
    resultingAction: (message, componentInteraction) => {
        updateToStaffMenu(message, componentInteraction);
    }

}

// SCORING ROW BEHAVIOR

// EXPORTS
export const COURSE_MENU_ADDITIONAL_COMPONENTS = [SCORE_BUTTON_ROW];
export const COURSE_MENU_ADDITIONAL_BEHAVIORS = [
    BACK_BUTTON_BEHAVIOR,
]