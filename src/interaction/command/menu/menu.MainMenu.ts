import { BaseMenu } from "./class.BaseMenu";

const MAIN_MENU_TITLE = "Discussion Menu";
const MAIN_MENU_DESCRIPTION = "Welcom to the discussion menu! Click the button below that corresponds to your role to open a menu for that role";
const MAIN_MENU_FIELDS: {name: string,  value:string}[] = [];

export const mainMenu = new BaseMenu({
    title: MAIN_MENU_TITLE,
    description: MAIN_MENU_DESCRIPTION,
    fields: MAIN_MENU_FIELDS
});