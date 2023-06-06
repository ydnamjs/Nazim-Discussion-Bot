import { CommandInteraction, Client} from "discord.js";
import { Command } from "../interface.Command";

import { BaseMenu } from "./class.BaseMenu";
import { MenuData } from "./interface.MenuData";

// constants
const MENU_SENT_MESSAGE = "CourseStudent menu was sent to your direct messages. Click Here: ";

export const testMenu: Command = {
    name: "test-menu",
    description: "opens the current menu being tested",
    run: async (client: Client, interaction: CommandInteraction) => {
        
        // Direct Message the user the discussion main menu
        
        // Sample constants
        const title = "Sample Title";
        const description = "sample desc";
        const fields = [
            {
                name: "field 1",
                value: "text1\ntext2n\ntext3",
            },
            {
                name: "field 2",
                value: "text4\ntext5n\ntext6",
            }
        ]

        // Sample menu data
        const sampleMenuData: MenuData = {
            title: title,
            description: description,
            fields: fields
        }

        // sample menu
        const sampleMenu = new BaseMenu(sampleMenuData);

        // sample menu
        const messageLink = (await sampleMenu.send(interaction.user)).url;

        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE + messageLink
        });
        
    }
}