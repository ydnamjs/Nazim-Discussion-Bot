import { ButtonInteraction, Client, ModalSubmitInteraction } from "discord.js";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";
import { CONFLICTING_DATES_MESSAGE, INVALID_INPUT_PREFIX, PERIOD_NUM_INPUT_ID, endDateActionRow, goalPointsActionRow, maxPointsActionRow, periodNumActionRow, startDateActionRow } from "./ModalComponents";
import { NewPeriodData, checkAgainstCurrentPeriods, createManagePeriodModal, handleIndexValidation, handlePeriodValidation, insertOnePeriod, sortPeriods, validatePeriodInput } from "./ModalUtilities";

const MODAL_ID_PREFIX = "edit_score_period_modal";
const MODAL_TITLE_PREFIX = "Edit Score Period In CISC ";
const SUCCESS_MESSAGE = "Score Period Successfully Edited";

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
    
    await createManagePeriodModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput);
}

async function handleModalInput(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {

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
    return SUCCESS_MESSAGE;
}