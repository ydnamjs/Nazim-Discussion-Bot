import { BaseInteraction, Guild, User } from "discord.js";
import { ROLES_GUILD } from "../secret";

export async function getRolesOfUserInGuild(interaction: BaseInteraction) {
    
    const guild = interaction.client.guilds.cache.get(ROLES_GUILD) as Guild;
    
    if( await guild.members.fetch(interaction.user)) {
        const roles = ((await guild.members.fetch(interaction.user)).roles.cache).keys();
        if (roles) {
            return [...roles];
        }
    }
    return [];
}

export async function userHasRoleWithId(user: User, role: string) {
    // get the guild that we are checking the users role of
    const guild = user.client.guilds.cache.get(ROLES_GUILD) as Guild;

    // if the user is a member
    if( await guild.members.fetch(user)) {
        
        // get their roles and return if they have the specified role
        const roles = (await guild.members.fetch(user)).roles.cache;
        if (roles) {
            return roles.has(role);
        }
    }

    // if they arent a member return false
    return false;
}