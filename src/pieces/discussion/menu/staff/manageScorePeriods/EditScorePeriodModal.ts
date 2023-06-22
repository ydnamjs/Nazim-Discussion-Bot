import { ButtonInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { DATABASE_ERROR_MESSAGE, PERIOD_NUM_INPUT_ID, SCORE_PERIOD_MODAL_EXPIRATION_TIME, endDateActionRow, goalPointsActionRow, maxPointsActionRow, processScorePeriodValidationData, scorePeriodNumActionRow, startDateActionRow, validateScorePeriodInput } from "./generalScorePeriodModal";
import { sendDismissableInteractionReply } from "../../../../../generalUtilities/DismissableMessage";
import { Course, courseModel } from "../../../../../generalModels/Course";

// MODAL TEXT CONSTANTS
const EDIT_SCORE_MODAL_TITLE_PREFIX = "Add Score Period To ";

// MODAL BEHAVIOR CONSTANTS
const EDIT_SCORE_MODAL_ID = "edit-score-period-modal";

// PRIMARY OPEN MODAL FUNCTION
/**
 * @function opens an add score period modal for the given course as a result of the given interaction
 * @param courseTitle - the title of the corse that the score period is to be added to 
 * @param interaction - the interaction that triggered the opening of this modal
 */
export async function openEditScorePeriodModal(courseTitle: string, interaction: ButtonInteraction) {
    
    // refresh the manage score periods menu so that after the modal is close/submitted it collects input again
    await updateToManageScorePeriodsMenu(courseTitle, interaction, false, true);
    
    // give the user an add score modal to input data to
    const editScorePeriodModal = new ModalBuilder({
        customId: EDIT_SCORE_MODAL_ID,
        title: EDIT_SCORE_MODAL_TITLE_PREFIX + courseTitle,
        components: [
            scorePeriodNumActionRow,
            startDateActionRow,
            endDateActionRow,
            goalPointsActionRow,
            maxPointsActionRow
        ]
    })
    interaction.showModal(editScorePeriodModal);

    // collect data from the modal
    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        submittedModal = await interaction.awaitModalSubmit({time: SCORE_PERIOD_MODAL_EXPIRATION_TIME})
    }
    catch {}

    // if the modal is submitted, process the data given
    if (submittedModal !== undefined) {
        processEditModalInput(courseTitle, submittedModal, interaction)
    }
}

async function processEditModalInput(courseTitle: string, submittedModal: ModalSubmitInteraction, triggeringInteraction: ButtonInteraction) {
    
    // get the course from the database
    let course: Course | null = null;
    try {
        course = await courseModel.findOne({name: courseTitle});
    }
    // if there was an error getting the course, inform the user that there was a database error
    catch(error: any) {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        console.error(error);
        return;
    }

    // if the discussion specs could not be accessed there is a serious error
    if(!course || course.discussionSpecs === null) {
        return;
    }

    // validate the index and score period data
    const scorePeriodIndex = Number.parseInt(submittedModal.fields.getTextInputValue(PERIOD_NUM_INPUT_ID));
    const modalData = validateScorePeriodInput(submittedModal);
    
    // if the data is invalid, return
    if(processScorePeriodValidationData(submittedModal, modalData, scorePeriodIndex, course.discussionSpecs.scorePeriods.length))
        return;
    
    console.log("check validation processor");

    // if the data is valid, attempt to update it in the database
    updateScorePeriod(course, submittedModal, {start: modalData.startDate as Date, end: modalData.endDate as Date, goalPoints: modalData.goalPoints, maxPoints: modalData.maxPoints}, triggeringInteraction)
    
}

async function updateScorePeriod(course: Course, submittedModal: ModalSubmitInteraction, newScorePeriodData: {start: Date, end: Date, goalPoints: number, maxPoints: number}, triggeringInteraction: ButtonInteraction) {

}