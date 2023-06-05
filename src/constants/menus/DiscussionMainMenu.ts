import { ButtonBuilder, ButtonStyle, MessageComponentInteraction } from "discord.js";
import { Menu } from "../../classes/Menu";
import { MenuData } from "../../interfaces/MenuData";
import { makeButtonRow } from "../functions/ButtonRowMaker";

// other menus
import { instructorMenu } from "../../menus/InstructorMenu";

// CONSTANTS

const STUDENT_MENU_BUTTON_LABEL = "student menu";
const INSTRUCTOR_MENU_BUTTON_LABEL = "instructor menu";
const TA_MENU_BUTTON_LABEL = "ta menu"

const STUDENT_MENU_BUTTON_ID = "discussion_student_menu_button";
const INSTRUCTOR_MENU_BUTTON_ID = "discussion_instructor_menu_button";
const TA_MENU_BUTTON_ID = "discussion_ta_menu_button"

// Action Row 1

const rowOneButtonData = [
    {
        customId: STUDENT_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: STUDENT_MENU_BUTTON_LABEL,
    },
    {
        customId: INSTRUCTOR_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: INSTRUCTOR_MENU_BUTTON_LABEL,
    },
    {
        customId: TA_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: TA_MENU_BUTTON_LABEL,
    }
];

const actionRowOne = makeButtonRow(rowOneButtonData);

// Menu data
const discussionMainMenuData: MenuData = {
    embedData: {
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
    },
    components: [ actionRowOne ],
    buttonBehaviors: [
        // Student-menu-button behavior
        {
            checkFunction: (customId: string) => {
                return customId === STUDENT_MENU_BUTTON_ID;
            },
            resultingAction: async (buttonInteraction: MessageComponentInteraction) => {
                await buttonInteraction.update({content: "student button clicked!\nno functionality yet sadly", embeds: [], components: []});
            }
        },

        // Instructor-menu-button behavior
        {
            checkFunction: (customId: string) => {
                return customId === INSTRUCTOR_MENU_BUTTON_ID;
            },
            resultingAction: async (buttonInteraction: MessageComponentInteraction) => {
                await buttonInteraction.update(instructorMenu);
            }
        },
    ]
}

export const mainMenu = new Menu(discussionMainMenuData);