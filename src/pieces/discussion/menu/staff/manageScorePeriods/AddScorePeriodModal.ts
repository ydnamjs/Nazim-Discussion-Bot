import { ButtonInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { sendDismissableInteractionReply } from "../../../../../generalUtilities/DismissableMessage";
import { CONFLICTING_DATES_MESSAGE, DATABASE_ERROR_MESSAGE, INVALID_END_DATE_REASON, INVALID_GOAL_POINTS_REASON, INVALID_INPUT_PREFIX, INVALID_MAX_POINTS_REASON, INVALID_START_DATE_REASON, SCORE_PERIOD_MODAL_EXPIRATION_TIME, ScorePeriodInputData, endDateActionRow, goalPointsActionRow, maxPointsActionRow, startDateActionRow, validateScorePeriodInput } from "./generalScorePeriodModal";

// MODAL TEXT CONSTANTS
const ADD_SCORE_MODAL_TITLE_PREFIX = "Add Score Period To ";

// MODAL BEHAVIOR CONSTANTS
const ADD_SCORE_MODAL_ID = "add-score-period-modal";

// MODAL NOTIFICATION CONSTANTS
const SUCCESS_MESSAGE = "New Score Period Added!";

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
        submittedModal = await interaction.awaitModalSubmit({time: SCORE_PERIOD_MODAL_EXPIRATION_TIME})
    }
    catch {}

    // if the modal is submitted, process the data given
    if (submittedModal !== undefined) {
        processAddModalInput(courseTitle, submittedModal, interaction)
    }
}

// PROCESS ADD MODAL INPUT HELPER FUNCTION
/**
 * @function processes the data of an add score period modal
 * @param {string} courseTitle - the name of the course that the score period will be added to
 * @param {ModalSubmitInteraction} submittedModal - the submitted add score period modal interaction that will be processed
 * @param {ButtonInteraction} triggeringInteraction  - the interaction that prompted the adding of a score period
 */
async function processAddModalInput(courseTitle: string, submittedModal: ModalSubmitInteraction, triggeringInteraction: ButtonInteraction) {
    
    // validate the score period data
    const modalData = validateScorePeriodInput(submittedModal);

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