import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

//embed (text)
const mainMenuEmbed = new EmbedBuilder({
    title: "Discussion Menu",
}) 


//buttons
const testButton = new ButtonBuilder({
    customId: "test-button",
    style: ButtonStyle.Primary,
    label: "test button text",
});

//row of buttons
const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(testButton)

//main menu
export default { content: "test content", embeds: [mainMenuEmbed], components: [buttonRow] }