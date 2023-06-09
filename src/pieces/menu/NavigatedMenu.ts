import { ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionUpdateOptions, StringSelectMenuBuilder } from "discord.js";
import { BaseMenu, buttonData, ComponentBehavior, MAX_NUMBER_OF_COMPONENT_ROWS, MenuData } from "./BaseMenu";
import { makeActionRowButton } from "../../generalUtilities/MakeActionRow";
import { mainMenu } from "../discussion/menu/DiscussionMainMenu";

/**
 * @interface NavigatedMenuData
 * @property {String} title - the title of the menu
 * @property {String} description - the description of the menu
 * @property {object[]} fields - list of title descriptions pairs for the menu content
 * @property {String} fields.name - name of the list element to be displayed in the menu
 * @property {String} fields.value - description of the list element to be displayed in the menu
 * @property {ActionRowBuilder} additionalComponents - discord.js interaction rows of components to be put under the navigation row. Max of 4
 * @property {ComponentBehavior[]} buttonBehaviors - the behaviors of the buttons see ComponentBehavior interface in class.BaseMenu.ts
 */
export interface NavigatedMenuData {
    title: string, 
    description: string, 
    fields: {name: string, value: string}[], 
    additionalComponents: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[], 
    additionalComponentBehaviors: ComponentBehavior[]
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
    exists: boolean
    customId?: string, 
    label?:string, 
    disabled?: boolean,
};

/**
 * @interface custom options for the navigation of the menu that overwrite the defaults
 * @property {customPageButtonData} prevButtonOptions - options to overwrite the default previous page button
 * @property {customPageButtonData} nextButtonOptions - options to overwrite the default next page button
 * @property {buttonData} specialMenuButton - **optional** button data that specifies a special button that appears between next page and main menu if it exists
 */
export interface CustomNavOptions {    
    prevButtonOptions: customPageButtonData, 
    nextButtonOptions: customPageButtonData, 
    specialMenuButton?: buttonData
}

function makeNavigationRow(customNavOptions: CustomNavOptions): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder> {
    
    const navButtonData: buttonData[] = []
        
    if(customNavOptions.prevButtonOptions.exists)
        navButtonData.push({
            customId: customNavOptions.prevButtonOptions.customId !== undefined ? customNavOptions.prevButtonOptions.customId : PREV_PAGE_CUSTOMID,
            label: customNavOptions.prevButtonOptions.label !== undefined ? customNavOptions.prevButtonOptions.label : PREV_PAGE_LABEL,
            disabled: customNavOptions.prevButtonOptions.disabled !== undefined ? customNavOptions.prevButtonOptions.disabled : PREV_PAGE_DISABLED,
            style: PREV_PAGE_STYLE,
        });

    if(customNavOptions.nextButtonOptions.exists) {
        navButtonData.push({
            customId: customNavOptions.nextButtonOptions.customId !== undefined ? customNavOptions.nextButtonOptions.customId : NEXT_PAGE_CUSTOMID,
            label: customNavOptions.nextButtonOptions.label !== undefined ? customNavOptions.nextButtonOptions.label : NEXT_PAGE_LABEL,
            disabled: customNavOptions.nextButtonOptions.disabled !== undefined ? customNavOptions.nextButtonOptions.disabled : NEXT_PAGE_DISABLED,
            style: NEXT_PAGE_STYLE,
        })
    }

    if(customNavOptions.specialMenuButton) {
        navButtonData.push({
            customId: customNavOptions.specialMenuButton.customId,
            label: customNavOptions.specialMenuButton.label,
            disabled: customNavOptions.specialMenuButton.disabled,
            style: customNavOptions.specialMenuButton.style,
        });
    }
    
    navButtonData.push(            
    {
        customId: MAIN_MENU_CUSTOMID,
        label: MAIN_MENU_LABEL,
        disabled: MAIN_MENU_DISABLED,
        style: MAIN_MENU_STYLE,
    },
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
    resultingAction: async (componentInteraction) => {
        componentInteraction.update(mainMenu.menuMessageData as InteractionUpdateOptions);
        mainMenu.collectMenuInteraction(componentInteraction.message);
    }
}

const CLOSE_MENU_BUTTON_BEHAVIOR: ComponentBehavior = {
    filter: (customId: string) => {
        return customId === CLOSE_MENU_CUSTOMID;
    },
    resultingAction: async (componentInteraction) => {
        await componentInteraction.message.reply("Discussion menu closed");
        componentInteraction.message.delete();
    }
}

const MAX_ADDITIONAL_COMPONENT_ROWS_EXCEEDED_ERROR = "ERROR: TRIED TO CREATE A NAVIAGTIONMENU WITH MORE ADDITIONAL COMPONENT ROWS THAN ALLOWED";

/**
 * @class menu that contains a row of buttons for navigating through all the menus as the first row of components
 * @param {NavigatedMenu} menuData - data used to generate the parts of the menu that are not defined by default
 * @param {CustomNavOptions} customNavOptions - options used to modify some of the existing navigation buttons (prev and next page as well as a special middle button)
 */
export class NavigatedMenu extends BaseMenu{

    constructor(menuData: NavigatedMenuData, pageNumber: number, customNavOptions?: CustomNavOptions) {
        
        if(menuData.additionalComponents && menuData.additionalComponents.length > MAX_NUMBER_OF_COMPONENT_ROWS - 1) {
            throw new Error(MAX_ADDITIONAL_COMPONENT_ROWS_EXCEEDED_ERROR);
        }
        

        let navigationRow;
        if(customNavOptions){
            navigationRow = makeNavigationRow(customNavOptions);
        }
        else {
            navigationRow = makeNavigationRow({
                prevButtonOptions: { exists : true },
                nextButtonOptions: { exists : true }
            });
        }

        const superMenuData: MenuData = {
            title: menuData.title,
            description: menuData.description,
            fields: menuData.fields,
            components: [navigationRow, ...menuData.additionalComponents],
            componentBehaviors: [MAIN_MENU_BUTTON_BEHAVIOR, CLOSE_MENU_BUTTON_BEHAVIOR , ...menuData.additionalComponentBehaviors]
        }

        super(superMenuData);
    }
}