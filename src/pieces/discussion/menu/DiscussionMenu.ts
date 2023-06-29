import { CommandInteraction, Client } from "discord.js";
import { Command } from "../../../command/Command";
import { mainMenu } from "./DiscussionMainMenu";

const MENU_SENT_MESSAGE = "Discussion menu was sent to your direct messages: ";

export const DiscussionMenu: Command = {
    name: "discussion-menu",
    description: "opens an embed menu for managing the discussion features",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        const messageLink = (await mainMenu.send(client, interaction)).url;

        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE + messageLink
        });
    }
}