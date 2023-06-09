import { Client, BaseInteraction, CacheType, Message, User } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../class.NavigatedMenu";

export interface DiscussionCourseBasicData {
    name: string,
    numStudents: number,
    numPosts: number,
    numComments: number,
}


const STAFF_MENU_TITLE = "My Courses";
const STAFF_MENU_DESCRIPTION = "Below this you will find a list of all your courses and some basic info about them and their discussions. To access a specific course click the view course button and input the name of the course";

export class StaffMenu extends NavigatedMenu {
    constructor(courseInfo: DiscussionCourseBasicData[]) {
        
        let fields: { name: string; value: string; }[] = []
        courseInfo.forEach((course: DiscussionCourseBasicData)=>{
            fields.push(
                {
                    name: course.name,
                    value: "# of students: " + course.numStudents + "\n# of posts: " + course.numPosts + "\n# of comments: " + course.numComments
                }
            )
        })
        
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