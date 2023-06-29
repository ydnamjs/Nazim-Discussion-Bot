import { ApplicationCommandOptionType, Client, CommandInteraction } from "discord.js";
import { Command } from "../../../command/Command";
import { scoreAllThreadsInCourse } from "./scoreFunctions";

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
        
        //const BEFORE = new Date("2023-06-25 02:02:00 PM");

        //console.log("scoring all threads before " + BEFORE.toDateString())
   
        //{before: BEFORE}

        scoreAllThreadsInCourse(client, "test", )

        interaction.followUp("check console");
    }
}