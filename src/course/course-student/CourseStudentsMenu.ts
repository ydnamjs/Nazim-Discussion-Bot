import { APIEmbedField } from "discord.js";
import { Menu } from "../../classes/Menu";
import { CourseStudent } from "./CourseStudentInterface";

export class CourseStudentsMenu extends Menu {
    courseName: string;
    students: CourseStudent[];
    pageNumber: number;

    constructor(courseName: string, students: CourseStudent[], pageNumber: number) {
        
        const studentFields: APIEmbedField[] = [];
        for(let count = 0; count < 25 && count < students.length; count ++) {
            
            const student = students[count]
            
            studentFields.push({
                name: student.username,
                value: "points: " + student.currPoints + "\nposts: " + student.numPosts + "\ncomments: " + student.numComments + "\nawards: " + student.numAwards + "\npenalties: " + student.numPenalties
            });
        }

        const menuData = {
            embedData: {
                title: "Students of " + courseName + " - Page " + pageNumber,
                description: "This menu is a list of all students. In the main panel of the menu, you will find a list of all students with various statistics. At the bottom are buttons to flip through pages if you have many students and below that is a drop down menu with buttons that take action on the student selected",
                fields: studentFields
            },
            components: []
        };
        
        super(menuData);

        this.courseName = courseName;
        this.students = students;
        this.pageNumber = pageNumber;
    }
}