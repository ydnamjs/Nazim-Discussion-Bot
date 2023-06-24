import { ActionRowBuilder, ButtonInteraction, ModalBuilder, ModalSubmitInteraction, TextInputBuilder } from "discord.js";
import { DateTime } from "luxon";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { ScorePeriod } from "../../../../../generalModels/DiscussionScoring";
import { sendDismissableInteractionReply } from "../../../../../generalUtilities/DismissableMessage";
import { refreshManagePeriodsMenu, updateToManagePeriodsMenu } from "./ManageScorePeriodsMenu";
import { DATABASE_ERROR_MESSAGE, DATE_STRING_FORMAT, END_DATE_INPUT_ID, GOAL_POINTS_INPUT_ID, INVALID_END_DATE_REASON, INVALID_GOAL_POINTS_REASON, INVALID_INDEX_PERIOD_REASON, INVALID_MAX_POINTS_REASON, INVALID_START_DATE_REASON, MAX_POINTS_INPUT_ID, MODAL_EXPIRATION_TIME, START_DATE_INPUT_ID } from "./ModalComponents";

/**
 * @type function that will handle a modals input data and return the interaction response message as a string
 */
export type ModalInputHandler = (courseName: string, submittedModal: ModalSubmitInteraction) => Promise<string>;

export async function createScorePeriodModal(idPrefix: string, titlePrefix: string, courseName: string, triggerInteraction: ButtonInteraction, components: ActionRowBuilder<TextInputBuilder>[], modalInputHandler: ModalInputHandler) {
    
    // the modal id has to be generated based on time 
    // because if it isnt and the user cancels the modal and opens another one
    // we have to filter that it matches the id otherwise the canceled modal will also be processed
    // and we'll have duplicates and that behavior is VERY undefined
    const modalId = idPrefix + new Date().getMilliseconds()

    updateToManagePeriodsMenu(courseName, triggerInteraction, false);

    const addScorePeriodModal = new ModalBuilder({
        customId: modalId,
        title: titlePrefix + courseName,
        components: components
    })
    
    triggerInteraction.showModal(addScorePeriodModal);

    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        // we have to filter that it matches the id because if it isnt and the user cancels the modal and opens another one the
        // canceled modal will also be processed and we'll have duplicates and that behavior is VERY undefined
        // (this is unlike message component interactions! and thus weird)
        submittedModal = await triggerInteraction.awaitModalSubmit({filter: (modal)=> {return modal.customId === modalId}, time: MODAL_EXPIRATION_TIME});
    }
    catch {}

    if (submittedModal !== undefined) {
        const replyText = await modalInputHandler(courseName, submittedModal);
        refreshManagePeriodsMenu(courseName, triggerInteraction);
        sendDismissableInteractionReply(submittedModal, replyText);
    }
}

/**
 * @interface information about the validity of a score period
 * @property {Date | undefined} startDate - the starting date of a score period if valid (undefined if invalid)
 * @property {Date | undefined} endDate - the ending date of a score period if valid (undefined if invalid)
 * @property {number} goalPoints - the goal points of a score period if valid (NaN if invalid)
 * @property {number} maxPoints - the maximum points of a score period if valid (NaN if invalid)
 */
export interface ScorePeriodValidationData {
    startDate: Date | undefined, 
    endDate: Date | undefined,  
    goalPoints: number, 
    maxPoints: number
}

/**
 * @function generates validation data for the given score period
 * @param {ModalSubmitInteraction} submittedModal - the submitted modal interaction whose input is to be validated
 * @returns {ScorePeriodValidationData} scorePeriodInputData - data about the validity of each property of the score period
 */
