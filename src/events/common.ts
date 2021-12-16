import { Guild } from "discord.js";
import type { ArgsOf } from "discordx";
import { Discord, On, Client } from "discordx";

@Discord()
export abstract class AppDiscord {
  @On("messageDelete")
  onMessage([message]: ArgsOf<"messageDelete">, client: Client) {
    console.log("Message Deleted", client.user?.username, message.content);
  }

  @On("guildCreate")
  async onGuildCreate(guild: Guild){
    var owner = await guild.fetchOwner();

    console.log(`Joined New Guild - [${guild.id}] ${guild.name} \nGuild Owner: ${owner.user.tag}`)
  }
}
