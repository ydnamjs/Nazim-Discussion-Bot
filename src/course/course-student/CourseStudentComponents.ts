import { ActionRowBuilder, ButtonStyle, MessageComponentInteraction, StringSelectMenuBuilder } from "discord.js";
import { makeButtonRow } from "../../constants/functions/ButtonRowMaker";

// CONSTANTS
const MAIN_MENU_BUTTON_LABEL = "go to main menu";
const COURSE_MENU_BUTTON_LABEL = "go back to course menu";
const PREVIOUS_PAGE_MENU_BUTTON_LABEL = "go to previous page"
const NEXT_PAGE_MENU_BUTTON_LABEL = "go to next page"

const MAIN_MENU_BUTTON_ID = "discussion_main_menu_button";
const COURSE_MENU_BUTTON_ID = "discussion_course_expanded_menu_button";
const PREVIOUS_PAGE_MENU_BUTTON_ID = "discussion_course_student_previous"
const NEXT_PAGE_MENU_BUTTON_ID = "discussion_course_student_next"


const rowOneButtonData = [
    {
        customId: MAIN_MENU_BUTTON_ID,
        style: ButtonStyle.Secondary,
        label: MAIN_MENU_BUTTON_LABEL,
    },
    {
        customId: COURSE_MENU_BUTTON_ID,
        style: ButtonStyle.Secondary,
        label: COURSE_MENU_BUTTON_LABEL,
    },
    {
        customId: PREVIOUS_PAGE_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: PREVIOUS_PAGE_MENU_BUTTON_LABEL,
    },
    {
        customId: NEXT_PAGE_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: NEXT_PAGE_MENU_BUTTON_LABEL,
    },
];

const rowOne = makeButtonRow(rowOneButtonData);

const studentSelectMenu = new StringSelectMenuBuilder({
    custom_id: "discussion_course_student_selector",
    placeholder: "",
    options: [
        {
            label: "ydna_",
            value: "ydna_"
        }
    ]
})

const rowTwo = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(studentSelectMenu);

export const courseStudentsComponents = [rowOne, rowTwo];