import { ActionRowBuilder, ButtonInteraction, TextInputBuilder } from "discord.js";
import { openPostScoringModal, scoreInputActionRow } from "./ScoringModalUtilities";

const MODAL_ID_PREFIX = "test";
const MODAL_TITLE_PREFIX = "";

export async function openEditPostModal(courseName: string, triggerInteraction: ButtonInteraction) {
    const components: ActionRowBuilder<TextInputBuilder>[] = [scoreInputActionRow];

    openPostScoringModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput)
}

async function handleModalInput(): Promise<string> {
    return "";
}