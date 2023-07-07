import { ActionRowBuilder, ButtonInteraction, Client, ModalBuilder, ModalSubmitInteraction, TextInputBuilder } from "discord.js";
import { sendDismissableFollowUp, sendDismissableMessage } from "../../generalUtilities/DismissableMessage";
import { CourseQueue } from "../discussion/scoring/courseQueue";
import { DATABASE_ERROR_MESSAGE } from "../../generalUtilities/CourseUtilities";

export const MODAL_EXPIRATION_TIME = 600_000; // 10 minutes

/**
 * @type function that will handle a modals input data and return the interaction response message as a string
 */
export type DiscussionModalHandler = (client: Client, courseName: string, submittedModal: ModalSubmitInteraction) => Promise<string>;

/**
 * @function creates and handles a modal for managing score periods
 * @param {string} idPrefix - the prefix of the modal's id (full id is prefix + milliseconds time)
 * @param {string} titlePrefix - the prefix of the modal's title (goes before the course name)
 * @param {string} courseName - the name of the course that is having its score periods managed
 * @param {ButtonInteraction} triggerInteraction - the interaction that triggered the opening of the modal
 * @param {ActionRowBuilder<TextInputBuilder>[]} components - the components that on the modal
 * @param {DiscussionModalHandler} modalInputHandler - function that handles the modal input
 */
export async function createDiscussionModal(idPrefix: string, titlePrefix: string, courseName: string, triggerInteraction: ButtonInteraction, components: ActionRowBuilder<TextInputBuilder>[], modalInputHandler: DiscussionModalHandler, courseQueues: Map<string, CourseQueue>, refreshFunction?: ()=>Promise<void>) {

    // the modal id has to be generated based on time 
    // because if it isnt and the user cancels the modal and opens another one
    // we have to filter that it matches the id otherwise the canceled modal will also be processed
    // and we'll have duplicates and that behavior is VERY undefined
    const modalId = idPrefix + new Date().getMilliseconds()

    const addScorePeriodModal = new ModalBuilder({
        customId: modalId,
        title: titlePrefix + courseName,
        components: components
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

    const courseQueue = courseQueues.get(courseName)

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
            const replyText = await modalInputHandler(triggerInteraction.client, courseName, submittedModal);
            refreshFunction? await refreshFunction() : 0;
            sendDismissableFollowUp(submittedModal, replyText);
        }
        else {
            sendDismissableMessage(triggerInteraction.user, DATABASE_ERROR_MESSAGE);
        } 
    })
}