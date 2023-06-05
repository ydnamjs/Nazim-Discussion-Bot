import { BaseInteraction, ButtonInteraction, CacheType, Client, Message, MessageComponentInteraction } from "discord.js";

export interface ComponentBehavior {
    checkFunction: (customId: string) => boolean;
    resultingAction: ( client: Client, interaction: BaseInteraction, message: Message, componentInteraction: MessageComponentInteraction ) => void;
}