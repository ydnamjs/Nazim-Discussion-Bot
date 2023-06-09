import { Client, BaseInteraction, CacheType, Message } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../class.NavigatedMenu";

const STAFF_MENU_TITLE = "My Courses";
const STAFF_MENU_DESCRIPTION = "Below this you will find a list of all your courses and some basic info about them and their discussions. To access a specific course click the view course button and input the name of the course";

export class StaffMenu extends NavigatedMenu {
    constructor() {
        const menuData: NavigatedMenuData = {
            title: STAFF_MENU_TITLE,
            description: STAFF_MENU_DESCRIPTION,
            fields: [],
            additionalComponents: [],
            additionalButtonBehaviors: []
        }
        
        super(menuData);
    }
}