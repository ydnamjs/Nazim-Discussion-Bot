import { CommandInteraction, Client, Interaction} from "discord.js";
import { Command } from "../interface.Command";

//** @constant the message sent to the user indicating that a menu was sent to them */
const MENU_SENT_MESSAGE = "Discussion menu was sent to your direct messages";

/** @constant the command for getting a discussion menu sent to yourself */
export const DiscussionMenu: Command = {
    name: "discussion-menu",
    description: "opens an embed menu for managing the discussion features",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // TODO: Implement sending a discussion main menu once that menu is implemented
        
        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE
        });
    }
}