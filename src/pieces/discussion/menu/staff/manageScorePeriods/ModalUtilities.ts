import { ActionRowBuilder, ButtonInteraction, Message, ModalBuilder, ModalSubmitInteraction, TextInputBuilder } from "discord.js";
import { DateTime } from "luxon";
import { courseModel } from "../../../../../generalModels/Course";
import { ScorePeriod } from "../../../../../generalModels/DiscussionScoring";
import { sendDismissableInteractionReply, sendDismissableReply } from "../../../../../generalUtilities/DismissableMessage";
import { refreshMenu, refreshMenuInteraction, updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { CONFLICTING_DATES_MESSAGE, DATABASE_ERROR_MESSAGE, DATE_STRING_FORMAT, END_DATE_INPUT_ID, GOAL_POINTS_INPUT_ID, INVALID_END_DATE_REASON, INVALID_GOAL_POINTS_REASON, INVALID_INDEX_PERIOD_REASON, INVALID_MAX_POINTS_REASON, INVALID_START_DATE_REASON, MAX_POINTS_INPUT_ID, MODAL_EXPIRATION_TIME, START_DATE_INPUT_ID } from "./ModalComponents";

export type ModalInputHandler = (courseName: string, submittedModal: ModalSubmitInteraction) => Promise<string>;

export async function createScorePeriodModal(idPrefix: string, titlePrefix: string, courseName: string, triggerInteraction: ButtonInteraction, components: ActionRowBuilder<TextInputBuilder>[], modalInputHandler: ModalInputHandler) {
    
    // the modal id has to be generated based on time 
    // because if it isnt and the user cancels the modal and opens another one
    // we have to filter that it matches the id otherwise the canceled modal will also be processed
    // and we'll have duplicates and that behavior is VERY undefined
    const modalId = idPrefix + new Date().getMilliseconds()

    updateToManageScorePeriodsMenu(courseName, triggerInteraction, false, true);

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
        refreshMenuInteraction(courseName, triggerInteraction);
        sendDismissableInteractionReply(submittedModal, replyText);
    }
}

export interface ScorePeriodValidationData {
    startDate: Date | undefined, 
    endDate: Date | undefined,  
    goalPoints: number, 
    maxPoints: number
}

/**
 * @function validates the input of an add/edit score period modal
 * @param submittedModal the submitted modal whose input is to be validated
 * @returns {ScorePeriodInputData} scorePeriodInputData - the score period input data after validation (see ScorePeriodInputData interface)
 */
export function validateScorePeriodInput(submittedModal: ModalSubmitInteraction): ScorePeriodValidationData {
    
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

    // TODO: rename function to better reflect that it also validates index
/**
 * @function goes through score period validation data and if there any problems replies to the modal interaction with the reasons the data was invalid
 * @param {ModalSubmitInteraction} submittedModal - the modal interaction to reply to if any of the input is invalid
 * @param {ScorePeriodInputData} modalData - the validation data to check
 * @returns {boolean} isInvalid - whether or not the input was invalid
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

export function handleIndexValidation(scorePeriodIndex: number, scorePeriodsLength: number): string {
    
    if( Number.isNaN(scorePeriodIndex) || scorePeriodIndex < 1 || (scorePeriodsLength && scorePeriodIndex > scorePeriodsLength) ) {
        return INVALID_INDEX_PERIOD_REASON;
    }
    return "";
}

export interface ScorePeriodData {
    start: Date, 
    end: Date,  
    goalPoints: number, 
    maxPoints: number
}

//TODO: JSDocify
export async function checkAgainstCurrentPeriods(newScorePeriodData: ScorePeriodData, currentScorePeriods: ScorePeriod[], submittedModal: ModalSubmitInteraction): Promise<boolean> {

    let hasConflict = false;
    currentScorePeriods.forEach((scorePeriod) => {
        if(scorePeriod.start.valueOf() <= newScorePeriodData.end.valueOf() && scorePeriod.end.valueOf() >= newScorePeriodData.start.valueOf()) {
            hasConflict = true;
        }
    })

    if(hasConflict) {
        sendDismissableInteractionReply(submittedModal, CONFLICTING_DATES_MESSAGE);
        return true;
    }
    return false;
}

/**
 * @function inserts a score period to a course in the database
 * @param {Object} newScorePeriodData - data for the score period to be added
 * @param {ModalSubmitInteraction} submittedModal - the modal submit interaction that caused the score period to be added
 * @param {string} courseName - the name of the course that the score period is being added to
 * @param {string} successMessage - the message to be used in the reply on successful database insert
 */
export async function insertOnePeriod( courseName: string, newScorePeriodData: ScorePeriodData, scorePeriods: ScorePeriod[], submittedModal: ModalSubmitInteraction, successMessage: string ) {

    scorePeriods.push({ ...newScorePeriodData, studentScores: new Map() });
    scorePeriods = scorePeriods.sort((a, b) => { return a.start.valueOf() - b.start.valueOf() })
    
    let newCourse: Document | null = null;
    try {
        newCourse = await courseModel.findOneAndUpdate( 
            {name: courseName}, 
            {"discussionSpecs.scorePeriods": scorePeriods}
        )
    }
    catch(error: any) {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        console.error(error);
        return;
    }
    
    if(newCourse !== null) {
        const newMenuMessage = await refreshMenu(courseName, submittedModal.message as Message, submittedModal.user);
        if(newMenuMessage)
            sendDismissableReply(newMenuMessage, successMessage)
    
        //TODO: After a score period is added, score all of the posts and comments that would fall into it (only necessary for score periods that started in the past)
        return;
    }
}