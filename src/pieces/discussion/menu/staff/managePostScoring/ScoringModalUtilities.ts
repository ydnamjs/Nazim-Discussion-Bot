import { ActionRowBuilder, ButtonInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { ModalInputHandler, createDiscussionModal } from "../../ModalUtilities";
import { refreshManagePostScoringMenu, updateToManagePostScoringMenu } from "./ManagePostScoringMenu";
import { DEFAULT_POST_SPECS } from "../../../../../pieces/courseManagement/DiscussionRulesDefaults";

export const SCORE_INPUT_ID = "discussion_score_period_input";
const SCORE_INPUT_LABEL = "score period #";
const SCORE_INPUT_PLACEHOLDER = "0";
const SCORE_INPUT_STYLE = TextInputStyle.Short;

const scoreInput = new TextInputBuilder({
    customId: SCORE_INPUT_LABEL,
    label: SCORE_INPUT_PLACEHOLDER,
    placeholder: DEFAULT_POST_SPECS.points.toString(),
    style: SCORE_INPUT_STYLE,
})

export const scoreInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [scoreInput]});

export async function openPostScoringModal(idPrefix: string, titlePrefix: string, courseName: string, triggerInteraction: ButtonInteraction, components: ActionRowBuilder<TextInputBuilder>[], modalInputHandler: ModalInputHandler) {
    
    updateToManagePostScoringMenu(courseName, triggerInteraction, false);

    await createDiscussionModal(idPrefix, titlePrefix, courseName, triggerInteraction, components, modalInputHandler, async () => {await refreshManagePostScoringMenu(courseName, triggerInteraction)})
}