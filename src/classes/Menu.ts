import { ActionRowBuilder, BaseInteraction, ButtonBuilder, Client, EmbedBuilder, Message, MessageCreateOptions } from "discord.js";
import { ComponentBehavior } from "../interfaces/ComponentBehavior";
import { MenuData } from "../interfaces/MenuData";

// MENU CLASS
export class Menu {

    protected static MENU_EXPIRTATION_MESSAGE = "Your previous menu was closed due to inactivity"; // Message sent when menu expires
    protected static MENU_EXPIRATION_TIME = 600_000 // Time for a menu to expire in ms (600_000 is 10 mins)

    // The message component is what you would send to show someone the menu
    // It is private and can be accessed from the getMessageComponent method because changing it is dangerous and should not be allowed
    // Example: "user.send(myMenu.getMenuMessageOptions());" will send the menu to the user store in the variable user
    private messageComponent: MessageCreateOptions;


    // Array of button behavior objects
    // Used in the collect function to specify what should happen when the id of a clicked button matches a certain format
    private buttonBehaviors: ComponentBehavior[];

    constructor(menuData: MenuData) {
        
        // Embed
        const embed = new EmbedBuilder(menuData.embedData)

        // MessageComponent
        this.messageComponent = {
            content: "",
            embeds: [embed],
            components: menuData.components
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
            const buttonPressed = await message.awaitMessageComponent( {filter: collectorFilter, time: Menu.MENU_EXPIRATION_TIME } );
            
            // For every button behavior, if the check function returns true, execute the resulting action
            this.buttonBehaviors.forEach( (behavior: ComponentBehavior) => {
                if(behavior.checkFunction(buttonPressed.customId)) {
                    behavior.resultingAction(client, interaction, message, buttonPressed);
                }
            })
        }
        catch (error: any) {
    
            // FIXME: THERE REALLY SHOULD BE A CHECK FOR IF THE MENU DID EXPIRE OR IF A DIFFERENT ERROR HAPPENED
            // CURRENTLY IT TREATS ALL ERRORS AS IF THE MENU EXPIRED
            
            // delete the menu and notify the user that it expired
            message.delete()
            interaction.user.send(Menu.MENU_EXPIRTATION_MESSAGE)
        }
    }

}