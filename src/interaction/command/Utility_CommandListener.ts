import { CommandInteraction, Client, Interaction } from "discord.js";
import { CommandList } from "./Data_CommandList";

// constants
const COMMAND_NOT_FOUND_MESSAGE = "Error: Command Not Found"


export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        
        // handle commands
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction);
        }

    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    
    // find the command in the list
    const slashCommand = CommandList.find(c => c.name === interaction.commandName);

    // if it doesnt exist there is an error and we return
    if (!slashCommand) {
        interaction.followUp({ content: COMMAND_NOT_FOUND_MESSAGE });
        return;
    }

    // if the command does exist run the command
    await interaction.deferReply();
    slashCommand.run(client, interaction);
};

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript