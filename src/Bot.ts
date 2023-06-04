//secrets like database connection and discord token that are top secret and not put on github
import { DISCORD_TOKEN, MONGODB_SRV } from "./secret";

import { Client, GatewayIntentBits, Partials } from "discord.js";

//import event listeners
import interactionCreate from "./listeners/interactionCreate";
import ready from "./listeners/ready";

//import database connection thing
const mongoose = require("mongoose");

console.log("Bot is starting...");

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

//connect to database
console.log("Attempting to connect to the database...");
mongoose.connect(
    MONGODB_SRV, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(()=>{
    console.log("Successfully connected to the database!")
}).catch((err: Error) => {
    console.log(err);
});

addListeners();

//log in to discord
client.login(DISCORD_TOKEN);

//function that adds all of the event listeners from the listeners folder
function addListeners() {
    console.log("adding listeners...");
    ready(client);
    interactionCreate(client);
    console.log("listeners added!");
}

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript