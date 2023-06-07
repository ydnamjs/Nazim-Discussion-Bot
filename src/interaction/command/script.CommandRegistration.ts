import { Client, GatewayIntentBits, Partials } from "discord.js";
import { DISCORD_TOKEN, NAZIM_TEST_SERVER_ID, MY_SERVER_ID } from "../../secret";
import { commandList } from "./data.CommandList";

// MAIN CALL
main(process.argv[2], process.argv[3]);

async function main(action: string, server: string) {

    // TODO: some of the stuff here can probably be removed. Not super urgent but if you have free time its something to do
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
        ],
        partials: [
            //not really sure what this is but it's needed for the bot to recognize when it recieves a DM for some reason
            Partials.Channel
        ]
    });
    
    client.on("ready", async () => {
        if (client.user && client.application) {
        
            if(action === "register") {
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
            else if (action === "unregister") {
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
        }
    });

    client.login(DISCORD_TOKEN);   
}