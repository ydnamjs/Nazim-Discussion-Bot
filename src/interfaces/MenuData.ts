import { ActionRowBuilder, ButtonBuilder, ButtonComponentData, EmbedData, StringSelectMenuBuilder } from "discord.js";
import { ComponentBehavior } from "./ComponentBehavior";

export interface MenuData {
    embedData: EmbedData,
    components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[],
    buttonBehaviors?: ComponentBehavior[],
    selectMenuBehaviors?: ComponentBehavior[],
}