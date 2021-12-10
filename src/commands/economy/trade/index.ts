import { Pagination } from "@discordx/utilities";
import axios from "axios";
import {
  CommandInteraction, MessageEmbed,
  User
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import api from "../../../configs/api/index.js";
import {
  getAvatarUrl,
  getSimpleCard,
  handleErrorMessage
} from "../../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive", "SIVE K-Pop Card Game", {
  trade: "Deck Related Commands for Card Game",
})
class TradeCommand {
  @SlashGroup("trade")
  @Slash("list", {description: "Display list of your trades"})
  async listTrade(
    @SlashChoice("Current Trade", 1)
    @SlashChoice("Trade History", 2)
    @SlashOption("type", {
      description: "Type of the list",
      required: true,
    })
    type: number,
    @SlashOption("size", {
      description: "Size of the data displayed {Default is 5}",
      required: false,
    })
    size: number,
    interaction: CommandInteraction
  ) {
    try {
      var url;
      var title;

      if (size === undefined) {
        size = 5;
      }
      if (type === 1) {
        url = `${api.tradelist}?discordId=${interaction.user.id}&page=0&size=${size}`;
        title = `${interaction.user.username} Ongoing Trade`;
      } else {
        url = `${api.tradelist}/history?discordId=${interaction.user.id}&page=0&size=${size}`;
        title = `${interaction.user.username} Trade History`;
      }

      const response = await axios.get(url);

      var data = response?.data;

      const embeds = [];

      var embedBuilder = new MessageEmbed().setAuthor(title).setColor("GOLD");

      if (data.totalElements === 0) {
        embedBuilder.setTitle(`No Ongoing Trade`);
        embedBuilder.setDescription(
          `Create a new one by using the slash command`
        );
        embedBuilder.setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

        interaction.reply({ embeds: [embedBuilder] });
      } else {
        for await (const e of data.content) {
          let playerCards: string[] = [];
          let oppositionCards: string[] = [];
          var status;

          var playerConfirmation = e.playerOffer.confirmation
            ? `Confirmed`
            : `Waiting For Confirmation`;
          var oppositionConfirmation = e.oppositionOffer.confirmation
            ? `Confirmed`
            : `Waiting For Confirmation`;
          var player = await interaction.client.users.fetch(
            e.playerOffer.playerId
          );
          var opposition = await interaction.client.users.fetch(
            e.oppositionOffer.playerId
          );

          e.playerOffer.cards.forEach((element: any) =>
            playerCards.push(getSimpleCard(element))
          );

          e.oppositionOffer.cards.forEach((element: any) =>
            oppositionCards.push(getSimpleCard(element))
          );

          if (e.status === "C") {
            status = `Trade Canceled`;
          } else if (e.status === "P") {
            status = `Trade Ongoing`;
          } else if (e.status === "S") {
            status = `Trade Successful`;
          } else {
            status = ``;
          }

          embedBuilder.addField(
            `[${e.tradeId}] - ${status} `,
            `${player.username.toUpperCase()} (${player.tag})\n${
              playerCards.length > 0
                ? playerCards.join("\n")
                : "```No Cards Offered```"
            }\n**${playerConfirmation}**\n\n${opposition.username.toUpperCase()} (${
              opposition.tag
            })\n${
              oppositionCards.length > 0
                ? oppositionCards.join("\n")
                : "```No Cards Offered```"
            }\n\n**${oppositionConfirmation}**\n`,
            false
          );
        }

        embeds.push(embedBuilder);

        for (var i = 1; i < data.totalPages; i++) {
          if (type === 1) {
            url = `${api.tradelist}?discordId=${interaction.user.id}&page=${i}&size=${size}`;
          } else {
            url = `${api.tradelist}/history?discordId=${interaction.user.id}&page=${i}&size=${size}`;
          }

          var tempResponse = await axios.get(url);

          var tempData = tempResponse?.data;

          var tempEmbed = new MessageEmbed()
            .setAuthor(title)
            .setColor("GOLD")

          for await (const e of tempData.content) {
            let playerCards: string[] = [];
            let oppositionCards: string[] = [];
            var status;

            var playerConfirmation = e.playerOffer.confirmation
              ? `Confirmed`
              : `Waiting For Confirmation`;
            var oppositionConfirmation = e.oppositionOffer.confirmation
              ? `Confirmed`
              : `Waiting For Confirmation`;
            var player = await interaction.client.users.fetch(
              e.playerOffer.playerId
            );
            var opposition = await interaction.client.users.fetch(
              e.oppositionOffer.playerId
            );

            e.playerOffer.cards.forEach((element: any) =>
              playerCards.push(getSimpleCard(element))
            );

            e.oppositionOffer.cards.forEach((element: any) =>
              oppositionCards.push(getSimpleCard(element))
            );

            if (e.status === "C") {
              status = `Trade Canceled`;
            } else if (e.status === "P") {
              status = `Trade Ongoing`;
            } else if (e.status === "S") {
              status = `Trade Successful`;
            } else {
              status = ``;
            }

            tempEmbed.addField(
              `[${e.tradeId}] - ${status} `,
              `${player.username.toUpperCase()} (${player.tag})\n${
                playerCards.length > 0
                  ? playerCards.join("\n")
                  : "```No Cards Offered```"
              }\n**${playerConfirmation}**\n\n${opposition.username.toUpperCase()} (${
                opposition.tag
              })\n${
                oppositionCards.length > 0
                  ? oppositionCards.join("\n")
                  : "```No Cards Offered```"
              }\n\n**${oppositionConfirmation}**\n`,
              false
            );
          }

          embeds.push(tempEmbed);
        }

        const pagination = new Pagination(interaction, embeds);
        await pagination.send();
      }
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("trade")
  @Slash("create", {description: "Create a new trade request"})
  async createTrade(
    @SlashOption("to", {
      description: "Member who you wanna trade",
      required: true,
    })
    opposition: User,
    @SlashOption("initial-card", {
      description: "Card ID to start the trade",
      required: true,
    })
    id1: number,
    @SlashOption("optional-card-1", {
      description: "Optional ID of card you want to put in the trade offer",
      required: false,
    })
    id2: number,
    @SlashOption("optional-card-2", {
      description: "Optional ID of card you want to put in the trade offer",
      required: false,
    })
    id3: number,
    @SlashOption("optional-card-3", {
      description: "Optional ID of card you want to put in the trade offer",
      required: false,
    })
    id4: number,
    interaction: CommandInteraction
  ) {
    try {
      const embedBuilder = new MessageEmbed();
      embedBuilder
        .setAuthor(`Trade Offer`)
        .setColor("GOLD")
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

      if (opposition.bot) {
        embedBuilder.setTitle(`You cannot trade with the bots`);
        embedBuilder.setDescription(
          `**As much as they are lively you should still play with other people**`
        );

        interaction.reply({ embeds: [embedBuilder], ephemeral: true });
      } else if (opposition.id === interaction.user.id) {
        embedBuilder.setTitle(`You cannot play with yourself`);
        embedBuilder.setDescription(
          `**Why would you even want to trade with yourself?**`
        );

        interaction.reply({ embeds: [embedBuilder], ephemeral: true });
      } else {
        embedBuilder.setTitle(`Trade Created Successfully`);
        embedBuilder.setDescription(
          `**Your Opposition will be notified through the channel**`
        );

        interaction.reply({ embeds: [embedBuilder], ephemeral: true });

        let cards = [];

        if (id1 !== undefined) {
          cards.push(id1);
        } else if (id2 !== undefined) {
          cards.push(id2);
        } else if (id3 !== undefined) {
          cards.push(id3);
        } else if (id4 !== undefined) {
          cards.push(id4);
        }

        let body = {
          discordId: interaction.user.id,
          oppositionDiscordId: opposition.id,
          cardIds: cards,
        };

        const response = await axios.post(`${api.trade}`, body);

        const e = response?.data;

        var oppositionEmbed = new MessageEmbed()
          .setAuthor(`Trade Offer`)
          .setColor("GOLD")
          .setThumbnail(
            getAvatarUrl(
              interaction.client.user?.id,
              interaction.client.user?.avatar
            )
          );

        let playerCards: string[] = [];
        let oppositionCards: string[] = [];
        var status;

        var playerConfirmation = e.playerOffer.confirmation
          ? `Confirmed`
          : `Waiting For Confirmation`;
        var oppositionConfirmation = e.oppositionOffer.confirmation
          ? `Confirmed`
          : `Waiting For Confirmation`;
        var player = await interaction.client.users.fetch(
          e.playerOffer.playerId
        );
        var opposition = await interaction.client.users.fetch(
          e.oppositionOffer.playerId
        );

        e.playerOffer.cards.forEach((element: any) =>
          playerCards.push(getSimpleCard(element))
        );

        e.oppositionOffer.cards.forEach((element: any) =>
          oppositionCards.push(getSimpleCard(element))
        );

        if (e.status === "C") {
          status = `Trade Canceled`;
        } else if (e.status === "P") {
          status = `Trade Ongoing`;
        } else if (e.status === "S") {
          status = `Trade Successful`;
        } else {
          status = ``;
        }

        oppositionEmbed.addField(
          `[${e.tradeId}] - ${status} `,
          `${player.username.toUpperCase()} (${player.tag})\n${
            playerCards.length > 0
              ? playerCards.join("\n")
              : "```No Cards Offered```"
          }\n**${playerConfirmation}**\n\n${opposition.username.toUpperCase()} (${
            opposition.tag
          })\n${
            oppositionCards.length > 0
              ? oppositionCards.join("\n")
              : "```No Cards Offered```"
          }\n\n**${oppositionConfirmation}**\n`,
          false
        );

        interaction.channel?.send({
          content: `${opposition}, You have a new Trade Request from ${interaction.user}`,
          embeds: [oppositionEmbed],
        });
      }
    } catch (error) {
      console.log(error);
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("trade")
  @Slash("add", {description: "Add a card to ongoing trade"})
  async addCard(
    @SlashOption("trade-id", {
      description: "Id of the designated trade",
      required: true,
    })
    tradeId: number,
    @SlashOption("card-id", {
      description: "Card ID to start the trade",
      required: true,
    })
    cardId: number,
    interaction: CommandInteraction
  ) {
    try {
      let body = {
        discordId: interaction.user.id,
        tradeId: tradeId,
        cardIds: [cardId],
      };

      const response = await axios.post(`${api.trade}/add`, body);

      const e = response?.data;

      var oppositionEmbed = new MessageEmbed()
        .setAuthor(`Trade Offer`)
        .setColor("GOLD")
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

      let playerCards: string[] = [];
      let oppositionCards: string[] = [];
      var status;

      var player = await interaction.client.users.fetch(e.playerOffer.playerId);
      var opposition = await interaction.client.users.fetch(
        e.oppositionOffer.playerId
      );

      e.playerOffer.cards.forEach((element: any) =>
        playerCards.push(getSimpleCard(element))
      );

      e.oppositionOffer.cards.forEach((element: any) =>
        oppositionCards.push(getSimpleCard(element))
      );

      if (e.status === "C") {
        status = `Trade Canceled`;
      } else if (e.status === "P") {
        status = `Trade Ongoing`;
      } else if (e.status === "S") {
        status = `Trade Successful`;
      } else {
        status = ``;
      }

      oppositionEmbed.addField(
        `[${e.tradeId}] - ${status} `,
        `${player.username.toUpperCase()} (${player.tag})\n${
          playerCards.length > 0
            ? playerCards.join("\n")
            : "```No Cards Offered```"
        }\n${opposition.username.toUpperCase()} (${
          opposition.tag
        })\n${
          oppositionCards.length > 0
            ? oppositionCards.join("\n")
            : "```No Cards Offered```"
        }\n`,
        false
      );

      interaction.reply({
        content: `Hey ${opposition}, ${interaction.user} Updated a trade request with id ${tradeId}`,
        embeds: [oppositionEmbed],
      });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("trade")
  @Slash("confirm", {description: "Confirm/Reject your side of the trade"})
  async confirmTrade(
    @SlashOption("trade-id", {
      description: "Id of the designated trade",
      required: true,
    })
    tradeId: number,
    @SlashChoice("Accept Trade", 1)
    @SlashChoice("Reject Trade", 2)
    @SlashOption("confirmation", {
      description: "Id of the designated trade",
      required: true,
    })
    choice: number,
    interaction: CommandInteraction
  ) {
    try {
      var url;
      if (choice === 1) {
        url = `${api.trade}/accept`;
      } else {
        url = `${api.trade}/reject`;
      }

      let body = {
        discordId: interaction.user.id,
        tradeId: tradeId,
      };
      const response = await axios.post(url, body);

      const e = response?.data;

      var oppositionEmbed = new MessageEmbed()
        .setAuthor(`Trade Offer`)
        .setColor("GOLD")
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

      let playerCards: string[] = [];
      let oppositionCards: string[] = [];
      var status;

      var playerConfirmation = e.playerOffer.confirmation
        ? `Confirmed`
        : `Waiting For Confirmation`;
      var oppositionConfirmation = e.oppositionOffer.confirmation
        ? `Confirmed`
        : `Waiting For Confirmation`;
      var player = await interaction.client.users.fetch(e.playerOffer.playerId);
      var opposition = await interaction.client.users.fetch(
        e.oppositionOffer.playerId
      );

      var message;
      if (choice === 1) {
        message = `Hey ${opposition}, ${interaction.user} has confirmed the trade with ID ${tradeId}`;
      } else {
        message = `Hey ${opposition}, ${interaction.user} has rejected the trade with ID ${tradeId}`;
      }
      e.playerOffer.cards.forEach((element: any) =>
        playerCards.push(getSimpleCard(element))
      );

      e.oppositionOffer.cards.forEach((element: any) =>
        oppositionCards.push(getSimpleCard(element))
      );

      if (e.status === "C") {
        status = `Trade Canceled`;
      } else if (e.status === "P") {
        status = `Trade Ongoing`;
      } else if (e.status === "S") {
        status = `Trade Successful`;
      } else {
        status = ``;
      }

      oppositionEmbed.addField(
        `[${e.tradeId}] - ${status} `,
        `${player.username.toUpperCase()} (${player.tag})\n${
          playerCards.length > 0
            ? playerCards.join("\n")
            : "```No Cards Offered```"
        }\n**${playerConfirmation}**\n\n${opposition.username.toUpperCase()} (${
          opposition.tag
        })\n${
          oppositionCards.length > 0
            ? oppositionCards.join("\n")
            : "```No Cards Offered```"
        }\n\n**${oppositionConfirmation}**\n`,
        false
      );

      interaction.reply({
        content: message,
        embeds: [oppositionEmbed],
      });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
