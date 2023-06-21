import { ActionRowBuilder, BaseInteraction, ButtonInteraction, Message, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";

const ADD_SCORE_MODAL_TITLE_PREFIX = "Add Score Period To ";
const ADD_SCORE_PERIOD_MODAL_EXPIRATION_TIME = 600_000;
const ADD_SCORE_PERIOD_MODAL_EXPIRTATION_MESSAGE = "Your add score period modal expired due to inactivity. No action was taken"

// INPUT FIELDS
const startDateInput = new TextInputBuilder({
    customId: "start",
    label: "start",
    style: TextInputStyle.Short
})

const endDateInput = new TextInputBuilder({
    customId: "end",
    label: "end",
    style: TextInputStyle.Short
})

const goalPointsInput = new TextInputBuilder({
    customId: "goal",
    label: "goal",
    style: TextInputStyle.Short
})

const maxPointsInput = new TextInputBuilder({
    customId: "max",
    label: "max",
    style: TextInputStyle.Short
})

// ACTION ROWS
const startDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [startDateInput]});
const endDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [endDateInput]});
const goalPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [goalPointsInput]});
const maxPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [maxPointsInput]});



export async function openAddScorePeriodModal(courseTitle: string, message: Message, interaction: ButtonInteraction) {
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
    let submittedModal: ModalSubmitInteraction;
    try {
        submittedModal = await interaction.awaitModalSubmit({time: ADD_SCORE_PERIOD_MODAL_EXPIRATION_TIME})
    }
    catch(error: any) {
        
        // if the collector expired, delete the menu and notify the user that it expired
        // TODO: I feel like theres a better way to do this but it will work for now
        if(error.toString().includes("Collector received no interactions before ending with reason: time")) {
            message.delete()
            interaction.user.send(ADD_SCORE_PERIOD_MODAL_EXPIRTATION_MESSAGE);
            return;
        }
    }

    // PROCESS INPUT
    // TODO: implement me
}