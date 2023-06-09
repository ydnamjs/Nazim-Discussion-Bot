import { CommandInteraction, Client, ButtonBuilder, ActionRowBuilder, ButtonComponentData, ButtonStyle} from "discord.js";
import { Command } from "../interface.Command";

import { CustomNavOptions, NavigatedMenu } from "./class.NavigatedMenu";
import { StaffMenu } from "./staff/class.StaffMenu";


// constants
const MENU_SENT_MESSAGE = "CourseStudent menu was sent to your direct messages. Click Here: ";

export const testMenu: Command = {
    name: "test-menu",
    description: "opens the current menu being tested",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // sample menu
        const sampleNavigatedMenu = new StaffMenu();

        // sample menu
        const messageLink = (await sampleNavigatedMenu.send(client, interaction)).url;

        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE + messageLink
        });
        
    }
}

// make button members
const MAX_BUTTONS_PER_ROW = 5; // 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#buttons
const EMPTY_ARRAY_ERROR_MESSAGE = "ERROR: makeButtonRow called with empty buttonRowData! Make Sure To Always Have At Least One Element";
const MAX_BUTTONS_EXCEEDED_WARNING_MESSAGE = "WARNING: number of buttons in makeButtonRow has exceeded max amount of displayable buttons. Any buttons beyond the limit quantity will not exist";

function makeActionRowButton( buttonRowData: Partial<ButtonComponentData>[]): ActionRowBuilder<ButtonBuilder> {
    
    // Throw error if array is empty
    if(buttonRowData.length < 1) {
        throw new Error(EMPTY_ARRAY_ERROR_MESSAGE)
    }

    // Give warning if array length is longer than max length
    if(buttonRowData.length > MAX_BUTTONS_PER_ROW) {
        console.warn(MAX_BUTTONS_EXCEEDED_WARNING_MESSAGE);
    }

    // Make a button builder for each piece of data provided up to the limit or until out of data
    const buttons: ButtonBuilder[] = [];
    for(let count = 0; count < MAX_BUTTONS_PER_ROW && count < buttonRowData.length; count++) {
        buttons.push(new ButtonBuilder(buttonRowData[count]));
    }
    
    //create an action row builder using buttons and return that
    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}