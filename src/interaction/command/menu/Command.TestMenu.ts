import { CommandInteraction, Client, ButtonBuilder, ActionRowBuilder, ButtonComponentData, ButtonStyle, GuildMember, Guild, User, BaseInteraction} from "discord.js";
import { Command } from "../interface.Command";

//import mongoose from "mongoose";
import { StaffMenu } from "./staff/class.StaffMenu";
import { Course, courseModel } from "../../../models/Course";
import { Document, Types } from "mongoose";
import { ROLES_GUILD } from "../../../secret";
//import { DB } from "../../../secret";

// constants
const MENU_SENT_MESSAGE = "CourseStudent menu was sent to your direct messages. Click Here: ";

export async function getRolesOfUserInGuild(interaction: BaseInteraction) {
    
    const guild = interaction.client.guilds.cache.get(ROLES_GUILD) as Guild;
    
    if( await guild.members.fetch(interaction.user)) {
        const roles = ((await guild.members.fetch(interaction.user)).roles.cache).keys();
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

        let allCourses: (Document<unknown, {}, Course> & Omit<Course & { _id: Types.ObjectId; }, never>)[] = [];

        try {
            allCourses = await courseModel.find({'roles.staff': {$in: roles}}).select('name roles.student -_id');
        }
        catch(error: any) {
            console.error(error);
        }

        console.log(allCourses);

        // sample menu
        const sampleNavigatedMenu: StaffMenu = new StaffMenu([
            {
                name: "cisc355",
                numStudents: 43,
                numPosts: 13,
                numComments: 2
            }
        ]);

        // sample menu
        const messageLink = (await sampleNavigatedMenu.send(client, interaction)).url;

        // Let them know that they have been DM'd the discussion menu
        await interaction.followUp({
            ephemeral: true,
            content: MENU_SENT_MESSAGE + messageLink
        });
        
    }
}