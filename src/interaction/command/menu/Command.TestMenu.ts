import { CommandInteraction, Client, ButtonBuilder, ActionRowBuilder, ButtonComponentData, ButtonStyle, GuildMember, Guild, User, BaseInteraction} from "discord.js";
import { Command } from "../interface.Command";

//import mongoose from "mongoose";
import { StaffMenu } from "./staff/class.StaffMenu";
import { courseModel } from "../../../models/Course";
//import { DB } from "../../../secret";

// constants
const MENU_SENT_MESSAGE = "CourseStudent menu was sent to your direct messages. Click Here: ";

async function getRolesOfUserInGuild(interaction: BaseInteraction) {
    if(interaction.guild && await interaction.guild.members.fetch(interaction.user)) {
        const roles = ((await interaction.guild.members.fetch(interaction.user)).roles.cache).keys();
        if (roles) {
            return [...roles];
        }
    }
    return [];
}

export const testMenu: Command = {
    name: "test-menu",
    description: "opens the current menu being tested",
    run: async (client: Client, interaction: CommandInteraction) => {
    
        const roles = await getRolesOfUserInGuild(interaction);

        console.log(roles);

        //await courseModel.find({INSTRUCTOR_ID: interaction.user.id});

        // sample menu
        const sampleNavigatedMenu: StaffMenu = new StaffMenu();

        // sample menu
        const messageLink = (await sampleNavigatedMenu.send(client, interaction)).url;

        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE + messageLink
        });
        
    }
}