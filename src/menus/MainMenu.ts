import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

//embed (text)
const mainMenuEmbed = new EmbedBuilder({
    title: "Discussion Menu",
    description: "Welcome to the discussion main menu!",
    fields: [
        {
            name: "Student Menu",
            value: "If you are a student click the button labeled student menu"
        },
        {
            name: "Instructor Menu",
            value: "If you are an instructor click the button labeled instructor menu"
        },
    ]
}) 


//buttons
const studentMenuButton = new ButtonBuilder({
    customId: "discussion_student_menu_button",
    style: ButtonStyle.Primary,
    label: "student menu",
});

const instructorMenuButton = new ButtonBuilder({
    customId: "discussion_instructor_menu_button",
    style: ButtonStyle.Primary,
    label: "instructor menu",
});

//row of buttons
const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([studentMenuButton, instructorMenuButton])

//main menu
export default { embeds: [mainMenuEmbed], components: [buttonRow] }