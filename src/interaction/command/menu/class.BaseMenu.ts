import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonComponentData, ButtonStyle, Client, EmbedBuilder, Message, MessageComponentInteraction, MessageCreateOptions } from "discord.js";

// interface that defines interaction component behavior in menus
// every interaction component has a custom id but no way to define functionality
// so we create collectors that fire when an interaction is recieved and then look at the custom id to determine the behavior
// this interface is really an object consisting of two functions: filter and resultingAction
// filter is meant to determine if the resulting action should fire and resultingAction is the behavior that is to be executed
// "why not just have filter be a string and define it later as check for if interaction.customID === filterString?" I hear you ask
// because then you cant specify patterns beyond an identical id.
// for example what if you wanted a function to fire for when the id was "page-1" "page-3" and "page-5" ...
// you could list every id from "page-1" to "page-99999" or...
// use the following function: (customId: string): boolean => { return ( (customId.substring(0, 5) === "page-") && (parseInt(customId.substring(5)) / 2 === 1)) }
export interface ComponentBehavior {
    filter: (customId: string) => boolean;
    resultingAction: ( client: Client, interaction: BaseInteraction, message: Message, componentInteraction: MessageComponentInteraction ) => void;
}

// interface that defines the input data for the menu class
// all of the complex behavior is defined and described in comments above
// after that it's just a regular old interface
export interface MenuData {
    title: string, // Title that appears in the embed portion of the menu
    description: string, // Description that appears in the embed portion of the menu
    fields: {name: string, value: string}[], // Fields that make up the embed
    components?: ActionRowBuilder<ButtonBuilder>[], // InteractionComponent rows that follow the embed in the menu 
    buttonBehaviors?: ComponentBehavior[], // Component Behavior list for buttons in the menu (see above for what this means)
}

export interface buttonData {
    customId: string, 
    label:string, disabled: 
    boolean, 
    style: ButtonStyle
};

// The maximum number of components discord allows in a message
// Having more than this number in a menu causes problems because a menu is just a special message
const MAX_NUMBER_OF_COMPONENTS = 5; 

export class BaseMenu {

// MENU MESSAGING

    // message data member
    // object that is used to construct a message that shows the visual aspect of the menu to be sent to a user as a direct message
    menuMessageData: MessageCreateOptions;

    // sends the menu to the user specified's DM's and returns the message sent
    async send(client: Client, interaction: BaseInteraction): Promise<Message<false>> {
        const sentMenuMessage = await interaction.user.send(this.menuMessageData);
        this.collectButtonInteraction(client, interaction, sentMenuMessage)
        return sentMenuMessage;
    }

// BUTTON BEHAVIOR

    private static MENU_EXPIRTATION_MESSAGE = "Your discussion menu expired due to inactivity";
    private static MENU_EXPIRATION_TIME = 600_000;

    // menu member that holds all of the button behavior information
    buttonBehaviors: ComponentBehavior[];

    async collectButtonInteraction(client: Client, interaction: BaseInteraction, message: Message ): Promise<void> {
        try {

            // Filter that checks if id of the button clicker matches the id of the menu reciever (should always be that way since DM but just in case)
            const collectorFilter = (i: BaseInteraction) => i.user.id === interaction.user.id;

            // Get the button that was pressed if one was pressed before menu expires
            const buttonPressed = await message.awaitMessageComponent( {filter: collectorFilter, time: BaseMenu.MENU_EXPIRATION_TIME } );

            // For every button behavior, if the check function returns true, execute the resulting action
            this.buttonBehaviors.forEach( (behavior: ComponentBehavior) => {
                if(behavior.filter(buttonPressed.customId)) {
                    behavior.resultingAction(client, interaction, message, buttonPressed);
                }
            })
        }
        catch (error: any) {

            // if the collector expired, delete the menu and notify the user that it expired
            // TODO: I feel like theres a better way to do this but it will work for now
            if(error.toString().includes("Collector received no interactions before ending with reason: time")) {
                message.delete()
                interaction.user.send(BaseMenu.MENU_EXPIRTATION_MESSAGE);
            }
        }
    }

    constructor(menuData: MenuData) {

        // build an embed as the menu's display
        const menuEmbed = new EmbedBuilder({
            title: menuData.title,
            description: menuData.description,
            fields: menuData.fields
        });

        // components can be a max of 5 rows
        if(menuData.components && menuData.components.length > MAX_NUMBER_OF_COMPONENTS) {

        }

        // construct the menuMessageData to be sent to the user
        this.menuMessageData = { 
            embeds: [menuEmbed],
            components: menuData.components
        }

        // define the behaviors for the menu's buttons
        this.buttonBehaviors = [];
        if(menuData.buttonBehaviors) {
            this.buttonBehaviors = menuData.buttonBehaviors;
        }
    }
}