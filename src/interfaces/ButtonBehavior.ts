import { BaseInteraction, ButtonInteraction, CacheType, Client, Message, MessageComponentInteraction } from "discord.js";

export interface ButtonBehavior {
    checkFunction: (customId: string) => boolean;
    resultingAction: ( buttonInteraction: MessageComponentInteraction ) => void;
}