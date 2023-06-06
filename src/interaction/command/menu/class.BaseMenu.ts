import { ActionRowBuilder, ButtonBuilder, ButtonComponentData, ButtonStyle, EmbedBuilder, Message, MessageCreateOptions, User } from "discord.js";
import { MenuData, assertValidComponentMenuArray } from "./interface.MenuData";

// MENU CLASS
export class BaseMenu {

    // make button members
    private static MAX_BUTTONS_PER_ROW = 5; // 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#buttons
    private static EMPTY_ARRAY_ERROR_MESSAGE = "ERROR: makeButtonRow called with empty buttonRowData! Make Sure To Always Have At Least One Element";
    private static MAX_BUTTONS_EXCEEDED_WARNING_MESSAGE = "WARNING: number of buttons in makeButtonRow has exceeded max amount of displayable buttons. Any buttons beyond the limit quantity will not exist";

    // navigation button row data member
    // this member holds the data used to generate the navigation menu buttons in the constructor
    // it is protected and not static because subclasses should be able to change the look of the buttons to some degree
    // TODO: abstract the button styles out of this data so that they cant be changed by mistake and adhear to a consistent style rule
    protected NAVIGATION_ROW_BUTTON_DATA: Partial<ButtonComponentData>[] = [
        // previous page
        {
            customId: "discussion_previous_page_button",
            label: "previous page",
            disabled: false,
            style: ButtonStyle.Primary
        },
        // next page
        {
            customId: "discussion_next_page_button",
            label: "next page",
            disabled: false,
            style: ButtonStyle.Primary
        },
        // previous menu
        {
            customId: "discussion_previous_menu_button",
            label: "previous menu",
            disabled: false,
            style: ButtonStyle.Secondary
        },
        // home/main menu
        {
            customId: "discussion_main_menu_button",
            label: "main menu",
            disabled: false,
            style: ButtonStyle.Secondary
        },
        // close menu
        {
            customId: "discussion_close_menu_button",
            label: "close menu",
            disabled: false,
            style: ButtonStyle.Danger
        }
    ]

    // message data member
    // object that is used to construct a message that shows the visual aspect of the menu to be sent to a user as a direct message
    menuMessageData: MessageCreateOptions;

    constructor(menuData: MenuData) {
        
        // create an embed for the menu using the data provided in menu data
        const menuEmbed = new EmbedBuilder({
            title: menuData.title,
            description: menuData.description,
            fields: menuData.fields
        });

        // create the navitagion bar using data in the class member
        // see class member "NAVIGATION_ROW_BUTTON_DATA" for more information
        const navigationActionRow = this.makeActionRowButton( this.NAVIGATION_ROW_BUTTON_DATA );

        // create an array to store all the components that the menu will have and start by putting the navigation row in it
        let menuComponents = [navigationActionRow];

        // if additional components were supplied, add those to
        if(menuData.additionalComponents) {
            menuComponents = [...menuComponents, ...menuData.additionalComponents]
        }

        // construct the menuMessageData to be sent to the user
        this.menuMessageData = { 
            embeds: [menuEmbed],
            components: menuComponents
        }
    }

    // sends the menu to the user specified's DM's and returns the message sent
    async send(user: User): Promise<Message<false>> {
        const sentMenuMessage = await user.send(this.menuMessageData);
        return sentMenuMessage;
    }

    // helper function to construct action row builders for rows of buttons
    protected makeActionRowButton( buttonRowData: Partial<ButtonComponentData>[]): ActionRowBuilder<ButtonBuilder> {
    
        // Throw error if array is empty
        if(buttonRowData.length < 1) {
            throw new Error(BaseMenu.EMPTY_ARRAY_ERROR_MESSAGE)
        }
    
        // Give warning if array length is longer than max length
        if(buttonRowData.length > BaseMenu.MAX_BUTTONS_PER_ROW) {
            console.warn(BaseMenu.MAX_BUTTONS_EXCEEDED_WARNING_MESSAGE);
        }
    
        // Make a button builder for each piece of data provided up to the limit or until out of data
        const buttons: ButtonBuilder[] = [];
        for(let count = 0; count < BaseMenu.MAX_BUTTONS_PER_ROW && count < buttonRowData.length; count++) {
            buttons.push(new ButtonBuilder(buttonRowData[count]));
        }
        
        //create an action row builder using buttons and return that
        return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    }
}