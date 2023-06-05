import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder, Interaction, Message } from "discord.js";
import { MENU_EXPIRATION_TIME, MENU_EXPIRTATION_MESSAGE } from "../constants/MenuConstants";
import instructorMenu from "./InstructorMenu";

// CONSTANTS

const STUDENT_MENU_BUTTON_LABEL = "student menu";
const INSTRUCTOR_MENU_BUTTON_LABEL = "instructor menu";

const STUDENT_MENU_BUTTON_ID = "discussion_student_menu_button";
const INSTRUCTOR_MENU_BUTTON_ID = "discussion_instructor_menu_button";


// TODO: Covert menu fields to constants
// Embed (text of menu)
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


// Buttons (make up button row)
const studentMenuButton = new ButtonBuilder({
    customId: STUDENT_MENU_BUTTON_ID,
    style: ButtonStyle.Primary,
    label: STUDENT_MENU_BUTTON_LABEL,
});

const instructorMenuButton = new ButtonBuilder({
    customId: INSTRUCTOR_MENU_BUTTON_ID,
    style: ButtonStyle.Primary,
    label: INSTRUCTOR_MENU_BUTTON_LABEL,
});

// Button Row (collection of all the interactive components of the menu)
const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([studentMenuButton, instructorMenuButton])

// Main menu (The whole menu that is sent to the user)
export const mainMenu = { embeds: [mainMenuEmbed], components: [buttonRow] }

// Collection function (Gives functionality to the buttons of the sent messages)
export async function collectButtonInteraction(client: Client, interaction: CommandInteraction, sentMenu: Message ) { 

    try {
        // Filter function that checks if id of the button clicker matches the id of the menu reciever (should always be that way since DM but just in case)
        const collectorFilter = (i: Interaction) => i.user.id === interaction.user.id;

        // Get the button that was pressed if one was pressed before menu expires
        const buttonPressed = await sentMenu.awaitMessageComponent( {filter: collectorFilter, time: MENU_EXPIRATION_TIME } );
        
        // Student-menu-button behavior
        if( buttonPressed.customId === STUDENT_MENU_BUTTON_ID ){
            // TODO: Add real function to this
            buttonPressed.update({content: "Button was pressed", embeds: [], components: []});
        }

        // Instructor-menu-button behavior
        else if (buttonPressed.customId === INSTRUCTOR_MENU_BUTTON_ID) {
            buttonPressed.update(instructorMenu);
        }
    }
    catch (error: any) {

        // FIXME: THERE REALLY SHOULD BE A CHECK FOR IF THE MENU DID EXPIRE OR IF A DIFFERENT ERROR HAPPENED
        // CURRENTLY IT TREATS ALL ERRORS AS IF THE MENU EXPIRED
        
        // delete the menu and notify the user that it expired
        sentMenu.delete()
        interaction.user.send(MENU_EXPIRTATION_MESSAGE)
    }
}