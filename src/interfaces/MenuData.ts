import { ActionRowBuilder, ButtonBuilder, ButtonComponentData, EmbedData } from "discord.js";
import { ComponentBehavior } from "./ComponentBehavior";

export interface MenuData {
    embedData: EmbedData,
    components: ActionRowBuilder<ButtonBuilder>[],
    buttonBehaviors?: ComponentBehavior[],
    selectMenuBehaviors?: ComponentBehavior[],
}