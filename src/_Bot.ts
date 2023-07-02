import { Client, GatewayIntentBits, Partials } from "discord.js";
import mongoose, { ConnectOptions } from "mongoose";
import commandListener from "./listeners/InteractionListener";
import onlineLogger from "./listeners/ReadyListener";
import messageListener from "./listeners/MessageCreate"
import { DISCORD_TOKEN, MONGODB_SRV } from "./secret";

main();

async function main() {

    console.log("Bot is starting...");

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessageReactions,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.DirectMessages,
        ],
        partials: [
            Partials.Channel //not really sure what this is but it's needed for the bot to recognize when it recieves a DM for some reason
        ]
    });

    console.log("Attempting to connect to the database...");
    await mongoose.connect(
        MONGODB_SRV, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as ConnectOptions
    ).then(()=>{
        console.log("Successfully connected to the database!")
    }).catch((err: Error) => {
        console.log(err);
    });

    addListeners(client);

    client.login(DISCORD_TOKEN);
}

function addListeners(client: Client) {
    console.log("adding listeners...");
    onlineLogger(client);
    commandListener(client);
    messageListener(client);
    console.log("listeners added!");
}

//some code taken from https://sabe.io/tutorials/how-to-build-discord-bot-typescript