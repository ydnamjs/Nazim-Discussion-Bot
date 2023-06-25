import { BaseInteraction, ButtonStyle, Message } from "discord.js";
import { makeActionRowButton } from "./MakeActionRow";

const DISMISSABLE_MESSAGE_DURATION = 600_000;

// DISMISS BUTTON CONSTANTS
const DISMISS_BUTTON_ID = "dismissable-message";
const DISMISS_BUTTON_LABEL = "Dismiss";
const DISMISS_BUTTON_DISABLED = false;
const DISMISS_BUTTON_STYLE = ButtonStyle.Primary;

const dismissRow = makeActionRowButton([{
    customId: DISMISS_BUTTON_ID,
    label: DISMISS_BUTTON_LABEL,
    disabled: DISMISS_BUTTON_DISABLED,
    style: DISMISS_BUTTON_STYLE
}])

/**
 * @function replies to a message with a dismissable message. useful for creating notifications that can be dismissed
 * @param {Message} message - the interaction that is being replied to
 * @param {string} text - the content of the message
 * @throws {Error} unrepliableInteractionError - thrown when interaction is not repliable
 */
export async function sendDismissableReply(message: Message, text: string) {

    const replyMessage = await message.reply({
        content: text,
        components: [dismissRow]
    });
        
    try {
        await replyMessage.awaitMessageComponent( {time: DISMISSABLE_MESSAGE_DURATION } );
    } catch {}

    replyMessage.delete()
}

/**
 * @function replies to an interaction with a dismissable message. useful for creating notifications that can be dismissed
 * @param {BaseInteraction} interaction - the interaction that is being replied to 
 * @param {string} text - the content of the message
 * @throws {Error} unrepliableInteractionError - thrown when interaction is not repliable
 */
export async function sendDismissableFollowUp(interaction: BaseInteraction, text: string) {

    if(interaction.isRepliable()) {
        const followUp = await interaction.followUp({
            content: text,
            components: [dismissRow]
        });
        try {
            await followUp.awaitMessageComponent( {filter: (i: BaseInteraction) => i.user.id === interaction.user.id, time: DISMISSABLE_MESSAGE_DURATION } );
        } catch {}
        followUp.delete()
    } 

    else {
        throw new Error("Interaction in sendDismissableInteractionReply must be repliable");
    }
}