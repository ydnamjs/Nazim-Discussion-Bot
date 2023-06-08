import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonComponentData, ButtonStyle, Client, ComponentType, EmbedBuilder, InteractionButtonComponentData, Message, MessageCreateOptions, User } from "discord.js";
import { ComponentBehavior, MenuData} from "./interface.MenuData";
import { BaseMenu, buttonData } from "./class.BaseMenu";
import { makeActionRowButton } from "./util.makeActionRow";



export interface NavigatedMenuData {
    title: string, 
    description: string, 
    fields: {name: string, value: string}[], 
    additionalComponents: ActionRowBuilder<ButtonBuilder>[], 
    additionalButtonBehaviors: ComponentBehavior[]
}

// NAVIGATION BUTTONS

const PREV_PAGE_CUSTOMID = "discussion_previous_page_button";
const PREV_PAGE_LABEL = "previous page";
const PREV_PAGE_DISABLED = true;
const PREV_PAGE_STYLE = ButtonStyle.Primary as number;

const NEXT_PAGE_CUSTOMID = "discussion_next_page_button";
const NEXT_PAGE_LABEL = "next page";
const NEXT_PAGE_DISABLED = true;
const NEXT_PAGE_STYLE = ButtonStyle.Primary as number;

const MAIN_MENU_CUSTOMID = "discussion_main_menu_button";
const MAIN_MENU_LABEL = "main menu";
const MAIN_MENU_DISABLED = false;
const MAIN_MENU_STYLE = ButtonStyle.Secondary as number;

const CLOSE_MENU_CUSTOMID = "discussion_close_menu_button";
const CLOSE_MENU_LABEL = "close menu";
const CLOSE_MENU_DISABLED = false;
const CLOSE_MENU_STYLE = ButtonStyle.Danger;

interface customPageButtonData {
    customId?: string, 
    label?:string, 
    disabled?: boolean, 
};
export interface CustomNavOptions {    
    prevButtonOptions: customPageButtonData, 
    nextButtonOptions: customPageButtonData, 
    specialMenuButton?: buttonData
}

function makeNavigationRow(customNavOptions: CustomNavOptions) {
    
    // add the previous and next page buttons
    const navButtonData: buttonData[] = [
        // previous page
        {
            customId: customNavOptions.prevButtonOptions.customId !== undefined ? customNavOptions.prevButtonOptions.customId : PREV_PAGE_CUSTOMID,
            label: customNavOptions.prevButtonOptions.label !== undefined ? customNavOptions.prevButtonOptions.label : PREV_PAGE_LABEL,
            disabled: customNavOptions.prevButtonOptions.disabled !== undefined ? customNavOptions.prevButtonOptions.disabled : PREV_PAGE_DISABLED,
            style: PREV_PAGE_STYLE,
        },
        // next page
        {
            customId: customNavOptions.nextButtonOptions.customId !== undefined ? customNavOptions.nextButtonOptions.customId : NEXT_PAGE_CUSTOMID,
            label: customNavOptions.nextButtonOptions.label !== undefined ? customNavOptions.nextButtonOptions.label : NEXT_PAGE_LABEL,
            disabled: customNavOptions.nextButtonOptions.disabled !== undefined ? customNavOptions.nextButtonOptions.disabled : NEXT_PAGE_DISABLED,
            style: NEXT_PAGE_STYLE,
        },
    ];

    // if the parent menu isnt the main menu than add it (we wouldnt want to have two main menu buttons)
    if(customNavOptions.specialMenuButton) {
        navButtonData.push({
            customId: customNavOptions.specialMenuButton.customId,
            label: customNavOptions.specialMenuButton.label,
            disabled: customNavOptions.specialMenuButton.disabled,
            style: customNavOptions.specialMenuButton.style,
        });
    }
    
    // add the main menu and the close menu buttons
    navButtonData.push(            
    // home/main menu
    {
        customId: MAIN_MENU_CUSTOMID,
        label: MAIN_MENU_LABEL,
        disabled: MAIN_MENU_DISABLED,
        style: MAIN_MENU_STYLE,
    },
    // close menu
    {
        customId: CLOSE_MENU_CUSTOMID,
        label: CLOSE_MENU_LABEL,
        disabled: CLOSE_MENU_DISABLED,
        style: CLOSE_MENU_STYLE,
    })

    return makeActionRowButton(navButtonData);
}

const MAIN_MENU_BUTTON_BEHAVIOR: ComponentBehavior = {
    
    filter: (customId: string) => {
        return customId === MAIN_MENU_CUSTOMID;
    },
    resultingAction: async (client, interaction, message, componentInteraction) => {
        // TODO: update the menu to the main menu once the main menu class has been added
        componentInteraction.reply("feature not yet implemented");
    }
}

const CLOSE_MENU_BUTTON_BEHAVIOR: ComponentBehavior = {
    filter: (customId: string) => {
        return customId === CLOSE_MENU_CUSTOMID;
    },
    resultingAction: async (client, interaction, message, componentInteraction) => {
        await message.reply("Discussion menu closed");
        message.delete();
    }
}

// MENU CLASS
export class NavigatedMenu extends BaseMenu{

    constructor(menuData: NavigatedMenuData, customNavOptions?: CustomNavOptions) {
        let navigationRow;
        if(customNavOptions){
            navigationRow = makeNavigationRow(customNavOptions);
        }
        else {
            navigationRow = makeNavigationRow({
                prevButtonOptions: {},
                nextButtonOptions: {}
            });
        }

        const superMenuData: MenuData = {
            title: menuData.title,
            description: menuData.description,
            fields: menuData.fields,
            components: [navigationRow, ...menuData.additionalComponents],
            buttonBehaviors: [MAIN_MENU_BUTTON_BEHAVIOR, CLOSE_MENU_BUTTON_BEHAVIOR , ...menuData.additionalButtonBehaviors]
        }

        super(superMenuData);
    }
}