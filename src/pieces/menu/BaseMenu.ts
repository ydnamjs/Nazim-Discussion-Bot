import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Message, MessageComponentInteraction, MessageCreateOptions, StringSelectMenuBuilder, User } from "discord.js";
import { sendDismissableReply } from "../../generalUtilities/DismissableMessage";

/**  
 * @interface interface of filter and action function
 * @property {function} filter - function that defines if the resulting action should execute
 * @property {function} resultingAction - function to be ran when the filter evaluates to true
 * @description the purpose of this structure is to be able to create a list of behaviors forcomponents in a menu based on more than matching an id exactly.
 * For example being able to execute on a function if the first 5 characters are "page-" and you wanted the same behavior for buttons "page-1" "page-2" and "page-3" ...
*/
export interface ComponentBehavior {
    filter: (customId: string) => boolean;
    resultingAction: ( componentInteraction: MessageComponentInteraction ) => void;
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

export const MAX_NUMBER_OF_COMPONENT_ROWS = 5; 
const MAX_COMPONENT_ROWS_EXCEEDED_ERROR = "ERROR: TRIED TO CREATE A MENU WITH MORE COMPONENT ROWS THAN ALLOWED";

/**
 * @class Base Menu is an interactive menu that is meant to be sent as a message to a user to display information about the discussion tracking feature
 * @param {MenuData} menuData - the data used to construct the menu
 */
export class BaseMenu {

    menuMessageData: MessageCreateOptions;

    private static MENU_EXPIRTATION_MESSAGE = "Your discussion menu expired due to inactivity";
    private static MENU_EXPIRATION_TIME = 600_000;

    private componentBehaviors: ComponentBehavior[];

    /** 
     * @function handles the collection of interactions on the menu when it is sent
     * @param {Message} message - the message from which the component interactions are being collected
     */
    async collectMenuInteraction(message: Message ): Promise<void> {
        try {

            const componentUsed = await message.awaitMessageComponent({time: BaseMenu.MENU_EXPIRATION_TIME});

            this.componentBehaviors.forEach( (behavior: ComponentBehavior) => {
                if(behavior.filter(componentUsed.customId)) {
                    behavior.resultingAction(componentUsed);
                }
            })
        }
        catch (error: any) {

            // TODO: I feel like theres a better way to do this but it will work for now
            if(error.toString().includes("Collector received no interactions before ending with reason: time")) {

                //TODO: removing await causes error but leaving it means the menu isnt deleted until the dissmissable reply expires
                // we need to make a custom function to reply, delete the menu, and then collect the dismiss button
                await sendDismissableReply(message, BaseMenu.MENU_EXPIRTATION_MESSAGE)
                message.delete()
            }
        }
    }

    constructor(menuData: MenuData) {

        if(menuData.components && menuData.components.length > MAX_NUMBER_OF_COMPONENT_ROWS) {
            throw new Error(MAX_COMPONENT_ROWS_EXCEEDED_ERROR);
        }

        const menuEmbed = new EmbedBuilder({
            title: menuData.title,
            description: menuData.description,
            fields: menuData.fields
        });

        this.menuMessageData = { 
            embeds: [menuEmbed],
            components: menuData.components
        }

        this.componentBehaviors = [];
        if(menuData.componentBehaviors) {
            this.componentBehaviors = menuData.componentBehaviors;
        }
    }
}