import { ButtonInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { sendDismissableInteractionReply } from "../../../../../generalUtilities/DismissableMessage";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { DATABASE_ERROR_MESSAGE, INVALID_INDEX_PERIOD_MESSAGE, PERIOD_NUM_INPUT_ID, SCORE_PERIOD_MODAL_EXPIRATION_TIME, scorePeriodNumActionRow } from "./GeneralScorePeriodModal";

// MODAL BEHAVIOR CONSTANTS
const DELETE_SCORE_PERIOD_MODAL_ID = "delete_score_period_modal"

// MODAL TEXT CONSTANTS
const DELETE_SCORE_PERIOD_MODAL_TITLE_PREFIX = "Delete Score Period From CISC ";

// MODAL NOTIFICATION CONSTANTS
const SUCCESS_MESSAGE = "Score Period Was Successfully Removed!";

// PRIMARY OPEN MODAL FUNCTION
/**
 * @function creates a modal for deleting a score period
 * @param {string} courseTitle - the name of the course from which a score period is being deleted
 * @param {ButtonInteraction} interaction - the interaction that prompted the deleting of a score period
 */
export async function openDeleteScorePeriodModal(courseTitle: string, interaction: ButtonInteraction) {
    
    // refresh the manage score periods menu so that after the modal is close/submitted it collects input again
    await updateToManageScorePeriodsMenu(courseTitle, interaction, false, true);

    // give the user an add score modal to input data to
    const addScorePeriodModal = new ModalBuilder({
        customId: DELETE_SCORE_PERIOD_MODAL_ID,
        title: DELETE_SCORE_PERIOD_MODAL_TITLE_PREFIX + courseTitle,
        components: [
            scorePeriodNumActionRow
        ]
    })
    interaction.showModal(addScorePeriodModal);

    // collect data from the modal
    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        submittedModal = await interaction.awaitModalSubmit({time: SCORE_PERIOD_MODAL_EXPIRATION_TIME})
    }
    catch {}

    // if the modal is submitted, process the data given
    if (submittedModal !== undefined) {
        processDeleteModalInput(courseTitle, submittedModal, interaction)
    }
}

// PROCESS DELETE MODAL INPUT HELPER FUNCTION
/**
 * @function processes the input of a delete score period modal
 * @param {string} courseTitle - the name of the course from which a score period is being deleted
 * @param {ModalSubmitInteraction} submittedModal - the submitted delete score period modal interaction that will be processed
 * @param {ButtonInteraction} triggeringInteraction - the interaction that prompted the deleting of a score period
 */
async function processDeleteModalInput(courseTitle: string, submittedModal: ModalSubmitInteraction, triggeringInteraction: ButtonInteraction) {
    
    // get the input index from the modal
    const scorePeriodIndex = Number.parseInt(submittedModal.fields.getTextInputValue(PERIOD_NUM_INPUT_ID));

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

    // if the course was valid
    if(course) {
        deleteScorePeriod(scorePeriodIndex, course, submittedModal, triggeringInteraction);
    }
}

// DELETE SCORE PERIOD HELPER FUNCTION
/**
 * @function attempts to delete the score period from the course's score periods
 * @param {number} scorePeriodIndex - the index of the score period to be removed
 * @param {Course} course - the course the score period is being removed from
 * @param {ModalSubmitInteraction} submittedModal - the modal interaction that the data for the score period index came from
 * @param {ButtonInteraction} triggeringInteraction - the interaction that triggered the deleting of a score period
 */
async function deleteScorePeriod(scorePeriodIndex: number, course: Course, submittedModal: ModalSubmitInteraction, triggeringInteraction: ButtonInteraction) {

    // otherwise delete the score period at that index
    const disc = course.discussionSpecs;
        
    // if the discussion specs could not be accessed there is a serious error
    if(disc === null) {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        return;
    }

    // if the input refers to an invalid score period, inform the user
    if(scorePeriodIndex < 1 || scorePeriodIndex > disc.scorePeriods.length || Number.isNaN(scorePeriodIndex)) {
        sendDismissableInteractionReply(submittedModal, INVALID_INDEX_PERIOD_MESSAGE);
        return;
    }

    // remove the score period at specified index and sort the list by start date
    disc.scorePeriods.splice(scorePeriodIndex - 1, 1);
    disc.scorePeriods = disc.scorePeriods.sort((a, b) => { return a.start.valueOf() - b.start.valueOf() });

    // update the database with the score period now removed
    let newCourse: Document | null = null;
    try {
        newCourse = await courseModel.findOneAndUpdate( 
            {name: course.name}, 
            {discussionSpecs: disc}
        )
    }
    // if there was a database error, inform the user and return
    catch(error: any) {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        console.error(error);
        return;
    }

    // otherwise, inform the user that the score period was successfully removed
    if(newCourse !== null) {
        // inform the user of the success
        sendDismissableInteractionReply(submittedModal, SUCCESS_MESSAGE)

        // refresh the menu to reflect new score period list
        await updateToManageScorePeriodsMenu(course.name, triggeringInteraction, false, false);
        return;
    }
}