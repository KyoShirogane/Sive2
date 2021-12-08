import { Pagination } from "@discordx/utilities";
import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import api from "../../configs/api/index.js";
import {
  convertDate,
  getAvatarUrl,
  getCardBody,
  handleErrorMessage,
} from "../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive", "SIVE K-Pop Card Game", {
  card: "Card Related Commands for Card Game",
})
class CardCommand {
  @SlashGroup("card")
  @Slash("list")
  async displayCard(
    @SlashOption("search", {
      description: "Search Key for idol name, idol group and nationality",
      required: false,
    })
    key: string,

    @SlashOption("rarity", {
      description: "Rarity Level of cards searched - Between 1 to 5",
      required: false,
    })
    rarity: string,
    interaction: CommandInteraction
  ): Promise<void> {
    try {
      var url;
      var response;
      var body;

      if (rarity === undefined) {
        body = {
          discordId: `${interaction.user.id}`,
          sort: 0,
        };
      } else {
        body = {
          discordId: `${interaction.user.id}`,
          rarity: rarity,
          sort: 0,
        };
      }

      if (key === undefined) {
        url = `${api.card}?page=0&size=9`;
      } else {
        url = `${api.card}?page=0&size=9&key=${key}`;
      }

      response = await axios.post(url, body);

      const data = response?.data;

      const embeds = [];

      var embedBuilder = new MessageEmbed()
        .setAuthor(`${interaction.user.username} Cards`)
        .setColor("GOLD");

      data.content.forEach(
        (e: { locked: boolean; ownerId: string; cardId: string }) => {
          var lock = e.locked === true ? "🔒" : "";
          embedBuilder.addField(
            `${lock} Card ID - ${e.cardId}`,
            getCardBody(e),
            false
          );
        }
      );

      embeds.push(embedBuilder);

      for (var i = 1; i < data.totalPages; i++) {
        if (key === undefined) {
          url = `${api.card}?page=${i}&size=9`;
        } else {
          url = `${api.card}?page=${i}&size=9&key=${key}`;
        }

        var tempResponse = await axios.post(url, body);

        const tempData = tempResponse?.data;

        var tempEmbed = new MessageEmbed()
          .setAuthor(`${interaction.user.username} Cards`)
          .setColor("GOLD")
          .setFooter(`Page ${i + 1} of ${data.totalPages}`);

        tempData.content.forEach(
          (e: { locked: boolean; ownerId: string; cardId: string }) => {
            var lock = e.locked === true ? "🔒" : "";

            tempEmbed.addField(
              `${lock} Card ID - ${e.cardId}`,
              getCardBody(e),
              false
            );
          }
        );

        embeds.push(tempEmbed);
      }

      const pagination = new Pagination(interaction, embeds);
      await pagination.send();
    } catch (error) {
      console.log(error);
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("view")
  async viewCard(
    @SlashOption("id", {
      description: "ID of the card",
      required: true,
    })
    id: number,
    interaction: CommandInteraction
  ) {
    try {
      const embedBuilder = new MessageEmbed();

      var response = await axios.post(`${api.card}/${id}`);
      var owner = await interaction.client.users.fetch(response.data.ownerId);

      if (owner === interaction.client.user) {
        embedBuilder.setTitle(`***** IN MARKET *****`);
      } else {
        embedBuilder.setTitle(`Owned By ${owner.tag}`);
      }

      var lock = response.data.locked === true ? "🔒" : "";
      var eraName =
        response.data.imageName != null
          ? "\n*****" + response.data.imageName + "*****\n"
          : "";
      var thumbnail =
        response.data.imageUrl != null
          ? response.data.imageUrl
          : getAvatarUrl(
              interaction.client.user?.id,
              interaction.client.user?.avatar
            );

      embedBuilder.setAuthor(
        `${lock}[${response.data.cardId}] ${response.data.fullName} - ${response.data.stageName}`
      );
      embedBuilder.setColor(`#${response.data.cardColor.replaceAll("#", "")}`);
      embedBuilder.setImage(thumbnail);
      embedBuilder.addField(
        response.data.serialNumber,
        response.data.rarity,
        false
      );
      embedBuilder.addField("Hangul", response.data.koreanName, false);
      embedBuilder.addField("Group Name", response.data.groupName, false);

      if (response.data.imageName != null) {
        embedBuilder.addField("Card Name", eraName, false);
      }

      embedBuilder.addField("Vocal", response.data.vocalStats.toString(), true);
      embedBuilder.addField("Rap", response.data.rapStats.toString(), true);
      embedBuilder.addField("Dance", response.data.danceStats.toString(), true);
      embedBuilder.setFooter(
        `Obtained At: ${convertDate(response.data.createdAt)}`,
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      );

      interaction.reply({
        embeds: [embedBuilder],
      });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("lock")
  async lockCard(
    @SlashOption("id", {
      description: "ID of the card",
      required: true,
    })
    id: number,
    interaction: CommandInteraction
  ) {
    const embedBuilder = new MessageEmbed();

    try {
      let body = {
        discordId: interaction.user.id,
        cardId: id,
      };

      var response = await axios.post(`${api.card}/lock`, body);

      var owner = await interaction.client.users.fetch(response.data.ownerId);

      if (owner === interaction.client.user) {
        embedBuilder.setTitle(`***** IN MARKET *****`);
      } else {
        embedBuilder.setTitle(`Owned By ${owner.tag}`);
      }

      var lock = response.data.locked === true ? "🔒" : "";
      var eraName =
        response.data.imageName != null
          ? "\n*****" + response.data.imageName + "*****\n"
          : "";
      var thumbnail =
        response.data.imageUrl != null
          ? response.data.imageUrl
          : getAvatarUrl(
              interaction.client.user?.id,
              interaction.client.user?.avatar
            );

      embedBuilder.setAuthor(
        `${lock}[${response.data.cardId}] ${response.data.fullName} - ${response.data.stageName}`
      );
      embedBuilder.setColor(`#${response.data.cardColor.replaceAll("#", "")}`);
      embedBuilder.setImage(thumbnail);
      embedBuilder.addField(
        response.data.serialNumber,
        response.data.rarity,
        false
      );
      embedBuilder.addField("Hangul", response.data.koreanName, false);
      embedBuilder.addField("Group Name", response.data.groupName, false);

      if (response.data.imageName != null) {
        embedBuilder.addField("Card Name", eraName, false);
      }

      embedBuilder.addField("Vocal", response.data.vocalStats.toString(), true);
      embedBuilder.addField("Rap", response.data.rapStats.toString(), true);
      embedBuilder.addField("Dance", response.data.danceStats.toString(), true);
      embedBuilder.setFooter(
        response.data.locked
          ? `Card Is Successfully Locked`
          : `Card Is Unlocked`,
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      );

      interaction.reply({ embeds: [embedBuilder], ephemeral: true });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("summon")
  async summonCard(
    @SlashOption("amount", {
      description: "Amount of cards to summon (Uses Ticket)",
      required: true,
    })
    amount: number,
    @SlashOption("private", {
      description:
        "This Flag indicate whether you want to send it privately or not",
      required: false,
    })
    hidden: boolean,
    @SlashOption("rarity", {
      description:
        "If being included it will uses the ticket according to the rarity level",
      required: false,
    })
    rarity: number,
    interaction: CommandInteraction
  ) {
    try {
      var url;

      if (rarity === undefined) {
        url = `${api.game}/inventory/summon`;
      } else {
        url = `${api.game}/inventory/summon/${rarity}`;
      }

      let body = {
        amount: amount,
        discordId: interaction.user.id,
      };

      var response = await axios.post(url, body);

      const data = response?.data;

      const embedBuilder = new MessageEmbed();

      data.forEach(
        (e: { locked: boolean; ownerId: string; cardId: string }) => {
          var lock = e.locked === true ? "🔒" : "";
          embedBuilder.addField(
            `${lock} Card ID - ${e.cardId}`,
            getCardBody(e),
            false
          );
        }
      );

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
