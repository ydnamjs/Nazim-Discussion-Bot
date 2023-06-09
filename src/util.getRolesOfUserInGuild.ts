import { BaseInteraction, Guild } from "discord.js";
import { ROLES_GUILD } from "./secret";

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