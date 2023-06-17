import { NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";

/** 
 * @interface basic information about a student in a discussion course. Intended to be used in view students menu
 * @property {string} username - username of the student
*/
export interface DiscussionStudentData {
    username: string,
}

export class ViewStudentsMenu extends NavigatedMenu {
    constructor(courseTitle: string, studentData: DiscussionStudentData[]) {
        
        // generate the fields of basic info for each course and the select menu options
        let fields: { name: string; value: string; }[] = [];

        // data to be fed into super class navigated menu
        const menuData: NavigatedMenuData = {
            title:courseTitle.toUpperCase(),
            description: "",
            fields: fields,
            additionalComponents: [],
            additionalComponentBehaviors: [],
        }

        super(menuData, 0);
    }
}