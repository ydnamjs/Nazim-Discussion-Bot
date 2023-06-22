import { ButtonInteraction, ButtonStyle, InteractionUpdateOptions, MessageComponentInteraction } from "discord.js";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../../NavigatedMenu";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { makeActionRowButton } from "../../../../../generalUtilities/MakeActionRow";
import { ComponentBehavior } from "../../BaseMenu";
import { updateToManageCourseMenu } from "../ManageCourseMenu";
import { openAddScorePeriodModal } from "./AddScorePeriodModal";
import { openDeleteScorePeriodModal } from "./DeleteScorePeriodModal";

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

        for(let index = 0; index < scorePeriodsData.length; index++) {
            fields.push({
                name: "Score Period #" + (index + 1),
                value: 
                    "Start: " + scorePeriodsData[index].start.toDateString() + 
                    "\nEnd: " + scorePeriodsData[index].end.toDateString() + 
                    "\nGoal Points: " + scorePeriodsData[index].goalPoints + 
                    "\nMax Points: " + scorePeriodsData[index].maxPoints
            })
        };

        // button behaviors
        const MANAGE_SCORE_PERIOD_MENU_ADDITIONAL_BEHAVIORS: ComponentBehavior[] = [
            // BACK BUTTON
            {
                filter: (customId) => {
                    return customId === BACK_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    updateToManageCourseMenu(courseTitle, message, componentInteraction);
                }
            },

            // ADD SCORE PERIOD BUTTON
            {
                filter: (customId) => {
                    return customId === ADD_SCORE_PERIOD_BUTTON_ID;
                },
                resultingAction: (_message, componentInteraction) => {
                    if(componentInteraction instanceof ButtonInteraction)
                    openAddScorePeriodModal(courseTitle, componentInteraction);
                }
            },

            // DELETE SCORE PERIOD BUTTON
            {
                filter: (customId) => {
                    return customId === DELETE_SCORE_PERIOD_BUTTON_ID;
                },
                resultingAction: (_message, componentInteraction) => {
                    if(componentInteraction instanceof ButtonInteraction)
                    openDeleteScorePeriodModal(courseTitle, componentInteraction);
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

/**
 * @function updates a menu so that it is now a staff menu (updates the interaction if supplied, otherwise just updates the message)
 * @param {string} courseTitle - the title of the course whose students are to be viewed
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 * @param {boolean} isInteractionUpdate - whether to update the interaction (true) or just edit the message (false)
 */
export async function updateToManageScorePeriodsMenu(courseTitle: string, componentInteraction: MessageComponentInteraction, isInteractionUpdate: boolean, shouldCollect: boolean) {

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
        isInteractionUpdate ? componentInteraction.reply("Database error. Please message admin") : componentInteraction.message.reply("Database error. Please message admin");
        return;
    }

    let scorePeriodData: ScorePeriodData[] = [];

    if(course.discussionSpecs !== null && course.discussionSpecs.scorePeriods) {
        
        scorePeriodData = course.discussionSpecs.scorePeriods.map((scorePeriod):ScorePeriodData => {
            return {
                start: scorePeriod.start,
                end: scorePeriod.end,
                goalPoints: scorePeriod.goalPoints,
                maxPoints: scorePeriod.maxPoints
            };
        })
    }

    scorePeriodData = scorePeriodData.sort((a, b) => { return a.start.valueOf() - b.start.valueOf() })

    // replace the old menu with the view students menu
    const manageScorePeriodsMenu = new ManageScorePeriodsMenu(courseTitle, scorePeriodData);
    isInteractionUpdate ? componentInteraction.update(manageScorePeriodsMenu.menuMessageData as InteractionUpdateOptions) : componentInteraction.message.edit(manageScorePeriodsMenu.menuMessageData as InteractionUpdateOptions);
    
    if(shouldCollect)
    manageScorePeriodsMenu.collectMenuInteraction(componentInteraction.user, componentInteraction.message);
}