import { BaseInteraction, ButtonStyle } from "discord.js";
import { makeActionRowButton } from "./MakeActionRow";

const DISMISSABLE_MESSAGE_DURATION = 600_000;

// DISMISS BUTTON CONSTANTS
const DISMISS_BUTTON_ID = "dismissable-message";
const DISMISS_BUTTON_LABEL = "Dismiss";
const DISMISS_BUTTON_DISABLED = false;
const DISMISS_BUTTON_STYLE = ButtonStyle.Primary;

/**
 * @function replies to an interaction with a dismissable message. useful for creating notifications that can be dismissed
 * @param {BaseInteraction} interaction - the interaction that is being replied to 
 * @param {string} text - the content of the message
 * @throws {Error} unrepliableInteractionError - thrown when interaction is not repliable
 */
export async function sendDismissableInteractionReply(interaction: BaseInteraction, text: string) {
    
    // make the dismiss button row for the dismissable message
    const dismissRow = makeActionRowButton([{
        customId: DISMISS_BUTTON_ID,
        label: DISMISS_BUTTON_LABEL,
        disabled: DISMISS_BUTTON_DISABLED,
        style: DISMISS_BUTTON_STYLE
    }])

    // reply to the interaction with the dismissable message if we can
    if(interaction.isRepliable()) {
        const reply = await interaction.reply({
            content: text,
            components: [dismissRow]
        });
        try {
            await reply.awaitMessageComponent( {filter: (i: BaseInteraction) => i.user.id === interaction.user.id, time: DISMISSABLE_MESSAGE_DURATION } );
            reply.delete()
        } catch {}
    } 
    // otherwise, throw an error
    else {
        throw new Error("Interaction in sendDismissableInteractionReply must be repliable");
    }
}