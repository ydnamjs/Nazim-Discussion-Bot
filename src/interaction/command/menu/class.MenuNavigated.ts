import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonComponentData, ButtonStyle, Client, ComponentType, EmbedBuilder, InteractionButtonComponentData, Message, MessageCreateOptions, User } from "discord.js";
import { ComponentBehavior, MenuData, assertValidComponentMenuArray } from "./interface.MenuData";

// MENU CLASS
export class MenuNavigated {

// MAKE BUTTON ROW HELPER FUNCTION

    private static MAX_BUTTONS_PER_ROW = 5; // 5 is chosen because that is discord's current limit (as of 6/5/2023:MM/DD/YYYY) https://discord.com/developers/docs/interactions/message-components#buttons
    private static EMPTY_ARRAY_ERROR_MESSAGE = "ERROR: makeButtonRow called with empty buttonRowData! Make Sure To Always Have At Least One Element";
    private static MAX_BUTTONS_EXCEEDED_WARNING_MESSAGE = "WARNING: number of buttons in makeButtonRow has exceeded max amount of displayable buttons. Any buttons beyond the limit quantity will not exist";

    // helper function to construct action row builders for rows of buttons
    // useful because it saves me from having to write out all the make builders
    protected makeActionRowButton( buttonRowData: Partial<ButtonComponentData>[]): ActionRowBuilder<ButtonBuilder> {
    
        // Throw error if array is empty
        if(buttonRowData.length < 1) {
            throw new Error(MenuNavigated.EMPTY_ARRAY_ERROR_MESSAGE)
        }
    
        // Give warning if array length is longer than max length
        if(buttonRowData.length > MenuNavigated.MAX_BUTTONS_PER_ROW) {
            console.warn(MenuNavigated.MAX_BUTTONS_EXCEEDED_WARNING_MESSAGE);
        }
    
        // Make a button builder for each piece of data provided up to the limit or until out of data
        const buttons: ButtonBuilder[] = [];
        for(let count = 0; count < MenuNavigated.MAX_BUTTONS_PER_ROW && count < buttonRowData.length; count++) {
            buttons.push(new ButtonBuilder(buttonRowData[count]));
        }
        
        //create an action row builder using buttons and return that
        return new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);
    }

