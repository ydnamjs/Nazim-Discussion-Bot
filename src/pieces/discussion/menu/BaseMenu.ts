import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Message, MessageComponentInteraction, MessageCreateOptions, StringSelectMenuBuilder } from "discord.js";

/**  
 * @interface interface of filter and action function
 * @property {function} filter - function that defines if the resulting action should execute
 * @property {function} resultingAction - function to be ran when the filter evaluates to true
 * @description the purpose of this structure is to be able to create a list of behaviors forcomponents in a menu based on more than matching an id exactly.
 * For example being able to execute on a function if the first 5 characters are "page-" and you wanted the same behavior for buttons "page-1" "page-2" and "page-3" ...
*/
export interface ComponentBehavior {
    filter: (customId: string) => boolean;
    resultingAction: ( message: Message, componentInteraction: MessageComponentInteraction ) => void;
}

/** 
 * @interface that defines the input data for the menu class
 * @property {String} title - the title of the menu
 * @property {String} description - the description of the menu
 * @property {object[]} fields - list of title descriptions pairs for the menu content
 * @property {String} fields.name - name of the list element to be displayed in the menu
 * @property {String} fields.value - description of the list element to be displayed in the menu
 * @property {ActionRowBuilder} components - discord.js interaction rows of components to be put under the menu
 * @property {ComponentBehavior[]} componentBehaviors - the behaviors of the components see ComponentBehavior interface in class.BaseMenu.ts
*/ 
export interface MenuData {
    title: string,
    description: string,
    fields: {name: string, value: string}[],
    components?: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[],
    componentBehaviors?: ComponentBehavior[],
}

/**
 * @interface data to make a button DOES NOT INCLUDE BEHAVIOR
 * @property {string} customId - id that must be unique and is used for determing behavior
 * @property {string} label - the text to be displayed on the button
 * @property {boolean} disabled - whether the button is disabled or not. disabled buttons are faded out and can not be clicked
 * @property {enum: ButtonStyle} style - the style of the button see https://discordjs.guide/message-components/buttons.html#button-styles
 */
export interface buttonData {
    customId: string, 
    label: string, 
    disabled: boolean, 
    style: ButtonStyle
};

/**
 *  @constant The maximum number of components discord allows in a message
*/
export const MAX_NUMBER_OF_COMPONENT_ROWS = 5; 
const MAX_COMPONENT_ROWS_EXCEEDED_ERROR = "ERROR: TRIED TO CREATE A MENU WITH MORE COMPONENT ROWS THAN ALLOWED";

/**
 * @class Base Menu is an interactive menu that is meant to be sent as a message to a user to display information about the discussion tracking feature
 * @param {MenuData} menuData - the data used to construct the menu
 */
export class BaseMenu {

// MENU MESSAGING

    /** @member {MessageCreateOptions} object that is used to construct a message containing the embed and components */
    menuMessageData: MessageCreateOptions;

    /** 
     * @function sends the menu as a message to the interaction user as a direct message
     * @param {Client} client - the client that the bot is logged in as
     * @param {BaseInteraction} interaction - the interaction that spawned this menu
     * @returns {Promise<Message<false>>} - the message that was sent
     */
    async send(client: Client, interaction: BaseInteraction): Promise<Message<false>> {
        const sentMenuMessage = await interaction.user.send(this.menuMessageData);
        this.collectMenuInteraction(interaction, sentMenuMessage)
        return sentMenuMessage;
    }

// COMPONENT BEHAVIOR

    /** @constant The message sent to the user when the menu expires due to inactivity */
    private static MENU_EXPIRTATION_MESSAGE = "Your discussion menu expired due to inactivity";
    /** @constant the amount of time in miliseconds before the menu expires (gets deleted) */
    private static MENU_EXPIRATION_TIME = 600_000;

    /** @member list of all the behaviors for the menu components */
    private componentBehaviors: ComponentBehavior[];

    /** 
     * @function handles the collection of interactions on the menu when it is sent
     * @param {Client} client - the client that the bot is logged in as
     * @param {BaseInteraction} interaction - the interaction that the menu belongs to
     * @param {Message} message - the message from which the component interactions are being collected
     */
    async collectMenuInteraction(interaction: BaseInteraction, message: Message ): Promise<void> {
        try {

            // Filter that checks if id of the component user matches the id of the menu reciever (should always be that way since DM but just in case)
            const collectorFilter = (i: BaseInteraction) => i.user.id === interaction.user.id;

            // Get the component that was pressed if one was pressed before menu expires
            const componentUsed = await message.awaitMessageComponent( {filter: collectorFilter, time: BaseMenu.MENU_EXPIRATION_TIME } );

            // For every component behavior, if the check function returns true, execute the resulting action
            this.componentBehaviors.forEach( (behavior: ComponentBehavior) => {
                if(behavior.filter(componentUsed.customId)) {
                    behavior.resultingAction(message, componentUsed);
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

        // components have a maximum number of rows
        if(menuData.components && menuData.components.length > MAX_NUMBER_OF_COMPONENT_ROWS) {
            throw new Error(MAX_COMPONENT_ROWS_EXCEEDED_ERROR);
        }

        // build an embed as the menu's display
        const menuEmbed = new EmbedBuilder({
            title: menuData.title,
            description: menuData.description,
            fields: menuData.fields
        });

        // construct the menu Message Data for the message to be sent to the user
        this.menuMessageData = { 
            embeds: [menuEmbed],
            components: menuData.components
        }

        // define the behaviors for the menu's components
        this.componentBehaviors = [];
        if(menuData.componentBehaviors) {
            this.componentBehaviors = menuData.componentBehaviors;
        }
    }
}