import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

// constants
const INSTRUCTOR_MENU_MESSAGE_CONTENT = "";

//

//embed (text)
const instructorMenuEmbed = new EmbedBuilder({
    title: "Instructor Menu",
    description: "Use the buttons below to navigate your courses"
}) 


//buttons
const mainMenuBotton = new ButtonBuilder({
    customId: "discussion_main_menu_button",
    style: ButtonStyle.Secondary,
    label: "main menu",
});

const viewCoursesButton = new ButtonBuilder({
    customId: "discussion_view_instructor_courses_button",
    style: ButtonStyle.Primary,
    label: "view courses",
});

//row of buttons
const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([mainMenuBotton, viewCoursesButton])

// instructor menu
export default { content: INSTRUCTOR_MENU_MESSAGE_CONTENT, embeds: [instructorMenuEmbed], components: [buttonRow] }