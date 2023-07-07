import { ActionRowBuilder, ButtonInteraction, Client, ModalBuilder, ModalSubmitInteraction, TextInputBuilder } from "discord.js";
import { DATABASE_ERROR_MESSAGE } from "../../../generalUtilities/CourseUtilities";
import { sendDismissableFollowUp, sendDismissableMessage } from "../../../generalUtilities/DismissableMessage";
import { CourseQueue } from "../scoring/courseQueue";


export const INVALID_INPUT_PREFIX = "Invalid Input Format. Nothing Was Changed\n**Reasons(s):**";
export const INPUT_ERROR_PREFIX = "Input Error. Nothing Was Changed\n**Reasons(s):**";
export const SCORING_ERROR_MESSAGE = "Scoring Error; Contact Admin";

export const MODAL_EXPIRATION_TIME = 600_000; // 10 minutes

/**
 * @type function that will handle a modals input data and return the interaction response message as a string
 */
export type DiscussionModalHandler = (client: Client, courseName: string, submittedModal: ModalSubmitInteraction) => Promise<string>;

/**
 * @interface input data for creating a discussion modal
 * @property {ActionRowBuilder<TextInputBuilder>[]} components - the components that on the modal
 * @property {string} idPrefix - the prefix of the modal's id (full id is prefix + milliseconds time)
 * @property {string} titlePrefix - the prefix of the modal's title (goes before the course name)
 * @property {string} courseName - the name of the course that is having its score periods managed
 * @property {Map<string, courseQueue>} courseQueues - Map of all the course queues to use for queueing the input handler
 * @property {DiscussionModalHandler} modalInputHandler - function that handles the modal input
 * @property {function} recollectFunction - function used to recollect component interactions on the menu that created the modal
 * @property {function} refreshFunction - function used to refresh the view of a menu after the modal's input has been handled
 */
export interface DiscussionModalData {
    components: ActionRowBuilder<TextInputBuilder>[]
    idPrefix: string, 
    titlePrefix: string, 
    courseName: string,
    courseQueues: Map<string, CourseQueue>,
    modalInputHandler: DiscussionModalHandler, 
    recollectFunction: () => Promise<void>,
    refreshFunction: () => Promise<void>
}

/**
 * @function creates and handles a modal for managing score periods
 * @param {ButtonInteraction} triggerInteraction - the interaction that triggered the opening of the modal
 * @param {DiscussionModalData} discussionModalData - data used to create a modal and handle its behavior
 */
export async function createDiscussionModal(triggerInteraction: ButtonInteraction, discussionModalData: DiscussionModalData) {

    discussionModalData.recollectFunction();

    // the modal id has to be generated based on time 
    // because if it isnt and the user cancels the modal and opens another one
    // we have to filter that it matches the id otherwise the canceled modal will also be processed
    // and we'll have duplicates and that behavior is VERY undefined
    const modalId = discussionModalData.idPrefix + new Date().getMilliseconds()

    const addScorePeriodModal = new ModalBuilder({
        customId: modalId,
        title: discussionModalData.titlePrefix + discussionModalData.courseName,
        components: discussionModalData.components
    })
    
    triggerInteraction.showModal(addScorePeriodModal);

    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {

        // we have to filter that it matches the id because if we don't and the user cancels the modal and opens another one the
        // canceled modal will also be processed and we'll have duplicates and that behavior is VERY undefined
        // (this is unlike message component interactions! and thus weird)
        submittedModal = await triggerInteraction.awaitModalSubmit({filter: (modal)=> {return modal.customId === modalId}, time: MODAL_EXPIRATION_TIME});
    }
    catch {}

    const courseQueue = discussionModalData.courseQueues.get(discussionModalData.courseName)

    if(!courseQueue && submittedModal) {
        sendDismissableFollowUp(submittedModal, DATABASE_ERROR_MESSAGE);
        return
    }
    else if (!courseQueue) {
        sendDismissableMessage(triggerInteraction.user, DATABASE_ERROR_MESSAGE);
        return
    }

    courseQueue.push( async () => {
        if (submittedModal !== undefined) {
            await submittedModal.deferReply()
            const replyText = await discussionModalData.modalInputHandler(triggerInteraction.client, discussionModalData.courseName, submittedModal);
            await discussionModalData.refreshFunction()
            sendDismissableFollowUp(submittedModal, replyText);
        }
        else {
            sendDismissableMessage(triggerInteraction.user, DATABASE_ERROR_MESSAGE);
        } 
    })
}