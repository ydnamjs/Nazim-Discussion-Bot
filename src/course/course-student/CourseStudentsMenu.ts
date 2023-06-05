import { APIEmbedField } from "discord.js";
import { Menu } from "../../classes/Menu";
import { CourseStudent } from "./CourseStudentInterface";
import { courseStudentsComponents } from "./CourseStudentComponents";

const TOTAL_MAX_CHAR_LIMIT = 6000; // 6000 is the most characters discord will will allow in an embed

export class CourseStudentsMenu extends Menu {
    courseName: string;
    students: CourseStudent[];
    pageNumber: number;
    endingStudent: number;

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

        // menu data for the menu
        const menuData = {
            embedData: {
                title: embedTitle,
                description: embedDescription,
                fields: studentFields
            },
            components: courseStudentsComponents
        };
        
        super(menuData);

        this.courseName = courseName;
        this.students = students;
        this.pageNumber = pageNumber;
        this.endingStudent = endingStudent;

        console.log(endingStudent);
    }
}