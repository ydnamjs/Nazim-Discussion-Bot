import { ButtonStyle, InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { ComponentBehavior } from "../BaseMenu";
import { updateToStaffMenu } from "./DiscussionStaffMenu";

export async function updateToManageCourseMenu(name: string, message: Message, componentInteraction: MessageComponentInteraction) {

    // replace the old menu with the manage course menu
    const manageCourseMenu = new ManageCourseMenu(name);
    componentInteraction.update(manageCourseMenu.menuMessageData as InteractionUpdateOptions);
    manageCourseMenu.collectMenuInteraction(componentInteraction, message);
}

const BACK_BUTTON_ID = "discussion_staff_menu_button";

const BACK_BUTTON_BEHAVIOR: ComponentBehavior = {
    filter: (customId) => {
        return customId === BACK_BUTTON_ID;
    },
    resultingAction: (message, componentInteraction) => {
        updateToStaffMenu(message, componentInteraction);
    }

}

export class ManageCourseMenu extends NavigatedMenu {
    constructor(tempTitle: string) {
        
        // generate the fields of basic info for each course and the select menu options
        let fields: { name: string; value: string; }[] = [];

        // data to be fed into super class navigated menu
        const menuData: NavigatedMenuData = {
            title: tempTitle,
            description: "MANAGE COURSE TEMP DESC",
            fields: fields,
            additionalComponents: [],
            additionalComponentBehaviors: [BACK_BUTTON_BEHAVIOR]
        }

        const customNavOptions: CustomNavOptions = {
            prevButtonOptions: {},
            nextButtonOptions: {},
            specialMenuButton: {
                customId: BACK_BUTTON_ID, 
                label: "back to my courses",
                disabled: false,
                style: ButtonStyle.Secondary
            }
        };
        
        super(menuData, customNavOptions);
    }
}