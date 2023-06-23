import { ActionRowBuilder, ButtonInteraction, Message, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, User } from "discord.js";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { sendDismissableInteractionReply, sendDismissableReply } from "../../../../../generalUtilities/DismissableMessage";
import { refreshMenu, refreshMenuInteraction, updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { CONFLICTING_DATES_MESSAGE, DATABASE_ERROR_MESSAGE, INVALID_INPUT_PREFIX, MODAL_EXPIRATION_TIME, endDateActionRow, goalPointsActionRow, maxPointsActionRow, startDateActionRow } from "./ModalComponents";
import { ScorePeriodData, checkAgainstCurrentPeriods, createScorePeriodModal, handlePeriodValidation, insertOnePeriod, validateScorePeriodInput } from "./ModalUtilities";

const MODAL_ID_PREFIX = "discussion_add_score_period_modal";
const MODAL_TITLE_PREFIX = "Add Score Period To CISC ";
const SUCCESS_MESSAGE = "New Score Period Added!";

/**
 * @function opens an add score period modal for the given course as a result of the given interaction
 * @param courseName - the name of the corse that the score period is to be added to 
 * @param triggerInteraction - the interaction that triggered the opening of this modal
 */
export async function openAddScorePeriodModal(courseName: string, triggerInteraction: ButtonInteraction) {

    const components = [
        startDateActionRow,
        endDateActionRow,
        goalPointsActionRow,
        maxPointsActionRow
    ];
    
    //await createScorePeriodModal( courseName, triggerInteraction, components, handleModalInput);
    await createScorePeriodModal(MODAL_ID_PREFIX, MODAL_TITLE_PREFIX, courseName, triggerInteraction, components, handleModalInput);
}

async function handleModalInput(courseName: string, submittedModal: ModalSubmitInteraction): Promise<string> {

    const periodValidationData = validateScorePeriodInput(submittedModal);

    const reasonsForFailure = handlePeriodValidation(periodValidationData)

    if(reasonsForFailure !== "") {
        return INVALID_INPUT_PREFIX + reasonsForFailure;
    }
    
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
        console.error(error);
        return DATABASE_ERROR_MESSAGE;
    }

    if(course && course.discussionSpecs !== null) {
    
        const currentScorePeriods = course.discussionSpecs.scorePeriods;
        const conflictsWithCurrentPeriods = await checkAgainstCurrentPeriods(newScorePeriod, currentScorePeriods, submittedModal)

        if(conflictsWithCurrentPeriods) {
            return CONFLICTING_DATES_MESSAGE;
        }

        insertOnePeriod(courseName, newScorePeriod, currentScorePeriods, submittedModal, SUCCESS_MESSAGE)
    }
    return SUCCESS_MESSAGE;
}