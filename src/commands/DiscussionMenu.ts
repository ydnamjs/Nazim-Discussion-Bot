import { CommandInteraction, Client, EmbedBuilder } from "discord.js";
import { Command } from "../Command";

export const DiscussionMenu: Command = {
    name: "discussion-menu",
    description: "opens an embed menu for managing the discussion features",
    run: async (client: Client, interaction: CommandInteraction) => {
        const discussionMainMenu = new EmbedBuilder({
            title: "Discussion Menu"
        })

        interaction.user.send({embeds: [discussionMainMenu]})

        await interaction.followUp({
            ephemeral: true,
            content: "Embed menu was sent to your direct messages feel free to dismiss this message"
        });
    }
};