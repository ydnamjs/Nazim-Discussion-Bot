import { ButtonInteraction, Client } from "discord.js";

//menus
import mainMenu from "../menus/MainMenu";
import instructorMenu from "./InstructorMenu";
import { getCoursesMenu } from "./ViewInstructorCoursesMenu";

// mappings of each button's id to it's function
// surely there has to be a better way to do this?
const buttonFunctions: {[key: string]: (client: Client, interaction: ButtonInteraction) => void} = {
    
    // return to main menu button
    "discussion_main_menu_button": (client: Client, interaction: ButtonInteraction) => {
        interaction.update(mainMenu);
        interaction.message.createMessageComponentCollector();
    },

    // student menu
    // STILL DUMMY FUNCTION
    "discussion_student_menu_button": (client: Client, interaction: ButtonInteraction) => {
        interaction.update({content: "Button was pressed", embeds: [], components: []});
    },

    // instructor menu
    "discussion_instructor_menu_button": (client: Client, interaction: ButtonInteraction) => {
        interaction.update(instructorMenu);
    },

    // instructor view courses
    "discussion_view_instructor_courses_button": async (client: Client, interaction: ButtonInteraction) => {
        const test = await getCoursesMenu(client, interaction, 0)
        
        interaction.update(test)
    },
}

export default buttonFunctions;