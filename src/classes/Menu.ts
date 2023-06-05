import { ActionRowBuilder, BaseInteraction, ButtonBuilder, Client, EmbedBuilder, Message, MessageCreateOptions } from "discord.js";
import { ButtonBehavior } from "../interfaces/ButtonBehavior";
import { MenuData } from "../interfaces/MenuData";

// CONSTANTS
const MAX_BUTTON_ROWS = 5; // 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#action-rows
const BUTTONS_PER_ROW = 5; // 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#buttons

const MAX_BUTTONS_EXCEEDED_WARNING = "MENU WARNING: number of buttons in menu has exceeded max amount of displayable buttons\nMENU WARNING: Any buttons beyond the limit quantity will not exist";
const MAX_BUTTONS_EXCEEDED_TITLE_PREFIX = "\nMENU WARNING: violating menu title: \"";


const MENU_EXPIRTATION_MESSAGE = "Your previous menu was closed due to inactivity"; // Message sent when menu expires
const MENU_EXPIRATION_TIME = 600_000 // Time for a menu to expire in ms (600_000 is 10 mins)

// MENU CLASS
export class Menu {

    // The message component is what you would send to show someone the menu
    // It is private and can be accessed from the getMessageComponent method because changing it is dangerous and should not be allowed
    // Example: "user.send(myMenu.getMenuMessageOptions());" will send the menu to the user store in the variable user
    private messageComponent: MessageCreateOptions;


    // Array of button behavior objects
    // Used in the collect function to specify what should happen when the id of a clicked button matches a certain format
    private buttonBehaviors: ButtonBehavior[];

    constructor(menuData: MenuData) {
        
        // Warn developer if number of buttons exceeds limit
        if(menuData.buttonData && menuData.buttonData.length > MAX_BUTTON_ROWS * BUTTONS_PER_ROW) {

            // If the embed has a title we give the title in the warning to help track down the offending menu
            if(menuData.embedData.title){
                console.warn(MAX_BUTTONS_EXCEEDED_WARNING + MAX_BUTTONS_EXCEEDED_TITLE_PREFIX + menuData.embedData.title +"\"");
            }
            else {
                console.warn(MAX_BUTTONS_EXCEEDED_WARNING);
            }

        }
        
        // Embed
        const embed = new EmbedBuilder(menuData.embedData)

        // Buttons
        const buttons: ButtonBuilder[] = [];
        if(menuData.buttonData) {
            menuData.buttonData.forEach( item => {
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
        
        // Button behavior array defaults to empty but if it is defined in the constructor than that overwrites it
        this.buttonBehaviors = [];
        if(menuData.buttonBehaviors) {
            this.buttonBehaviors = menuData.buttonBehaviors;
        }
    }

    // Getter for message component
    // See messageComponent class member for explanation
    getMessageComponent(): MessageCreateOptions {
        return this.messageComponent;
    }

    // Collects button interaction for the menu
    async collectButtonInteraction(client: Client, interaction: BaseInteraction, message: Message ): Promise<void> {
        try {
            
            // Filter function that checks if id of the button clicker matches the id of the menu reciever (should always be that way since menus are sent as a DM but just in case)
            const collectorFilter = (i: BaseInteraction) => i.user.id === interaction.user.id;
    
            // Get the button that was pressed if one was pressed before menu expires
            const buttonPressed = await message.awaitMessageComponent( {filter: collectorFilter, time: MENU_EXPIRATION_TIME } );
            
            // For every button behavior, if the check function returns true, execute the resulting action
            this.buttonBehaviors.forEach( (behavior: ButtonBehavior) => {
                if(behavior.checkFunction(buttonPressed.customId)) {
                    behavior.resultingAction(buttonPressed);
                }
            })
        }
        catch (error: any) {
    
            // FIXME: THERE REALLY SHOULD BE A CHECK FOR IF THE MENU DID EXPIRE OR IF A DIFFERENT ERROR HAPPENED
            // CURRENTLY IT TREATS ALL ERRORS AS IF THE MENU EXPIRED
            
            // delete the menu and notify the user that it expired
            message.delete()
            interaction.user.send(MENU_EXPIRTATION_MESSAGE)
        }
    }

}