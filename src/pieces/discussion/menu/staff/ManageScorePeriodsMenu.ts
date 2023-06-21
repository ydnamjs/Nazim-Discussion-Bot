import { InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { NavigatedMenu, NavigatedMenuData } from "../NavigatedMenu";
import { Course, courseModel } from "../../../../generalModels/Course";

/**
 * @function updates a menu so that it is now a staff menu
 * @param {string} courseTitle - the title of the course whose students are to be viewed
 * @param {Message} message - the message to have the menu be replaced on
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 */
export async function updateToManageScorePeriodsMenu(courseTitle: string, message: Message, componentInteraction: MessageComponentInteraction) {

    // get the ids of all students in the course
    let course: Course | null = null;
    try {
        course = await courseModel.findOne({name: courseTitle});
    }
    catch(error: any) {
        console.error(error);
    }

    // if the course was not found there was a problem getting it from the database
    if(!course) {
        componentInteraction.reply("Database error. Please message admin");
        return;
    }

    const scorePeriodData: ScorePeriodData[] = [
        {
            start: new Date("2023-06-21"),
            end: new Date("2023-06-27"),
            goalPoints: 1000,
            maxPoints: 1350
        },
        {
            start: new Date("2023-06-28"),
            end: new Date("2023-07-04"),
            goalPoints: 1000,
            maxPoints: 1350
        }
    ]

    // replace the old menu with the view students menu
    const manageScorePeriodsMenu = new ManageScorePeriodsMenu(courseTitle, scorePeriodData);
    componentInteraction.update(manageScorePeriodsMenu.menuMessageData as InteractionUpdateOptions);
    manageScorePeriodsMenu.collectMenuInteraction(componentInteraction, message);
}

/** 
 * @interface basic information about a score period - intended to be used in the ManageScorePeriodsMenu
 * @property {Date} start - the exact date and time the score period starts
 * @property {Date} end - the exact date and time the score period ends
 * @property {number} goalPoints - the goal for the number of points a student can recieve in the score period
 * @property {number} maxPoints - the maximum number of points a student can recieve in the score period
*/
export interface ScorePeriodData {
    start: Date,
    end: Date,
    goalPoints: number,
    maxPoints: number
}

export class ManageScorePeriodsMenu extends NavigatedMenu {
    constructor(courseTitle: string, scorePeriodsData: ScorePeriodData[]) {
        
        // generate the fields of basic info for each course and the select menu options
        let fields: { name: string, value: string }[] = [];
        scorePeriodsData.forEach(scorePeriod => {
            fields.push({
                name: scorePeriod.start.toDateString() + " to " + scorePeriod.end.toDateString(),
                value: "Goal Points: " + scorePeriod.goalPoints + "\nMax Points: " + scorePeriod.maxPoints
            })
        });

        // data to be fed into super class navigated menu
        const menuData: NavigatedMenuData = {
            title: courseTitle.toUpperCase() + "Manage Score Periods",
            description: "replace me",
            fields: fields,
            additionalComponents: [],
            additionalComponentBehaviors: [],
        }

        super(menuData, 0);
    }
}