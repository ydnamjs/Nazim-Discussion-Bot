import { APIEmbedField, ButtonInteraction, ButtonStyle, InteractionUpdateOptions, MessageComponentInteraction } from "discord.js";
import { getCourseByName } from "../../../../../generalUtilities/getCourseByName";
import { makeActionRowButton } from "../../../../../generalUtilities/MakeActionRow";
import { ComponentBehavior } from "../../BaseMenu";
import { CustomNavOptions, NavigatedMenu, NavigatedMenuData } from "../../NavigatedMenu";
import { updateToManageCourseMenu } from "../ManageCourseMenu";
import { openAddScorePeriodModal } from "./AddScorePeriodModal";
import { openDeleteScorePeriodModal } from "./DeleteScorePeriodModal";
import { openEditScorePeriodModal } from "./EditScorePeriodModal";

const MENU_TITLE_SUFFIX = " Manage Score Periods";
const MENU_DESCRIPTION = "replace me";
const FIELD_TITLE_PREFIX = "Score Period #";
const FIELD_START_PREFIX = "Start: ";
const FIELD_END_PREFIX = "\nEnd: "
const FIELD_GOAL_POINTS_PREFIX = "\nGoal Points: "
const FIELD_MAX_POINTS_PREFIX = "\nMax Points: "

const BACK_BUTTON_ID = "discussion_manage_score_periods_menu_back_button";
const BACK_BUTTON_LABEL = "Back To Course";
const BACK_BUTTON_DISABLED = false;
const BACK_BUTTON_STYLE = ButtonStyle.Secondary

const ADD_PERIOD_BUTTON_ID = "discussion-add-score-period-button";
const ADD_PERIOD_BUTTON_LABEL = "Add Score Period";
const ADD_PERIOD_BUTTON_DISABLED = false;
const ADD_PERIOD_BUTTON_STYLE = ButtonStyle.Primary

const EDIT_PERIOD_BUTTON_ID = "discussion-edit-score-period-button";
const EDIT_PERIOD_BUTTON_LABEL = "Edit Score Period";
const EDIT_PERIOD_BUTTON_DISABLED = false;
const EDIT_PERIOD_BUTTON_STYLE = ButtonStyle.Primary

const DELETE_PERIOD_BUTTON_ID = "discussion-delete-score-period-button";
const DELETE_PERIOD_BUTTON_LABEL = "Delete Score Period";
const DELETE_PERIOD_BUTTON_DISABLED = false;
const DELETE_PERIOD_BUTTON_STYLE = ButtonStyle.Primary

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

const ADD_PERIOD_BUTTON_DATA = {
    custom_id: ADD_PERIOD_BUTTON_ID,
    label: ADD_PERIOD_BUTTON_LABEL,
    disabled: ADD_PERIOD_BUTTON_DISABLED,
    style: ADD_PERIOD_BUTTON_STYLE
}

const EDIT_PERIOD_BUTTON_DATA = {
    custom_id: EDIT_PERIOD_BUTTON_ID,
    label: EDIT_PERIOD_BUTTON_LABEL,
    disabled: EDIT_PERIOD_BUTTON_DISABLED,
    style: EDIT_PERIOD_BUTTON_STYLE
}

const DELETE_PERIOD_BUTTON_DATA = {
    custom_id: DELETE_PERIOD_BUTTON_ID,
    label: DELETE_PERIOD_BUTTON_LABEL,
    disabled: DELETE_PERIOD_BUTTON_DISABLED,
    style: DELETE_PERIOD_BUTTON_STYLE
}

const MANAGE_PERIODS_BUTTON_ROW = makeActionRowButton([ADD_PERIOD_BUTTON_DATA, EDIT_PERIOD_BUTTON_DATA, DELETE_PERIOD_BUTTON_DATA]);

/**
 * @function updates a menu so that it is now a staff menu (updates the interaction if supplied, otherwise just updates the message)
 * @param {string} courseName - the title of the course whose students are to be viewed
 * @param {MessageComponentInteraction} componentInteraction - the interaction that triggered this menu replacement
 * @param {boolean} isInteractionUpdate - whether to update the interaction (true) or just edit the message (false)
 */
