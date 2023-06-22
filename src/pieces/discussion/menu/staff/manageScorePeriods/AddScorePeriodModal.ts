import { ActionRowBuilder, ButtonInteraction, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { DateTime } from "luxon";
import { Course, courseModel } from "../../../../../generalModels/Course";

// CONSTANTS
const ADD_SCORE_PERIOD_MODAL_EXPIRATION_TIME = 600_000;
const DATE_STRING_FORMAT = "yyyy-MM-dd hh:mm a";

const ADD_SCORE_MODAL_TITLE_PREFIX = "Add Score Period To ";
const SUCCESS_MESSAGE = "New Score Period Added!";
const CONFLICTING_DATES_MESSAGE = "New Score Period Has Overlap With Already Existing Score Period(s). New Score Period Was Not Added."
const INVALID_INPUT_PREFIX = "Invalid Input Format. New Score Period Was Not Added\nReasons(s):";
const INVALID_START_DATE_REASON = "\n- Invalid start date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM Ex: 2004-06-08 12:00 AM";
const INVALID_END_DATE_REASON = "\n- Invalid start date format. Input should be of the form: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM Ex: 2001-10-23 11:59 PM";
const INVALID_GOAL_POINTS_REASON = "\n- Invalid goal points. Input should be a non negative integer less than or equal to max points. Ex: 1000";
const INVALID_MAX_POINTS_REASON = "\n- Invalid maximum points. Input should be a non negative integer greater than or equal to goal points. Ex: 1350";

const START_DATE_INPUT_ID = "discussion_add_score_period_start_input";
const START_DATE_INPUT_LABEL = "start date and time: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM";
const START_DATE_INPUT_PLACEHOLDER = DATE_STRING_FORMAT.toUpperCase();
const START_DATE_INPUT_STYLE = TextInputStyle.Short;

const END_DATE_INPUT_ID = "discussion_add_score_period_end_input";
const END_DATE_INPUT_LABEL = "end date and time: " + DATE_STRING_FORMAT.toUpperCase() + "M/PM";
const END_DATE_INPUT_PLACEHOLDER =  DATE_STRING_FORMAT.toUpperCase();
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

/**
 * @function validates the input of an add score period modal
 * @param addScorePeriodModal the submitted modal whose input is to be validated
 * @returns {ScorePeriodInputData} scorePeriodInputData - the score period input data after validation (see ScorePeriodInputData interface)
 */
function validateInput(addScorePeriodModal: ModalSubmitInteraction): ScorePeriodInputData {
    const startDateString = addScorePeriodModal.fields.getTextInputValue(START_DATE_INPUT_ID);
    const startDateTime = DateTime.fromFormat(startDateString, DATE_STRING_FORMAT)
    const startDate = startDateTime.isValid ? startDateTime.toJSDate() : undefined;

    const endDateString = addScorePeriodModal.fields.getTextInputValue(END_DATE_INPUT_ID);
    const endDateTime = DateTime.fromFormat(endDateString, DATE_STRING_FORMAT)
    const endDate = startDateTime.isValid ? endDateTime.toJSDate() : undefined;

    let goalPoints = parseInt(addScorePeriodModal.fields.getTextInputValue(GOAL_POINTS_INPUT_ID));

    let maxPoints = parseInt(addScorePeriodModal.fields.getTextInputValue(MAX_POINTS_INPUT_ID));
    
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

/**
 * @function opens an add score period modal for the given course as a result of the given interaction
 * @param courseTitle - the title of the corse that the score period is to be added to 
 * @param interaction - the interaction that triggered the opening of this modal
 */
export async function openAddScorePeriodModal(courseTitle: string, interaction: ButtonInteraction) {
    
    // refresh the manage score periods menu so that after the modal is close/submitted it collects input again
    await updateToManageScorePeriodsMenu(courseTitle, interaction, false);
    
    // give the user a modal to input data to
    const addScorePeriodModal = new ModalBuilder({
        customId: "add-score-period-modal",
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
        
        const modalData = validateInput(submittedModal);

        // if the data is valid
        if(modalData.startDate && modalData.endDate && !Number.isNaN(modalData.goalPoints) && !Number.isNaN(modalData.maxPoints)) {
            
            const newStart = modalData.startDate;
            const newEnd = modalData.endDate;

            let course: Course | null = null;
            try {
                course = await courseModel.findOne({name: courseTitle});
            }
            catch(error: any) {
                console.error(error);
            }

            if(course) {
                const scorePeriods = course.discussionSpecs?.scorePeriods;
                let hasOverlap = false;

                scorePeriods?.forEach((scorePeriod) => {
                    if(scorePeriod.start.valueOf() <= newEnd.valueOf() && scorePeriod.end.valueOf() >= newStart.valueOf()) {
                        hasOverlap = true;
                    }
                })

                if(hasOverlap) {
                    submittedModal.reply(CONFLICTING_DATES_MESSAGE);
                }
                else {
                    
                    const disc = course.discussionSpecs;
                    
                    disc?.scorePeriods.push({   
                        start: newStart,
                        end: newEnd,
                        goalPoints: modalData.goalPoints,
                        maxPoints: modalData.maxPoints,
                        studentScores: new Map()
                    });

                    await courseModel.findOneAndUpdate( 
                        {name: courseTitle}, 
                        {discussionSpecs: disc}
                    )
                    submittedModal.reply(SUCCESS_MESSAGE);

                    //TODO: After a score period is added, score all of the posts and comments that would fall into it (only necessary for score periods that started in the past)

                }

            }
        }
        // if the data is not valid, inform the user
        else {
            
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

            submittedModal.reply(INVALID_INPUT_PREFIX + reasons);
        }

    }
}