import { Client, CommandInteraction, Interaction } from "discord.js";
import { commandList } from "../command/CommandList";

const COMMAND_NOT_FOUND_MESSAGE = "Error: Command Not Found. Please contact an admin"

/** 
 * @function creates a listener for interactions on the given client
 * @param {Client} client - the client whose interactions should be listened for
*/
export default (client: Client): void => {
    
    client.on("interactionCreate", async (interaction: Interaction) => {

        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction);
        }
    });
};

async function handleSlashCommand(client: Client, interaction: CommandInteraction): Promise<void> {
    
    const slashCommand = commandList.find(c => c.name === interaction.commandName);

    if (!slashCommand) {
        interaction.reply({ content: COMMAND_NOT_FOUND_MESSAGE });
        return;
    }

    await interaction.deferReply();
    slashCommand.run(client, interaction);
};

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript