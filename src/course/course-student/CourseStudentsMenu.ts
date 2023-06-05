import { APIEmbedField, BaseInteraction, ButtonStyle, Client, InteractionUpdateOptions, Message, MessageComponentInteraction, } from "discord.js";
import { Menu } from "../../classes/Menu";
import { makeButtonRow } from "../../constants/functions/ButtonRowMaker";
import { CourseStudent } from "./CourseStudentInterface";
import { ComponentBehavior } from "../../interfaces/ComponentBehavior";
import { makeButtonBehaviorOnID } from "../../constants/functions/buttonBehaviorOnIdMaker";

// CONSTANTS
const TOTAL_MAX_CHAR_LIMIT = 6000; // 6000 is the most characters discord will will allow in an embed

const MAIN_MENU_BUTTON_LABEL = "go to main menu";
const COURSE_MENU_BUTTON_LABEL = "go back to course menu";
const PREVIOUS_PAGE_MENU_BUTTON_LABEL = "go to previous page"
const NEXT_PAGE_MENU_BUTTON_LABEL = "go to next page"

const MAIN_MENU_BUTTON_ID = "discussion_main_menu_button";
const COURSE_MENU_BUTTON_ID = "discussion_course_expanded_menu_button";
const PREVIOUS_PAGE_MENU_BUTTON_ID = "discussion_course_student_previous"
const NEXT_PAGE_MENU_BUTTON_ID = "discussion_course_student_next"

const REMOVE_MENU_BUTTON_LABEL = "remove student";
const GET_POSTS_MENU_BUTTON_LABEL = "get student's posts";
const GET_COMMENTS_MENU_BUTTON_LABEL = "get student's comments"
const GET_SCORES_MENU_BUTTON_LABEL = "get student's scores"

const REMOVE_MENU_BUTTON_ID = "discussion_remove_course_student_menu_button";
const GET_POSTS_MENU_BUTTON_ID = "discussion_get_posts_course_student_menu_button";
const GET_COMMENTS_MENU_BUTTON_ID = "discussion_get_comments_course_student_menu_button"
const GET_SCORES_MENU_BUTTON_ID = "discussion_get_scores_course_student_menu_button"

// BUTTONS & BUTTON ROWS
const rowOneButtonData = [
    {
        customId: MAIN_MENU_BUTTON_ID,
        style: ButtonStyle.Secondary,
        label: MAIN_MENU_BUTTON_LABEL,
    },
    {
        customId: COURSE_MENU_BUTTON_ID,
        style: ButtonStyle.Secondary,
        label: COURSE_MENU_BUTTON_LABEL,
    },
    {
        customId: PREVIOUS_PAGE_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: PREVIOUS_PAGE_MENU_BUTTON_LABEL,
    },
    {
        customId: NEXT_PAGE_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: NEXT_PAGE_MENU_BUTTON_LABEL,
    },
];

const rowOne = makeButtonRow(rowOneButtonData);

const rowTwoButtonData = [
    {
        customId: REMOVE_MENU_BUTTON_ID,
        style: ButtonStyle.Danger,
        label: REMOVE_MENU_BUTTON_LABEL,
    },
    {
        customId: GET_POSTS_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: GET_POSTS_MENU_BUTTON_LABEL,
    },
    {
        customId: GET_COMMENTS_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: GET_COMMENTS_MENU_BUTTON_LABEL,
    },
    {
        customId: GET_SCORES_MENU_BUTTON_ID,
        style: ButtonStyle.Primary,
        label: GET_SCORES_MENU_BUTTON_LABEL,
    },
];

const rowTwo = makeButtonRow(rowTwoButtonData);

const courseStudentsComponents = [rowOne, rowTwo];

export class CourseStudentsMenu extends Menu {
    courseName: string;
    students: CourseStudent[];
    pageNumber: number;
    endingStudent: number;
    selectedStudent?: CourseStudent = undefined;

    constructor(courseName: string, students: CourseStudent[], pageNumber: number, startingStudent: number) {
        
        // Total character amount is important as embeds have a limit to how many characters can be included
        let charCount = 0;

        // Embed Title and charCount update
        const embedTitle = "Students of " + courseName + " - Page " + pageNumber;
        charCount += embedTitle.length;

        // Embed Description and charCount update
        const embedDescription = "This menu is a list of all students. In the main panel of the menu, you will find a list of all students with various statistics. At the bottom are buttons to flip through pages if you have many students and below that is a drop down menu with buttons that take action on the student selected";
        charCount += embedDescription.length;

        // The students to display in the embed as fields
        const studentFields: APIEmbedField[] = [];
        let endingStudent = startingStudent;
        for(let count = startingStudent; count < 25 + startingStudent && count < students.length; count++ ) {
            
            const student = students[count]
            
            let newName = student.username
            // This check seems kind of overkill but just in case
            if(newName.length > 256) {
                newName = student.username.slice(0, 256);
            }

            // I don't think it's possible to break the 1024 char limit on values without overflowing the number type
            const newValue = "points: " + student.currPoints + "\nposts: " + student.numPosts + "\ncomments: " + student.numComments + "\nawards: " + student.numAwards + "\npenalties: " + student.numPenalties;

            // If adding the new field puts us over the limit do not do it
            if(charCount + newName.length + newValue.length < TOTAL_MAX_CHAR_LIMIT) {

                charCount += (newName.length + newValue.length);

                studentFields.push({
                    name: newName,
                    value: newValue
                });

                endingStudent = count;
            }
            else {
                break;
            }
        }

        const buttonBehaviors: ComponentBehavior[] = [

            {
                checkFunction: (customId: string) => {
                    return (customId === NEXT_PAGE_MENU_BUTTON_ID);
                },
                resultingAction: (client: Client, interaction: BaseInteraction, message: Message, componentInteraction: MessageComponentInteraction) => {
                    const nextPageMenu = new CourseStudentsMenu(
                        courseName = this.courseName,
                        students = this.students,
                        pageNumber = this.pageNumber + 1,
                        startingStudent = this.endingStudent + 1,
                    );
                    componentInteraction.update(nextPageMenu.getMessageComponent() as InteractionUpdateOptions);
                    nextPageMenu.collectButtonInteraction(client, interaction, message);
                },
            },
/*
            makeButtonBehaviorOnID(NEXT_PAGE_MENU_BUTTON_ID, (componentInteraction: MessageComponentInteraction) => {
                const nextPageMenu = new CourseStudentsMenu(
                    courseName = this.courseName,
                    students = this.students,
                    pageNumber = this.pageNumber + 1,
                    startingStudent = this.endingStudent + 1,
                );
                componentInteraction.update(nextPageMenu.getMessageComponent() as InteractionUpdateOptions);
                console.log("updated menu?");
            })
*/
        ]

        // menu data for the menu
        const menuData = {
            embedData: {
                title: embedTitle,
                description: embedDescription,
                fields: studentFields
            },
            components: courseStudentsComponents,
            buttonBehaviors: buttonBehaviors,
        };
        
        super(menuData);

        this.courseName = courseName;
        this.students = students;
        this.pageNumber = pageNumber;
        this.endingStudent = endingStudent;
    }
}