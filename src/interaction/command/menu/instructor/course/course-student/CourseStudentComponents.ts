import { ActionRowBuilder, ButtonStyle, MessageComponentInteraction, StringSelectMenuBuilder, TextInputBuilder } from "discord.js";
import { makeButtonRow } from "../../../ButtonRowMaker";

// CONSTANTS
const MAIN_MENU_BUTTON_LABEL = "go to main menu";
const COURSE_MENU_BUTTON_LABEL = "go back to course menu";
const PREVIOUS_PAGE_MENU_BUTTON_LABEL = "go to previous page"
const NEXT_PAGE_MENU_BUTTON_LABEL = "go to next page"

const MAIN_MENU_BUTTON_ID = "discussion_main_menu_button";
const COURSE_MENU_BUTTON_ID = "discussion_course_expanded_menu_button";
const PREVIOUS_PAGE_MENU_BUTTON_ID = "discussion_course_student_previous"
const NEXT_PAGE_MENU_BUTTON_ID = "discussion_course_student_next"

const REMOVE_MENU_BUTTON_LABEL = "remove student";
const GET_POSTS_MENU_BUTTON_LABEL = "get student's posts";
const GET_COMMENTS_MENU_BUTTON_LABEL = "get student's comments"
const GET_SCORES_MENU_BUTTON_LABEL = "get student's scores"

const REMOVE_MENU_BUTTON_ID = "discussion_remove_course_student_menu_button";
const GET_POSTS_MENU_BUTTON_ID = "discussion_get_posts_course_student_menu_button";
const GET_COMMENTS_MENU_BUTTON_ID = "discussion_get_comments_course_student_menu_button"
const GET_SCORES_MENU_BUTTON_ID = "discussion_get_scores_course_student_menu_button"


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

const rowTwoButtonData = [
    {
        customId: REMOVE_MENU_BUTTON_ID,
        style: ButtonStyle.Danger,
        label: REMOVE_MENU_BUTTON_LABEL,
    },
    {
        customId: GET_POSTS_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: GET_POSTS_MENU_BUTTON_LABEL,
    },
    {
        customId: GET_COMMENTS_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: GET_COMMENTS_MENU_BUTTON_LABEL,
    },
    {
        customId: GET_SCORES_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: GET_SCORES_MENU_BUTTON_LABEL,
    },
];

const rowTwo = makeButtonRow(rowTwoButtonData);

const courseStudentsComponents = [rowOne, rowTwo];