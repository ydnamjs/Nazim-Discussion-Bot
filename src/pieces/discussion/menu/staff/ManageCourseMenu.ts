import { InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { COURSE_MENU_ADDITIONAL_BEHAVIORS, COURSE_MENU_ADDITIONAL_COMPONENTS, customNavOptions } from "./CourseMenuComponents";

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
            additionalComponents: COURSE_MENU_ADDITIONAL_COMPONENTS,
            additionalComponentBehaviors: COURSE_MENU_ADDITIONAL_BEHAVIORS
        }

        super(menuData, 0, customNavOptions);
    }
}