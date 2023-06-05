import { CommandInteraction, Client, Interaction} from "discord.js";
import { Command } from "../interfaces/Command";
import { mainMenu } from "../constants/menus/DiscussionMainMenu";
import { CourseStudentsMenu } from "../course/course-student/CourseStudentsMenu";
import { CourseStudent } from "../course/course-student/CourseStudentInterface";

// constants
const MENU_SENT_MESSAGE = "CourseStudent menu was sent to your direct messages. Click Here: ";

export const testCourseStudentMenu: Command = {
    name: "test-course-student-menu",
    description: "opens a menu of student information for a course",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // Direct Message the user the discussion main menu
        
        const sampleStudentData: CourseStudent[] = [
            {
                username: "ydna_",
                numPosts: 9999,
                numComments: 123456,
                numAwards: 2,
                numPenalties: -999999,
                currPoints: 8005882300,
            },
            {
                username: "Nazim",
                numPosts: 78,
                numComments: 600,
                numAwards: 679,
                numPenalties: 0,
                currPoints: 999999,
            }
        ];

        const studentMenu = new CourseStudentsMenu("CISC355-010", sampleStudentData, 1);

        const sentMessage = await interaction.user.send(studentMenu.getMessageComponent());

        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE + sentMessage.url
        });

        // Handles the collection of button events for the menu
        //collectButtonInteraction(client, interaction, sentMenu);
    }
}