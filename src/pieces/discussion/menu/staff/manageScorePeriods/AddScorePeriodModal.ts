import { ActionRowBuilder, ButtonInteraction, Message, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateToManageScorePeriodsMenu } from "./ManageScorePeriodsMenu";
import { DateTime } from "luxon";
import { Course, courseModel } from "../../../../../generalModels/Course";
import { ScorePeriod } from "../../../../../generalModels/DiscussionScoring";

// CONSTANTS
const ADD_SCORE_MODAL_TITLE_PREFIX = "Add Score Period To ";
const ADD_SCORE_PERIOD_MODAL_EXPIRATION_TIME = 600_000;
const ADD_SCORE_PERIOD_MODAL_EXPIRTATION_MESSAGE = "Your add score period modal expired due to inactivity. No action was taken"

const START_DATE_INPUT_ID = "discussion_add_score_period_start_input";
const START_DATE_INPUT_LABEL = "start date and time: YYYY-MM-DD HH-MM-SS";
const START_DATE_INPUT_PLACEHOLDER = "YYYY-MM-DD HH-MM-SS";
const START_DATE_INPUT_STYLE = TextInputStyle.Short;

const END_DATE_INPUT_ID = "discussion_add_score_period_end_input";
const END_DATE_INPUT_LABEL = "end date and time: YYYY-MM-DD HH-MM-SS";
const END_DATE_INPUT_PLACEHOLDER = "YYYY-MM-DD HH-MM-SS";
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
    const startDateTime = DateTime.fromFormat(startDateString, "yyyy-MM-dd hh:mm a")
    const startDate = startDateTime.isValid ? startDateTime.toJSDate() : undefined;

    const endDateString = addScorePeriodModal.fields.getTextInputValue(END_DATE_INPUT_ID);
    const endDateTime = DateTime.fromFormat(endDateString, "yyyy-MM-dd hh:mm a")
    const endDate = startDateTime.isValid ? endDateTime.toJSDate() : undefined;

    const goalPoints = parseInt(addScorePeriodModal.fields.getTextInputValue(GOAL_POINTS_INPUT_ID));
    const maxPoints = parseInt(addScorePeriodModal.fields.getTextInputValue(MAX_POINTS_INPUT_ID));

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
                    submittedModal.reply("New Score Period Has Overlap With Already Existing Score Period(s). New Score Period Was Not Added");
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
                    submittedModal.reply("New Score Period Added!");

                    //TODO: After a score period is added, score all of the posts and comments that would fall into it (only necessary for score periods that started in the past)

                }

            }
        }
        // if the data is not valid, inform the user
        else {
            submittedModal.reply("Invalid Input Format. New Score Period Was Not Added");
        }

    }
}