import { ActionRowBuilder, ButtonInteraction, Client, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { AwardSpecs, PostSpecs } from "../../../../../generalModels/DiscussionScoring";
import { DATABASE_ERROR_MESSAGE, getCourseByName, overwriteCourseDiscussionSpecs } from "../../../../../generalUtilities/CourseUtilities";
import { DEFAULT_POST_SPECS } from "../../../../../pieces/courseManagement/DiscussionRulesDefaults";
import { ModalInputHandler, createDiscussionModal } from "../../../../../pieces/menu/ModalUtilities";
import { recollectManagePostSpecsInput, refreshManagePostSpecsMenu } from "./ManagePostScoringMenu";
import { INPUT_ERROR_PREFIX, INVALID_INPUT_PREFIX, SCORING_ERROR_MESSAGE } from "../../DiscussionModalUtilities";
import { rescoreDiscussion } from "../../../../../pieces/discussion/scoring/rescorePeriods";
import { CourseQueue } from "src/pieces/discussion/scoring/courseQueue";

// POST SCORE INPUT COMPONENT
const SCORE_INPUT_ID = "discussion_score_input";
const SCORE_INPUT_LABEL = "points for post";
const SCORE_INPUT_STYLE = TextInputStyle.Short;

const scoreInput = new TextInputBuilder({
    customId: SCORE_INPUT_ID,
    label: SCORE_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.points.toString(),
    style: SCORE_INPUT_STYLE,
})

const scoreInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [scoreInput]});

// COMMENT SCORE INPUT COMPONENT
const COMMENT_SCORE_INPUT_ID = "discussion_comment_score_input";
const COMMENT_SCORE_INPUT_LABEL = "points for comments (given to poster)";
const COMMENT_SCORE_INPUT_STYLE = TextInputStyle.Short;

const commentScoreInput = new TextInputBuilder({
    customId: COMMENT_SCORE_INPUT_ID,
    label: COMMENT_SCORE_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.commentPoints.toString(),
    style: COMMENT_SCORE_INPUT_STYLE,
})

const commentScoreInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [commentScoreInput]});

// LENGTH REQ INPUT COMPONENT
const LENGTH_REQ_INPUT_ID = "discussion_length_input";
const LENGTH_REQ_INPUT_LABEL = "post minimum length requirement";
const LENGTH_REQ_INPUT_STYLE = TextInputStyle.Short;

const lengthReqInput = new TextInputBuilder({
    customId: LENGTH_REQ_INPUT_ID,
    label: LENGTH_REQ_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.minLength.toString(),
    style: LENGTH_REQ_INPUT_STYLE,
})

const lengthReqInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [lengthReqInput]});

// PARAGRAPH REQ INPUT COMPONENT
const PARA_REQ_INPUT_ID = "discussion_paragraph_input";
const PARA_REQ_INPUT_LABEL = "post minimum paragraph requirement";
const PARA_REQ_INPUT_STYLE = TextInputStyle.Short;

const paraReqInput = new TextInputBuilder({
    customId: PARA_REQ_INPUT_ID,
    label: PARA_REQ_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.minParagraphs.toString(),
    style: PARA_REQ_INPUT_STYLE,
})

const paraReqInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [paraReqInput]});

// LINK REQ INPUT COMPONENT
const LINK_REQ_INPUT_ID = "discussion_link_input";
const LINK_REQ_INPUT_LABEL = "post minimum link requirement";
const LINK_REQ_INPUT_STYLE = TextInputStyle.Short;

const linkReqInput = new TextInputBuilder({
    customId: LINK_REQ_INPUT_ID,
    label: LINK_REQ_INPUT_LABEL,
    placeholder: DEFAULT_POST_SPECS.minLinks.toString(),
    style: LINK_REQ_INPUT_STYLE,
})

const linkReqInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [linkReqInput]});

// AWARD UNICODE INPUT COMPONENT
const AWARD_UNICODE_INPUT_ID = "discussion_post_award_unicode_input";
const AWARD_UNICODE_INPUT_LABEL = "award emoji unicode";
const AWARD_UNICODE_INPUT_STYLE = TextInputStyle.Short;
const AWARD_UNICODE_INPUT_PLACEHOLDER = "👍";

