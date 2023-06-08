// MAKE BUTTON ROW HELPER FUNCTION

import { ActionRowBuilder, ButtonBuilder, ButtonComponent, ButtonComponentData } from "discord.js";

/** @constant the maximum number of buttons allowed in a row */
const MAX_BUTTONS_PER_ROW = 5; // 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#buttons

/** @constant the error message for trying to make an empty row */
const EMPTY_ARRAY_ERROR_MESSAGE = "ERROR: makeButtonRow called with empty buttonRowData! Make Sure To Always Have At Least One Element";

/** @constant the error message for trying to make a row with too many buttons */
const MAX_BUTTONS_EXCEEDED_ERROR_MESSAGE = "ERROR: number of buttons in makeButtonRow has exceeded max amount of buttons";

// helper function to construct action row builders for rows of buttons
// useful because it saves me from having to write out all the make builders
/**
 * @function makes an action row of buttons with the given button row data
 * @param {Partial<ButtonComponentData>[]} buttonRowData - a list of data used to generate buttons in the row
 * @returns {ActionRowBuilder} the row of buttons that was made using the data
 */
export function makeActionRowButton( buttonRowData: Partial<ButtonComponentData>[]): ActionRowBuilder<ButtonBuilder> {

    // Throw error if array is empty
    if(buttonRowData.length < 1) {
        throw new Error(EMPTY_ARRAY_ERROR_MESSAGE)
    }

    // Give warning if array length is longer than max length
    if(buttonRowData.length > MAX_BUTTONS_PER_ROW) {
        throw new Error(MAX_BUTTONS_EXCEEDED_ERROR_MESSAGE);
    }

    // Make a button builder for each piece of data provided up to the limit or until out of data
    const buttons: ButtonBuilder[] = [];
    for(let count = 0; count < MAX_BUTTONS_PER_ROW && count < buttonRowData.length; count++) {
        buttons.push(new ButtonBuilder(buttonRowData[count]));
    }
    
    //create an action row builder using buttons and return that
    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}