import { ActionRowBuilder, ButtonInteraction, Client, Emoji, ModalSubmitInteraction, TextInputBuilder, parseEmoji } from "discord.js";
import { AWARD_POINTS_INPUT_ID, AWARD_UNICODE_INPUT_ID, awardPointsInputActionRow, awardUnicodeInputActionRow, openPostScoringModal, updateCourse } from "./ScoringModalUtilities";
import { scoreAllThreads } from "../../../../../pieces/discussion/tracking/scoreFunctions";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";


const MODAL_ID_PREFIX = "test2";
const MODAL_TITLE_PREFIX = "Add Award To CISC ";

export async function openAddPostAwardModal(courseName: string, triggerInteraction: ButtonInteraction) {
    const components: ActionRowBuilder<TextInputBuilder>[] = [awardUnicodeInputActionRow, awardPointsInputActionRow];

    openPostScoringModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput)
}

async function handleModalInput(client: Client, courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {
    
    const emojiInput = submittedModal.fields.getTextInputValue(AWARD_UNICODE_INPUT_ID).trim();
    const awardPoints = Number.parseInt(submittedModal.fields.getTextInputValue(AWARD_POINTS_INPUT_ID));

    const inputErrors =  validateInput(emojiInput, awardPoints);

    if(inputErrors !== "")
        return inputErrors

    return "check console";
    //return await rescoreCourse(client, courseName);
}

function validateInput(emojiInput: string, awardPoints: number): string {

    let errorReasons = "";
    
    const emojiInputArray = emojiInput.match(/\p{Extended_Pictographic}/gu);

    if(emojiInput.length != emojiInputArray?.length)
        errorReasons += "\n- Non emoji character detected in emoji input. Please input one emoji in unicode form EX: 👍";
    else if (emojiInputArray === null)
        errorReasons += "\n- No Emoji detected. Please input one emoji in unicode form EX: 👍";
    else if(emojiInputArray.length > 1)
        errorReasons += "\n- Multiple Emoji detected. Please input one emoji in unicode form EX: 👍";

    if(Number.isNaN(awardPoints))
        errorReasons += "\n- Invalid Award Points Detected. Please input an integer EX: 25";
    
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