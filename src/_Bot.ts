import { Client, GatewayIntentBits, Partials } from "discord.js";
import { DISCORD_TOKEN, MONGODB_SRV } from "./secret";

//import event listeners
import commandListener from "./interaction/util.InteractionListener";
import onlineLogger from "./interaction/util.ReadyListener";

// TODO: converting this to an import disalows the useNewUrlParser option for some reason. When done with refactoring figure out if converting breaks it or not
//import database connection thing
const mongoose = require("mongoose");


// MAIN CALL
main();

/**
 * @function The main function of the entire project.
 * This is the actual running bot.
 */
async function main() {

    console.log("Bot is starting...");

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
        ],
        partials: [
            Partials.Channel //not really sure what this is but it's needed for the bot to recognize when it recieves a DM for some reason
        ]
    });

    //connect to database
    console.log("Attempting to connect to the database...");
    await mongoose.connect(
        MONGODB_SRV, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    ).then(()=>{
        console.log("Successfully connected to the database!")
    }).catch((err: Error) => {
        console.log(err);
    });

    // add the listeners to the client so that it can interact with the world
    addListeners(client);

    //log in to discord
    client.login(DISCORD_TOKEN);
}
    
//function that adds all of the event listeners from the listeners folder
/**
 * @function Adds event listeners to the given client
 * 
 * @param {Client} client - The client to add event listeners to
 * 
 * @note listeners are defined and imported from subfolder: "interaction"
 */
function addListeners(client: Client) {
    console.log("adding listeners...");
    onlineLogger(client);
    commandListener(client);
    console.log("listeners added!");
}

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript