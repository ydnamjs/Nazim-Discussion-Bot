import { Client, BaseInteraction, CacheType, Message, User } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../class.NavigatedMenu";

const STAFF_MENU_TITLE = "My Courses";
const STAFF_MENU_DESCRIPTION = "Below this you will find a list of all your courses and some basic info about them and their discussions. To access a specific course click the view course button and input the name of the course";

export class StaffMenu extends NavigatedMenu {
    constructor() {
        
        const fields = [
            {
                name: "cisc355-010",
                value: "# of students: " + 23 + "\n# of posts: " + 4 + "\n# of comments: " + 13
            },
            {
                name: "cisc355-011",
                value: "# of students: " + 27 + "\n# of posts: " + 8 + "\n# of comments: " + 35
            },
            {
                name: "cisc999-000",
                value: "# of students: " + -85 + "\n# of posts: " + 9 + "\n# of comments: " + 24
            }
        ]
        
        const menuData: NavigatedMenuData = {
            title: STAFF_MENU_TITLE,
            description: STAFF_MENU_DESCRIPTION,
            fields: fields,
            additionalComponents: [],
            additionalButtonBehaviors: []
        }
        
        super(menuData);
    }
}