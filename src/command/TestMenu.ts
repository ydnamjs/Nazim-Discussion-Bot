import { CommandInteraction, Client, Interaction} from "discord.js";
import { Command } from "./Command";
import { CourseStudentsMenu } from "../menu/course/course-student/CourseStudentsMenu";
import { CourseStudent } from "../menu/course/course-student/CourseStudentInterface";

// constants
const MENU_SENT_MESSAGE = "CourseStudent menu was sent to your direct messages. Click Here: ";

export const testMenu: Command = {
    name: "test-menu",
    description: "opens the current menu being tested",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // Direct Message the user the discussion main menu
        
        // Test Data
        const sampleStudentData: CourseStudent[] = [];
        for(let i = 0; i < 103; i++) {
            sampleStudentData.push({
                username: i.toString(),
                numPosts: 9999,
                numComments: 123456,
                numAwards: 2,
                numPenalties: -999999,
                currPoints: 8005882300,
            })
        }

        const studentMenu = new CourseStudentsMenu("CISC355-010", sampleStudentData, 1, 0);

        const sentMessage = await interaction.user.send(studentMenu.getMessageComponent());

        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE + sentMessage.url
        });

        // Handles the collection of button events for the menu
        //collectButtonInteraction(client, interaction, sentMenu);
        studentMenu.collectButtonInteraction(client, interaction, sentMessage);
    }
}