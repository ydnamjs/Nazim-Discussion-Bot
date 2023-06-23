import { ButtonInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { sendDismissableInteractionReply } from "../../../../../generalUtilities/DismissableMessage";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { DATABASE_ERROR_MESSAGE, MODAL_EXPIRATION_TIME, endDateActionRow, goalPointsActionRow, maxPointsActionRow, startDateActionRow } from "./ModalComponents";
import { ScorePeriodData, checkAgainstCurrentPeriods, handlePeriodValidation, insertOnePeriod, validateScorePeriodInput } from "./ModalUtilities";

const TITLE_PREFIX = "Add Score Period To CISC ";
const MODAL_ID = "discussion_add_score_period_modal";
const SUCCESS_MESSAGE = "New Score Period Added!";

/**
 * @function opens an add score period modal for the given course as a result of the given interaction
 * @param courseName - the name of the corse that the score period is to be added to 
 * @param triggerInteraction - the interaction that triggered the opening of this modal
 */
export async function openAddScorePeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {
    
    //TODO: replace with a refresh function once that is implemented
    updateToManageScorePeriodsMenu(courseName, triggerInteraction, false, true);
    
    const addScorePeriodModal = new ModalBuilder({
        customId: MODAL_ID,
        title: TITLE_PREFIX + courseName,
        components: [
            startDateActionRow,
            endDateActionRow,
            goalPointsActionRow,
            maxPointsActionRow
        ]
    })
    
    triggerInteraction.showModal(addScorePeriodModal);

    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        submittedModal = await triggerInteraction.awaitModalSubmit({time: MODAL_EXPIRATION_TIME})
    }
    catch {}

    if (submittedModal !== undefined) {
        await handleModalInput(courseName, submittedModal);
        //TODO: add a refresh function once that is implemented
    }
}

async function handleModalInput(courseName: string, submittedModal: ModalSubmitInteraction) {

    const periodValidationData = validateScorePeriodInput(submittedModal);

    const hasInvalidInput = handlePeriodValidation(submittedModal, periodValidationData)

    if(hasInvalidInput)
        return

    const newScorePeriod: ScorePeriodData = {
        start: periodValidationData.startDate as Date, 
        end: periodValidationData.endDate as Date, 
        goalPoints: periodValidationData.goalPoints, 
        maxPoints: periodValidationData.maxPoints
    }

    let course: Course | null = null;
    try {
        course = await courseModel.findOne({name: courseName});
    }
    catch(error: any) {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        console.error(error);
        return true;
    }

    if(course && course.discussionSpecs !== null) {
    
        const currentScorePeriods = course.discussionSpecs.scorePeriods;
        const conflictsWithCurrentPeriods = await checkAgainstCurrentPeriods(newScorePeriod, currentScorePeriods, submittedModal)

        if(conflictsWithCurrentPeriods) {
            return
        }

        insertOnePeriod(courseName, newScorePeriod, currentScorePeriods, submittedModal, SUCCESS_MESSAGE)
    }
}