import { ActionRowBuilder, ButtonBuilder, ButtonComponentData, EmbedBuilder, EmbedData, Message, MessageCreateOptions } from "discord.js";

// CONSTANTS
const MAX_BUTTON_ROWS = 5; // 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#action-rows
const BUTTONS_PER_ROW = 5; // 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#buttons

const MAX_BUTTONS_EXCEEDED_WARNING = "MENU WARNING: number of buttons in menu has exceeded max amount of displayable buttons\nMENU WARNING: Any buttons beyond the limit quantity will not exist";
const MAX_BUTTONS_EXCEEDED_TITLE_PREFIX = "\nMENU WARNING: violating menu title: \"";

// MENU CLASS
export class Menu {

    // The message component is what you would send to show someone the menu
    // It is private and can be accessed from the getMessageComponent method because changing it is dangerous and should not be allowed
    // Example: interaction.user.send(myMenu.getMenuMessageOptions());
    private messageComponent: MessageCreateOptions;

    constructor(embedData: EmbedData, buttonData?: Partial<ButtonComponentData>[]) {
        
        // Warn developer if number of buttons exceeds limit
        if(buttonData && buttonData.length > MAX_BUTTON_ROWS * BUTTONS_PER_ROW) {

            // If the embed has a title we give the title in the warning to help track down the offending menu
            if(embedData.title){
                console.warn(MAX_BUTTONS_EXCEEDED_WARNING + MAX_BUTTONS_EXCEEDED_TITLE_PREFIX + embedData.title +"\"");
            }
            else {
                console.warn(MAX_BUTTONS_EXCEEDED_WARNING);
            }

        }
        
        // Embed
        const embed = new EmbedBuilder(embedData)

        // Buttons
        const buttons: ButtonBuilder[] = [];
        if(buttonData) {
            buttonData.forEach( item => {
                const newButton = new ButtonBuilder(item);
                buttons.push(newButton);
            });
        }

        // Action/button rows
        const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];
        for(let rowNumber = 0; rowNumber < MAX_BUTTON_ROWS; rowNumber++) {
            
            // Create an array of buttons to be added to the row
            const rowButtons: ButtonBuilder[] = [];
            for( let rowPosition = 0; rowPosition < BUTTONS_PER_ROW && rowNumber * BUTTONS_PER_ROW + rowPosition < buttons.length; rowPosition++ ) {
                rowButtons.push(buttons[rowNumber * BUTTONS_PER_ROW + rowPosition]);
            }

            // Create and add the row only if it will contain buttons
            if (rowButtons[0]) {
                actionRows.push( new ActionRowBuilder<ButtonBuilder>().addComponents(rowButtons));
            }
        }

        // MessageComponent
        this.messageComponent = {
            embeds: [embed],
            components: actionRows
        }
    }

    // Getter for message component
    // See messageComponent class member for explanation
    getMessageComponent():MessageCreateOptions {
        return this.messageComponent;
    }

}