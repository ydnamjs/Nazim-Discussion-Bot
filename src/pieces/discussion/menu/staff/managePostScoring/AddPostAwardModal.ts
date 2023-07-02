import { ActionRowBuilder, ButtonInteraction, Client, Emoji, ModalSubmitInteraction, TextInputBuilder, parseEmoji } from "discord.js";
import { AWARD_POINTS_INPUT_ID, AWARD_STAFF_ONLY_INPUT_ID, AWARD_UNICODE_INPUT_ID, awardPointsInputActionRow, awardStaffOnlyInputActionRow, awardUnicodeInputActionRow, openPostScoringModal, updateCourse } from "./ScoringModalUtilities";
import { scoreAllThreads } from "../../../scoring/scoreFunctions";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";
import { AwardSpecs } from "src/generalModels/DiscussionScoring";


const MODAL_ID_PREFIX = "test2";
const MODAL_TITLE_PREFIX = "Add Award To CISC ";

export async function openAddPostAwardModal(courseName: string, triggerInteraction: ButtonInteraction) {
    const components: ActionRowBuilder<TextInputBuilder>[] = [awardUnicodeInputActionRow, awardPointsInputActionRow, awardStaffOnlyInputActionRow];

    openPostScoringModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput)
}

async function handleModalInput(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {
    
    const emojiInput = submittedModal.fields.getTextInputValue(AWARD_UNICODE_INPUT_ID).trim();
    const awardPointsInput = Number.parseInt(submittedModal.fields.getTextInputValue(AWARD_POINTS_INPUT_ID));
    const isStaffOnlyInput = submittedModal.fields.getTextInputValue(AWARD_STAFF_ONLY_INPUT_ID);
    const inputErrors =  validateInput(emojiInput, awardPointsInput, isStaffOnlyInput);

    if(inputErrors !== "")
        return inputErrors

    const newAward: AwardSpecs = {
        points: awardPointsInput,
        trackStudents: isStaffOnlyInput !== "True"
    }

    return await rescoreCourse(client, courseName, emojiInput, newAward);
}

function validateInput(emojiInput: string, awardPointsInput: number, isStaffOnlyInput: string): string {

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

    if(Number.isNaN(awardPointsInput))
        errorReasons += "\n- Invalid Award Points Detected. Please input an integer EX: 25";
    
    if((isStaffOnlyInput !== "True") && (isStaffOnlyInput !== "False"))
        errorReasons += "\n- Invalid Staff Only Detected. Please input \"True\" or \"False\"";

    return errorReasons
}

async function rescoreCourse(client: Client, courseName: string, newAwardEmoji: string, newAwardSpecs: AwardSpecs) {

    const course = await getCourseByName(courseName)

    if(!course || !course.channels.discussion || !course.discussionSpecs)
        return "database error"

    course.discussionSpecs.postSpecs.awards.set(newAwardEmoji, newAwardSpecs)

    const rescoredPeriods = await scoreAllThreads(client, course.channels.discussion, course.discussionSpecs, course.roles.staff)

    if(!rescoredPeriods)
        return "rescore error"

    return updateCourse(courseName, course.discussionSpecs.postSpecs, rescoredPeriods);
}