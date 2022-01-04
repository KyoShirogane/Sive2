import { Pagination } from "@discordx/utilities";
import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import api from "../../configs/api/index.js";
import {
  getAvatarUrl,
  handleErrorMessage,
} from "../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive", "SIVE K-Pop Card Game", {
  game: "Game Commands",
  general: "General Commands",
})
class GeneralCommands {
  @SlashGroup(`general`)
  @Slash("bot-info", { description: "Bot Information" })
  async info(interaction: CommandInteraction) {
    const owner = await interaction.client.users.fetch(`297962724191895552`);

    const embedBuilder = new MessageEmbed()
      .setThumbnail(
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      )
      .setColor(`GOLD`);

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

  // @SlashGroup(`general`)
  // @Slash("server-info", { description: "Current Server Information" })
  // async serverInfo(interaction: CommandInteraction) {
  //   const embedBuilder = new MessageEmbed()
  //     .setThumbnail(
  //       getAvatarUrl(
  //         interaction.client.user?.id,
  //         interaction.client.user?.avatar
  //       )
  //     )
  //     .setColor(`GOLD`);
  //   const owner = await interaction.guild?.fetchOwner();

  //   if (interaction.guild?.bannerURL() !== null) {
  //     embedBuilder.setImage(interaction.guild?.bannerURL()!);
  //   }

  //   if (interaction.guild?.iconURL() !== null) {
  //     embedBuilder.setThumbnail(interaction.guild?.iconURL()!);
  //   }
  //   embedBuilder.setAuthor(`${interaction.guild?.name.toUpperCase()}`);
  //   embedBuilder.setTitle(`Server Information`);
  //   embedBuilder.setColor(`GOLD`);
  //   embedBuilder.setDescription(`Owned By ${owner?.displayName}`);
  //   embedBuilder.addField(`Created At`, `${interaction.guild?.createdAt}`);
  //   embedBuilder.addField(`Member Counts`, `${interaction.guild?.memberCount}`);
  //   embedBuilder.addField(
  //     `Text Channels`,
  //     `${
  //       interaction.guild?.channels.cache.filter((c) => c.type === "GUILD_TEXT")
  //         .size
  //     }`
  //   );
  //   embedBuilder.addField(
  //     `Voice Channels`,
  //     `${
  //       interaction.guild?.channels.cache.filter(
  //         (c) => c.type === "GUILD_VOICE"
  //       ).size
  //     }`
  //   );
  //   embedBuilder.addField(`Emotes`, `${interaction.guild?.emojis.cache.size}`);
  //   embedBuilder.addField(`Roles`, `${interaction.guild?.roles.cache.size}`);
  //   embedBuilder.setFooter(
  //     `Requested By ${interaction.user.username.toUpperCase()}`
  //   );

  //   interaction.reply({ embeds: [embedBuilder] });
  // }

  @SlashGroup(`game`)
  @Slash("help", { description: "Game Information" })
  async gameHelp(interaction: CommandInteraction): Promise<void> {
    try {
      let embeds = [];

      const response = await axios.get(`${api.help}`);

      var data = response?.data;

      const introEmbed = new MessageEmbed()
        .setAuthor(`${data.title}`)
        .setTitle(`${data.subTitle}`)
        .setDescription(`${data.description}`)
        .setColor(`GOLD`)
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

      for (var i = 0; i < data.guidelines.length; i++) {
        introEmbed.addField(
          `Page ${i + 1} - ${data.guidelines[i].title}`,
          `${data.guidelines[i].description}`,
          false
        );
      }

      embeds.push(introEmbed);

      for (var i = 0; i < data.guidelines.length; i++) {
        var guideline = data.guidelines[i];

        const tempEmbed = new MessageEmbed()
          .setAuthor(`${guideline.title}`)
          .setTitle(`${guideline.description}`)
          .setColor(`GOLD`)
          .setThumbnail(
            getAvatarUrl(
              interaction.client.user?.id,
              interaction.client.user?.avatar
            )
          )
          .setDescription(`Commands:`);

        guideline.helps.forEach((e: { command: any; usage: any }) => {
          tempEmbed.addField(`${e.command}`, `${e.usage}`, false);
        });

        embeds.push(tempEmbed);
      }

      const pagination = new Pagination(interaction, embeds);
      await pagination.send();
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup(`game`)
  @Slash("leaderboard", { description: "Ranking of top earner in SIVE" })
  async leaderboard(interaction: CommandInteraction) {
    try {
      const response = await axios.get(`${api.leaderboard}/balance`);

      var data = response?.data;

      const embedBuilder = new MessageEmbed()
        .setAuthor(`Global Leaderboard of SIVE`)
        .setTitle(`SIVE Top Earners`)
        .setDescription(`Top Players who have the most money on SIVE`)
        .setColor(`GOLD`);

      for await (const e of data) {
        var player = await interaction.client.users.fetch(e.discordId);

        embedBuilder.addField(
          `[${e.rank}] ${player.username} (${player.tag})`,
          `Current Balance: ${e.balance}`,
          false
        );
      }

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup(`game`)
  @Slash("redeem", { description: "Redeem code to earn rewards in SIVE" })
  async redeemCode(
    @SlashOption("code", {
      description: "Redeem Code to redeem",
      required: true,
    })
    code: string,
    interaction: CommandInteraction
  ) {
    var maskedCode = `${code.slice(-3)}`;
    try {
      let body = {
        code: code,
        discordId: interaction.user.id,
      };
      const response = await axios.post(`${api.game}/redeem`, body);
      var data = response?.data;

      var embedBuilder = new MessageEmbed()
        .setAuthor(`Successfully Redeemed A Code`)
        .setTitle(`You Have Redeemed Code [*****${maskedCode}]`)
        .setDescription(`You Gained ${data.balance}$`)
        .setColor(`GOLD`)
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

      data.prizes.forEach((e: { qty: any; name: any; description: any }) => {
        embedBuilder.addField(
          `**${e.qty}X ${e.name}**`,
          `${e.description}`,
          false
        );
      });

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
