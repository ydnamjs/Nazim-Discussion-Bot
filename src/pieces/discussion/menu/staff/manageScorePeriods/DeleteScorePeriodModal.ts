import { ButtonInteraction, Client, ModalSubmitInteraction } from "discord.js";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";
import { INVALID_INPUT_PREFIX, PERIOD_NUM_INPUT_ID, periodNumActionRow } from "./ModalComponents";
import { createHandleModal, handleIndexValidation, overwritePeriods } from "./PeriodModalUtilities";

const MODAL_ID_PREFIX = "delete_score_period_modal"
const MODAL_TITLE_PREFIX = "Delete Score Period From CISC ";
const SUCCESS_MESSAGE = "Score Period Was Successfully Removed!";

/**
 * @function creates a modal for deleting a score period
 * @param {string} courseName - the name of the course from which a score period is being deleted
 * @param {ButtonInteraction} triggerInteraction - the interaction that prompted the deleting of a score period
 */
export async function openDeletePeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {
    
    const components = [
        periodNumActionRow
    ];
    
    await createHandleModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput);
}

async function handleModalInput(_client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {

    const toDeleteIndex = Number.parseInt(submittedModal.fields.getTextInputValue(PERIOD_NUM_INPUT_ID));

    const fetchedCourse = await getCourseByName(courseName);

    if(fetchedCourse && fetchedCourse.discussionSpecs !== null) {
    
        let scorePeriods = fetchedCourse.discussionSpecs.scorePeriods;

        const reasonForFailure = handleIndexValidation(toDeleteIndex, scorePeriods.length)

        if(reasonForFailure !== "") {
            return INVALID_INPUT_PREFIX + reasonForFailure;
        }

        scorePeriods.splice(toDeleteIndex - 1, 1);
        
        const deleteErrors = await overwritePeriods(courseName, scorePeriods);

        if(deleteErrors !== "")
            return deleteErrors
    }
    return SUCCESS_MESSAGE;
}