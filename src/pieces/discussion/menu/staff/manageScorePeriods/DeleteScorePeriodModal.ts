import { ButtonInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { sendDismissableInteractionReply } from "../../../../../generalUtilities/DismissableMessage";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { DATABASE_ERROR_MESSAGE, INVALID_INDEX_PERIOD_REASON, INVALID_INPUT_PREFIX, MODAL_EXPIRATION_TIME, PERIOD_NUM_INPUT_ID, scorePeriodNumActionRow } from "./ModalComponents";
import { handleIndexValidation } from "./ModalUtilities";

const MODAL_ID = "delete_score_period_modal"
const TITLE_PREFIX = "Delete Score Period From CISC ";
const SUCCESS_MESSAGE = "Score Period Was Successfully Removed!";

// PRIMARY OPEN MODAL FUNCTION
/**
 * @function creates a modal for deleting a score period
 * @param {string} courseTitle - the name of the course from which a score period is being deleted
 * @param {ButtonInteraction} interaction - the interaction that prompted the deleting of a score period
 */
export async function openDeleteScorePeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {
    
    //TODO: replace with a refresh function once that is implemented
    updateToManageScorePeriodsMenu(courseName, triggerInteraction, false, true);
    
    const addScorePeriodModal = new ModalBuilder({
        customId: MODAL_ID,
        title: TITLE_PREFIX + courseName,
        components: [
            scorePeriodNumActionRow
        ]
    })
    triggerInteraction.showModal(addScorePeriodModal);

    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        submittedModal = await triggerInteraction.awaitModalSubmit({time: MODAL_EXPIRATION_TIME})
    }
    catch {}

    if (submittedModal !== undefined) {
        await handleModalInput(courseName, submittedModal);
        //TODO: add a refresh function once that is implemented
    }
}

async function handleModalInput(courseName: string, submittedModal: ModalSubmitInteraction) {

    const toDeleteIndex = Number.parseInt(submittedModal.fields.getTextInputValue(PERIOD_NUM_INPUT_ID));

    let fetchedCourse: Course | null = null;
    try {
        fetchedCourse = await courseModel.findOne({name: courseName});
    }
    catch(error: any) {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        console.error(error);
        return true;
    }

    if(fetchedCourse && fetchedCourse.discussionSpecs !== null) {
    
        let scorePeriods = fetchedCourse.discussionSpecs.scorePeriods;

        const reasonForFailure = handleIndexValidation(toDeleteIndex, scorePeriods.length)

        if(reasonForFailure !== "") {
            sendDismissableInteractionReply(submittedModal, INVALID_INPUT_PREFIX + INVALID_INDEX_PERIOD_REASON);
            return;
        }

        scorePeriods.splice(toDeleteIndex - 1, 1);
        
        let newCourse: Document | null = null;
        try {
            newCourse = await courseModel.findOneAndUpdate( {name: courseName}, {"discussionSpecs.scorePeriods": scorePeriods})
        }
        catch(error: any) {
            sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
            console.error(error);
            return;
        }

        sendDismissableInteractionReply(submittedModal, SUCCESS_MESSAGE);
    }
}