// NAVIGATION BUTTONS

    protected PARENT_MENU_IS_MAIN_MENU = false;

    protected PREV_PAGE_CUSTOMID = "discussion_previous_page_button";
    protected PREV_PAGE_LABEL = "previous page";
    protected PREV_PAGE_DISABLED = true;
    private static PREV_PAGE_STYLE = ButtonStyle.Primary as number;

    protected NEXT_PAGE_CUSTOMID = "discussion_next_page_button";
    protected NEXT_PAGE_LABEL = "next page";
    protected NEXT_PAGE_DISABLED = true;
    private static NEXT_PAGE_STYLE = ButtonStyle.Primary as number;

    protected PARENT_MENU_CUSTOMID = "discussion_parent_menu_button";
    protected PARENT_MENU_LABEL = "parent menu";
    protected PARENT_MENU_DISABLED = true;
    private static PARENT_MENU_STYLE = ButtonStyle.Secondary as number;

    private static MAIN_MENU_CUSTOMID = "discussion_main_menu_button";
    private static MAIN_MENU_LABEL = "main menu";
    protected MAIN_MENU_DISABLED = false;
    private static MAIN_MENU_STYLE = ButtonStyle.Secondary as number;

    private static CLOSE_MENU_CUSTOMID = "discussion_close_menu_button";
    private static CLOSE_MENU_LABEL = "close menu";
    private static CLOSE_MENU_DISABLED = false;
    private static CLOSE_MENU_STYLE = ButtonStyle.Danger;

    private static MAIN_MENU_BUTTON_BEHAVIOR: ComponentBehavior = {
        filter: (customId: string) => {
            return customId === MenuNavigated.MAIN_MENU_CUSTOMID;
        },
        resultingAction: async (client, interaction, message, componentInteraction) => {
            // TODO: update the menu to the main menu once the main menu class has been added
            componentInteraction.reply("feature not yet implemented");
        }
    }

    private static CLOSE_MENU_BUTTON_BEHAVIOR: ComponentBehavior = {
        filter: (customId: string) => {
            return customId === MenuNavigated.CLOSE_MENU_CUSTOMID;
        },
        resultingAction: async (client, interaction, message, componentInteraction) => {
            await message.reply("Discussion menu closed");
            message.delete();
        }
    }

    private makeNavigationRow() {
        
        // add the previous and next page buttons
        const navData = [
            // previous page
            {
                customId: this.PREV_PAGE_CUSTOMID,
                label: this.PREV_PAGE_LABEL,
                disabled: this.PREV_PAGE_DISABLED,
                style: MenuNavigated.PREV_PAGE_STYLE,
            },
            // next page
            {
                customId: this.NEXT_PAGE_CUSTOMID,
                label: this.NEXT_PAGE_LABEL,
                disabled: this.NEXT_PAGE_DISABLED,
                style: MenuNavigated.NEXT_PAGE_STYLE,
            },
        ];

        // if the parent menu isnt the main menu than add it (we wouldnt want to have two main menu buttons)
        if(!this.PARENT_MENU_IS_MAIN_MENU) {
            navData.push({
                customId: this.PARENT_MENU_CUSTOMID,
                label: this.PARENT_MENU_LABEL,
                disabled: this.PARENT_MENU_DISABLED,
                style: MenuNavigated.PARENT_MENU_STYLE,
            });
        }
        
        // add the main menu and the close menu buttons
        navData.push(            
        // home/main menu
        {
            customId: MenuNavigated.MAIN_MENU_CUSTOMID,
            label: MenuNavigated.MAIN_MENU_LABEL,
            disabled: this.MAIN_MENU_DISABLED,
            style: MenuNavigated.MAIN_MENU_STYLE,
        },
        // close menu
        {
            customId: MenuNavigated.CLOSE_MENU_CUSTOMID,
            label: MenuNavigated.CLOSE_MENU_LABEL,
            disabled: MenuNavigated.CLOSE_MENU_DISABLED,
            style: MenuNavigated.CLOSE_MENU_STYLE,
        })

        return this.makeActionRowButton(navData);
    }

    // navigation button row data member
    // this member holds the data used to generate the navigation menu buttons in the constructor
    // it is protected and not static because subclasses should be able to change the look of the buttons to some degree

// BUTTON BEHAVIOR MANAGEMENT

    private static MENU_EXPIRTATION_MESSAGE = "Your discussion menu expired due to inactivity";
    private static MENU_EXPIRATION_TIME = 5_000;

    buttonBehaviors: ComponentBehavior[];

    async collectButtonInteraction(client: Client, interaction: BaseInteraction, message: Message ): Promise<void> {
        try {

            // Filter function that checks if id of the button clicker matches the id of the menu reciever (should always be that way since DM but just in case)
            const collectorFilter = (i: BaseInteraction) => i.user.id === interaction.user.id;

            // Get the button that was pressed if one was pressed before menu expires
            const buttonPressed = await message.awaitMessageComponent( {filter: collectorFilter, time: MenuNavigated.MENU_EXPIRATION_TIME } );

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
                interaction.user.send(MenuNavigated.MENU_EXPIRTATION_MESSAGE);
            }
        }
    }

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

// SET UP

    constructor(menuData: MenuData) {
        
        // create an embed for the menu using the data provided in menu data
        const menuEmbed = new EmbedBuilder({
            title: menuData.title,
            description: menuData.description,
            fields: menuData.fields
        });

        // create the navitagion bar using data in the class member
        // see class member "NAVIGATION_ROW_BUTTON_DATA" for more information
        //const navigationActionRow = this.makeActionRowButton( this.navigationRowButtonData );
        const navigationActionRow = this.makeNavigationRow();

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

        this.buttonBehaviors = [];
        if(menuData.additionalButtonBehaviors) {
            this.buttonBehaviors = [...menuData.additionalButtonBehaviors];
        }
        this.buttonBehaviors.push(MenuNavigated.MAIN_MENU_BUTTON_BEHAVIOR, MenuNavigated.CLOSE_MENU_BUTTON_BEHAVIOR);
    }
}