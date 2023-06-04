import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Client, EmbedBuilder, Interaction } from "discord.js";
import { course_model } from "../models/Course";

//buttons
const mainMenuBotton = new ButtonBuilder({
    customId: "discussion_main_menu_button",
    style: ButtonStyle.Secondary,
    label: "main menu",
});

//row of buttons
const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents([mainMenuBotton])


export async function getCoursesMenu (client: Client, interaction: Interaction, pageNumber: number) {
    
    let docs;

    // get all courses from database matching the user id
    try {
        docs = await course_model.find({INSTRUCTOR_ID: interaction.user.id}).sort({COURSE_NAME: 1});
    }
    catch(error: any) {
        console.log(error);
        /*
        await interaction.followUp({
            ephemeral: true,
            content: "database connection failed"
        });
        */
        return {content: "failed to retrieve courses", embeds: [], components: [buttonRow]};
    }

    if(!docs) {
        return {content: "failed to retrieve courses", embeds: [], components: [buttonRow]};
    }

    const courseFields: {name: string, value: string}[] = [];

    for( let i = 0 + 24 * pageNumber; i < 24 + 24 * pageNumber && i < docs.length; i++) {
        courseFields.push({name: docs[i].COURSE_NAME, value: "sample text"})
    }



    //embed (text)
    const InstructorCourseViewMenuEmbed = new EmbedBuilder({
        title: "Instructor Courses Page " + pageNumber,
        fields: courseFields
    })

    return {content: "", embeds: [InstructorCourseViewMenuEmbed], components: [buttonRow] }


}