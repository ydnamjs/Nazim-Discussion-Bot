import { ActionRowBuilder, ButtonInteraction, Client, ModalSubmitInteraction, TextInputBuilder } from "discord.js";
import { COMMENT_SCORE_INPUT_ID, LENGTH_REQ_INPUT_ID, LINK_REQ_INPUT_ID, PARA_REQ_INPUT_ID, SCORE_INPUT_ID, commentScoreInputActionRow, lengthReqInputActionRow, linkReqInputActionRow, openPostScoringModal, paraReqInputActionRow, scoreInputActionRow } from "./ScoringModalUtilities";
import { scoreAllThreads } from "../../../../../pieces/discussion/tracking/scoreFunctions";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";
import { PostSpecs, ScorePeriod } from "../../../../../generalModels/DiscussionScoring";
import { courseModel } from "../../../../../generalModels/Course";

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
    
    const inputErrors =  validateInput(scoreInput, commentScoreInput, lengthInput, paraInput, linkInput);

    if(inputErrors !== "")
        return inputErrors
    
    const newPostSpecs: Partial<PostSpecs> = {
        points: scoreInput,
        commentPoints: commentScoreInput,
        minLength: lengthInput,
        minParagraphs: paraInput,
        minLinks: linkInput,
    }

    return await rescoreCourse(client, courseName, newPostSpecs);
}

function validateInput(score: number, commentScore: number, length: number, para: number, link: number): string {

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

async function rescoreCourse(client: Client, courseName: string, newPostScoringData: Partial<PostSpecs>) {

    const course = await getCourseByName(courseName)

    if(!course || !course.channels.discussion || !course.discussionSpecs)
        return "database error"

    // we unpack the course's post specs to preserve awards/penalties
    course.discussionSpecs.postSpecs = {...course.discussionSpecs.postSpecs, ...newPostScoringData};

    const rescoredPeriods = await scoreAllThreads(client, course.channels.discussion, course.discussionSpecs, course.roles.staff)

    if(rescoredPeriods)
        console.log(rescoredPeriods[0].studentScores.values())

    if(!rescoredPeriods)
        return "rescore"

    return updateCourse(courseName, course.discussionSpecs.postSpecs, rescoredPeriods);
}

async function updateCourse(courseName: string, newPostSpecs: PostSpecs, newScorePeriods: ScorePeriod[]) {
    
    try {
        await courseModel.findOneAndUpdate( 
            {name: courseName}, 
            {
                "discussionSpecs.postSpecs": newPostSpecs,
                "discussionSpecs.scorePeriods": newScorePeriods
            }
        )
    }
    catch(error: any) {
        console.error(error);
        return "database error";
    }
    return "success";
}