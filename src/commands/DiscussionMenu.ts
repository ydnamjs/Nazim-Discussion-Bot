import { CommandInteraction, Client, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageActionRowComponent, ComponentType, APIActionRowComponent } from "discord.js";
import { Command } from "../interfaces/Command";

export const DiscussionMenu: Command = {
    name: "discussion-menu",
    description: "opens an embed menu for managing the discussion features",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        const discussionMainMenu = new EmbedBuilder({
            title: "Discussion Menu",
        }) 

        const testButton = new ButtonBuilder({
            customId: "test-button",
            style: ButtonStyle.Primary,
            label: "test button text",
        });

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(testButton)

        interaction.user.send({
            content: "test content",
            embeds: [discussionMainMenu],
            components: [buttonRow]
        });

        await interaction.followUp({
            ephemeral: true,
            content: "Embed menu was sent to your direct messages feel free to dismiss this message"
        });
    }
};