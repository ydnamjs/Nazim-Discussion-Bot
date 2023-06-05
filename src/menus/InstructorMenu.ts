import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, CommandInteraction, EmbedBuilder, Interaction, Message } from "discord.js";
//import { MENU_EXPIRATION_TIME, MENU_EXPIRTATION_MESSAGE } from "../constants/MenuConstants";
//import { collectButtonInteraction, mainMenu } from "./MainMenu";

// CONSTANTS
const MAIN_MENU_BUTTON_LABEL = "main menu";
const VIEW_COURSE_MENU_BUTTON_LABEL = "view courses";

const MAIN_MENU_BUTTON_ID = "discussion_main_menu_button";
const VIEW_COURSE_MENU_BUTTON_ID = "discussion_view_instructor_courses_button";


// Embed (text of menu)
const instructorMenuEmbed = new EmbedBuilder({
    title: "Instructor Menu",
    description: "Use the buttons below to navigate your courses"
}) 

// Buttons (make up button row)
const mainMenuButton = new ButtonBuilder({
    customId: MAIN_MENU_BUTTON_ID,
    style: ButtonStyle.Secondary,
    label: MAIN_MENU_BUTTON_LABEL,
});

const viewCoursesButton = new ButtonBuilder({
    customId: VIEW_COURSE_MENU_BUTTON_ID,
    style: ButtonStyle.Primary,
    label: VIEW_COURSE_MENU_BUTTON_LABEL,
});

// Button Row (collection of all the interactive components of the menu)
const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([mainMenuButton, viewCoursesButton])

// Instruction menu (The whole menu that is sent to the user)
export const instructorMenu = { embeds: [instructorMenuEmbed], components: [buttonRow] }
/*
// Collection function (Gives functionality to the buttons of the sent messages)
export async function SetupInstructorViewButtonCollector(client: Client, interaction: CommandInteraction, sentMenu: Message ) { 

    try {
        // Filter function that checks if id of the button clicker matches the id of the menu reciever (should always be that way since DM but just in case)
        const collectorFilter = (i: Interaction) => i.user.id === interaction.user.id;

        // Get the button that was pressed if one was pressed before menu expires
        const buttonPressed = await sentMenu.awaitMessageComponent( {filter: collectorFilter, time: MENU_EXPIRATION_TIME } );
        
        // Main-menu-button behavior
        if( buttonPressed.customId === MAIN_MENU_BUTTON_ID ){
            buttonPressed.update(mainMenu);
            collectButtonInteraction(client, interaction, sentMenu);
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
*/