export function validateScorePeriodInput(submittedModal: ModalSubmitInteraction): ScorePeriodValidationData {
    
    const startDateString = submittedModal.fields.getTextInputValue(START_DATE_INPUT_ID);
    const startDateTime = DateTime.fromFormat(startDateString, DATE_STRING_FORMAT)
    const startDate = startDateTime.toJSDate().getTime() ? startDateTime.toJSDate() : undefined;

    const endDateString = submittedModal.fields.getTextInputValue(END_DATE_INPUT_ID);
    const endDateTime = DateTime.fromFormat(endDateString, DATE_STRING_FORMAT)
    const endDate = endDateTime.toJSDate().getTime() ? endDateTime.toJSDate() : undefined;

    let goalPoints = parseInt(submittedModal.fields.getTextInputValue(GOAL_POINTS_INPUT_ID));
    let maxPoints = parseInt(submittedModal.fields.getTextInputValue(MAX_POINTS_INPUT_ID));
    
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

/**
 * @function goes through score period validation data and assembles a string detailing why it the data is invalid if at all
 * @param {ScorePeriodInputData} modalData - the validation data to handle
 * @returns {string} reasonsForFailure - the reasons why the data was invalid
 */
export function handlePeriodValidation(modalData: ScorePeriodValidationData): string { 
    
    let reasonsForFailure = "";
    if(!modalData.startDate){
        reasonsForFailure += INVALID_START_DATE_REASON;
    }
    if(!modalData.endDate){
        reasonsForFailure += INVALID_END_DATE_REASON;
    }
    if(Number.isNaN(modalData.goalPoints)){
        reasonsForFailure += INVALID_GOAL_POINTS_REASON;
    }
    if(Number.isNaN(modalData.maxPoints)){
        reasonsForFailure += INVALID_MAX_POINTS_REASON;
    }
    return reasonsForFailure;
}

/**
 * @function validates and handles a score period index against the length of the list it is indexing
 * @param {number} scorePeriodIndex - the index being validated
 * @param {number} scorePeriodsLength - the length of the score period list being indexed
 * @returns {string} reasonsForFailure - the reason the input was not valid if there was one
 */
export function handleIndexValidation(scorePeriodIndex: number, scorePeriodsLength: number): string {
    
    if( Number.isNaN(scorePeriodIndex) || scorePeriodIndex < 1 || (scorePeriodsLength && scorePeriodIndex > scorePeriodsLength) ) {
        return INVALID_INDEX_PERIOD_REASON;
    }
    return "";
}

/**
 * @interface data used to construct a new score period
 * @property {Date} start: the start of the new score period
 * @property {Date} end: the end of the new score period
 * @property {number} goalPoints: the target number of points that can be earned in the new score period
 * @property {number} maxPoints: the maximum number of points that can be earned in the new score period
 */
export interface NewScorePeriodData {
    start: Date, 
    end: Date,  
    goalPoints: number, 
    maxPoints: number
}

/**
 * @function determines if the new score period provided has any issues with the current ones
 * @param newScorePeriodData - the new score period to be added
 * @param currentScorePeriods - the old score periods being checked against
 * @returns {boolean} hasConflict - whether or not the new score Period has a conflict with the current ones
 */
export async function checkAgainstCurrentPeriods(newScorePeriodData: NewScorePeriodData, currentScorePeriods: ScorePeriod[]): Promise<boolean> {

    let hasConflict = false;
    currentScorePeriods.forEach((scorePeriod) => {
        if(scorePeriod.start.valueOf() <= newScorePeriodData.end.valueOf() && scorePeriod.end.valueOf() >= newScorePeriodData.start.valueOf()) {
            hasConflict = true;
        }
    })
    return hasConflict;
}

/**
 * @function inserts a score period to a course in the database
 * @param {Object} newScorePeriodData - data for the score period to be added
 * @param {ModalSubmitInteraction} submittedModal - the modal submit interaction that caused the score period to be added
 * @param {string} courseName - the name of the course that the score period is being added to
 * @param {string} successMessage - the message to be used in the reply on successful database insert
 */
export async function insertOnePeriod( courseName: string, newScorePeriodData: NewScorePeriodData, scorePeriods: ScorePeriod[], submittedModal: ModalSubmitInteraction, successMessage: string ): Promise<string> {

    scorePeriods.push({ ...newScorePeriodData, studentScores: new Map() });
    scorePeriods = scorePeriods.sort((a, b) => { return a.start.valueOf() - b.start.valueOf() })
    
    const insertErrors = await overwritePeriods(courseName, scorePeriods)

    return insertErrors;
}

/**
 * @function overwrites the score periods of the given course
 * @param {string} courseName - the name of the course to overwrite the score periods of
 * @param {ScorePeriod[]} scorePeriods - the new score periods that will overwrite the ones in the course
 * @returns {string} reasonsForFailure - the reasons that the overwrite failed if any
 */
async function overwritePeriods(courseName: string, scorePeriods: ScorePeriod[]): Promise<string> {
    let newCourse: Course | null = null;
    try {
        newCourse = await courseModel.findOneAndUpdate( 
            {name: courseName}, 
            {"discussionSpecs.scorePeriods": scorePeriods}
        )
    }
    catch(error: any) {
        console.error(error);
        return DATABASE_ERROR_MESSAGE;
    }
    return "";
}