export async function updateToManagePeriodsMenu(courseName: string, componentInteraction: MessageComponentInteraction, isInteractionUpdate: boolean) {

    const scorePeriodData = await getScorePeriodData(courseName)

    const manageScorePeriodsMenu = new ManagePeriodsMenu(courseName, scorePeriodData);
    isInteractionUpdate ? componentInteraction.update(manageScorePeriodsMenu.menuMessageData as InteractionUpdateOptions) : componentInteraction.message.edit(manageScorePeriodsMenu.menuMessageData as InteractionUpdateOptions);
    manageScorePeriodsMenu.collectMenuInteraction(componentInteraction.user, componentInteraction.message);
}

/**
 * @function refreshes the manage periods menu on the interaction provided's message
 * @param courseName - the name of the course that the menu is for
 * @param interaction - the interaction that the menu belongs to
 */
export async function refreshManagePeriodsMenu(courseName: string, interaction: MessageComponentInteraction) {

    const scorePeriodData = await getScorePeriodData(courseName)
    
    const manageScorePeriodsMenu = new ManagePeriodsMenu(courseName, scorePeriodData);
    interaction.message.edit({embeds: manageScorePeriodsMenu.menuMessageData.embeds});
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

async function getScorePeriodData (courseName: string) {
    
    let fetchedCourse = await getCourseByName(courseName)
    
    if(!fetchedCourse || fetchedCourse.discussionSpecs === null) {
        return [];
    }
    
    let scorePeriodData: ScorePeriodData[] = [];
            
    scorePeriodData = fetchedCourse.discussionSpecs.scorePeriods.map((scorePeriod):ScorePeriodData => {
        return {
            start: scorePeriod.start,
            end: scorePeriod.end,
            goalPoints: scorePeriod.goalPoints,
            maxPoints: scorePeriod.maxPoints
        };
    })

    scorePeriodData = scorePeriodData.sort((a, b) => { return a.start.valueOf() - b.start.valueOf() })

    return scorePeriodData;
}

class ManagePeriodsMenu extends NavigatedMenu {
    constructor(courseTitle: string, scorePeriodsData: ScorePeriodData[]) {
        
        let fields: APIEmbedField[] = [];

        for(let index = 0; index < scorePeriodsData.length; index++) {
            fields.push({
                name: FIELD_TITLE_PREFIX + (index + 1),
                value: 
                    FIELD_START_PREFIX + scorePeriodsData[index].start.toDateString() + " " + scorePeriodsData[index].start.toLocaleTimeString() + 
                    FIELD_END_PREFIX + scorePeriodsData[index].end.toDateString() + " " + scorePeriodsData[index].end.toLocaleTimeString() + 
                    FIELD_GOAL_POINTS_PREFIX + scorePeriodsData[index].goalPoints + 
                    FIELD_MAX_POINTS_PREFIX + scorePeriodsData[index].maxPoints
            })
        };

        const MANAGE_SCORE_PERIOD_MENU_ADDITIONAL_BEHAVIORS: ComponentBehavior[] = [
            {
                filter: (customId) => {
                    return customId === BACK_BUTTON_ID;
                },
                resultingAction: (message, componentInteraction) => {
                    updateToManageCourseMenu(courseTitle, message, componentInteraction);
                }
            },
            {
                filter: (customId) => {
                    return customId === ADD_PERIOD_BUTTON_ID;
                },
                resultingAction: (_message, componentInteraction) => {
                    if(componentInteraction instanceof ButtonInteraction)
                    openAddScorePeriodModal(courseTitle, componentInteraction);
                }
            },
            {
                filter: (customId) => {
                    return customId === EDIT_PERIOD_BUTTON_ID;
                },
                resultingAction: (_message, componentInteraction) => {
                    if(componentInteraction instanceof ButtonInteraction)
                    openEditScorePeriodModal(courseTitle, componentInteraction);
                }
            },
            {
                filter: (customId) => {
                    return customId === DELETE_PERIOD_BUTTON_ID;
                },
                resultingAction: (_message, componentInteraction) => {
                    if(componentInteraction instanceof ButtonInteraction)
                    openDeleteScorePeriodModal(courseTitle, componentInteraction);
                }
            }
        ]

        const menuData: NavigatedMenuData = {
            title: courseTitle.toUpperCase() + MENU_TITLE_SUFFIX,
            description: MENU_DESCRIPTION,
            fields: fields,
            additionalComponents: [MANAGE_PERIODS_BUTTON_ROW],
            additionalComponentBehaviors: MANAGE_SCORE_PERIOD_MENU_ADDITIONAL_BEHAVIORS,
        }

        super(menuData, 0, customNavOptions);
    }
}