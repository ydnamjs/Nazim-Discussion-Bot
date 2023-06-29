import { BaseInteraction, Client, Guild, User } from "discord.js";
import { ROLES_GUILD } from "../secret";

export async function getRolesOfUserInGuild(client: Client, user: User) {
    
    const guild = client.guilds.cache.get(ROLES_GUILD) as Guild;
    
    if( await guild.members.fetch(user)) {
        const roles = ((await guild.members.fetch(user)).roles.cache).keys();
        if (roles) {
            return [...roles];
        }
    }
    return [];
}

export async function userHasRoleWithId(user: User, role: string) {

    const guild = user.client.guilds.cache.get(ROLES_GUILD) as Guild;

    if( await guild.members.fetch(user)) {
        
        const roles = (await guild.members.fetch(user)).roles.cache;
        if (roles) {
            return roles.has(role);
        }
    }

    return false;
}