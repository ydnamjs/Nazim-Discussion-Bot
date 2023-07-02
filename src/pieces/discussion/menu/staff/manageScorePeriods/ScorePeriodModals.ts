import { ActionRowBuilder, ButtonInteraction, Client, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { DateTime } from "luxon";
import { courseModel } from "../../../../../generalModels/Course";
import { ScorePeriod, StudentScoreData } from "../../../../../generalModels/DiscussionScoring";
import { DATABASE_ERROR_MESSAGE, getCourseByName, overwriteCourseDiscussionSpecs } from "../../../../../generalUtilities/CourseUtilities";
import { sortPeriods } from "../../../../../generalUtilities/ScorePeriodUtilities";
import { scoreAllThreads } from "../../../../../pieces/discussion/scoring/scoreFunctions";
import { ModalInputHandler, createDiscussionModal } from "../../../../../pieces/menu/ModalUtilities";
import { refreshManagePeriodsMenu, updateToManagePeriodsMenu } from "./ManageScorePeriodsMenu";

// MODAL BEHAVIOR CONSTANTS
const DATE_STRING_FORMAT = "yyyy-MM-dd hh:mm:ss a";

// MODAL NOTIFICATION CONSTANTS
const CONFLICTING_DATES_MESSAGE = "Score Period Has Overlap With Already Existing Score Period(s). Nothing Was Changed.";
const INVALID_INPUT_PREFIX = "Invalid Input Format. Nothing Was Changed\n**Reasons(s):**";
const INVALID_START_DATE_REASON = "\n- Invalid start date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM and be before end date Ex: 1970-01-01 12:00:00 AM";
const INVALID_END_DATE_REASON = "\n- Invalid end date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM and be after start date Ex: 2036-08-26 11:59:59 PM";
const INVALID_GOAL_POINTS_REASON = "\n- Invalid goal points. Input should be a non negative integer less than or equal to max points. Ex: 800";
const INVALID_MAX_POINTS_REASON = "\n- Invalid maximum points. Input should be a non negative integer greater than or equal to goal points. Ex: 1000";
const INVALID_INDEX_PERIOD_REASON = "\n- Invalid score period input. Please retry with a number in your menu."

// INPUT FIELD CONSTANTS
const PERIOD_NUM_INPUT_ID = "discussion_score_period_input";
const PERIOD_NUM_INPUT_LABEL = "score period #";
const PERIOD_NUM_INPUT_PLACEHOLDER = "0";
const PERIOD_NUM_INPUT_STYLE = TextInputStyle.Short;

const START_DATE_INPUT_ID = "discussion_score_period_start_input";
const START_DATE_INPUT_LABEL = "start date/time: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM";
const START_DATE_INPUT_PLACEHOLDER = "1970-01-01 12:00:00 AM";
const START_DATE_INPUT_STYLE = TextInputStyle.Short;

const END_DATE_INPUT_ID = "discussion_score_period_end_input";
const END_DATE_INPUT_LABEL = "end date/time: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM";
const END_DATE_INPUT_PLACEHOLDER =  "2036-08-26 11:59:59 PM";
const END_DATE_INPUT_STYLE = TextInputStyle.Short;

const GOAL_POINTS_INPUT_ID = "discussion_score_period_goal_input";
const GOAL_POINTS_INPUT_LABEL = "goal points";
const GOAL_POINTS_INPUT_PLACEHOLDER = "";
const GOAL_POINTS_INPUT_STYLE = TextInputStyle.Short;

const MAX_POINTS_INPUT_ID = "discussion_score_period_max_input";
const MAX_POINTS_INPUT_LABEL = "max points";
const MAX_POINTS_INPUT_PLACEHOLDER = "";
const MAX_POINTS_INPUT_STYLE = TextInputStyle.Short;

// INPUT FIELDS
const periodNumInput = new TextInputBuilder({
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
const periodNumActionRow = new ActionRowBuilder<TextInputBuilder>({components: [periodNumInput]});
const startDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [startDateInput]});
const endDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [endDateInput]});
const goalPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [goalPointsInput]});
const maxPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [maxPointsInput]});

// ADD MODAL
const ADD_MODAL_ID_PREFIX = "discussion_add_score_period_modal";
const ADD_MODAL_TITLE_PREFIX = "Add Score Period To CISC ";
const ADD_MODAL_SUCCESS_MESSAGE = "New Score Period Added!";

