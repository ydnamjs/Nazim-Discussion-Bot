import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

// constants
const INSTRUCTOR_MENU_MESSAGE_CONTENT = "";

//embed (text)
const instructorMenuEmbed = new EmbedBuilder({
    title: "Instructor Menu",
}) 


//buttons
const instructorMenuButton = new ButtonBuilder({
    customId: "discussion_instructor_menu_button",
    style: ButtonStyle.Primary,
    label: "instructor menu",
});

//row of buttons
//const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([, ])

// instructor menu
export default { content: INSTRUCTOR_MENU_MESSAGE_CONTENT, embeds: [instructorMenuEmbed], components: [] }