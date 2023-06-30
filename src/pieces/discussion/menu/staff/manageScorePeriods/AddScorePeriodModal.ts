import { ButtonInteraction, Client, ModalSubmitInteraction } from "discord.js";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";
import { CONFLICTING_DATES_MESSAGE, INVALID_INPUT_PREFIX, endDateActionRow, goalPointsActionRow, maxPointsActionRow, startDateActionRow } from "./ModalComponents";
import { NewPeriodData, checkAgainstCurrentPeriods, createHandlePeriodModal, handlePeriodValidation, insertOnePeriod, validatePeriodInput } from "./PeriodModalUtilities";

const MODAL_ID_PREFIX = "discussion_add_score_period_modal";
const MODAL_TITLE_PREFIX = "Add Score Period To CISC ";
const SUCCESS_MESSAGE = "New Score Period Added!";

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
    
    await createHandlePeriodModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput);
}

async function handleModalInput(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {

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

    return SUCCESS_MESSAGE;
}