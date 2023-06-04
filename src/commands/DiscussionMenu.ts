import { CommandInteraction, Client} from "discord.js";
import { Command } from "../interfaces/Command";
import { buttonRow, discussionMainMenu } from "../menus/MainMenu";

export const DiscussionMenu: Command = {
    name: "discussion-menu",
    description: "opens an embed menu for managing the discussion features",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // Direct Message the user the discussion menu
        interaction.user.send({
            content: "test content",
            embeds: [discussionMainMenu],
            components: [buttonRow]
        });

        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: "Embed menu was sent to your direct messages feel free to dismiss this message"
        });
    }
};