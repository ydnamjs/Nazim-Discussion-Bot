import { CommandInteraction, Client, ApplicationCommandOptionType, CategoryChannel } from 'discord.js';
import { Course, courseModel } from '../../../models/Course';
import { Command } from '../interface.Command';


export const removeCourse: Command = {
    name: "remove-course",
	description: 'Remove a course',
	options: [{
		name: 'course',
		description: 'The three-digit course ID of the course to be added (ex: 108).',
		type: ApplicationCommandOptionType.String,
		required: true
	}],

    run: async (client: Client, interaction: CommandInteraction) => {
        // check for course name and guild
        const courseOp = interaction.options.get('course')?.value;
        if (!courseOp || !interaction.guild) {
            interaction.editReply("You must enter a course name");
            return;
        }
        const courseName = courseOp as string

        //	make sure course does not exist already
        if((await courseModel.find({name: courseName})).length === 0) {
            interaction.editReply({ content: `${courseName} does not exist as a course`});
            return;
        }

		const reason = `Deleting course \`${courseName}\` as requested 
		by \`${interaction.user.username}\` \`(${interaction.user.id})\`.`;

        const course: Course = await courseModel.findOne({name: courseName}) as Course;

        // delete all of the channels in the category and then the the category from the server
        const courseCategory = await interaction.guild.channels.fetch(course.channels.category) as CategoryChannel;
        const courseChannels = [...courseCategory.children.cache.keys()];
        courseChannels.forEach(async channelID => {
            const channel = await client.channels.fetch(channelID);
            channel?.delete(reason);
        });
        courseCategory.delete();

        // delete the roles of the course from the server
        const studentRoleId = course.roles.student;
        const staffRoleId = course.roles.staff;
        const stu = await interaction.guild.roles.fetch(studentRoleId);
        stu?.delete();
        const staff = await interaction.guild.roles.fetch(staffRoleId);
        staff?.delete();

        // delete the course from the database
        courseModel.deleteOne(course);

        interaction.editReply(`Successfully removed course with ID ${course}`);
    }
}