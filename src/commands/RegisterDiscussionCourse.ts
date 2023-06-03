import { CommandInteraction, Client, EmbedBuilder } from "discord.js";
import { Command } from "../Command";

import mongoose from "mongoose";

import CourseSchema from "../schemas/CourseSchema";

export const RegisterDiscussionCourse: Command = {
    name: "register-discussion-course",
    description: "registers a discussion course with the name provided",
    options: [{
        //type 3 means string. I dont know why it wouldn't let me just write string
        type: 3,
        name: "course-name",
        description: "the name of the course to be registered ex: \"CISC355-011\"",
    }],
    
    run: async (client: Client, interaction: CommandInteraction) => {

        let content = "";

        const courseName = interaction.options.get("course-name")?.value;

        try {
            await new CourseSchema({
                INSTRUCTOR_ID: interaction.user.id,
                COURSE_NAME: courseName
            }).save();
        }

        catch (error: any) {
            console.log(error);
            content = "failed to register course"
        }

        if(content === "") {
            content = "Registered new course: " + courseName;
        }

        await interaction.followUp({
            ephemeral: true,
            content
        });
    }
};