import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

// CONSTANTS
const INSTRUCTOR_MENU_MESSAGE_CONTENT = "";

//

// Embed (text of menu)
const instructorMenuEmbed = new EmbedBuilder({
    title: "Instructor Menu",
    description: "Use the buttons below to navigate your courses"
}) 

// Buttons (make up button row)
const mainMenuButton = new ButtonBuilder({
    customId: "discussion_main_menu_button",
    style: ButtonStyle.Secondary,
    label: "main menu",
});

const viewCoursesButton = new ButtonBuilder({
    customId: "discussion_view_instructor_courses_button",
    style: ButtonStyle.Primary,
    label: "view courses",
});

const collectorTestButton = new ButtonBuilder({
    customId: "lol",
    style: ButtonStyle.Danger,
    label: "collectorTest",
});

// Button Row (collection of all the interactive components of the menu)
const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([mainMenuButton, viewCoursesButton, collectorTestButton])

// Instruction menu (The whole menu that is sent to the user)
export default { content: INSTRUCTOR_MENU_MESSAGE_CONTENT, embeds: [instructorMenuEmbed], components: [buttonRow] }