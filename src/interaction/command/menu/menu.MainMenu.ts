import { ButtonComponentData, ButtonStyle } from "discord.js";
import { BaseMenu, buttonData } from "./class.BaseMenu";
import { makeActionRowButton } from "./util.makeActionRow";

const MAIN_MENU_TITLE = "Discussion Menu";
const MAIN_MENU_DESCRIPTION = "Welcom to the discussion menu! Click the button below that corresponds to your role to open a menu for that role";
const MAIN_MENU_FIELDS: {name: string,  value:string}[] = [];

const MAIN_MENU_BUTTON_DATA: Partial<ButtonComponentData>[] = [
    {
        customId: "discussion_student_menu_button",
        label: "student view",
        style: ButtonStyle.Primary,
        disabled: true
    },
    {
        customId: "discussion_staff_menu_button",
        label: "staff view",
        style: ButtonStyle.Primary,
        disabled: true
    },
    {
        customId: "discussion_admin_menu_button",
        label: "admin view",
        style: ButtonStyle.Primary,
        disabled: true
    }
]

const MAIN_MENU_COMPONENTS = [makeActionRowButton(MAIN_MENU_BUTTON_DATA)];

export const mainMenu = new BaseMenu({
    title: MAIN_MENU_TITLE,
    description: MAIN_MENU_DESCRIPTION,
    fields: MAIN_MENU_FIELDS,
    components: MAIN_MENU_COMPONENTS
});