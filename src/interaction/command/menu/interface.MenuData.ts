import { ActionRowBuilder, ButtonBuilder, BaseInteraction, Client, Message, MessageComponentInteraction } from "discord.js";

const MAX_ADDITIONAL_COMPONENT_ROWS = 4; // The maximum amount of component rows that can be added to a menu. Discord allows at most 5 action rows in a message as of 06/06/2023 and the menu class uses one for navigation buttons

declare const validComponentMenuArray: unique symbol; // I'm gonna be honest. I dont fully understand what this does but you needed for making a branded type

// MenuComponentArray is essentially just an array of ActionRowBuilders with a limit on the length which is defined above as a constant
// I learned about it from https://evertpot.com/opaque-ts-types/
// I know it says opagque type but some people insist that it really is a branded type and the quick search I did revealed one article that required a membership to read everything else had to do with marketing
// but I'm digressing. The important thing you need to know is that you have to call the function assertValidComponentMenuArray(variable) when you declare a variable of this type
// and because of the design of that function it will throw an error if you violate a property (in this case the length of the array exceeding a certain limit)
// so if you define a variable and call that function on it and the program is continuing to run, you know it didnt violate that property since other wise an error would have been thrown
export type menuComponentArray = ActionRowBuilder<ButtonBuilder>[] & { 
    [validComponentMenuArray]: true
}

// this function essentially makes sure that the array of ActionRowBuilders has a length less than the max defined above
// if that isnt the case then the program has an error thrown making it pretty hard to keep going
// see the compont above explaing type menuComponentArray for why this is useful
export function assertValidComponentMenuArray(input: ActionRowBuilder<ButtonBuilder>[]): asserts input is menuComponentArray {
    if (input.length > MAX_ADDITIONAL_COMPONENT_ROWS) {
        throw new Error("Menu Component Array had too many elements\n" + input.toString);
    }
}

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
    additionalComponents?: menuComponentArray, // InteractionComponent rows that follow the embed in the menu 
    additionalButtonBehaviors?: ComponentBehavior[], // 
}