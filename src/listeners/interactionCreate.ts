import { CommandInteraction, Client, Interaction, ButtonInteraction } from "discord.js";
import { CommandList } from "../constants/CommandList";

import buttonFunctions from "../menus/_buttonFunctions";

// constants
const COMMAND_NOT_FOUND_MESSAGE = "Error: Command Not Found"
const BUTTON_FUNCTION_NOT_FOUND_MESSAGE = "sorry button behavior not yet defined or there was an error with the defined behavior";


export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        
        // handle commands
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction);
        }
        
        // handle buttons
        else if(interaction.isButton()) {
            await handleButtonPress(client, interaction);
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

const handleButtonPress = async (client: Client, interaction: ButtonInteraction) => {
    
    // find button functionality in list
    const buttonFunction = buttonFunctions[interaction.customId];
    
    // try to execute it. If it doesnt work let the user know
    try {
        buttonFunction(client, interaction);
    }
    catch (error: any) {
        console.log(error);
        await interaction.reply({
            ephemeral: true,
            content: BUTTON_FUNCTION_NOT_FOUND_MESSAGE
        });
        return;
    }

};

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript