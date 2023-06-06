const { REST, Routes } = require('discord.js');
import { DISCORD_TOKEN, CLIENT_ID, NAZIM_TEST_SERVER_ID, MY_SERVER_ID } from "../../secret";
import { commandList } from "./data.CommandList";


// CONSTANT
const rest = new REST().setToken(DISCORD_TOKEN);

// MAIN CALL
main(process.argv[2], process.argv[3]);

// HELPER FUNCTIONS
function main(action: string, server: string) {
    if(action === "register") {
        switch(server) { 
            case "global": { 
                registerAllCommandsToGlobal();
                break; 
            } 
            case "nazim": { 
                registerAllCommandsToNazim();
               break; 
            } 
            case "ydna": {
                registerAllCommandsToYdna();
                break;
            }
            default: { 
                console.warn("WARNING: Server parameter of command registration was invalid. Nothing was executed");
                break; 
            } 
         } 
    }
    else if (action === "unregister") {
        switch(server) { 
            case "global": { 
                unregisterAllCommandsGlobal(); 
                break; 
            } 
            case "nazim": { 
                unregisterAllCommandsNazim();
                break; 
            } 
            case "ydna": {
                unregisterAllCommandsYdna();
                break;
            }
            default: { 
                console.warn("WARNING: Server parameter of command registration was invalid. Nothing was executed");
                break; 
            } 
         } 
    }
}

// Register commands to ydna's server
function registerAllCommandsToGlobal() {
    rest.put(Routes.applicationCommands(CLIENT_ID), { body: commandList })
    .then(() => console.log('Successfully registered all application commands to global'))
    .catch(console.error);
}

// Register commands to Nazim's server
function registerAllCommandsToNazim() {
    rest.put(Routes.applicationCommands(CLIENT_ID, NAZIM_TEST_SERVER_ID), { body: commandList })
	.then(() => console.log('Successfully registered all application commands to Nazim\'s Server'))
	.catch(console.error);
}

// Register commands to ydna's server
function registerAllCommandsToYdna() {
    rest.put(Routes.applicationCommands(CLIENT_ID, MY_SERVER_ID), { body: commandList })
    .then(() => console.log('Successfully registered all application commands to ydna\'s Server'))
    .catch(console.error);
}

// Unregister all global commands
function unregisterAllCommandsGlobal() {
    rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands from global'))
	.catch(console.error);
}

// Unregister all Nazim's server commands
function unregisterAllCommandsNazim() {
    rest.put(Routes.applicationCommands(CLIENT_ID, NAZIM_TEST_SERVER_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands from Nazim\'s server'))
	.catch(console.error);
}

// Unregister all ydna's server commands
function unregisterAllCommandsYdna() {
    rest.put(Routes.applicationCommands(CLIENT_ID, MY_SERVER_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands from ydna\'s server'))
	.catch(console.error);
}

// Some code taken from https://discordjs.guide/slash-commands/deleting-commands.html#deleting-specific-commands