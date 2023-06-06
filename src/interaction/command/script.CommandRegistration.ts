const { REST, Routes } = require('discord.js');
import { DISCORD_TOKEN, CLIENT_ID, NAZIM_TEST_SERVER_ID, MY_SERVER_ID } from "../../secret";
import { CommandList } from "./data.CommandList";


// CONSTANT
const rest = new REST().setToken(DISCORD_TOKEN);

// MAIN CALL
main(process.argv[2], process.argv[3]);

// HELPER FUNCTIONS
function main(action: string, server: string) {
    if(action === "register") {
        switch(server) { 
            case "global": { 
                console.warn("Command Registration command not yet implemented");
               break; 
            } 
            case "nazim": { 
                registerAllCommandsToNazim() 
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
                unregisterAllGlobalCommands(); 
                break; 
            } 
            case "nazim": { 
                console.warn("Command Registration command not yet implemented");
                break; 
            } 
            case "ydna": {
                console.warn("Command Registration command not yet implemented");
                break;
            }
            default: { 
               console.warn("WARNING: Server parameter of command registration was invalid. Nothing was executed");
               break; 
            } 
         } 
    }
}


// Unregister all global commands
function unregisterAllGlobalCommands() {
    rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] })
	.then(() => console.log('Successfully deleted all application commands.'))
	.catch(console.error);
}

// Register commands to ydna's server
function registerAllCommandsToYdna() {
    rest.put(Routes.applicationCommands(CLIENT_ID, MY_SERVER_ID), { body: CommandList })
    .then(() => console.log('Successfully registered all application commands.'))
    .catch(console.error);
}

// Register commands to Nazim's server
function registerAllCommandsToNazim() {
    rest.put(Routes.applicationCommands(CLIENT_ID, NAZIM_TEST_SERVER_ID), { body: CommandList })
	.then(() => console.log('Successfully registered all application commands.'))
	.catch(console.error);
}

// Some code taken from https://discordjs.guide/slash-commands/deleting-commands.html#deleting-specific-commands