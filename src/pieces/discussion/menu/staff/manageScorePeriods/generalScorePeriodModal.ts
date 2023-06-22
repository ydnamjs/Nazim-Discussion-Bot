import { ActionRowBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

// MODAL BEHAVIOR CONSTANTS
export const SCORE_PERIOD_MODAL_EXPIRATION_TIME = 600_000; // 10 minutes
export const DATE_STRING_FORMAT = "yyyy-MM-dd hh:mm:ss a";

export const DATABASE_ERROR_MESSAGE = "Database error. Please message admin";
export const CONFLICTING_DATES_MESSAGE = "New Score Period Has Overlap With Already Existing Score Period(s). New Score Period Was Not Added.";
export const INVALID_INPUT_PREFIX = "Invalid Input Format. New Score Period Was Not Added\nReasons(s):";
export const INVALID_START_DATE_REASON = "\n- Invalid start date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM Ex: 1970-01-01 12:00:00 AM";
export const INVALID_END_DATE_REASON = "\n- Invalid start date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM Ex: 2036-08-26 11:59:59 PM";
export const INVALID_GOAL_POINTS_REASON = "\n- Invalid goal points. Input should be a non negative integer less than or equal to max points. Ex: 800";
export const INVALID_MAX_POINTS_REASON = "\n- Invalid maximum points. Input should be a non negative integer greater than or equal to goal points. Ex: 1000";

// INPUT FIELD CONSTANTS
export const PERIOD_NUM_INPUT_ID = "discussion_score_period_input";
const PERIOD_NUM_INPUT_LABEL = "score period #";
const PERIOD_NUM_INPUT_PLACEHOLDER = "0";
const PERIOD_NUM_INPUT_STYLE = TextInputStyle.Short;

export const START_DATE_INPUT_ID = "discussion_score_period_start_input";
const START_DATE_INPUT_LABEL = "start date/time: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM";
const START_DATE_INPUT_PLACEHOLDER = "1970-01-01 12:00:00 AM";
const START_DATE_INPUT_STYLE = TextInputStyle.Short;

export const END_DATE_INPUT_ID = "discussion_score_period_end_input";
const END_DATE_INPUT_LABEL = "end date/time: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM";
const END_DATE_INPUT_PLACEHOLDER =  "2036-08-26 11:59:59 PM";
const END_DATE_INPUT_STYLE = TextInputStyle.Short;

export const GOAL_POINTS_INPUT_ID = "discussion_score_period_goal_input";
const GOAL_POINTS_INPUT_LABEL = "goal points";
const GOAL_POINTS_INPUT_PLACEHOLDER = "";
const GOAL_POINTS_INPUT_STYLE = TextInputStyle.Short;

export const MAX_POINTS_INPUT_ID = "discussion_score_period_max_input";
const MAX_POINTS_INPUT_LABEL = "max points";
const MAX_POINTS_INPUT_PLACEHOLDER = "";
const MAX_POINTS_INPUT_STYLE = TextInputStyle.Short;

// INPUT FIELDS
const scorePeriodNumInput = new TextInputBuilder({
    customId: PERIOD_NUM_INPUT_ID,
    label: PERIOD_NUM_INPUT_LABEL,
    placeholder: PERIOD_NUM_INPUT_PLACEHOLDER,
    style: PERIOD_NUM_INPUT_STYLE,
})

const startDateInput = new TextInputBuilder({
    customId: START_DATE_INPUT_ID,
    label: START_DATE_INPUT_LABEL,
    placeholder: START_DATE_INPUT_PLACEHOLDER,
    style: START_DATE_INPUT_STYLE,
})

const endDateInput = new TextInputBuilder({
    customId: END_DATE_INPUT_ID,
    label: END_DATE_INPUT_LABEL,
    placeholder: END_DATE_INPUT_PLACEHOLDER,
    style: END_DATE_INPUT_STYLE
})

const goalPointsInput = new TextInputBuilder({
    customId: GOAL_POINTS_INPUT_ID,
    label: GOAL_POINTS_INPUT_LABEL,
    placeholder: GOAL_POINTS_INPUT_PLACEHOLDER,
    style: GOAL_POINTS_INPUT_STYLE
})

const maxPointsInput = new TextInputBuilder({
    customId: MAX_POINTS_INPUT_ID,
    label: MAX_POINTS_INPUT_LABEL,
    placeholder: MAX_POINTS_INPUT_PLACEHOLDER,
    style: MAX_POINTS_INPUT_STYLE
})

// ACTION ROWS
export const scorePeriodNumActionRow = new ActionRowBuilder<TextInputBuilder>({components: [scorePeriodNumInput]});
export const startDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [startDateInput]});
export const endDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [endDateInput]});
export const goalPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [goalPointsInput]});
export const maxPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [maxPointsInput]});