import { ActionRowBuilder, ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";

// MODAL
const DELETE_SCORE_PERIOD_MODAL_ID = "delete_score_period_modal"
const DELETE_SCORE_PERIOD_MODAL_TITLE_PREFIX = "Delete Score Period From CISC ";

// SCORE PERIOD # INPUT FIELD
const PERIOD_NUM_INPUT_ID = "discussion_delete_score_period_input";
const PERIOD_NUM_INPUT_LABEL = "score period #";
const PERIOD_NUM_INPUT_PLACEHOLDER = "0";
const PERIOD_NUM_INPUT_STYLE = TextInputStyle.Short;

const scorePeriodNumInput = new TextInputBuilder({
    customId: PERIOD_NUM_INPUT_ID,
    label: PERIOD_NUM_INPUT_LABEL,
    placeholder: PERIOD_NUM_INPUT_PLACEHOLDER,
    style: PERIOD_NUM_INPUT_STYLE,
})
const scorePeriodNumActionRow = new ActionRowBuilder<TextInputBuilder>({components: [scorePeriodNumInput]});

//FUNCTION
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
}