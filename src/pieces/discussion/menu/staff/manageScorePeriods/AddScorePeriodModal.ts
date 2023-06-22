import { ActionRowBuilder, ButtonInteraction, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { DateTime } from "luxon";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { sendDismissableInteractionReply } from "../../../../../generalUtilities/DismissableMessage";

// MODAL TEXT CONSTANTS
const ADD_SCORE_MODAL_TITLE_PREFIX = "Add Score Period To ";

// MODAL BEHAVIOR CONSTANTS
const ADD_SCORE_PERIOD_MODAL_EXPIRATION_TIME = 600_000; // 10 minutes
const DATE_STRING_FORMAT = "yyyy-MM-dd tt";
const ADD_SCORE_MODAL_ID = "add-score-period-modal";

// MODAL NOTIFICATION CONSTANTS
const SUCCESS_MESSAGE = "New Score Period Added!";
const DATABASE_ERROR_MESSAGE = "Database error. Please message admin";
const CONFLICTING_DATES_MESSAGE = "New Score Period Has Overlap With Already Existing Score Period(s). New Score Period Was Not Added.";
const INVALID_INPUT_PREFIX = "Invalid Input Format. New Score Period Was Not Added\nReasons(s):";
const INVALID_START_DATE_REASON = "\n- Invalid start date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM Ex: 1970-01-01 12:00:00 AM";
const INVALID_END_DATE_REASON = "\n- Invalid start date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM Ex: 2036-08-26 11:59:59 PM";
const INVALID_GOAL_POINTS_REASON = "\n- Invalid goal points. Input should be a non negative integer less than or equal to max points. Ex: 800";
const INVALID_MAX_POINTS_REASON = "\n- Invalid maximum points. Input should be a non negative integer greater than or equal to goal points. Ex: 1000";

// INPUT FIELD CONSTANTS
const START_DATE_INPUT_ID = "discussion_add_score_period_start_input";
const START_DATE_INPUT_LABEL = "start date/time: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM";
const START_DATE_INPUT_PLACEHOLDER = "1970-01-01 12:00:00 AM";
const START_DATE_INPUT_STYLE = TextInputStyle.Short;

const END_DATE_INPUT_ID = "discussion_add_score_period_end_input";
const END_DATE_INPUT_LABEL = "end date/time: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM";
const END_DATE_INPUT_PLACEHOLDER =  "2036-08-26 11:59:59 PM";
const END_DATE_INPUT_STYLE = TextInputStyle.Short;

const GOAL_POINTS_INPUT_ID = "discussion_add_score_period_goal_input";
const GOAL_POINTS_INPUT_LABEL = "goal points";
const GOAL_POINTS_INPUT_PLACEHOLDER = "";
const GOAL_POINTS_INPUT_STYLE = TextInputStyle.Short;

const MAX_POINTS_INPUT_ID = "discussion_add_score_period_max_input";
const MAX_POINTS_INPUT_LABEL = "max points";
const MAX_POINTS_INPUT_PLACEHOLDER = "";
const MAX_POINTS_INPUT_STYLE = TextInputStyle.Short;

// INPUT FIELDS
const startDateInput = new TextInputBuilder({
    customId: START_DATE_INPUT_ID,
    label: START_DATE_INPUT_LABEL,
    placeholder: START_DATE_INPUT_PLACEHOLDER,
    style: START_DATE_INPUT_STYLE,
})

const endDateInput = new TextInputBuilder({
    customId: END_DATE_INPUT_ID,
    label: END_DATE_INPUT_LABEL,
    placeholder: END_DATE_INPUT_PLACEHOLDER,
    style: END_DATE_INPUT_STYLE
})

const goalPointsInput = new TextInputBuilder({
    customId: GOAL_POINTS_INPUT_ID,
    label: GOAL_POINTS_INPUT_LABEL,
    placeholder: GOAL_POINTS_INPUT_PLACEHOLDER,
    style: GOAL_POINTS_INPUT_STYLE
})

const maxPointsInput = new TextInputBuilder({
    customId: MAX_POINTS_INPUT_ID,
    label: MAX_POINTS_INPUT_LABEL,
    placeholder: MAX_POINTS_INPUT_PLACEHOLDER,
    style: MAX_POINTS_INPUT_STYLE
})

// ACTION ROWS
const startDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [startDateInput]});
const endDateActionRow = new ActionRowBuilder<TextInputBuilder>({components: [endDateInput]});
const goalPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [goalPointsInput]});
const maxPointsActionRow = new ActionRowBuilder<TextInputBuilder>({components: [maxPointsInput]});

