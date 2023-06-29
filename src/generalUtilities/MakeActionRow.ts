import { ActionRowBuilder, ButtonBuilder, ButtonComponentData } from "discord.js";

// 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#buttons
const MAX_BUTTONS_PER_ROW = 5;

const EMPTY_ARRAY_ERROR_MESSAGE = "ERROR: makeButtonRow called with empty buttonRowData! Make Sure To Always Have At Least One Element";
const MAX_BUTTONS_EXCEEDED_ERROR_MESSAGE = "ERROR: number of buttons in makeButtonRow has exceeded max amount of buttons";

/**
 * @function makes an action row of buttons with the given button row data
 * @param {Partial<ButtonComponentData>[]} buttonRowData - a list of data used to generate buttons in the row
 * @returns {ActionRowBuilder} the row of buttons that was made using the data
 */
export function makeActionRowButton( buttonRowData: Partial<ButtonComponentData>[]): ActionRowBuilder<ButtonBuilder> {

    if(buttonRowData.length < 1) {
        throw new Error(EMPTY_ARRAY_ERROR_MESSAGE)
    }

    if(buttonRowData.length > MAX_BUTTONS_PER_ROW) {
        throw new Error(MAX_BUTTONS_EXCEEDED_ERROR_MESSAGE);
    }

    const buttons: ButtonBuilder[] = [];
    for(let count = 0; count < MAX_BUTTONS_PER_ROW && count < buttonRowData.length; count++) {
        buttons.push(new ButtonBuilder(buttonRowData[count]));
    }
    
    return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
}