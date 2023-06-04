import { CommandInteraction, Client, Interaction } from "discord.js";
import { CommandList } from "../CommandList";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand() || interaction.isContextMenuCommand()) {
            await handleSlashCommand(client, interaction);
        }
    });
};

const handleSlashCommand = async (client: Client, interaction: CommandInteraction): Promise<void> => {
    //find the command in the list
    const slashCommand = CommandList.find(c => c.name === interaction.commandName);

    //if it doesnt exist there is an error and we return
    if (!slashCommand) {
        interaction.followUp({ content: "Error: Command Not Found" });
        return;
    }

    //if the command does exist run the command
    await interaction.deferReply();
    slashCommand.run(client, interaction);
};

//code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript