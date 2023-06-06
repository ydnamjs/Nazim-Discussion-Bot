import { CommandInteraction, Client, ButtonBuilder, ActionRowBuilder, ButtonComponentData, ButtonStyle} from "discord.js";
import { Command } from "../interface.Command";

import { BaseMenu } from "./class.BaseMenu";
import { MenuData, assertValidComponentMenuArray } from "./interface.MenuData";

// constants
const MENU_SENT_MESSAGE = "CourseStudent menu was sent to your direct messages. Click Here: ";

export const testMenu: Command = {
    name: "test-menu",
    description: "opens the current menu being tested",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // direct Message the user the menu being tested
        
        // sample constants
        const title = "Sample Title";
        const description = "sample desc";
        const fields = [
            {
                name: "field 1",
                value: "text1\ntext2n\ntext3",
            },
            {
                name: "field 2",
                value: "text4\ntext5n\ntext6",
            }
        ]

        // sample button data
        const sampleButtonData1 = [];
        for (let i = 1; i < 6; i++) {
            sampleButtonData1.push({
                customId: "test" + i,
                label: "button" + i,
                disabled: false,
                style: ButtonStyle.Primary
            });
        }

        const sampleButtonData2 = [];
        for (let i = 6; i < 11; i++) {
            sampleButtonData2.push({
                customId: "test" + i,
                label: "button" + i,
                disabled: false,
                style: ButtonStyle.Primary
            });
        }

        const sampleButtonData3 = [];
        for (let i = 11; i < 16; i++) {
            sampleButtonData3.push({
                customId: "test" + i,
                label: "button" + i,
                disabled: false,
                style: ButtonStyle.Primary
            });
        }

        const sampleButtonData4 = [];
        for (let i = 16; i < 21; i++) {
            sampleButtonData4.push({
                customId: "test" + i,
                label: "button" + i,
                disabled: false,
                style: ButtonStyle.Primary
            });
        }

        // sample additional components
        const sampleAdditionalComponents = [
            makeActionRowButton(sampleButtonData1),
            makeActionRowButton(sampleButtonData2),
            makeActionRowButton(sampleButtonData3),
            makeActionRowButton(sampleButtonData4),
        ];
        assertValidComponentMenuArray(sampleAdditionalComponents);

        // sample menu data
        const sampleMenuData: MenuData = {
            title: title,
            description: description,
            fields: fields,
            additionalComponents: sampleAdditionalComponents
        }

        // sample menu
        const sampleMenu = new BaseMenu(sampleMenuData);

        // sample menu
        const messageLink = (await sampleMenu.send(interaction.user)).url;

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