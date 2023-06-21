import { ButtonStyle, InteractionUpdateOptions, Message, MessageComponentInteraction } from "discord.js";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../../NavigatedMenu";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { makeActionRowButton } from "../../../../../generalUtilities/MakeActionRow";
import { ComponentBehavior } from "../../BaseMenu";
import { updateToStaffMenu } from "../DiscussionStaffMenu";
import { updateToManageCourseMenu } from "../ManageCourseMenu";

// BUTTON CONSTANTS
const BACK_BUTTON_ID = "discussion_manage_score_periods_menu_back_button";
const BACK_BUTTON_LABEL = "Back To Course";
const BACK_BUTTON_DISABLED = false;
const BACK_BUTTON_STYLE = ButtonStyle.Secondary

const ADD_SCORE_PERIOD_BUTTON_ID = "discussion-add-score-period-button";
const ADD_SCORE_PERIOD_BUTTON_LABEL = "Add Score Period";
const ADD_SCORE_PERIOD_BUTTON_DISABLED = false;
const ADD_SCORE_PERIOD_BUTTON_STYLE = ButtonStyle.Primary

const EDIT_SCORE_PERIOD_BUTTON_ID = "discussion-edit-score-period-button";
const EDIT_SCORE_PERIOD_BUTTON_LABEL = "Edit Score Period";
const EDIT_SCORE_PERIOD_BUTTON_DISABLED = false;
const EDIT_SCORE_PERIOD_BUTTON_STYLE = ButtonStyle.Primary

const DELETE_SCORE_PERIOD_BUTTON_ID = "discussion-delete-score-period-button";
const DELETE_SCORE_PERIOD_BUTTON_LABEL = "Delete Score Period";
const DELETE_SCORE_PERIOD_BUTTON_DISABLED = false;
const DELETE_SCORE_PERIOD_BUTTON_STYLE = ButtonStyle.Primary

// NAVIGATION ROW

const customNavOptions: CustomNavOptions = {
    prevButtonOptions: {exists: true},
    nextButtonOptions: {exists: true},
    specialMenuButton: {
        customId: BACK_BUTTON_ID, 
        label: BACK_BUTTON_LABEL,
        disabled: BACK_BUTTON_DISABLED,
        style: BACK_BUTTON_STYLE
    }
};

// SCORE PERIOD ROW

const ADD_SCORE_PERIOD_BUTTON_DATA = {
    custom_id: ADD_SCORE_PERIOD_BUTTON_ID,
    label: ADD_SCORE_PERIOD_BUTTON_LABEL,
    disabled: ADD_SCORE_PERIOD_BUTTON_DISABLED,
    style: ADD_SCORE_PERIOD_BUTTON_STYLE
}

const EDIT_SCORE_PERIOD_BUTTON_DATA = {
    custom_id: EDIT_SCORE_PERIOD_BUTTON_ID,
    label: EDIT_SCORE_PERIOD_BUTTON_LABEL,
    disabled: EDIT_SCORE_PERIOD_BUTTON_DISABLED,
    style: EDIT_SCORE_PERIOD_BUTTON_STYLE
}

const DELETE_SCORE_PERIOD_BUTTON_DATA = {
    custom_id: DELETE_SCORE_PERIOD_BUTTON_ID,
    label: DELETE_SCORE_PERIOD_BUTTON_LABEL,
    disabled: DELETE_SCORE_PERIOD_BUTTON_DISABLED,
    style: DELETE_SCORE_PERIOD_BUTTON_STYLE
}

const SCORE_PERIOD_BUTTON_ROW = makeActionRowButton([ADD_SCORE_PERIOD_BUTTON_DATA, EDIT_SCORE_PERIOD_BUTTON_DATA, DELETE_SCORE_PERIOD_BUTTON_DATA]);

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

        const MANAGE_SCORE_PERIOD_MENU_ADDITIONAL_BEHAVIORS: ComponentBehavior[] = [
            {
                filter: (customId) => {
                    return customId === BACK_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    updateToManageCourseMenu(courseTitle, message, componentInteraction);
                }
            }
        ]

        // data to be fed into super class navigated menu
        const menuData: NavigatedMenuData = {
            title: courseTitle.toUpperCase() + "Manage Score Periods",
            description: "replace me",
            fields: fields,
            additionalComponents: [SCORE_PERIOD_BUTTON_ROW],
            additionalComponentBehaviors: MANAGE_SCORE_PERIOD_MENU_ADDITIONAL_BEHAVIORS,
        }

        super(menuData, 0, customNavOptions);
    }
}