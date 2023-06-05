import { ActionRowBuilder, ButtonBuilder, ButtonComponentData, EmbedBuilder, EmbedData, Message, MessageCreateOptions } from "discord.js";

export class Menu {
    
    embed: EmbedBuilder;
    buttons: ButtonBuilder[];
    
    buttonRow: ActionRowBuilder<ButtonBuilder>;
    //buttonRows: ActionRowBuilder[];

    constructor(embedData: EmbedData, buttonData?: Partial<ButtonComponentData>[]) {
        // embed
        this.embed = new EmbedBuilder(embedData)

        // buttons
        this.buttons = [];
        if(buttonData) {
            buttonData.forEach( item => {
                const newButton = new ButtonBuilder(item);
                this.buttons.push(newButton);
            });
        }

        this.buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(this.buttons.slice(0, 5))

        // button rows
        /*
        this.buttonRows = [];
        this.buttonRows.push(
            new ActionRowBuilder<ButtonBuilder>().addComponents(this.buttons.slice(0, 5))
        );
        */
    }

    getMenuMessageOptions():MessageCreateOptions {
        return {
            embeds: [this.embed],
            components: [this.buttonRow]
        }
    }

}