/**
 * @function opens an add score period modal for the given course as a result of the given interaction
 * @param courseName - the name of the corse that the score period is to be added to 
 * @param triggerInteraction - the interaction that triggered the opening of this modal
 */
export async function openAddPeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {

    const components = [
        startDateActionRow,
        endDateActionRow,
        goalPointsActionRow,
        maxPointsActionRow
    ];
    
    await createHandlePeriodModal(ADD_MODAL_ID_PREFIX, ADD_MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleAddPeriodModal);
}

async function handleAddPeriodModal(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {

    const periodValidationData = validatePeriodInput(submittedModal);

    const reasonsForFailure = handlePeriodValidation(periodValidationData)

    if(reasonsForFailure !== "")
        return INVALID_INPUT_PREFIX + reasonsForFailure;
    
    const newScorePeriod: NewPeriodData = {
        start: periodValidationData.startDate as Date, 
        end: periodValidationData.endDate as Date, 
        goalPoints: periodValidationData.goalPoints, 
        maxPoints: periodValidationData.maxPoints
    }

    const fetchedCourse = await getCourseByName(courseName)

    if(!fetchedCourse || fetchedCourse.discussionSpecs === null || fetchedCourse.channels.discussion === null)
        return DATABASE_ERROR_MESSAGE
    
    const conflictsWithCurrentPeriods = hasPeriodConflict(newScorePeriod, fetchedCourse.discussionSpecs.scorePeriods)

    if(conflictsWithCurrentPeriods) {
        return CONFLICTING_DATES_MESSAGE;
    }

    fetchedCourse.discussionSpecs.scorePeriods.push({
        ...newScorePeriod,
        studentScores: new Map<string, StudentScoreData>()
    })

    const rescoredPeriods = await scoreAllThreads(client, fetchedCourse.channels.discussion, fetchedCourse.discussionSpecs, fetchedCourse.roles.staff)

    if(!rescoredPeriods)
        return "Scoring Error"

    fetchedCourse.discussionSpecs.scorePeriods = rescoredPeriods;

    const updateDatabaseErrors = await overwriteCourseDiscussionSpecs(courseName, fetchedCourse.discussionSpecs);

    if(updateDatabaseErrors !== "")
        return updateDatabaseErrors

    return ADD_MODAL_SUCCESS_MESSAGE;
}

// EDIT MODAL
const EDIT_MODAL_ID_PREFIX = "edit_score_period_modal";
const EDIT_MODAL_TITLE_PREFIX = "Edit Score Period In CISC ";
const EDIT_MODAL_SUCCESS_MESSAGE = "Score Period Successfully Edited";

/**
 * @function opens an add score period modal for the given course as a result of the given interaction
 * @param courseTitle - the title of the corse that the score period is to be added to 
 * @param interaction - the interaction that triggered the opening of this modal
 */
export async function openEditPeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {
    
    const components = [
        periodNumActionRow,
        startDateActionRow,
        endDateActionRow,
        goalPointsActionRow,
        maxPointsActionRow
    ];
    
    await createHandlePeriodModal(EDIT_MODAL_ID_PREFIX, EDIT_MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleEditPeriodModal);
}

async function handleEditPeriodModal(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {

    const toEditIndex = Number.parseInt(submittedModal.fields.getTextInputValue(PERIOD_NUM_INPUT_ID));
    const periodValidationData = validatePeriodInput(submittedModal);

    const fetchedCourse = await getCourseByName(courseName);
    
    if(!fetchedCourse || fetchedCourse.discussionSpecs == null)
        return DATABASE_ERROR_MESSAGE

    fetchedCourse.discussionSpecs.scorePeriods = sortPeriods(fetchedCourse.discussionSpecs.scorePeriods);

    const reasonsForFailure = handleIndexValidation(toEditIndex, fetchedCourse.discussionSpecs.scorePeriods.length) + handlePeriodValidation(periodValidationData)

    if(reasonsForFailure !== "") {
        return INVALID_INPUT_PREFIX + reasonsForFailure
    }

    const newScorePeriod: NewPeriodData = {
        start: periodValidationData.startDate as Date, 
        end: periodValidationData.endDate as Date, 
        goalPoints: periodValidationData.goalPoints, 
        maxPoints: periodValidationData.maxPoints
    }

    fetchedCourse.discussionSpecs.scorePeriods.splice(toEditIndex - 1, 1);
    const conflictsWithCurrentPeriods = hasPeriodConflict(newScorePeriod, fetchedCourse.discussionSpecs.scorePeriods)

    if(conflictsWithCurrentPeriods)
        return CONFLICTING_DATES_MESSAGE;

    const insertErrors = await insertOnePeriod(client, courseName, newScorePeriod, fetchedCourse.discussionSpecs.scorePeriods)

    if(insertErrors !== "")
        return insertErrors

    return EDIT_MODAL_SUCCESS_MESSAGE;
}

// DELETE MODAL
const DELETE_MODAL_ID_PREFIX = "delete_score_period_modal"
const DELETE_MODAL_TITLE_PREFIX = "Delete Score Period From CISC ";
const DELETE_MODAL_SUCCESS_MESSAGE = "Score Period Was Successfully Removed!";

/**
 * @function creates a modal for deleting a score period
 * @param {string} courseName - the name of the course from which a score period is being deleted
 * @param {ButtonInteraction} triggerInteraction - the interaction that prompted the deleting of a score period
 */
export async function openDeletePeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {
    
    const components = [
        periodNumActionRow
    ];
    
    await createHandlePeriodModal(DELETE_MODAL_ID_PREFIX, DELETE_MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleDeletePeriodModal);
}

async function handleDeletePeriodModal(_client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {

    const toDeleteIndex = Number.parseInt(submittedModal.fields.getTextInputValue(PERIOD_NUM_INPUT_ID));

    const fetchedCourse = await getCourseByName(courseName);

    if(!fetchedCourse || fetchedCourse.discussionSpecs === null)
        return DATABASE_ERROR_MESSAGE

    const reasonForFailure = handleIndexValidation(toDeleteIndex, fetchedCourse.discussionSpecs.scorePeriods.length)

    if(reasonForFailure !== "")
        return INVALID_INPUT_PREFIX + reasonForFailure;

    fetchedCourse.discussionSpecs.scorePeriods.splice(toDeleteIndex - 1, 1);
        
    const deleteErrors = await overwriteCourseDiscussionSpecs(courseName, fetchedCourse.discussionSpecs);

    if(deleteErrors !== "")
        return deleteErrors

    return DELETE_MODAL_SUCCESS_MESSAGE;
}

// UTILITY FUNCTIONS
async function createHandlePeriodModal(idPrefix: string, titlePrefix: string, courseName: string, triggerInteraction: ButtonInteraction, components: ActionRowBuilder<TextInputBuilder>[], modalInputHandler: ModalInputHandler) {
    
    updateToManagePeriodsMenu(courseName, triggerInteraction, false);

    createDiscussionModal(idPrefix, titlePrefix, courseName, triggerInteraction, components, modalInputHandler, async () => {await refreshManagePeriodsMenu(courseName, triggerInteraction)})
}

interface PeriodValidationData {
    startDate: Date | undefined, 
    endDate: Date | undefined,  
    goalPoints: number, 
    maxPoints: number
}

function validatePeriodInput(submittedModal: ModalSubmitInteraction): PeriodValidationData {
    
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

function handlePeriodValidation(modalData: PeriodValidationData): string { 
    
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

function handleIndexValidation(scorePeriodIndex: number, scorePeriodsLength: number): string {
    
    if( Number.isNaN(scorePeriodIndex) || scorePeriodIndex < 1 || (scorePeriodsLength && scorePeriodIndex > scorePeriodsLength) ) {
        return INVALID_INDEX_PERIOD_REASON;
    }
    return "";
}

interface NewPeriodData {
    start: Date, 
    end: Date,  
    goalPoints: number, 
    maxPoints: number
}

function hasPeriodConflict(newScorePeriodData: NewPeriodData, currentScorePeriods: ScorePeriod[]): boolean {

    let hasConflict = false;
    currentScorePeriods.forEach((scorePeriod) => {
        if(scorePeriod.start.valueOf() <= newScorePeriodData.end.valueOf() && scorePeriod.end.valueOf() >= newScorePeriodData.start.valueOf()) {
            hasConflict = true;
        }
    })
    return hasConflict;
}

async function insertOnePeriod(client: Client, courseName: string, newScorePeriodData: NewPeriodData, scorePeriods: ScorePeriod[]): Promise<string> {

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

async function overwritePeriods(courseName: string, scorePeriods: ScorePeriod[]): Promise<string> {

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