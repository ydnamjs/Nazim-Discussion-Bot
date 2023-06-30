import { ActionRowBuilder, ButtonInteraction, Client, ModalSubmitInteraction, TextInputBuilder } from "discord.js";
import { COMMENT_SCORE_INPUT_ID, LENGTH_REQ_INPUT_ID, LINK_REQ_INPUT_ID, PARA_REQ_INPUT_ID, SCORE_INPUT_ID, commentScoreInputActionRow, lengthReqInputActionRow, linkReqInputActionRow, openPostScoringModal, paraReqInputActionRow, scoreInputActionRow } from "./ScoringModalUtilities";

const MODAL_ID_PREFIX = "test";
const MODAL_TITLE_PREFIX = "";

export async function openEditPostModal(courseName: string, triggerInteraction: ButtonInteraction) {
    const components: ActionRowBuilder<TextInputBuilder>[] = [scoreInputActionRow, commentScoreInputActionRow, lengthReqInputActionRow, paraReqInputActionRow, linkReqInputActionRow];

    openPostScoringModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput)
}

async function handleModalInput(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {
    
    const scoreInput = Number.parseInt(submittedModal.fields.getTextInputValue(SCORE_INPUT_ID))
    const commentScoreInput = Number.parseInt(submittedModal.fields.getTextInputValue(COMMENT_SCORE_INPUT_ID))
    const lengthInput = Number.parseInt(submittedModal.fields.getTextInputValue(LENGTH_REQ_INPUT_ID))
    const paraInput = Number.parseInt(submittedModal.fields.getTextInputValue(PARA_REQ_INPUT_ID))
    const linkInput = Number.parseInt(submittedModal.fields.getTextInputValue(LINK_REQ_INPUT_ID))
    
    return validateInput(scoreInput, commentScoreInput, lengthInput, paraInput, linkInput);
}

function validateInput(score: number, commentScore: number, length: number, para: number, link: number): string {

    let errorReasons = "";

    if(Number.isNaN(score) || !(score > 0))
        errorReasons += "\n- score shoule be a non negative integer";

    if(Number.isNaN(commentScore) || !(commentScore > 0))
        errorReasons += "\n- comment score should be a non negative integer";

    if(Number.isNaN(length) || !(length > 0))
        errorReasons += "\n- min length requirement should be a non negative integer";

    if(Number.isNaN(para) || !(para > 0))
        errorReasons += "\n- min paragraphs requirement should be a non negative integer";

    if(Number.isNaN(para) || !(para > 0))
        errorReasons += "\n- min links requirement should be a non negative integer";

    return errorReasons
}