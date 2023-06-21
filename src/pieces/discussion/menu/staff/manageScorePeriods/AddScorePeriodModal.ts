import { ActionRowBuilder, ButtonInteraction, Message, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";

// CONSTANTS
const ADD_SCORE_MODAL_TITLE_PREFIX = "Add Score Period To ";
const ADD_SCORE_PERIOD_MODAL_EXPIRATION_TIME = 600_000;
const ADD_SCORE_PERIOD_MODAL_EXPIRTATION_MESSAGE = "Your add score period modal expired due to inactivity. No action was taken"

const START_DATE_INPUT_ID = "discussion_add_score_period_start_input";
const START_DATE_INPUT_LABEL = "start date and time: YYYY-MM-DD HH-MM-SS";
const START_DATE_INPUT_PLACEHOLDER = "YYYY-MM-DD HH-MM-SS";
const START_DATE_INPUT_STYLE = TextInputStyle.Short;

const END_DATE_INPUT_ID = "discussion_add_score_period_end_input";
const END_DATE_INPUT_LABEL = "end date and time: YYYY-MM-DD HH-MM-SS";
const END_DATE_INPUT_PLACEHOLDER = "YYYY-MM-DD HH-MM-SS";
const END_DATE_INPUT_STYLE = TextInputStyle.Short;

const GOAL_POINTS_INPUT_ID = "discussion_add_score_period_goal_input";
const GOAL_POINTS_INPUT_LABEL = "goal points";
const GOAL_POINTS_INPUT_PLACEHOLDER = "";
const GOAL_POINTS_INPUT_STYLE = TextInputStyle.Short;

const MAX_POINTS_INPUT_ID = "discussion_add_score_period_max_input";
const MAX_POINTS_INPUT_LABEL = "max points";
const MAX_POINTS_INPUT_PLACEHOLDER = "";
const MAX_POINTS_INPUT_STYLE = TextInputStyle.Short;

// INPUT FIELDS
const startDateInput = new TextInputBuilder({
    customId: START_DATE_INPUT_ID,
    label: START_DATE_INPUT_LABEL,
    placeholder: START_DATE_INPUT_PLACEHOLDER,
    style: START_DATE_INPUT_STYLE,
})

const endDateInput = new TextInputBuilder({
    customId: END_DATE_INPUT_ID,
    label: END_DATE_INPUT_LABEL,
    placeholder: END_DATE_INPUT_PLACEHOLDER,
    style: END_DATE_INPUT_STYLE
})

const goalPointsInput = new TextInputBuilder({
    customId: GOAL_POINTS_INPUT_ID,
    label: GOAL_POINTS_INPUT_LABEL,
    placeholder: GOAL_POINTS_INPUT_PLACEHOLDER,
    style: GOAL_POINTS_INPUT_STYLE
})

const maxPointsInput = new TextInputBuilder({
    customId: MAX_POINTS_INPUT_ID,
    label: MAX_POINTS_INPUT_LABEL,
    placeholder: MAX_POINTS_INPUT_PLACEHOLDER,
    style: MAX_POINTS_INPUT_STYLE
})

// ACTION ROWS
const startDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [startDateInput]});
const endDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [endDateInput]});
const goalPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [goalPointsInput]});
const maxPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [maxPointsInput]});

export async function openAddScorePeriodModal(courseTitle: string, message: Message, interaction: ButtonInteraction) {
    
    await updateToManageScorePeriodsMenu(courseTitle, message, interaction, false);
    
    // MODAL
    const addScorePeriodModal = new ModalBuilder({
        customId: "add-score-period-modal",
        title: ADD_SCORE_MODAL_TITLE_PREFIX + courseTitle,
        components: [
            startDateActionRow,
            endDateActionRow,
            goalPointsActionRow,
            maxPointsActionRow
        ]
    })
    interaction.showModal(addScorePeriodModal);

    // COLLECT MODAL
    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        submittedModal = await interaction.awaitModalSubmit({time: ADD_SCORE_PERIOD_MODAL_EXPIRATION_TIME})
    }
    catch {}

    if (submittedModal !== undefined) {
        submittedModal.reply("you submitted this");
    }

    // PROCESS INPUT
    // TODO: implement me
}