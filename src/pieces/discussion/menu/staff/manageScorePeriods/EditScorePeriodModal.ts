import { ButtonInteraction, Message, ModalBuilder, ModalSubmitInteraction, User } from "discord.js";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { sendDismissableInteractionReply } from "../../../../../generalUtilities/DismissableMessage";
import { ScorePeriodData, refreshMenu, updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { DATABASE_ERROR_MESSAGE, INVALID_INPUT_PREFIX, MODAL_EXPIRATION_TIME, PERIOD_NUM_INPUT_ID, endDateActionRow, goalPointsActionRow, maxPointsActionRow, scorePeriodNumActionRow, startDateActionRow } from "./ModalComponents";
import { checkAgainstCurrentPeriods, handleIndexValidation, handlePeriodValidation, insertOnePeriod, validateScorePeriodInput } from "./ModalUtilities";

const MODAL_ID = "edit_score_period_modal";
const TITLE_PREFIX = "Add Score Period To ";
const SUCCESS_MESSAGE = "Score Period Successfully Updated";

// PRIMARY OPEN MODAL FUNCTION
/**
 * @function opens an add score period modal for the given course as a result of the given interaction
 * @param courseTitle - the title of the corse that the score period is to be added to 
 * @param interaction - the interaction that triggered the opening of this modal
 */
export async function openEditScorePeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {
    
    //TODO: replace with a refresh function once that is implemented
    updateToManageScorePeriodsMenu(courseName, triggerInteraction, false, true);
    
    const editScorePeriodModal = new ModalBuilder({
        customId: MODAL_ID,
        title: TITLE_PREFIX + courseName,
        components: [
            scorePeriodNumActionRow,
            startDateActionRow,
            endDateActionRow,
            goalPointsActionRow,
            maxPointsActionRow
        ]
    })
    triggerInteraction.showModal(editScorePeriodModal);
    
    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        submittedModal = await triggerInteraction.awaitModalSubmit({time: MODAL_EXPIRATION_TIME})
    }
    catch {}

    if (submittedModal !== undefined) {
        handleModalInput(courseName, submittedModal, triggerInteraction.message);
    }
}

async function handleModalInput(courseName: string, submittedModal: ModalSubmitInteraction, triggerMessage: Message) {

    const toEditIndex = Number.parseInt(submittedModal.fields.getTextInputValue(PERIOD_NUM_INPUT_ID));
    const periodValidationData = validateScorePeriodInput(submittedModal);

    let course: Course | null = null;
    try {
        course = await courseModel.findOne({name: courseName});
    }
    catch(error: any) {
        refreshMenu(courseName, triggerMessage, submittedModal.user);
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        console.error(error);
        return true;
    }
    
    if(course && course.discussionSpecs !== null) {

        const currentScorePeriods = course.discussionSpecs.scorePeriods;

        const reasonsForFailure = handleIndexValidation(toEditIndex, currentScorePeriods.length) + handlePeriodValidation(periodValidationData)

        if(reasonsForFailure !== "") {
            refreshMenu(courseName, triggerMessage, submittedModal.user);
            sendDismissableInteractionReply(submittedModal, INVALID_INPUT_PREFIX + reasonsForFailure);
            return
        }

        const newScorePeriod: ScorePeriodData = {
            start: periodValidationData.startDate as Date, 
            end: periodValidationData.endDate as Date, 
            goalPoints: periodValidationData.goalPoints, 
            maxPoints: periodValidationData.maxPoints
        }

        currentScorePeriods.splice(toEditIndex - 1, 1);
        const conflictsWithCurrentPeriods = await checkAgainstCurrentPeriods(newScorePeriod, currentScorePeriods, submittedModal)

        if(conflictsWithCurrentPeriods) {
            return
        }

        insertOnePeriod(courseName, newScorePeriod, currentScorePeriods, submittedModal, SUCCESS_MESSAGE)
    }
}