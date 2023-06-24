import { ApplicationCommandOptionType, ChannelType, Client, CommandInteraction, ForumChannel, Message, ThreadChannel } from "discord.js";
import { Command } from "../../../command/Command";
import { Course, courseModel } from "../../../generalModels/Course";
import { getThreadMessages, scoreDiscussionItem, scoreThread } from "./scoreFunctions";
import { CommentSpecs, PostSpecs } from "../../../generalModels/DiscussionScoring";

export const testScore: Command = {
    
    name: "testscore",
	description: 'test the score of a comment or post',

	options: [
        {
		    name: 'course',
		    description: 'The name of the course this message belongs to',
		    type: ApplicationCommandOptionType.String,
		    required: true
    	},
        {
		    name: 'message',
		    description: 'The message id of a comment or post',
		    type: ApplicationCommandOptionType.String,
		    required: true
    	}
    ],

	run: async (client: Client, interaction: CommandInteraction) => {
        
        /*
        
        let course: Course | null = null;
        try {
            course = await courseModel.findOne({name: interaction.options.get('course')?.value});
        }
        catch(error: any) {
            console.error(error);
        }

        const forum = await client.channels.fetch(course?.channels.discussion as string) as ForumChannel

        const messageId = interaction.options.get('message')?.value as string

        const message = await forum.threads.cache.get("1120907827947520102")?.messages.fetch(messageId) as Message

        const str = await scoreDiscussionItem(message, course?.discussionSpecs?.commentSpecs as CommentSpecs, course?.roles.staff as string)

        */
        getThreadMessages(client, interaction.options.get('message')?.value as string, {before: new Date("2023-06-24T09:25:00"), after: new Date("2023-06-24T08:24:00")})
        interaction.followUp("check console");
        //interaction.followUp(str.score.toString());
    }
}