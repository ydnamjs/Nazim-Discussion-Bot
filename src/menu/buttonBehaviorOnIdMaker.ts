import { BaseInteraction, Client, Message, MessageComponentInteraction } from "discord.js";
import { ComponentBehavior } from "./ComponentBehavior";

export function makeButtonBehaviorOnID(id: string, resultingAction: (client: Client, interaction: BaseInteraction, message: Message, componentInteraction: MessageComponentInteraction) => void): ComponentBehavior {
    return {
        checkFunction: (customId: string) => {
            return (customId === id);
        },
        resultingAction: resultingAction,
    }
}