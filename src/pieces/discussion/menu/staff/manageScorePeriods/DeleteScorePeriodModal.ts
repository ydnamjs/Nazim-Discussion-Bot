import { ButtonInteraction, ModalSubmitInteraction } from "discord.js";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { DATABASE_ERROR_MESSAGE, INVALID_INPUT_PREFIX, PERIOD_NUM_INPUT_ID, scorePeriodNumActionRow } from "./ModalComponents";
import { createScorePeriodModal, handleIndexValidation } from "./ModalUtilities";

const MODAL_ID_PREFIX = "delete_score_period_modal"
const MODAL_TITLE_PREFIX = "Delete Score Period From CISC ";
const SUCCESS_MESSAGE = "Score Period Was Successfully Removed!";

// PRIMARY OPEN MODAL FUNCTION
/**
 * @function creates a modal for deleting a score period
 * @param {string} courseTitle - the name of the course from which a score period is being deleted
 * @param {ButtonInteraction} interaction - the interaction that prompted the deleting of a score period
 */
export async function openDeleteScorePeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {
    
    const components = [
        scorePeriodNumActionRow
    ];
    
    await createScorePeriodModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput);
}

async function handleModalInput(courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {

    const toDeleteIndex = Number.parseInt(submittedModal.fields.getTextInputValue(PERIOD_NUM_INPUT_ID));

    let fetchedCourse: Course | null = null;
    try {
        fetchedCourse = await courseModel.findOne({name: courseName});
    }
    catch(error: any) {
        return DATABASE_ERROR_MESSAGE;
    }

    if(fetchedCourse && fetchedCourse.discussionSpecs !== null) {
    
        let scorePeriods = fetchedCourse.discussionSpecs.scorePeriods;

        const reasonForFailure = handleIndexValidation(toDeleteIndex, scorePeriods.length)

        if(reasonForFailure !== "") {
            return INVALID_INPUT_PREFIX + reasonForFailure;
        }

        scorePeriods.splice(toDeleteIndex - 1, 1);
        
        let newCourse: Document | null = null;
        try {
            newCourse = await courseModel.findOneAndUpdate( {name: courseName}, {"discussionSpecs.scorePeriods": scorePeriods})
        }
        catch(error: any) {
            console.error(error);
            return DATABASE_ERROR_MESSAGE;
        }
    }
    return SUCCESS_MESSAGE;
}