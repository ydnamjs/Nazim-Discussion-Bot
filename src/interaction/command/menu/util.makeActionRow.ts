// MAKE BUTTON ROW HELPER FUNCTION

import { ActionRowBuilder, ButtonBuilder, ButtonComponentData } from "discord.js";

const MAX_BUTTONS_PER_ROW = 5; // 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#buttons
const EMPTY_ARRAY_ERROR_MESSAGE = "ERROR: makeButtonRow called with empty buttonRowData! Make Sure To Always Have At Least One Element";
const MAX_BUTTONS_EXCEEDED_WARNING_MESSAGE = "WARNING: number of buttons in makeButtonRow has exceeded max amount of displayable buttons. Any buttons beyond the limit quantity will not exist";

// helper function to construct action row builders for rows of buttons
// useful because it saves me from having to write out all the make builders
export function makeActionRowButton( buttonRowData: Partial<ButtonComponentData>[]): ActionRowBuilder<ButtonBuilder> {

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