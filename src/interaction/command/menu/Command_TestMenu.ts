import { CommandInteraction, Client, Interaction} from "discord.js";
import { Command } from "../Interface_Command";

// constants
const MENU_SENT_MESSAGE = "CourseStudent menu was sent to your direct messages. Click Here: ";

export const testMenu: Command = {
    name: "test-menu",
    description: "opens the current menu being tested",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // Direct Message the user the discussion main menu
        
        // CURRENTLY DOES NOTHING BECAUSE REFACTOR REMOVED THE IMPLEMENTATION

        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE + sentMessage.url
        });

        // Handles the collection of button events for the menu
        //collectButtonInteraction(client, interaction, sentMenu);
    }
}