// PRIMARY OPEN MODAL FUNCTION
/**
 * @function opens an add score period modal for the given course as a result of the given interaction
 * @param courseTitle - the title of the corse that the score period is to be added to 
 * @param interaction - the interaction that triggered the opening of this modal
 */
export async function openAddScorePeriodModal(courseTitle: string, interaction: ButtonInteraction) {
    
    // refresh the manage score periods menu so that after the modal is close/submitted it collects input again
    await updateToManageScorePeriodsMenu(courseTitle, interaction, false, true);
    
    // give the user an add score modal to input data to
    const addScorePeriodModal = new ModalBuilder({
        customId: ADD_SCORE_MODAL_ID,
        title: ADD_SCORE_MODAL_TITLE_PREFIX + courseTitle,
        components: [
            startDateActionRow,
            endDateActionRow,
            goalPointsActionRow,
            maxPointsActionRow
        ]
    })
    interaction.showModal(addScorePeriodModal);

    // collect data from the modal
    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        submittedModal = await interaction.awaitModalSubmit({time: ADD_SCORE_PERIOD_MODAL_EXPIRATION_TIME})
    }
    catch {}

    // if the modal is submitted, process the data given
    if (submittedModal !== undefined) {
        processAddModalInput(courseTitle, submittedModal, interaction)
    }
}

// INPUT DATA INTERFACE
/**
 * @interface defines the scorePeriod data that has been input. Used for after it has been converted from strings
 * @property {Date | undefined} startDate - If valid, the start date and time of the score period Undefined. if invalid input
 * @property {Date | undefined} endDate - If valid, the end date and time of the score period. Undefined if invalid input
 * @property {number} goalPoints - The target score that students are expected to earn in the score period. NaN if invalid input
 * @property {number} maxPoints - The maximum number of points that students can in earn in the score period. NaN if invalid input
 */
interface ScorePeriodInputData {
    startDate: Date | undefined, 
    endDate: Date | undefined,  
    goalPoints: number, 
    maxPoints: number
}

// PROCESS ADD MODAL INPUT HELPER FUNCTION
/**
 * @function processes the data of an add score period modal
 * @param {string} courseTitle - the name of the course that the score period will be added to
 * @param {ModalSubmitInteraction} submittedModal - the submitted add score period modal interaction that will be processed
 * @param {ButtonInteraction} triggeringInteraction  - the interaction that prompted the adding of a score period
 */
async function processAddModalInput(courseTitle: string, submittedModal: ModalSubmitInteraction, triggeringInteraction: ButtonInteraction) {
    
    // validate the input
    const modalData = validateInput(submittedModal);

    // if the data is not valid, inform the user
    if(modalData.startDate === undefined || modalData.endDate === undefined || Number.isNaN(modalData.goalPoints) || Number.isNaN(modalData.maxPoints)) {
        
        // create list of reasons why input failed
        let reasons = "";
        if(!modalData.startDate){
            reasons += INVALID_START_DATE_REASON;
        }
        if(!modalData.endDate){
            reasons += INVALID_END_DATE_REASON;
        }
        if(Number.isNaN(modalData.goalPoints)){
            reasons += INVALID_GOAL_POINTS_REASON;
        }
        if(Number.isNaN(modalData.maxPoints)){
            reasons += INVALID_MAX_POINTS_REASON;
        }

        // send the user the reasons
        sendDismissableInteractionReply(submittedModal, INVALID_INPUT_PREFIX + reasons);
        return;
    }

    // otherwise, get the course from the database
    let course: Course | null = null;
    try {
        course = await courseModel.findOne({name: courseTitle});
    }
    // if there was an error getting the course, inform the user that there was a database error
    catch(error: any) {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        console.error(error);
        return;
    }
    
    // if the course was valid
    if(course && course.discussionSpecs !== null) {
        insertNewScorePeriod(course, submittedModal, {start: modalData.startDate as Date, end: modalData.endDate as Date, goalPoints: modalData.goalPoints, maxPoints: modalData.maxPoints}, triggeringInteraction)
    }
}

// VALIDATE DATA HELPER FUNCTION
/**
 * @function validates the input of an add score period modal
 * @param addScorePeriodModal the submitted modal whose input is to be validated
 * @returns {ScorePeriodInputData} scorePeriodInputData - the score period input data after validation (see ScorePeriodInputData interface)
 */
