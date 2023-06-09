import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { BaseMenu, buttonData, ComponentBehavior, MAX_NUMBER_OF_COMPONENT_ROWS, MenuData } from "./class.BaseMenu";
import { makeActionRowButton } from "./util.makeActionRow";

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
/**
 * @interface interface for custom page buttons input
 * @property {String} customId - **optional** the string for the button's id to be used in place of default
 * @property {String} label - **optional** the text to be displayed on the button to be used in place of default
 * @property {boolean} disabled - **optional** the state of if the button is disabled to be used in place of default
 */
interface customPageButtonData {
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

/**
 * @function makes an ActionRowBuilder of the navigation buttons (typically used for a navigated menu)
 * @param {CustomNavOptions} customNavOptions - object containing definitions for overwriting the defailt menu buttons (main menu and close menu are not changable nor is the the style of the page buttons)
 * @returns {ActionRowBuilder} the row containing the navigation buttons specified by the customNavOptions and defaults
 */
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

/** @constant behavior of the main menu button */
const MAIN_MENU_BUTTON_BEHAVIOR: ComponentBehavior = {
    
    filter: (customId: string) => {
        return customId === MAIN_MENU_CUSTOMID;
    },
    resultingAction: async ( _message, componentInteraction) => {
        // TODO: update the menu to the main menu once the main menu class has been added
        componentInteraction.reply("feature not yet implemented");
    }
}

/** @constant behavior of the close menu button */
const CLOSE_MENU_BUTTON_BEHAVIOR: ComponentBehavior = {
    filter: (customId: string) => {
        return customId === CLOSE_MENU_CUSTOMID;
    },
    resultingAction: async ( message, componentInteraction) => {
        await message.reply("Discussion menu closed");
        message.delete();
    }
}

const MAX_ADDITIONAL_COMPONENT_ROWS_EXCEEDED_ERROR = "ERROR: TRIED TO CREATE A NAVIAGTIONMENU WITH MORE ADDITIONAL COMPONENT ROWS THAN ALLOWED";

/**
 * @class menu that contains a row of buttons for navigating through all the menus as the first row of components
 * @param {NavigatedMenu} menuData - data used to generate the parts of the menu that are not defined by default
 * @param {CustomNavOptions} customNavOptions - options used to modify some of the existing navigation buttons (prev and next page as well as a special middle button)
 */
export class NavigatedMenu extends BaseMenu{

    constructor(menuData: NavigatedMenuData, customNavOptions?: CustomNavOptions) {
        
        // components have a maximum number of rows
        if(menuData.additionalComponents && menuData.additionalComponents.length > MAX_NUMBER_OF_COMPONENT_ROWS - 1) {
            throw new Error(MAX_ADDITIONAL_COMPONENT_ROWS_EXCEEDED_ERROR);
        }
        

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