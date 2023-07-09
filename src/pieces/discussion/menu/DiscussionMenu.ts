import { CommandInteraction, Client } from "discord.js";
import { Command } from "../../../command/Command";
import { sendDiscussionMainMenu } from "./DiscussionMainMenu";
import { CourseQueue } from "../scoring/courseQueue";

const MENU_SENT_PREFIX = "Discussion menu was sent to your direct messages: ";

export const DiscussionMenu: Command = {
    name: "discussion-menu",
    description: "opens an embed menu for managing the discussion features",
    run: async (interaction: CommandInteraction, courseQueues: Map<string, CourseQueue>) => {
        
        const messageLink = (await sendDiscussionMainMenu(interaction, courseQueues)).url;

        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_PREFIX + messageLink
        });
    }
}