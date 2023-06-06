import { CommandInteraction, Client, Interaction} from "discord.js";
import { Command } from "../interface.Command";

// constants
const MENU_SENT_MESSAGE = "Discussion menu was sent to your direct messages";

export const DiscussionMenu: Command = {
    name: "discussion-menu",
    description: "opens an embed menu for managing the discussion features",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // CURRENTLY DOES NOTHING BECAUSE REFACTOR REMOVED THE IMPLEMENTATION

        // Direct Message the user the discussion main menu
        //const sentMenu = await interaction.user.send(mainMenu);
        //const sentMenu = await interaction.user.send(mainMenu.getMessageComponent());

        
        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE
        });

        // Handles the collection of button events for the menu
        //collectButtonInteraction(client, interaction, sentMenu);
        //mainMenu.collectButtonInteraction(client, interaction, sentMenu);
    }
}