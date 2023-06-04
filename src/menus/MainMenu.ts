import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export const discussionMainMenu = new EmbedBuilder({
    title: "Discussion Menu",
}) 

const testButton = new ButtonBuilder({
    customId: "test-button",
    style: ButtonStyle.Primary,
    label: "test button text",
});

export const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(testButton)