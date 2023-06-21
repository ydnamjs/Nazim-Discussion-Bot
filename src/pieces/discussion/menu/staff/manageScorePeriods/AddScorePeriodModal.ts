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

interface scorePeriodInputData {
    startDate: Date | undefined, 
    endDate: Date | undefined,  
    goalPoints: number, 
    maxPoints: number
}

function validateInput(submittedModal: ModalSubmitInteraction): scorePeriodInputData {
    const startDateString = submittedModal.fields.getTextInputValue(START_DATE_INPUT_ID);
    const startDateTime = DateTime.fromFormat(startDateString, "yyyy-MM-dd hh:mm a")
    const startDate = startDateTime.isValid ? startDateTime.toJSDate() : undefined;

    const endDateString = submittedModal.fields.getTextInputValue(END_DATE_INPUT_ID);
    const endDateTime = DateTime.fromFormat(endDateString, "yyyy-MM-dd hh:mm a")
    const endDate = startDateTime.isValid ? endDateTime.toJSDate() : undefined;

    const goalPoints = parseInt(submittedModal.fields.getTextInputValue(GOAL_POINTS_INPUT_ID));
    const maxPoints = parseInt(submittedModal.fields.getTextInputValue(MAX_POINTS_INPUT_ID));

    return {startDate: startDate, endDate: endDate, goalPoints: goalPoints, maxPoints: maxPoints};
}

export async function openAddScorePeriodModal(courseTitle: string, interaction: ButtonInteraction) {
    
    await updateToManageScorePeriodsMenu(courseTitle, interaction, false);
    
    // MODAL
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

    // COLLECT MODAL
    let submittedModal: ModalSubmitInteraction | undefined = undefined;
    try {
        submittedModal = await interaction.awaitModalSubmit({time: ADD_SCORE_PERIOD_MODAL_EXPIRATION_TIME})
    }
    catch {}

    if (submittedModal !== undefined) {
        const modalData = validateInput(submittedModal);

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
            
            modalData.startDate

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
                }

            }
        }
        else {
            submittedModal.reply("Invalid Input Format. New Score Period Was Not Added");
        }

    }

    // PROCESS INPUT
    // TODO: implement me



}