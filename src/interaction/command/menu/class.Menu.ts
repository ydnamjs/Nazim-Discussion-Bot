import { EmbedBuilder, Message, MessageCreateOptions, User } from "discord.js";
import { MenuData } from "./interface.MenuData";

// MENU CLASS
export class BaseMenu {

    menu: MessageCreateOptions;

    constructor(menuData: MenuData) {
        const menuEmbed = new EmbedBuilder({
            title: menuData.title,
            description: menuData.description,
            fields: menuData.fields
        });

        this.menu = { 
            embeds: [menuEmbed],
        }
    }

    // sends the menu to the user specified's DM's and returns the message sent
    async send(user: User): Promise<Message<false>> {
        const sentMenuMessage = await user.send(this.menu);
        return sentMenuMessage;
    }

}