const awardUnicodeInput = new TextInputBuilder({
    customId: AWARD_UNICODE_INPUT_ID,
    label: AWARD_UNICODE_INPUT_LABEL,
    placeholder: AWARD_UNICODE_INPUT_PLACEHOLDER,
    style: AWARD_UNICODE_INPUT_STYLE,
})

const awardUnicodeInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [awardUnicodeInput]});

// AWARD POINTS INPUT COMPONENT
const AWARD_POINTS_INPUT_ID = "discussion_post_award_points_input";
const AWARD_POINTS_INPUT_LABEL = "award points";
const AWARD_POINTS_INPUT_STYLE = TextInputStyle.Short;
const AWARD_POINTS_INPUT_PLACEHOLDER = "25";

const awardPointsInput = new TextInputBuilder({
    customId: AWARD_POINTS_INPUT_ID,
    label: AWARD_POINTS_INPUT_LABEL,
    placeholder: AWARD_POINTS_INPUT_PLACEHOLDER,
    style: AWARD_POINTS_INPUT_STYLE,
})

const awardPointsInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [awardPointsInput]});

// IS STAFF ONLY INPUT COMPONENT
const AWARD_STAFF_ONLY_INPUT_ID = "discussion_post_award_staff_only_input";
const AWARD_STAFF_ONLY_INPUT_LABEL = "is award staff only? (\"True\" or \"False\")";
const AWARD_STAFF_ONLY_INPUT_STYLE = TextInputStyle.Short;
const AWARD_STAFF_ONLY_INPUT_PLACEHOLDER = "True";

const awardStaffOnlyInput = new TextInputBuilder({
    customId: AWARD_STAFF_ONLY_INPUT_ID,
    label: AWARD_STAFF_ONLY_INPUT_LABEL,
    placeholder: AWARD_STAFF_ONLY_INPUT_PLACEHOLDER,
    style: AWARD_STAFF_ONLY_INPUT_STYLE,
})

const awardStaffOnlyInputActionRow = new ActionRowBuilder<TextInputBuilder>({components: [awardStaffOnlyInput]});

// EDIT POST SCORING MODAL
const MODAL_ID_PREFIX = "edit_post_scoring_modal";
const MODAL_TITLE_PREFIX = "Edit Post Scoring - CISC ";

export async function openEditPostModal(courseName: string, triggerInteraction: ButtonInteraction, courseQueues: Map<string, CourseQueue>) {
    const components: ActionRowBuilder<TextInputBuilder>[] = [scoreInputActionRow, commentScoreInputActionRow, lengthReqInputActionRow, paraReqInputActionRow, linkReqInputActionRow];

    openPostScoringModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput, courseQueues)
}

