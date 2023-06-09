import { ButtonComponentData, ButtonStyle, Client, InteractionUpdateOptions, Message, MessageComponentInteraction, MessageCreateOptions } from "discord.js";
import { BaseMenu, ComponentBehavior, buttonData } from "./class.BaseMenu";
import { makeActionRowButton } from "./util.makeActionRow";
import { updateToStaffMenu } from "./staff/class.StaffMenu";

const MAIN_MENU_TITLE = "Discussion Menu";
const MAIN_MENU_DESCRIPTION = "Welcom to the discussion menu! Click the button below that corresponds to your role to open a menu for that role";
const MAIN_MENU_FIELDS: {name: string,  value:string}[] = [];

const MAIN_MENU_STUDENT_BUTTON_ID = "discussion_student_menu_button";
const MAIN_MENU_STUDENT_BUTTON_LABEL = "student view";
const MAIN_MENU_STUDENT_BUTTON_STYLE = ButtonStyle.Primary;
const MAIN_MENU_STUDENT_BUTTON_DISABLED = true;

const MAIN_MENU_STAFF_BUTTON_ID = "discussion_staff_menu_button";
const MAIN_MENU_STAFF_BUTTON_LABEL = "staff view";
const MAIN_MENU_STAFF_BUTTON_STYLE = ButtonStyle.Primary;
const MAIN_MENU_STAFF_BUTTON_DISABLED = false;

/** @constant list of button data used to construct the visual parts of the buttons for the main menu */
const MAIN_MENU_BUTTON_DATA: Partial<ButtonComponentData>[] = [
    {
        customId: MAIN_MENU_STUDENT_BUTTON_ID,
        label: MAIN_MENU_STUDENT_BUTTON_LABEL,
        style: MAIN_MENU_STUDENT_BUTTON_STYLE,
        disabled: MAIN_MENU_STUDENT_BUTTON_DISABLED
    },
    {
        customId: MAIN_MENU_STAFF_BUTTON_ID,
        label: MAIN_MENU_STAFF_BUTTON_LABEL,
        style: MAIN_MENU_STAFF_BUTTON_STYLE,
        disabled: MAIN_MENU_STAFF_BUTTON_DISABLED
    }
];

/** @constant the components of the main menu (see MAIN_MENU_BUTTON_DATA for how editing how they look and MAIN_MENU_BUTTON_BEHAVIORS for how they act) */
const MAIN_MENU_COMPONENTS = [makeActionRowButton(MAIN_MENU_BUTTON_DATA)];

/**@constant behavior data of main menu buttons (see component behavior interface in class.BaseMenu.ts) */
const MAIN_MENU_BUTTON_BEHAVIORS: ComponentBehavior[] = [
    {
        filter: (customId: string) => {
            return customId === MAIN_MENU_STUDENT_BUTTON_ID;
        },
        resultingAction: (message: Message, componentInteraction: MessageComponentInteraction) => {
            // TODO: Implement opening of student view once student menu is implemented
            componentInteraction.update({
                content: "Student view not yet implemented",
                embeds: [],
                components: []
            });
        }
    },
    {
        filter: (customId: string) => {
            return customId === MAIN_MENU_STAFF_BUTTON_ID;
        },
        resultingAction: updateToStaffMenu
    },
]

/** @constant the main menu object that is sent for the discussion menu command - used to acess all other menus */
export const mainMenu = new BaseMenu({
    title: MAIN_MENU_TITLE,
    description: MAIN_MENU_DESCRIPTION,
    fields: MAIN_MENU_FIELDS,
    components: MAIN_MENU_COMPONENTS,
    buttonBehaviors: MAIN_MENU_BUTTON_BEHAVIORS
});