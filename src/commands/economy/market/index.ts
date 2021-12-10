import { Pagination } from "@discordx/utilities";
import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import api from "../../../configs/api/index.js";
import {
  getAvatarUrl,
  getCardBody,
  handleErrorMessage,
} from "../../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive", "SIVE K-Pop Card Game", {
  market: "Shop Related Commands for Card Game",
})
class MarketCommand {
  @SlashGroup("market")
  @Slash("list", {description: "Display cards being sold on market"})
  async displayMarketItems(
    @SlashOption("search", {
      description: "Search Parameter",
      required: false,
    })
    key: string,
    interaction: CommandInteraction
  ): Promise<void> {
    try {
      var body;
      if (key === undefined) {
        body = {
          discordId: interaction.user.id,
        };
      } else {
        body = {
          discordId: interaction.user.id,
          key: key,
        };
      }

      const response = await axios.post(
        `${api.market}/items?page=0&size=10`,
        body
      );
      const data = response?.data;

      const embeds = [];

      const embedBuilder = new MessageEmbed().setColor("GOLD");

      if (data.numberOfElements === 0) {
        embedBuilder
          .setAuthor("No Cards Available On Market")
          .setDescription("Please Check Again Later")
          .setThumbnail(
            getAvatarUrl(
              interaction.client.user?.id,
              interaction.client.user?.avatar
            )
          );

        interaction.reply({ embeds: [embedBuilder] });
      } else {
        embedBuilder
          .setAuthor("Cards On Sale In Market")
          .setTitle(`To Buy Item here The ID is indicated inside the []`);
        data.content.forEach(
          (e: {
            id: any;
            locked: boolean;
            ownerId: string;
            cardId: string;
            discordId: string;
            card: any;
          }) => {
            var lock = e.card.locked === true ? "🔒" : "";
            embedBuilder.addField(
              `[${e.id}] ${lock} Card ID - ${e.card.cardId}`,
              getCardBody(e.card),
              false
            );
          }
        );

        embeds.push(embedBuilder);

        for (var i = 1; i < data.totalPages; i++) {
          const response = await axios.post(
            `${api.market}/items?page=${i}&size=10`,
            body
          );

          const data = response?.data;

          const tempEmbed = new MessageEmbed()
            .setColor("GOLD")
            .setAuthor("Cards On Sale In Market")
            .setTitle(`To Buy Item here The ID is indicated inside the []`);

          data.content.forEach(
            (e: {
              id: any;
              locked: boolean;
              ownerId: string;
              cardId: string;
              discordId: string;
              card: any;
            }) => {
              var lock = e.card.locked === true ? "🔒" : "";
              tempEmbed.addField(
                `[${e.id}] ${lock} Card ID - ${e.card.cardId}`,
                getCardBody(e.card),
                false
              );
            }
          );

          embeds.push(tempEmbed);
        }

        const pagination = new Pagination(interaction, embeds);
        await pagination.send();
      }
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("market")
  @Slash("my-listing", {description: "Display your market listing"})
  async listedMarketItems(
    @SlashOption("search", {
      description: "Search Parameter",
      required: false,
    })
    key: string,
    interaction: CommandInteraction
  ): Promise<void> {
    try {
      var body;
      if (key === undefined) {
        body = {
          discordId: interaction.user.id,
        };
      } else {
        body = {
          discordId: interaction.user.id,
          key: key,
        };
      }

      const response = await axios.post(
        `${api.market}/my-items?page=0&size=10`,
        body
      );
      const data = response?.data;

      const embeds = [];

      const embedBuilder = new MessageEmbed().setColor("GOLD");

      if (data.numberOfElements === 0) {
        embedBuilder
          .setAuthor("No Cards Available On Market")
          .setDescription("Please Check Again Later")
          .setThumbnail(
            getAvatarUrl(
              interaction.client.user?.id,
              interaction.client.user?.avatar
            )
          );

        interaction.reply({ embeds: [embedBuilder] });
      } else {
        embedBuilder
          .setAuthor("My Current Listing On Market")
          .setTitle(`If the item expired you can claim your items`);
        data.content.forEach(
          (e: {
            id: any;
            locked: boolean;
            ownerId: string;
            cardId: string;
            discordId: string;
            expiredDate: any;
            card: any;
          }) => {
            var lock = e.card.locked === true ? "🔒" : "";
            embedBuilder.addField(
              `[${e.id}] ${lock} Card ID - ${e.card.cardId}\n\nExpires In ${e.expiredDate}`,
              getCardBody(e.card),
              false
            );
          }
        );

        embeds.push(embedBuilder);

        for (var i = 1; i < data.totalPages; i++) {
          const response = await axios.post(
            `${api.market}/my-items?page=${i}&size=10`,
            body
          );

          const data = response?.data;

          const tempEmbed = new MessageEmbed()
            .setColor("GOLD")
            .setAuthor("Cards On Sale In Market")
            .setTitle(`To Buy Item here The ID is indicated inside the []`);

          data.content.forEach(
            (e: {
              id: any;
              locked: boolean;
              ownerId: string;
              cardId: string;
              discordId: string;
              expiredDate: any;
              card: any;
            }) => {
              var lock = e.card.locked === true ? "🔒" : "";
              tempEmbed.addField(
                `[${e.id}] ${lock} Card ID - ${e.card.cardId}\n\nExpires In ${e.expiredDate}`,
                getCardBody(e.card),
                false
              );
            }
          );

          embeds.push(tempEmbed);
        }

        const pagination = new Pagination(interaction, embeds);
        await pagination.send();
      }
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("market")
  @Slash("buy", {description: "Purchase card from the market"})
  async purchaseItem(
    @SlashOption("id", {
      description: "Item ID",
      required: true,
    })
    id: number,
    interaction: CommandInteraction
  ) {
    try {
      let body = {
        discordId: interaction.user.id,
        marketId: id,
      };

      await axios.post(`${api.market}/items/buy`, body);

      const embedBuilder = new MessageEmbed()
        .setAuthor(`Successfully Purchased Item`)
        .setTitle(`Check your inventory to see the items`)
        .setThumbnail(
          `${getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )}`
        )
        .setColor(`GOLD`);

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("market")
  @Slash("sell", {description: "List your item into the market"})
  async sellItem(
    @SlashOption("id", {
      description: "Card ID",
      required: true,
    })
    id: number,
    @SlashChoice("1 Hour", 1)
    @SlashChoice("6 Hours", 6)
    @SlashChoice("12 Hours", 12)
    @SlashChoice("24 Hours", 12)
    @SlashOption("duration", {
      description: "Duration of the card sale on the market",
      required: true,
    })
    duration: number,
    @SlashOption("price", {
      description: "Price of the card you are going to sell",
      required: true,
    })
    price: number,
    interaction: CommandInteraction
  ) {
    try {
      let body = {
        discordId: interaction.user.id,
        cardId: id,
        duration: 60 * duration,
        price: price,
      };

      await axios.post(`${api.market}/items/sell`, body);

      const embedBuilder = new MessageEmbed()
        .setAuthor(`Item Posted On Market`)
        .setTitle(
          `Check Your Listing Regularly To Check If It Has Been Expired`
        )
        .setDescription(
          `Your Card Has Been Posted On Market For ${price}$ And ${duration} Hours`
        )
        .setThumbnail(
          `${getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )}`
        )
        .setColor(`GOLD`);

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
