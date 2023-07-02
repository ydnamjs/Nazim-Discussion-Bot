import { ButtonInteraction, Client, ModalSubmitInteraction } from "discord.js";
import { getCourseByName, overwriteCourseDiscussionSpecs } from "../../../../../generalUtilities/CourseUtilities";
import { CONFLICTING_DATES_MESSAGE, INVALID_INPUT_PREFIX, PERIOD_NUM_INPUT_ID, endDateActionRow, goalPointsActionRow, maxPointsActionRow, periodNumActionRow, startDateActionRow } from "./ModalComponents";
import { NewPeriodData, checkAgainstCurrentPeriods, createHandlePeriodModal, handleIndexValidation, handlePeriodValidation, insertOnePeriod, overwritePeriods, sortPeriods, validatePeriodInput } from "./PeriodModalUtilities";

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

    if(reasonsForFailure !== "") {
        return INVALID_INPUT_PREFIX + reasonsForFailure;
    }
    
    const newScorePeriod: NewPeriodData = {
        start: periodValidationData.startDate as Date, 
        end: periodValidationData.endDate as Date, 
        goalPoints: periodValidationData.goalPoints, 
        maxPoints: periodValidationData.maxPoints
    }

    const fetchedCourse = await getCourseByName(courseName)

    if(fetchedCourse && fetchedCourse.discussionSpecs !== null) {
    
        const currentScorePeriods = fetchedCourse.discussionSpecs.scorePeriods;
        const conflictsWithCurrentPeriods = await checkAgainstCurrentPeriods(newScorePeriod, currentScorePeriods)

        if(conflictsWithCurrentPeriods) {
            return CONFLICTING_DATES_MESSAGE;
        }

        const insertErrors = await insertOnePeriod(client, courseName, newScorePeriod, currentScorePeriods)

        if(insertErrors !== "")
            return insertErrors
    }

    return ADD_MODAL_SUCCESS_MESSAGE;
}

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
    
    if(fetchedCourse && fetchedCourse.discussionSpecs !== null) {

        const currentScorePeriods = fetchedCourse.discussionSpecs.scorePeriods;
        sortPeriods(currentScorePeriods)

        const reasonsForFailure = handleIndexValidation(toEditIndex, currentScorePeriods.length) + handlePeriodValidation(periodValidationData)

        if(reasonsForFailure !== "") {
            return INVALID_INPUT_PREFIX + reasonsForFailure
        }

        const newScorePeriod: NewPeriodData = {
            start: periodValidationData.startDate as Date, 
            end: periodValidationData.endDate as Date, 
            goalPoints: periodValidationData.goalPoints, 
            maxPoints: periodValidationData.maxPoints
        }

        currentScorePeriods.splice(toEditIndex - 1, 1);
        const conflictsWithCurrentPeriods = await checkAgainstCurrentPeriods(newScorePeriod, currentScorePeriods)

        if(conflictsWithCurrentPeriods) {
            return CONFLICTING_DATES_MESSAGE;
        }

        const insertErrors = await insertOnePeriod(client, courseName, newScorePeriod, currentScorePeriods)

        if(insertErrors !== "")
            return insertErrors
    }
    return EDIT_MODAL_SUCCESS_MESSAGE;
}

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

    if(fetchedCourse && fetchedCourse.discussionSpecs !== null) {

        const reasonForFailure = handleIndexValidation(toDeleteIndex, fetchedCourse.discussionSpecs.scorePeriods.length)

        if(reasonForFailure !== "") {
            return INVALID_INPUT_PREFIX + reasonForFailure;
        }

        fetchedCourse.discussionSpecs.scorePeriods.splice(toDeleteIndex - 1, 1);
        
        const deleteErrors = await overwriteCourseDiscussionSpecs(courseName, fetchedCourse.discussionSpecs);

        if(deleteErrors !== "")
            return deleteErrors
    }

    return DELETE_MODAL_SUCCESS_MESSAGE;
}