import { ActionRowBuilder, ButtonInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { ModalInputHandler, createDiscussionModal } from "../../ModalUtilities";
import { refreshManagePostScoringMenu, updateToManagePostScoringMenu } from "./ManagePostScoringMenu";
import { DEFAULT_POST_SPECS } from "../../../../../pieces/courseManagement/DiscussionRulesDefaults";

// score input component
export const SCORE_INPUT_ID = "discussion_score_input";
const SCORE_INPUT_LABEL = "points for post";
const SCORE_INPUT_STYLE = TextInputStyle.Short;

const scoreInput = new TextInputBuilder({
    customId: SCORE_INPUT_ID,
    label: SCORE_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.points.toString(),
    style: SCORE_INPUT_STYLE,
})

export const scoreInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [scoreInput]});

// comment score input component
export const COMMENT_SCORE_INPUT_ID = "discussion_comment_score_input";
const COMMENT_SCORE_INPUT_LABEL = "points for comments (given to poster)";
const COMMENT_SCORE_INPUT_STYLE = TextInputStyle.Short;

const commentScoreInput = new TextInputBuilder({
    customId: COMMENT_SCORE_INPUT_ID,
    label: COMMENT_SCORE_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.commentPoints.toString(),
    style: COMMENT_SCORE_INPUT_STYLE,
})

export const commentScoreInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [commentScoreInput]});

// length req input component
export const LENGTH_REQ_INPUT_ID = "discussion_length_input";
const LENGTH_REQ_INPUT_LABEL = "post minimum length requirement";
const LENGTH_REQ_INPUT_STYLE = TextInputStyle.Short;

const lengthReqInput = new TextInputBuilder({
    customId: LENGTH_REQ_INPUT_ID,
    label: LENGTH_REQ_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.minLength.toString(),
    style: LENGTH_REQ_INPUT_STYLE,
})

export const lengthReqInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [lengthReqInput]});

// paragraph req input component
export const PARA_REQ_INPUT_ID = "discussion_paragraph_input";
const PARA_REQ_INPUT_LABEL = "post minimum paragraph requirement";
const PARA_REQ_INPUT_STYLE = TextInputStyle.Short;

const paraReqInput = new TextInputBuilder({
    customId: PARA_REQ_INPUT_ID,
    label: PARA_REQ_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.minParagraphs.toString(),
    style: PARA_REQ_INPUT_STYLE,
})

export const paraReqInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [paraReqInput]});

// link req input component
export const LINK_REQ_INPUT_ID = "discussion_link_input";
const LINK_REQ_INPUT_LABEL = "post minimum link requirement";
const LINK_REQ_INPUT_STYLE = TextInputStyle.Short;

const linkReqInput = new TextInputBuilder({
    customId: LINK_REQ_INPUT_ID,
    label: LINK_REQ_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.minLinks.toString(),
    style: LINK_REQ_INPUT_STYLE,
})

export const linkReqInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [linkReqInput]});

export async function openPostScoringModal(idPrefix: string, titlePrefix: string, courseName: string, triggerInteraction: ButtonInteraction, components: ActionRowBuilder<TextInputBuilder>[], modalInputHandler: ModalInputHandler) {
    
    updateToManagePostScoringMenu(courseName, triggerInteraction, false);

    await createDiscussionModal(idPrefix, titlePrefix, courseName, triggerInteraction, components, modalInputHandler, async () => {await refreshManagePostScoringMenu(courseName, triggerInteraction)})
}