import { BaseInteraction, ButtonInteraction, CacheType, Client, Message, MessageComponentInteraction } from "discord.js";

export interface ComponentBehavior {
    checkFunction: (customId: string) => boolean;
    resultingAction: ( componentInteraction: MessageComponentInteraction ) => void;
}