import { Client, GatewayIntentBits, Partials } from "discord.js";
import { DISCORD_TOKEN, NAZIM_TEST_SERVER_ID, MY_SERVER_ID } from "../secret";
import { commandList } from "./CommandList";

// MAIN CALL
main(process.argv[2], process.argv[3]);

/**
 * @function
 * 
 * @param {string} action - The action to do 
 * - "reg" for registering 
 * - "unreg" for unregistering commands (deleting)
 * 
 * @param {string} server - The server to do the action for 
 * - "global" for all servers
 * - "nazim" for the nazim test server
 * - "ydna" for ydna's serer
 */
async function main(action: string, server: string) {

    const client = new Client({intents: []});
    
    client.on("ready", () => { handleAction(client, action, server) });

    client.login(DISCORD_TOKEN);   
}

async function handleAction(client: Client, action: string, server: string) {

    if(action === "register") {
        registerCommandsTo(client, server);
    }
    else if (action === "unregister") {
        unregisterCommandsFrom(client, server);
    }
}

async function registerCommandsTo(client: Client, server: string) {
    
    if (!client.application) {
        return
    }
    
    switch(server) { 
        case "global": { 
            await client.application.commands.set(commandList);
            console.log('Successfully registered all application commands to global');
            process.exit();
        } 
        case "nazim": { 
            await client.application.commands.set(commandList, NAZIM_TEST_SERVER_ID);
            console.log('Successfully registered all application commands to Nazim\'s server');
            process.exit();
        } 
        case "ydna": {
            await client.application.commands.set(commandList, MY_SERVER_ID);
            console.log('Successfully registered all application commands to ydna\'s server');
            process.exit();
        }
        default: { 
            console.warn("WARNING: Server parameter of command registration was invalid. Nothing was executed");
            process.exit();
        } 
    } 
}

async function unregisterCommandsFrom(client: Client, server: string) {
    
    if (!client.application) {
        return
    }
    
    switch(server) { 
        case "global": { 
            await client.application.commands.set([]);
            console.log('Successfully deleted all application commands from global');
            process.exit(); 
        } 
        case "nazim": { 
            await client.application.commands.set([], NAZIM_TEST_SERVER_ID);
            console.log('Successfully deleted all application commands from Nazim\'s server');
            process.exit(); 
        } 
        case "ydna": {
            await client.application.commands.set([], MY_SERVER_ID);
            console.log('Successfully deleted all application commands from ydna\'s server');
            process.exit(); 
        }
        default: { 
            console.warn("WARNING: Server parameter of command registration was invalid. Nothing was executed");
            process.exit();
        } 
    } 
}