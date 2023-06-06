const { REST, Routes } = require('discord.js');
import { DISCORD_TOKEN, CLIENT_ID } from "../secret";

const rest = new REST().setToken(DISCORD_TOKEN);

// delete all global commands
rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);

// code taken from https://discordjs.guide/slash-commands/deleting-commands.html#deleting-specific-commands