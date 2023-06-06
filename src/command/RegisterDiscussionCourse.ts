import { CommandInteraction, Client, EmbedBuilder } from "discord.js";
import { Command } from "./Command";

import { course, course_model } from "../models-MARKED-FOR-DELETION/Course";

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

        const newCourseName = interaction.options.get("course-name")?.value as string | undefined;

        // if no course name was given tell the user they need to give one then return
        if(!newCourseName) {

            await interaction.followUp({
                ephemeral: true,
                content: "sorry, you need to specify a course name"
            });

            return;
        }

        // check to see if there already is a course with that name owned by instructor
        let courseAlreadyExists = false;
        try {
            const docs = await course_model.find({INSTRUCTOR_ID: interaction.user.id});
            
            const currentCourseNames: string[] = [];

            docs.forEach((course: course) => {
                currentCourseNames.push(course.COURSE_NAME);
            })

            courseAlreadyExists = (currentCourseNames.indexOf(newCourseName) !== -1);

        }
        catch(error: any) {
            console.log(error);
            await interaction.followUp({
                ephemeral: true,
                content: "database connection failed"
            });
            return;
        }

        // if there is already a course with that name owned by the insturctor tell the user it already exists and return
        if(courseAlreadyExists) {
            await interaction.followUp({
                ephemeral: true,
                content: "sorry, you already have a course with that name"
            });

            return;
        }

        // save the newly registered course
        try {
            await new course_model({
                INSTRUCTOR_ID: interaction.user.id,
                COURSE_NAME: newCourseName
            }).save();
        }
        catch (error: any) {
            console.log(error);
            await interaction.followUp({
                ephemeral: true,
                content: "database connection failed"
            });
            return;
        }

        // confirm to the user that their course was successfully registered
        await interaction.followUp({
            ephemeral: true,
            content: "Registered new course: " + newCourseName
        });
    }
};