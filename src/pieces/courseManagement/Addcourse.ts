import { OverwriteResolvable, CommandInteraction, Client, PermissionsBitField, ChannelType, ApplicationCommandOptionType } from 'discord.js';
import { Course, courseModel } from '../../generalModels/Course';
import { Command } from '../../command/Command';
import { GUILDS, ROLES } from '../../secret';
import { DEFAULT_DISCUSSION_SPECS } from './DiscussionRulesDefaults';

export const addCourse: Command = {
    
    name: "add-course",
	description: 'Creates a courses category and adds all necessary channels/roles.',

	options: [
        {
		    name: 'course',
		    description: 'The three-digit course ID of the course to be added (ex: 108).',
		    type: ApplicationCommandOptionType.String,
		    required: true
    	},
        {
            name: 'is-discussion',
            description: 'Whether or not the course should have a discussion channel and discussion tracking',
            type: ApplicationCommandOptionType.Boolean,
            required: true
        }
    ],

	run: async (client: Client, interaction: CommandInteraction) => {
		//interaction.reply('<a:loading:755121200929439745> working...');

        // check for course name and guild
        const courseOp = interaction.options.get('course')?.value;
        if (!courseOp || !interaction.guild) {
            interaction.editReply("You must enter a course name");
            return;
        }
        const course = courseOp as string

		//	make sure course does not exist already
        if((await courseModel.find({name: course})).length) {
            interaction.editReply({ content: `${course} has already been registered as a course.`});
            return;
        }

		const reason = `Creating new course \`${course}\` as requested 
		by \`${interaction.user.username}\` \`(${interaction.user.id})\`.`;

		//	create staff role for course
		const staffRole = await interaction.guild.roles.create({
			name: `${course} Staff`,
			permissions: BigInt(0),
			mentionable: true,
			reason: reason
		});

		//	create student role for course
		const studentRole = await interaction.guild.roles.create({
			name: `CISC ${course}`,
			permissions: BigInt(0),
			reason: reason
		});

		//	set permissions for the course
		const standardPerms: Array<OverwriteResolvable> = [{
			id: ROLES.ADMIN,
			allow: PermissionsBitField.Flags.ViewChannel
		}, {
			id: staffRole.id,
			allow: PermissionsBitField.Flags.ViewChannel
		}, {
			id: GUILDS.MAIN,
			deny: PermissionsBitField.Flags.ViewChannel
		}, {
			id: studentRole.id,
			allow: PermissionsBitField.Flags.ViewChannel
		}, {
			id: ROLES.MUTED,
			deny: PermissionsBitField.Flags.ViewChannel
		}];
		const staffPerms = [standardPerms[0], standardPerms[1], standardPerms[2]];

		//	create course category
		const categoryChannel = await interaction.guild.channels.create({
            name: `CISC ${course}`,
			type: ChannelType.GuildCategory,
			permissionOverwrites: standardPerms,
			reason
		});

		//	create each channel in the category
		const generalChannel = await interaction.guild.channels.create({
            name: `${course}_general`, 
            type: ChannelType.GuildText, 
            permissionOverwrites: standardPerms, 
            parent: categoryChannel.id, 
            reason: reason
        });
        await interaction.guild.channels.create({
            name: `${course}_homework`, 
            type: ChannelType.GuildText,
            permissionOverwrites: standardPerms, 
            parent: categoryChannel.id, 
            reason: reason
        });
		await interaction.guild.channels.create({
            name: `${course}_labs`,
            type: ChannelType.GuildText,
            permissionOverwrites: standardPerms, 
            parent: categoryChannel.id, 
            reason: reason
        });

        const isDiscussion = interaction.options.get('is-discussion') !== undefined && interaction.options.get('is-discussion')?.value

        let discussionChannel = undefined

        if(isDiscussion) {
            discussionChannel = await interaction.guild.channels.create({
                name: `${course}_discussion`,
                type: ChannelType.GuildForum,
                permissionOverwrites: standardPerms, 
                parent: categoryChannel.id, 
                reason: reason, 
            });
        }
		const staffChannel = await interaction.guild.channels.create({
            name: `${course}_staff`,
            type: ChannelType.GuildText,
            permissionOverwrites: staffPerms, 
            parent: categoryChannel.id, 
            reason: reason
        });
		const privateQuestionChannel = await interaction.guild.channels.create({
            name: `${course}_private_qs`,
            type: ChannelType.GuildText,
            permissionOverwrites: staffPerms, 
            parent: categoryChannel.id, 
            reason: reason, 
            topic: '[no message count]'
        });

		//	adding the course to the database
		const newCourse: Course = {
			name: course,
			channels: {
				category: categoryChannel.id,
				general: generalChannel.id,
                discussion: discussionChannel? discussionChannel.id : null,
				staff: staffChannel.id,
				private: privateQuestionChannel.id
			},
			roles: {
				staff: staffRole.id,
				student: studentRole.id
			},
			assignments: ['hw1', 'hw2', 'hw3', 'hw4', 'hw5', 'lab1', 'lab2', 'lab3', 'lab4', 'lab5'],
            discussionSpecs: isDiscussion? DEFAULT_DISCUSSION_SPECS : null
		};

		await new courseModel(newCourse).save();

		interaction.editReply(`Successfully added course with ID ${course}`);
	}
}

// most of this is from udcis sage. I updated it to fit my structure and made it use discord.js v14
// https://github.com/ud-cis-discord/Sage/tree/main