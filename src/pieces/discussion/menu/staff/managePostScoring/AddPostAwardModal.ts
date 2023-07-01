import { ActionRowBuilder, ButtonInteraction, Client, Emoji, ModalSubmitInteraction, TextInputBuilder, parseEmoji } from "discord.js";
import { AWARD_UNICODE_INPUT_ID, awardUnicodeInputActionRow, openPostScoringModal, updateCourse } from "./ScoringModalUtilities";
import { scoreAllThreads } from "../../../../../pieces/discussion/tracking/scoreFunctions";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";


const MODAL_ID_PREFIX = "test2";
const MODAL_TITLE_PREFIX = "Add Award To CISC ";

export async function openAddPostAwardModal(courseName: string, triggerInteraction: ButtonInteraction) {
    const components: ActionRowBuilder<TextInputBuilder>[] = [awardUnicodeInputActionRow];

    openPostScoringModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput)
}

async function handleModalInput(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {
    
    const emojiInput = submittedModal.fields.getTextInputValue(AWARD_UNICODE_INPUT_ID).trim()

    const inputErrors =  validateInput(emojiInput);

    if(inputErrors !== "")
        return inputErrors

    return "check console";
    //return await rescoreCourse(client, courseName);
}

function validateInput(emojiInput: string, ): string {

    let errorReasons = "";
    
    const emojiInputArray = emojiInput.match(/\p{Extended_Pictographic}/gu);

    if(emojiInput.length != emojiInputArray?.length)
        errorReasons += "\n- Non emoji character detected in emoji input. Please input one emoji in unicode form EX: 👍";
    else if (emojiInputArray === null)
        errorReasons += "\n- No Emoji detected. Please input one emoji in unicode form EX: 👍";
    else if(emojiInputArray.length > 1)
        errorReasons += "\n- Multiple Emoji detected. Please input one emoji in unicode form EX: 👍";

    return errorReasons
}

async function rescoreCourse(client: Client, courseName: string) {

    const course = await getCourseByName(courseName)

    if(!course || !course.channels.discussion || !course.discussionSpecs)
        return "database error"

    //TODO: Add new awards to course discussion specs
    //course.discussionSpecs.postSpecs.awards.set(new emoji, new awards specs)

    const rescoredPeriods = await scoreAllThreads(client, course.channels.discussion, course.discussionSpecs, course.roles.staff)

    if(!rescoredPeriods)
        return "rescore error"

    return updateCourse(courseName, course.discussionSpecs.postSpecs, rescoredPeriods);
}