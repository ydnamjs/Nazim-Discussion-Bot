import { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";
import { ScorePeriodData } from "./ManageScorePeriodsMenu";
import { CONFLICTING_DATES_MESSAGE, INVALID_INPUT_PREFIX, PERIOD_NUM_INPUT_ID, endDateActionRow, goalPointsActionRow, maxPointsActionRow, scorePeriodNumActionRow, startDateActionRow } from "./ModalComponents";
import { checkAgainstCurrentPeriods, createScorePeriodModal, handleIndexValidation, handlePeriodValidation, insertOnePeriod, validateScorePeriodInput } from "./ModalUtilities";

const MODAL_ID_PREFIX = "edit_score_period_modal";
const MODAL_TITLE_PREFIX = "Add Score Period To ";
const SUCCESS_MESSAGE = "Score Period Successfully Updated";

// PRIMARY OPEN MODAL FUNCTION
/**
 * @function opens an add score period modal for the given course as a result of the given interaction
 * @param courseTitle - the title of the corse that the score period is to be added to 
 * @param interaction - the interaction that triggered the opening of this modal
 */
export async function openEditScorePeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {
    
    const components = [
        scorePeriodNumActionRow,
        startDateActionRow,
        endDateActionRow,
        goalPointsActionRow,
        maxPointsActionRow
    ];
    
    await createScorePeriodModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput);
}

async function handleModalInput(courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {

    const toEditIndex = Number.parseInt(submittedModal.fields.getTextInputValue(PERIOD_NUM_INPUT_ID));
    const periodValidationData = validateScorePeriodInput(submittedModal);

    const fetchedCourse = await getCourseByName(courseName);
    
    if(fetchedCourse && fetchedCourse.discussionSpecs !== null) {

        const currentScorePeriods = fetchedCourse.discussionSpecs.scorePeriods;

        const reasonsForFailure = handleIndexValidation(toEditIndex, currentScorePeriods.length) + handlePeriodValidation(periodValidationData)

        if(reasonsForFailure !== "") {
            return INVALID_INPUT_PREFIX + reasonsForFailure
        }

        const newScorePeriod: ScorePeriodData = {
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

        insertOnePeriod(courseName, newScorePeriod, currentScorePeriods, submittedModal, SUCCESS_MESSAGE)
    }
    
    return SUCCESS_MESSAGE;
}