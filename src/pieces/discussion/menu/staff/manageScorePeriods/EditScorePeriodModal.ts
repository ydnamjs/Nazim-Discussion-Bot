import { ButtonInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { SCORE_PERIOD_MODAL_EXPIRATION_TIME, endDateActionRow, goalPointsActionRow, maxPointsActionRow, scorePeriodNumActionRow, startDateActionRow } from "./generalScorePeriodModal";

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
    const addScorePeriodModal = new ModalBuilder({
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
    interaction.showModal(addScorePeriodModal);

    // collect data from the modal
    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        submittedModal = await interaction.awaitModalSubmit({time: SCORE_PERIOD_MODAL_EXPIRATION_TIME})
    }
    catch {}

    // if the modal is submitted, process the data given
    if (submittedModal !== undefined) {
        //processEditModalInput(courseTitle, submittedModal, interaction)
    }
}