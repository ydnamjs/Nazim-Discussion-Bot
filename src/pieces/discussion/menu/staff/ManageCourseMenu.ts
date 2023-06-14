import { InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";

export async function updateToManageCourseMenu(name: string, message: Message, componentInteraction: MessageComponentInteraction) {

    // replace the old menu with the manage course menu
    const manageCourseMenu = new ManageCourseMenu(name);
    componentInteraction.update(manageCourseMenu.menuMessageData as InteractionUpdateOptions);
    manageCourseMenu.collectMenuInteraction(componentInteraction, message);
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
            additionalComponentBehaviors: []
        }

        const customNavOptions: CustomNavOptions = {
            prevButtonOptions: {},
            nextButtonOptions: {},
        };
        
        super(menuData, customNavOptions);
    }
}