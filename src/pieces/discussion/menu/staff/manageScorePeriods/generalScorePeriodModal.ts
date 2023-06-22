import { ActionRowBuilder, ButtonInteraction, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { DateTime } from "luxon";
import { sendDismissableInteractionReply } from "../../../../../generalUtilities/DismissableMessage";
import { DiscussionSpecs } from "src/generalModels/DiscussionScoring";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { courseModel } from "../../../../../generalModels/Course";

// MODAL BEHAVIOR CONSTANTS
export const SCORE_PERIOD_MODAL_EXPIRATION_TIME = 600_000; // 10 minutes
export const DATE_STRING_FORMAT = "yyyy-MM-dd hh:mm:ss a";

// MODAL NOTIFICATION CONSTANTS
export const DATABASE_ERROR_MESSAGE = "Database error. Please message admin";
export const CONFLICTING_DATES_MESSAGE = "Score Period Has Overlap With Already Existing Score Period(s). Nothing Was Changed.";
export const INVALID_INPUT_PREFIX = "Invalid Input Format. Nothing Was Changed\nReasons(s):";
export const INVALID_START_DATE_REASON = "\n- Invalid start date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM Ex: 1970-01-01 12:00:00 AM";
export const INVALID_END_DATE_REASON = "\n- Invalid start date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM Ex: 2036-08-26 11:59:59 PM";
export const INVALID_GOAL_POINTS_REASON = "\n- Invalid goal points. Input should be a non negative integer less than or equal to max points. Ex: 800";
export const INVALID_MAX_POINTS_REASON = "\n- Invalid maximum points. Input should be a non negative integer greater than or equal to goal points. Ex: 1000";
export const INVALID_INDEX_PERIOD_MESSAGE = "\n-Invalid score period input. Please retry with a number in your menu."

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

// INPUT DATA INTERFACE
/**
 * @interface defines the scorePeriod data that has been input. Used for after it has been converted from strings
 * @property {Date | undefined} startDate - If valid, the start date and time of the score period Undefined. if invalid input
 * @property {Date | undefined} endDate - If valid, the end date and time of the score period. Undefined if invalid input
 * @property {number} goalPoints - The target score that students are expected to earn in the score period. NaN if invalid input
 * @property {number} maxPoints - The maximum number of points that students can in earn in the score period. NaN if invalid input
 */
export interface ScorePeriodInputData {
    startDate: Date | undefined, 
    endDate: Date | undefined,  
    goalPoints: number, 
    maxPoints: number
}

// VALIDATE DATA HELPER FUNCTION
/**
 * @function validates the input of an add/edit score period modal
 * @param submittedModal the submitted modal whose input is to be validated
 * @returns {ScorePeriodInputData} scorePeriodInputData - the score period input data after validation (see ScorePeriodInputData interface)
 */
export function validateScorePeriodInput(submittedModal: ModalSubmitInteraction): ScorePeriodInputData {
    
    // get and validate start date
    const startDateString = submittedModal.fields.getTextInputValue(START_DATE_INPUT_ID);
    const startDateTime = DateTime.fromFormat(startDateString, DATE_STRING_FORMAT)
    const startDate = startDateTime.toJSDate().getTime() ? startDateTime.toJSDate() : undefined;

    // get and validate end date
    const endDateString = submittedModal.fields.getTextInputValue(END_DATE_INPUT_ID);
    const endDateTime = DateTime.fromFormat(endDateString, DATE_STRING_FORMAT)
    const endDate = endDateTime.toJSDate().getTime() ? endDateTime.toJSDate() : undefined;

    // get goal points
    let goalPoints = parseInt(submittedModal.fields.getTextInputValue(GOAL_POINTS_INPUT_ID));

    // get max points
    let maxPoints = parseInt(submittedModal.fields.getTextInputValue(MAX_POINTS_INPUT_ID));
    
    // validate points are non negative integers and that goal is not more than max
    if(goalPoints < 0)
    goalPoints = NaN;
    if(maxPoints < 0 )
        maxPoints = NaN;
    if(goalPoints > maxPoints) {
        goalPoints = NaN;
        maxPoints = NaN;
    }

    return {startDate: startDate, endDate: endDate, goalPoints: goalPoints, maxPoints: maxPoints};
}

// PROCESS VALIDATION DATA HELPER FUNCTION
/**
 * @function goes through score period validation data and if there any problems replies to the modal interaction with the reasons the data was invalid
 * @param {ModalSubmitInteraction} submittedModal - the modal interaction to reply to if any of the input is invalid
 * @param {ScorePeriodInputData} modalData - the validation data to check
 * @param {number} index - **optional** - index to also check for validity
 * @param {number} scorePeriodsLength - **optional** length of the score periods list that index is indexing to
 * @returns {boolean} isInvalid - whether or not any input was invalid
 */
export function processScorePeriodValidationData(submittedModal: ModalSubmitInteraction, modalData: ScorePeriodInputData, index?: number, scorePeriodsLength?: number): boolean { 
    
    // create list of reasons why input failed
    let reasons = "";
    if(index !== undefined && (Number.isNaN(index) || index < 1 || (scorePeriodsLength && index > scorePeriodsLength))) {
        reasons += INVALID_INDEX_PERIOD_MESSAGE;
    }
    if(!modalData.startDate){
        reasons += INVALID_START_DATE_REASON;
    }
    if(!modalData.endDate){
        reasons += INVALID_END_DATE_REASON;
    }
    if(Number.isNaN(modalData.goalPoints)){
        reasons += INVALID_GOAL_POINTS_REASON;
    }
    if(Number.isNaN(modalData.maxPoints)){
        reasons += INVALID_MAX_POINTS_REASON;
    }

    // if there are any reasons send the user the reasons and return true
    if(reasons !== "") {
        sendDismissableInteractionReply(submittedModal, INVALID_INPUT_PREFIX + reasons);
        return true;
    }

    // otherwise return false
    return false;
}

/**
 * @function adds a score period to a course in the database
 * @param {DiscussionSpecs} discussionSpecs - the discussion specs that are already in place for the course
 * @param {Object} newScorePeriodData - data for the score period to be added
 * @param {ModalSubmitInteraction} submittedModal - the modal submit interaction that caused the score period to be added
 * @param {ButtonInteraction} triggeringInteraction - the interaction that triggered the modal
 * @param {string} courseTitle - the name of the course that the score period is being added to
 * @param {string} successMessage - the message to be used in the reply on successful database insert
 */
export async function addOneScorePeriodToDataBase(
    discussionSpecs: DiscussionSpecs, 
    newScorePeriodData: {start: Date, end: Date, goalPoints: number, maxPoints: number}, 
    submittedModal: ModalSubmitInteraction,
    triggeringInteraction: ButtonInteraction,
    courseTitle: string,
    successMessage: string
    ) {
        // add the new score periods to the old and sort the list by start date
        discussionSpecs.scorePeriods.push({   
            start: newScorePeriodData.start,
            end: newScorePeriodData.end,
            goalPoints: newScorePeriodData.goalPoints,
            maxPoints: newScorePeriodData.maxPoints,
            studentScores: new Map()
        });
        discussionSpecs.scorePeriods = discussionSpecs.scorePeriods.sort((a, b) => { return a.start.valueOf() - b.start.valueOf() })
    
        // update the database with the new score period
        let newCourse: Document | null = null;
        try {
            newCourse = await courseModel.findOneAndUpdate( 
                {name: courseTitle}, 
                {discussionSpecs: discussionSpecs}
            )
        }
        // if there was a database error, inform the user and return
        catch(error: any) {
            sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
            console.error(error);
            return;
        }
    
        // otherwise, inform the user that the score period was successfully added
        if(newCourse !== null) {
            
            // inform the user of the success
            sendDismissableInteractionReply(submittedModal, successMessage)
    
            // refresh the menu to reflect new score periods
            await updateToManageScorePeriodsMenu(courseTitle, triggeringInteraction, false, false);
    
            //TODO: After a score period is added, score all of the posts and comments that would fall into it (only necessary for score periods that started in the past)
            return;
        }
}