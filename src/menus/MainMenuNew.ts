import { BaseInteraction, ButtonStyle, Client, Message, MessageComponentInteraction } from "discord.js";
import { Menu } from "../classes/Menu";
//import { SetupInstructorViewButtonCollector, instructorMenu } from "./InstructorMenu";

// CONSTANTS

const STUDENT_MENU_BUTTON_LABEL = "student menu";
const INSTRUCTOR_MENU_BUTTON_LABEL = "instructor menu";

const STUDENT_MENU_BUTTON_ID = "discussion_student_menu_button";
const INSTRUCTOR_MENU_BUTTON_ID = "discussion_instructor_menu_button";
/*
export const mainMenu = new Menu({
    {
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
    [
        {
            customId: STUDENT_MENU_BUTTON_ID,
            style: ButtonStyle.Primary,
            label: STUDENT_MENU_BUTTON_LABEL,
        },
        {
            customId: INSTRUCTOR_MENU_BUTTON_ID,
            style: ButtonStyle.Primary,
            label: INSTRUCTOR_MENU_BUTTON_LABEL,
        }
    ],
    [
        {
            checkFunction: (customId: string) => {
                return customId === INSTRUCTOR_MENU_BUTTON_ID;
            },
            resultingAction: async (buttonInteraction: MessageComponentInteraction) => {
                await buttonInteraction.update(instructorMenu);
            }
        }
    ]
});
*/