function validateInput(addScorePeriodModal: ModalSubmitInteraction): ScorePeriodInputData {
    
    // get and validate start date
    const startDateString = addScorePeriodModal.fields.getTextInputValue(START_DATE_INPUT_ID);
    const startDateTime = DateTime.fromFormat(startDateString, DATE_STRING_FORMAT)
    const startDate = startDateTime.toJSDate().getTime() ? undefined : startDateTime.toJSDate();

    // get and validate end date
    const endDateString = addScorePeriodModal.fields.getTextInputValue(END_DATE_INPUT_ID);
    const endDateTime = DateTime.fromFormat(endDateString, DATE_STRING_FORMAT)
    const endDate = endDateTime.toJSDate().getTime() ? undefined : endDateTime.toJSDate();

    // get goal points
    let goalPoints = parseInt(addScorePeriodModal.fields.getTextInputValue(GOAL_POINTS_INPUT_ID));

    // get max points
    let maxPoints = parseInt(addScorePeriodModal.fields.getTextInputValue(MAX_POINTS_INPUT_ID));
    
    // validate points are non negative integers and that goal is not more than max
    if(goalPoints < 0)
    goalPoints = NaN;
    if(maxPoints < 0 )
        maxPoints = NaN;
    if(goalPoints > maxPoints) {
        goalPoints = NaN;
        maxPoints = NaN;
    }

    return {startDate: startDate, endDate: endDate, goalPoints: goalPoints, maxPoints: maxPoints};
}

// INSERT NEW SCORE PERIOD HELPER FUNCTION
/**
 * @function attempts to insert the score period into the courses score periods
 * @param {Course} course - the course the score period is being added to
 * @param {ModalSubmitInteraction} submittedModal - the modal interaction that the data for the score period came from
 * @param {ScorePeriodInputData} newScorePeriodData - the data for the new score period (NOTE: properties cannot be undefined or NaN)
 * @param {ButtonInteraction} triggeringInteraction - the interaction that triggered the adding of a score period
 */
async function insertNewScorePeriod(course: Course, submittedModal: ModalSubmitInteraction, newScorePeriodData: {start: Date, end: Date, goalPoints: number, maxPoints: number}, triggeringInteraction: ButtonInteraction) {
    
    // if the discussion specs could not be accessed there is a serious error
    if(course.discussionSpecs === null)
    {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        return;
    }

    // get the score periods from the data base
    const scorePeriods = course.discussionSpecs.scorePeriods;
            
    // determine if the new score period has any overlap with existing ones
    let hasOverlap = false;
    scorePeriods.forEach((scorePeriod) => {
        if(scorePeriod.start.valueOf() <= newScorePeriodData.end.valueOf() && scorePeriod.end.valueOf() >= newScorePeriodData.start.valueOf()) {
            hasOverlap = true;
        }
    })

    // if there is overlap, inform the user
    if(hasOverlap) {
        sendDismissableInteractionReply(submittedModal, CONFLICTING_DATES_MESSAGE);
        return;
    }
    
    // other wise, add it to the score periods
    const disc = course.discussionSpecs;
    
    // if the discussion specs could not be accessed there is a serious error
    if(disc === null) {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        return;
    }

    // add the new score periods to the old and sort the list by start date
    disc.scorePeriods.push({   
        start: newScorePeriodData.start,
        end: newScorePeriodData.end,
        goalPoints: newScorePeriodData.goalPoints,
        maxPoints: newScorePeriodData.maxPoints,
        studentScores: new Map()
    });
    disc.scorePeriods = disc.scorePeriods.sort((a, b) => { return a.start.valueOf() - b.start.valueOf() })

    // update the database with the new score period
    let newCourse: Document | null = null;
    try {
        newCourse = await courseModel.findOneAndUpdate( 
            {name: course.name}, 
            {discussionSpecs: disc}
        )
    }
    // if there was a database error, inform the user and return
    catch(error: any) {
        sendDismissableInteractionReply(submittedModal, DATABASE_ERROR_MESSAGE);
        console.error(error);
        return;
    }

    // otherwise, inform the user that the score period was successfully added
    if(newCourse !== null) {
        
        // inform the user of the success
        sendDismissableInteractionReply(submittedModal, SUCCESS_MESSAGE)

        // refresh the menu to reflect new score periods
        await updateToManageScorePeriodsMenu(course.name, triggeringInteraction, false, false);

        //TODO: After a score period is added, score all of the posts and comments that would fall into it (only necessary for score periods that started in the past)
        return;
    } 
}