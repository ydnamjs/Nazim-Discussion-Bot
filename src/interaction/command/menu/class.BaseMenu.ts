import { BaseInteraction, Client, EmbedBuilder, Message, MessageCreateOptions } from "discord.js";
import { ComponentBehavior, MenuData } from "./interface.MenuData";

export class BaseMenu {

// MENU MESSAGING

    // message data member
    // object that is used to construct a message that shows the visual aspect of the menu to be sent to a user as a direct message
    menuMessageData: MessageCreateOptions;

    // sends the menu to the user specified's DM's and returns the message sent
    async send(client: Client, interaction: BaseInteraction): Promise<Message<false>> {
        const sentMenuMessage = await interaction.user.send(this.menuMessageData);
        //this.collectButtonInteraction(client, interaction, sentMenuMessage)
        return sentMenuMessage;
    }

// BUTTON BEHAVIOR

    private static MENU_EXPIRTATION_MESSAGE = "Your discussion menu expired due to inactivity";
    private static MENU_EXPIRATION_TIME = 5_000;

    buttonBehaviors: ComponentBehavior[];

    async collectButtonInteraction(client: Client, interaction: BaseInteraction, message: Message ): Promise<void> {
        try {

            // Filter function that checks if id of the button clicker matches the id of the menu reciever (should always be that way since DM but just in case)
            const collectorFilter = (i: BaseInteraction) => i.user.id === interaction.user.id;

            // Get the button that was pressed if one was pressed before menu expires
            const buttonPressed = await message.awaitMessageComponent( {filter: collectorFilter, time: BaseMenu.MENU_EXPIRATION_TIME } );

            // For every button behavior, if the check function returns true, execute the resulting action
            this.buttonBehaviors.forEach( (behavior: ComponentBehavior) => {
                if(behavior.filter(buttonPressed.customId)) {
                    behavior.resultingAction(client, interaction, message, buttonPressed);
                }
            })
        }
        catch (error: any) {

            // if the collector expired, delete the menu and notify the user that it expired
            // TODO: I feel like theres a better way to do this but it will work for now
            if(error.toString().includes("Collector received no interactions before ending with reason: time")) {
                message.delete()
                interaction.user.send(BaseMenu.MENU_EXPIRTATION_MESSAGE);
            }
        }
    }

    constructor(menuData: MenuData) {
        const menuEmbed = new EmbedBuilder({
            title: menuData.title,
            description: menuData.description,
            fields: menuData.fields
        });

         // if additional components were supplied, add those to
        let menuComponents = menuData.additionalComponents;

        // construct the menuMessageData to be sent to the user
        this.menuMessageData = { 
            embeds: [menuEmbed],
            components: menuComponents
        }

        this.buttonBehaviors = [];
        if(menuData.additionalButtonBehaviors) {
            this.buttonBehaviors = menuData.additionalButtonBehaviors;
        }
    }
}