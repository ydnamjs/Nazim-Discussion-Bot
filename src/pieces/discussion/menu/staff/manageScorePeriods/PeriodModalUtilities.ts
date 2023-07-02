import { ActionRowBuilder, ButtonInteraction, Client, ModalSubmitInteraction, TextInputBuilder } from "discord.js";
import { DateTime } from "luxon";
import { courseModel } from "../../../../../generalModels/Course";
import { ScorePeriod } from "../../../../../generalModels/DiscussionScoring";
import { scoreAllThreads } from "../../../tracking/scoreFunctions";
import { ModalInputHandler, createDiscussionModal } from "../../../../menu/ModalUtilities";
import { refreshManagePeriodsMenu, updateToManagePeriodsMenu } from "./ManageScorePeriodsMenu";
import { DATABASE_ERROR_MESSAGE, DATE_STRING_FORMAT, END_DATE_INPUT_ID, GOAL_POINTS_INPUT_ID, INVALID_END_DATE_REASON, INVALID_GOAL_POINTS_REASON, INVALID_INDEX_PERIOD_REASON, INVALID_MAX_POINTS_REASON, INVALID_START_DATE_REASON, MAX_POINTS_INPUT_ID, START_DATE_INPUT_ID } from "./ModalComponents";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";

/**
 * @function creates and handles a modal for managing score periods
 * @param {string} idPrefix - the prefix of the modal's id (full id is prefix + milliseconds time)
 * @param {string} titlePrefix - the prefix of the modal's title (goes before the course name)
 * @param {string} courseName - the name of the course that is having its score periods managed
 * @param {ButtonInteraction} triggerInteraction - the interaction that triggered the opening of the modal
 * @param {ActionRowBuilder<TextInputBuilder>[]} components - the components that on the modal
 * @param {ModalInputHandler} modalInputHandler - function that handles the modal input
 */
export async function createHandlePeriodModal(idPrefix: string, titlePrefix: string, courseName: string, triggerInteraction: ButtonInteraction, components: ActionRowBuilder<TextInputBuilder>[], modalInputHandler: ModalInputHandler) {
    
    updateToManagePeriodsMenu(courseName, triggerInteraction, false);

    createDiscussionModal(idPrefix, titlePrefix, courseName, triggerInteraction, components, modalInputHandler, async () => {await refreshManagePeriodsMenu(courseName, triggerInteraction)})
}

/**
 * @interface information about the validity of a score period
 * @property {Date | undefined} startDate - the starting date of a score period if valid (undefined if invalid)
 * @property {Date | undefined} endDate - the ending date of a score period if valid (undefined if invalid)
 * @property {number} goalPoints - the goal points of a score period if valid (NaN if invalid)
 * @property {number} maxPoints - the maximum points of a score period if valid (NaN if invalid)
 */
export interface PeriodValidationData {
    startDate: Date | undefined, 
    endDate: Date | undefined,  
    goalPoints: number, 
    maxPoints: number
}

/**
 * @function generates validation data for the given score period
 * @param {ModalSubmitInteraction} submittedModal - the submitted modal interaction whose input is to be validated
 * @returns {PeriodValidationData} scorePeriodInputData - data about the validity of each property of the score period
 */
export function validatePeriodInput(submittedModal: ModalSubmitInteraction): PeriodValidationData {
    
    const startDateString = submittedModal.fields.getTextInputValue(START_DATE_INPUT_ID);
    const startDateTime = DateTime.fromFormat(startDateString, DATE_STRING_FORMAT)
    let startDate = startDateTime.toJSDate().getTime() ? startDateTime.toJSDate() : undefined;

    const endDateString = submittedModal.fields.getTextInputValue(END_DATE_INPUT_ID);
    const endDateTime = DateTime.fromFormat(endDateString, DATE_STRING_FORMAT)
    let endDate = endDateTime.toJSDate().getTime() ? endDateTime.toJSDate() : undefined;

    if(startDate && endDate && startDate.valueOf() >= endDate.valueOf()) {
        startDate = undefined;
        endDate = undefined;
    }

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
export function handlePeriodValidation(modalData: PeriodValidationData): string { 
    
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
export interface NewPeriodData {
    start: Date, 
    end: Date,  
    goalPoints: number, 
    maxPoints: number
}

/**
 * @function determines if the new score period provided has any issues with the current ones
 * @param {NewPeriodData} newScorePeriodData - the new score period to be added
 * @param {ScorePeriod[]} currentScorePeriods - the old score periods being checked against
 * @returns {boolean} hasConflict - whether or not the new score Period has a conflict with the current ones
 */
export async function checkAgainstCurrentPeriods(newScorePeriodData: NewPeriodData, currentScorePeriods: ScorePeriod[]): Promise<boolean> {

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
 * @param {Client} client - the client performing operations
 * @param {string} courseName - the name of the course that the score period is being added to
 * @param {NewPeriodData} newScorePeriodData - data for the score period to be added
 * @param {ScorePeriod[]} scorePeriods - the score periods that existed prior to the insert
 */
export async function insertOnePeriod(client: Client, courseName: string, newScorePeriodData: NewPeriodData, scorePeriods: ScorePeriod[]): Promise<string> {

    // TODO: After on the fly scoring is done, add listeners to undo and pause it while scoring is being done
    scorePeriods = scorePeriods.sort((a, b) => { return a.start.valueOf() - b.start.valueOf() })

    const course = await getCourseByName(courseName);

    if(!course || !course.discussionSpecs || !course.channels.discussion)
        return "database error"

    course.discussionSpecs.scorePeriods.push({ ...newScorePeriodData, studentScores: new Map() });

    // FIXME: This is currently broken because the rescored period isnt always the first/only one
    // it was before the changes to rescoring done with post editing but now it isnt
    // we likely just need to feed in discussion specs from the functions that call this instead of getting new ones from course since those dont have the removed/edited period
    const newScorePeriods = await scoreAllThreads(client, course.channels.discussion, course.discussionSpecs, course.roles.staff)
    
    if(!newScorePeriods || newScorePeriods.length !== 1)
        return "scoring error ocurred";

    scorePeriods.push(newScorePeriods[0])
    let insertErrors = await overwritePeriods(courseName, scorePeriods)
    return insertErrors;
}

/**
 * @function sorts periods and returns the sorted periods. Not that sorting mutates the original array of periods as it uses the Array.sort function
 * @param {ScorePeriod[]} periods - the periods to be sorted
 * @returns {ScorePeriod[]} sorted periods - 
 */
export function sortPeriods(periods: ScorePeriod[]): ScorePeriod[] {

    return periods.sort((a, b) => {return a.start.valueOf() - b.start.valueOf()});
}

/**
 * @function overwrites the score periods of the given course
 * @param {string} courseName - the name of the course to overwrite the score periods of
 * @param {ScorePeriod[]} scorePeriods - the new score periods that will overwrite the ones in the course
 * @returns {string} reasonsForFailure - the reasons that the overwrite failed if any
 */
export async function overwritePeriods(courseName: string, scorePeriods: ScorePeriod[]): Promise<string> {

    try {
        await courseModel.findOneAndUpdate( 
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