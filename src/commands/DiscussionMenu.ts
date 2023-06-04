import { CommandInteraction, Client} from "discord.js";
import { Command } from "../interfaces/Command";
import mainMenu from "../menus/MainMenu";

// constants
const MENU_SENT_MESSAGE = "Discussion menu was sent to your direct messages";

export const DiscussionMenu: Command = {
    name: "discussion-menu",
    description: "opens an embed menu for managing the discussion features",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // Direct Message the user the discussion main menu
        interaction.user.send(mainMenu);

        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE
        });
    }
};