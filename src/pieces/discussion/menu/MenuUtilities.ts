import { ActionRowBuilder, EmbedBuilder, Message, MessageCreateOptions, User } from "discord.js";
import { sendDismissableReply } from "../../../generalUtilities/DismissableMessage";
import { ComponentBehavior } from "../../../pieces/menu/BaseMenu";

export async function sendMenu(user: User, menuData: MenuCreationData, componentBehaviors: ComponentBehavior[]): Promise<Message> {
    const menuMessageData = CreateMenuMessageData(menuData);
    const sentMenuMessage = await user.send(menuMessageData);
    CollectMenuInteraction(sentMenuMessage, componentBehaviors)
    return sentMenuMessage;
}

export const MAX_NUMBER_OF_COMPONENT_ROWS = 5; 
const MAX_COMPONENT_ROWS_EXCEEDED_ERROR = "ERROR: TRIED TO CREATE A MENU WITH MORE COMPONENT ROWS THAN ALLOWED";

function CreateMenuMessageData(menuData: MenuCreationData): MessageCreateOptions {

    if(menuData.components && menuData.components.length > MAX_NUMBER_OF_COMPONENT_ROWS) {
        // TODO: Should this be an error or an exception? Should it even exist?
        throw new Error(MAX_COMPONENT_ROWS_EXCEEDED_ERROR);
    }

    const menuEmbed = new EmbedBuilder({
        title: menuData.title,
        description: menuData.description,
        fields: menuData.fields
    });

    const newMenu = { 
        embeds: [menuEmbed],
        components: menuData.components
    }

    return newMenu;
}

interface MenuCreationData {
    title: string,
    description: string,
    fields: {name: string, value: string}[],
    components?: ActionRowBuilder<any>[] //ButtonBuilder | StringSelectMenuBuilder
}

const COLLECTOR_EXPIRATION_MESSAGE = "Collector received no interactions before ending with reason: time";
const MENU_EXPIRTATION_NOTIFICATION = "Your discussion menu expired due to inactivity";
const MENU_EXPIRATION_TIME = 600_000;

async function CollectMenuInteraction(message: Message, componentBehaviors: ComponentBehavior[]): Promise<void> {

    try {
        const componentUsed = await message.awaitMessageComponent({time: MENU_EXPIRATION_TIME});

        componentBehaviors.forEach( (behavior: ComponentBehavior) => {
            if(behavior.filter(componentUsed.customId)) {
                behavior.resultingAction(componentUsed);
            }
        })
    }
    catch (error: any) {

        // TODO: I feel like theres a better way to do this but it will work for now
        if(error.toString().includes(COLLECTOR_EXPIRATION_MESSAGE)) {

            //TODO: removing await causes error but leaving it means the menu isnt deleted until the dissmissable reply expires
            // we need to make a custom function to reply, delete the menu, and then collect the dismiss button
            await sendDismissableReply(message, MENU_EXPIRTATION_NOTIFICATION)
            message.delete()
        }
    }
}