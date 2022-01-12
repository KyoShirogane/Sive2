import { Guild } from "discord.js";
import { Discord, On } from "discordx";

@Discord()
export abstract class AppDiscord {
  // @On("guildCreate")
  // async onGuildCreate(guild: Guild){
  //   var owner = await guild.fetchOwner();

  //   console.log(`Joined New Guild - [${guild.id}] ${guild.name} \nGuild Owner: ${owner.user.tag}`)
  // }
}
