import { embedType, Pagination } from "@discordx/utilities";
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
  deck: "Deck Related Commands for Card Game",
})
class DeckCommand {
  @SlashGroup("deck")
  @Slash("list", { description: "Display all your decks" })
  async getDecks(interaction: CommandInteraction): Promise<void> {
    const response = await axios.get(
      `${api.players}/${interaction.user.id}/decks`
    );

    var data = response?.data;

    const embeds: embedType[] = [];

    data.forEach((element: { id: any; deckName: any; cards: any }) => {
      var embedBuilder = new MessageEmbed()
        .setAuthor(`[${element.id}] ${element.deckName}`)
        .setColor("GOLD");

      element.cards.forEach(
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
    });

    const pagination = new Pagination(interaction, embeds);
    await pagination.send();
  }
  @SlashGroup("deck")
  @Slash("create", { description: "Create a new deck" })
  async createDeck(
    @SlashOption("name", {
      description: "Name for the deck to create",
      required: true,
    })
    name: string,
    @SlashOption("id1", {
      description: "ID for first card",
      required: true,
    })
    card1: number,
    @SlashOption("id2", {
      description: "ID for second card",
      required: false,
    })
    card2: number,
    @SlashOption("id3", {
      description: "ID for third card",
      required: false,
    })
    card3: number,
    @SlashOption("id4", {
      description: "ID for fourth card",
      required: false,
    })
    card4: number,
    @SlashOption("id5", {
      description: "ID for fifth card",
      required: false,
    })
    card5: number,
    interaction: CommandInteraction
  ) {
    try {
      let cards: number[] = [];

      if (card1 !== undefined) {
        cards.push(card1);
      }

      if (card2 !== undefined) {
        cards.push(card2);
      }

      if (card3 !== undefined) {
        cards.push(card3);
      }

      if (card4 !== undefined) {
        cards.push(card4);
      }

      if (card5 !== undefined) {
        cards.push(card5);
      }
      const body = {
        name: name,
        discordId: interaction.user.id,
        cardsId: cards,
      };

      await axios.post(`${api.game}/decks`, body);

      const embedBuilder = new MessageEmbed();

      embedBuilder.setAuthor(`New Deck Has Been Created`);
      embedBuilder.setTitle(`Deck ${name} is created!`);
      embedBuilder.setDescription(
        `Each deck can only hold 5 cards and you can only create 3 decks currently`
      );
      embedBuilder.setColor(`GOLD`);
      embedBuilder.setThumbnail(
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      );
      embedBuilder.setFooter(`Check your deck list to view your decks`);

      interaction.reply({ embeds: [embedBuilder], ephemeral: true });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("deck")
  @Slash("edit", { description: "Add/Remove card from your deck" })
  async editDeck(
    @SlashChoice("add", 1)
    @SlashChoice("remove", 2)
    @SlashOption("type", {
      description: "Option to Add/Remove Card",
      required: true,
    })
    type: number,
    @SlashOption("deck-id", {
      description: "ID of your deck",
      required: true,
    })
    deckId: number,
    @SlashOption("card-id", {
      description: "Card ID",
      required: true,
    })
    cardId: number,
    interaction: CommandInteraction
  ) {
    try {
      var url;
      var message;
      if (type === 1) {
        url = `${api.game}/decks/add`;
        message = `Card with ID ${cardId} is added into the deck`;
      } else {
        url = `${api.game}/decks/remove`;
        message = `Card with ID ${cardId} is removed from the deck`;
      }

      let cards = [cardId];

      let body = {
        discordId: interaction.user.id,
        deckId: deckId,
        cardsId: cards,
      };

      await axios.post(url, body);

      const embedBuilder = new MessageEmbed();

      embedBuilder.setAuthor(`Deck is updated`);
      embedBuilder.setTitle(message);
      embedBuilder.setDescription(`Check your list to see the changes`);
      embedBuilder.setColor(`GOLD`);
      embedBuilder.setThumbnail(
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
}
