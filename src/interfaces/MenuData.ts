import { ButtonComponentData, EmbedData } from "discord.js";
import { ButtonBehavior } from "./ButtonBehavior";

export interface MenuData {
    embedData: EmbedData,
    buttonData?: Partial<ButtonComponentData>[],
    buttonBehaviors?: ButtonBehavior[]
}