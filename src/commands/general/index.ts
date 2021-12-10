import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";
import { getAvatarUrl } from "../../utilities/helper/index.js";

@Discord()
class GeneralCommands {
  @Slash("bot-info", { description: "Bot Information" })
  async info(interaction: CommandInteraction) {
    const owner = await interaction.client.users.fetch(`297962724191895552`);

    const embedBuilder = new MessageEmbed();

    embedBuilder.setAuthor(`SIVE Bot`);
    embedBuilder.setTitle(`Bot Information`);
    embedBuilder.setColor(`GOLD`);
    embedBuilder.setImage(
      getAvatarUrl(interaction.client.user?.id, interaction.client.user?.avatar)
    );
    embedBuilder.setDescription(
      `Card K-Pop Bot created using Discordx and Spring Framework.`
    );
    embedBuilder.addField(`Created By`, `${owner.tag}`);
    embedBuilder.addField(`Node Version`, `${process.versions.node}`);
    embedBuilder.addField(`API Version`, `2.1.5`);
    embedBuilder.setFooter(
      `Requested By ${interaction.user.username.toUpperCase()}`
    );

    interaction.reply({ embeds: [embedBuilder] });
  }

  @Slash("server-info", { description: "Current Server Information" })
  async serverInfo(interaction: CommandInteraction) {
    const embedBuilder = new MessageEmbed();
    const owner = await interaction.guild?.fetchOwner();

    if (interaction.guild?.bannerURL() !== null) {
      embedBuilder.setImage(interaction.guild?.bannerURL()!);
    }

    if (interaction.guild?.iconURL() !== null) {
      embedBuilder.setThumbnail(interaction.guild?.iconURL()!);
    }
    embedBuilder.setAuthor(`${interaction.guild?.name.toUpperCase()}`);
    embedBuilder.setTitle(`Server Information`);
    embedBuilder.setColor(`GOLD`);
    embedBuilder.setDescription(`Owned By ${owner?.displayName}`);
    embedBuilder.addField(`Created At`, `${interaction.guild?.createdAt}`);
    embedBuilder.addField(`Member Counts`, `${interaction.guild?.memberCount}`);
    embedBuilder.addField(
      `Text Channels`,
      `${
        interaction.guild?.channels.cache.filter((c) => c.type === "GUILD_TEXT")
          .size
      }`
    );
    embedBuilder.addField(
      `Voice Channels`,
      `${
        interaction.guild?.channels.cache.filter(
          (c) => c.type === "GUILD_VOICE"
        ).size
      }`
    );
    embedBuilder.addField(`Emotes`, `${interaction.guild?.emojis.cache.size}`);
    embedBuilder.addField(`Roles`, `${interaction.guild?.roles.cache.size}`);
    embedBuilder.setFooter(
      `Requested By ${interaction.user.username.toUpperCase()}`
    );

    interaction.reply({ embeds: [embedBuilder] });
  }
}
