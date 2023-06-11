import { CommandInteraction, Client, Interaction } from "discord.js";
import { commandList } from "../command/data.CommandList";

// constants
/**
 * @constant - The message to reply to the user with when they send a command that does not exist
 */
const COMMAND_NOT_FOUND_MESSAGE = "Error: Command Not Found. Please contact an admin"

/** 
 * @function creates a listener for interactions on the given client
 * 
 * @param {Client} client - the client whose interactions should be listened for
*/
export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        
        // handle commands
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction);
        }

    });
};

/**
 * 
 * @function handles finding and running a command for the client
 * 
 * @param {Client} client - the client to run the command for
 * 
 * @param {CommandInteraction} interaction - the interaction with the command to run
 */
async function handleSlashCommand(client: Client, interaction: CommandInteraction): Promise<void> {
    
    // find the command in the list
    const slashCommand = commandList.find(c => c.name === interaction.commandName);

    // if it doesnt exist there is an error and we return
    if (!slashCommand) {
        interaction.reply({ content: COMMAND_NOT_FOUND_MESSAGE });
        return;
    }

    // if the command does exist run the command
    await interaction.deferReply();
    slashCommand.run(client, interaction);
};

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript