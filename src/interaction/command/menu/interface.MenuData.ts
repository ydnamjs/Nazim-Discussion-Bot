import { ActionRowBuilder, ButtonBuilder, BaseInteraction, Client, Message, MessageComponentInteraction } from "discord.js";

// interface that defines interaction component behavior in menus
// every interaction component has a custom id but no way to define functionality
// so we create collectors that fire when an interaction is recieved and then look at the custom id to determine the behavior
// this interface is really an object consisting of two functions: filter and resultingAction
// filter is meant to determine if the resulting action should fire and resultingAction is the behavior that is to be executed
// "why not just have filter be a string and define it later as check for if interaction.customID === filterString?" I hear you ask
// because then you cant specify patterns beyond an identical id.
// for example what if you wanted a function to fire for when the id was "page-1" "page-3" and "page-5" ...
// you could list every id from "page-1" to "page-99999" or...
// use the following function: (customId: string): boolean => { return ( (customId.substring(0, 5) === "page-") && (parseInt(customId.substring(5)) / 2 === 1)) }
export interface ComponentBehavior {
    filter: (customId: string) => boolean;
    resultingAction: ( client: Client, interaction: BaseInteraction, message: Message, componentInteraction: MessageComponentInteraction ) => void;
}

// interface that defines the input data for the menu class
// all of the complex behavior is defined and described in comments above
// after that it's just a regular old interface
export interface MenuData {
    title: string, // Title that appears in the embed portion of the menu
    description: string, // Description that appears in the embed portion of the menu
    fields: {name: string, value: string}[], // Fields that make up the embed
    components?: ActionRowBuilder<ButtonBuilder>[], // InteractionComponent rows that follow the embed in the menu 
    buttonBehaviors?: ComponentBehavior[], // Component Behavior list for buttons in the menu (see above for what this means)
}