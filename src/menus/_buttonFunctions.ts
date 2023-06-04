import { ButtonInteraction, Client } from "discord.js";

// mappings of each button's id to it's function
// surely there has to be a better way to do this?
const buttonFunctions: {[key: string]: (client: Client, interaction: ButtonInteraction) => void} = {
    
    // student menu
    "discussion_student_menu_button": (client: Client, interaction: ButtonInteraction) => {
        interaction.update({content: "Button was pressed", embeds: [], components: []});
    },

    // instructor menu
    "discussion_instructor_menu_button": (client: Client, interaction: ButtonInteraction) => {
        interaction.update({content: "Button was pressed", embeds: [], components: []});
    },

}

export default buttonFunctions;