async function handleModalInput(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {
    
    const scoreInput = Number.parseInt(submittedModal.fields.getTextInputValue(SCORE_INPUT_ID))
    const commentScoreInput = Number.parseInt(submittedModal.fields.getTextInputValue(COMMENT_SCORE_INPUT_ID))
    const lengthInput = Number.parseInt(submittedModal.fields.getTextInputValue(LENGTH_REQ_INPUT_ID))
    const paraInput = Number.parseInt(submittedModal.fields.getTextInputValue(PARA_REQ_INPUT_ID))
    const linkInput = Number.parseInt(submittedModal.fields.getTextInputValue(LINK_REQ_INPUT_ID))
    
    const inputErrors =  validatePostSpecsInput(scoreInput, commentScoreInput, lengthInput, paraInput, linkInput);

    if(inputErrors !== "")
        return INVALID_INPUT_PREFIX + inputErrors
    
    const newPostSpecs: Partial<PostSpecs> = {
        points: scoreInput,
        commentPoints: commentScoreInput,
        minLength: lengthInput,
        minParagraphs: paraInput,
        minLinks: linkInput,
    }

    const course = await getCourseByName(courseName)

    if(!course || !course.channels.discussion || !course.discussionSpecs)
        return DATABASE_ERROR_MESSAGE

    // we unpack the course's post specs to preserve awards/penalties
    course.discussionSpecs.postSpecs = {...course.discussionSpecs.postSpecs, ...newPostSpecs};

    const rescoredPeriods = await rescoreDiscussion(client, course.channels.discussion, course.discussionSpecs, course.roles.staff)

    if(!rescoredPeriods)
        return SCORING_ERROR_MESSAGE

    course.discussionSpecs.scorePeriods = rescoredPeriods

    return overwriteCourseDiscussionSpecs(courseName, course.discussionSpecs);
}

// ADD AWARD MODAL
const ADD_AWARD_MODAL_ID_PREFIX = "add_edit_post_award_modal";
const ADD_AWARD_MODAL_TITLE_PREFIX = "Add/Edit Award - CISC ";

const ADD_AWARD_SUCCESS_MESSAGE = "Award successfully added";
const EDIT_AWARD_SUCCESS_MESSAGE = "Award successfully updated";

export async function openAddPostAwardModal(courseName: string, triggerInteraction: ButtonInteraction, courseQueues: Map<string, CourseQueue>) {
    const components: ActionRowBuilder<TextInputBuilder>[] = [awardUnicodeInputActionRow, awardPointsInputActionRow, awardStaffOnlyInputActionRow];

    openPostScoringModal(ADD_AWARD_MODAL_ID_PREFIX, ADD_AWARD_MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleAddAwardModalInput, courseQueues)
}

async function handleAddAwardModalInput(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {
    
    const emojiInput = submittedModal.fields.getTextInputValue(AWARD_UNICODE_INPUT_ID).trim();
    const awardPointsInput = Number.parseInt(submittedModal.fields.getTextInputValue(AWARD_POINTS_INPUT_ID));
    const isStaffOnlyInput = submittedModal.fields.getTextInputValue(AWARD_STAFF_ONLY_INPUT_ID);
    
    const inputErrors =  validateAwardInput(emojiInput, awardPointsInput, isStaffOnlyInput);

    if(inputErrors !== "")
        return INVALID_INPUT_PREFIX + inputErrors

    const newAward: AwardSpecs = {
        points: awardPointsInput,
        trackStudents: isStaffOnlyInput !== "True"
    }

    const course = await getCourseByName(courseName)

    if(!course || !course.channels.discussion || !course.discussionSpecs)
        return DATABASE_ERROR_MESSAGE

    const edited = course.discussionSpecs.postSpecs.awards.has(emojiInput)

    course.discussionSpecs.postSpecs.awards.set(emojiInput, newAward)

    const rescoredPeriods = await rescoreDiscussion(client, course.channels.discussion, course.discussionSpecs, course.roles.staff)

    if(!rescoredPeriods)
        return SCORING_ERROR_MESSAGE

    course.discussionSpecs.scorePeriods = rescoredPeriods

    const awardErrors = await overwriteCourseDiscussionSpecs(courseName, course.discussionSpecs);

    if(awardErrors !== "")
        return awardErrors

    return edited ? EDIT_AWARD_SUCCESS_MESSAGE : ADD_AWARD_SUCCESS_MESSAGE;
}


// DELETE AWARD MODAL
const DELETE_AWARD_MODAL_ID_PREFIX = "delete_post_award_modal";
const DELETE_AWARD_MODAL_TITLE_PREFIX = "Delete Award - CISC ";

const EMOJI_NOT_FOUND_ERROR_MESSAGE = "\n- Emoji not found"

const DELETE_AWARD_SUCCESS_MESSAGE = "Award successfully deleted";

export async function openDeletePostAwardModal(courseName: string, triggerInteraction: ButtonInteraction, courseQueues: Map<string, CourseQueue>) {
    const components: ActionRowBuilder<TextInputBuilder>[] = [awardUnicodeInputActionRow];

    openPostScoringModal(DELETE_AWARD_MODAL_ID_PREFIX, DELETE_AWARD_MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleDeleteAwardModalInput, courseQueues)
}

async function handleDeleteAwardModalInput(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {
    
    const emojiInput = submittedModal.fields.getTextInputValue(AWARD_UNICODE_INPUT_ID).trim();

    const course = await getCourseByName(courseName)

    if(!course || !course.channels.discussion || !course.discussionSpecs)
        return DATABASE_ERROR_MESSAGE

    const inputErrors = validateEmojiInput(emojiInput)

    if(inputErrors !== "")
        return INVALID_INPUT_PREFIX + inputErrors;

    if(!(course.discussionSpecs.postSpecs.awards.has(emojiInput)))
        return INPUT_ERROR_PREFIX + EMOJI_NOT_FOUND_ERROR_MESSAGE
    course.discussionSpecs.postSpecs.awards.delete(emojiInput)

    const rescoredPeriods = await rescoreDiscussion(client, course.channels.discussion, course.discussionSpecs, course.roles.staff)

    if(!rescoredPeriods)
        return SCORING_ERROR_MESSAGE

    course.discussionSpecs.scorePeriods = rescoredPeriods

    const awardErrors = await overwriteCourseDiscussionSpecs(courseName, course.discussionSpecs);

    if(awardErrors !== "")
    return awardErrors

    return DELETE_AWARD_SUCCESS_MESSAGE;
}

// HELPER FUNCTIONS
async function openPostScoringModal(idPrefix: string, titlePrefix: string, courseName: string, triggerInteraction: ButtonInteraction, components: ActionRowBuilder<TextInputBuilder>[], modalInputHandler: ModalInputHandler, courseQueues: Map<string, CourseQueue>) {
    
    recollectManagePostSpecsInput(courseName, triggerInteraction, courseQueues);

    await createDiscussionModal(idPrefix, titlePrefix, courseName, triggerInteraction, components, modalInputHandler, async () => {await refreshManagePostSpecsMenu(courseName, triggerInteraction, courseQueues)})
}

function validatePostSpecsInput(score: number, commentScore: number, length: number, para: number, link: number): string {

    let errorReasons = "";

    if(Number.isNaN(score) || !(score >= 0))
        errorReasons += "\n- score shoule be a non negative integer";

    if(Number.isNaN(commentScore) || !(commentScore >= 0))
        errorReasons += "\n- comment score should be a non negative integer";

    if(Number.isNaN(length) || !(length >= 0))
        errorReasons += "\n- min length requirement should be a non negative integer";

    if(Number.isNaN(para) || !(para >= 0))
        errorReasons += "\n- min paragraphs requirement should be a non negative integer";

    if(Number.isNaN(link) || !(link >= 0))
        errorReasons += "\n- min links requirement should be a non negative integer";

    return errorReasons
}

function validateEmojiInput(emojiInput: string) {
    
    let errorReasons = "";

    // FIXME: This parsing currently does not support every discord emoji or even most of them
    // for example it does support :zap: but not :hamburger:
    const emojiInputArray = emojiInput.match(/\p{Extended_Pictographic}/gu);

    if(emojiInput.length != emojiInputArray?.length)
        errorReasons += "\n- Non emoji character detected in emoji input. Please input one emoji in unicode form EX: 👍";
    else if (emojiInputArray === null)
        errorReasons += "\n- No Emoji detected. Please input one emoji in unicode form EX: 👍";
    else if(emojiInputArray.length > 1)
        errorReasons += "\n- Multiple Emoji detected. Please input one emoji in unicode form EX: 👍";
    
    return errorReasons;
}

function validateAwardInput(emojiInput: string, awardPointsInput: number, isStaffOnlyInput: string): string {

    let errorReasons = "";

    errorReasons += validateEmojiInput(emojiInput);
    
    if(Number.isNaN(awardPointsInput))
        errorReasons += "\n- Invalid Award Points Detected. Please input an integer EX: 25";
    
    if((isStaffOnlyInput !== "True") && (isStaffOnlyInput !== "False"))
        errorReasons += "\n- Invalid Staff Only Detected. Please input \"True\" or \"False\"";

    return errorReasons
}