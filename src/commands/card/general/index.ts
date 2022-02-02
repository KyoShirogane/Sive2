import { Pagination } from "@discordx/utilities";
import axios from "axios";
import Canvas from "canvas";
import {
  CommandInteraction,
  MessageAttachment,
  MessageEmbed,
} from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import api from "../../../configs/api/index.js";
import {
  convertDate,
  getAvatarUrl,
  getCardBody,
  handleErrorMessage,
} from "../../../utilities/helper/index.js";

enum BurnType {
  id = "Card ID",
  Rarity = "Rarity",
}

@Discord()
@SlashGroup("sive", "SIVE K-Pop Card Game", {
  card: "Card Related Commands for Card Game",
})
class CardCommand {
  @SlashGroup("card")
  @Slash("list", { description: "Display all the cards you have" })
  async displayCard(
    @SlashChoice("Sorted by Summoning time", "0")
    @SlashChoice("Sorted by Group Name", "1")
    @SlashOption("sort", {
      description: "Card Sorting Parameter",
      required: true,
    })
    sort: string,
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
          sort: sort,
        };
      } else {
        body = {
          discordId: `${interaction.user.id}`,
          rarity: rarity,
          sort: sort,
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

      for await (const e of data.content) {
        var lock = e.locked === true ? "🔒" : "";
        embedBuilder.addField(
          `${lock} Card ID - ${e.cardId}`,
          getCardBody(e),
          false
        );
      }

      embeds.push(embedBuilder);

      for (var i = 1; i < data.totalPages; i++) {
        if (key === undefined) {
          url = `${api.card}?page=${i}&size=9`;
        } else {
          url = `${api.card}?page=${i}&size=9&key=${key}`;
        }

        const tempResponse = await axios.post(url, body);

        const tempData = tempResponse?.data;

        var embedBuilder = new MessageEmbed()
          .setAuthor(`${interaction.user.username} Cards`)
          .setColor("GOLD");

        tempData.content.forEach(
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
      }

      const pagination = new Pagination(interaction, embeds);
      await pagination.send();
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("view", { description: "View a specific card through card ID" })
  async viewCard(
    @SlashOption("id", {
      description: "ID of the card",
      required: true,
    })
    id: number,
    interaction: CommandInteraction
  ) {
    try {
      var response = await axios.post(`${api.card}/${id}`);

      if (!response.data.graphic) {
        const embedBuilder = new MessageEmbed();

        var owner = await interaction.client.users.fetch(response.data.ownerId);

        if (owner.bot) {
          embedBuilder.setTitle(`***** CURRENTLY IN MARKET *****`);
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
        embedBuilder.setColor(
          `#${response.data.cardColor.replaceAll("#", "")}`
        );
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

        embedBuilder.addField(
          "Vocal",
          response.data.vocalStats.toString(),
          true
        );
        embedBuilder.addField("Rap", response.data.rapStats.toString(), true);
        embedBuilder.addField(
          "Dance",
          response.data.danceStats.toString(),
          true
        );
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
      } else {
        await interaction.deferReply();
        var background = await Canvas.loadImage(response.data.imageUrl);

        const canvas = Canvas.createCanvas(1120, 1670);
        const context = canvas.getContext("2d");

        // This uses the canvas dimensions to stretch the image onto the entire canvas
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.shadowBlur = 30;
        context.shadowColor = "gold";

        context.font = "900 90px sans-serif";
        context.fillStyle = "#ffd700";
        context.fillText(
          `${response.data.rarity}`,
          canvas.width * 0.025,
          canvas.height * 0.975
        );

        context.shadowBlur = 60;
        context.shadowColor = "black";

        context.font = "400 78px sans";
        context.fillStyle = "#ffffff";
        context.fillText(
          `${response.data.serialNumber}`,
          canvas.width * 0.025,
          canvas.height * 0.9
        );
        context.fillText(
          `${response.data.groupName}`,
          canvas.width * 0.025,
          canvas.height * 0.825
        );
        context.fillText(
          `${response.data.imageName}`,
          canvas.width * 0.025,
          canvas.height * 0.75
        );
        context.fillText(
          `${response.data.stageName}`,
          canvas.width * 0.025,
          canvas.height * 0.675
        );

        var fileName = `${response.data.cardId}_${response.data.groupName.replaceAll(" ", "_")}_${response.data.stageName.replaceAll(" ", "_")}`
        
        // Use the helpful Attachment class structure to process the file for you
        const attachment = new MessageAttachment(
          canvas.toBuffer(),
          `${fileName.toLowerCase()}.png`
        );

        await interaction.followUp({ files: [attachment] });
      }
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("lock", { description: "Lock/Unlock your card" })
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
        embedBuilder.setTitle(`***** CURRENTLY IN MARKET *****`);
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
  @Slash("standard-summon", {
    description: "Summon idol standard cards {requiring tickets}",
  })
  async summonStandardCard(
    @SlashOption("amount", {
      description: "Amount of cards to summon (Uses Ticket)",
      required: true,
    })
    amount: number,
    @SlashOption("hidden", {
      description:
        "This Flag indicate whether you want to send it privately or not",
      required: true,
    })
    hidden: boolean,
    @SlashChoice("★☆☆☆☆", 1)
    @SlashChoice("★★☆☆☆", 2)
    @SlashChoice("★★★☆☆", 3)
    @SlashChoice("★★★★☆", 4)
    @SlashChoice("★★★★★", 5)
    @SlashOption("rarity", {
      description: "Card Rarity",
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

      interaction.reply({ embeds: [embedBuilder], ephemeral: hidden });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("gender-summon", {
    description: "Summon idol gender cards {requiring tickets}",
  })
  async summonGenderCard(
    @SlashOption("amount", {
      description: "Amount of cards to summon (Uses Ticket)",
      required: true,
    })
    amount: number,
    @SlashChoice("Male Idol", "M")
    @SlashChoice("Female Idol", "F")
    @SlashOption("gender", {
      description: "Idol Gender",
      required: true,
    })
    gender: string,
    @SlashOption("hidden", {
      description:
        "This Flag indicate whether you want to send it privately or not",
      required: true,
    })
    hidden: boolean,
    interaction: CommandInteraction
  ) {
    try {
      var url = `${api.game}/inventory/gender-summon?gender=${gender}`;

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

      interaction.reply({ embeds: [embedBuilder], ephemeral: hidden });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("burn", { description: "Burn idol cards to gain fragments" })
  async burnCard(
    @SlashChoice("Card ID", "Card ID")
    @SlashChoice("Rarity", "Rarity")
    @SlashOption("type", {
      description: "Select The Burn Type",
      required: true,
    })
    type: string,
    @SlashOption("value", {
      description: "Value of the selected Type",
      required: true,
    })
    value: number,
    interaction: CommandInteraction
  ) {
    try {
      var url;
      var body;

      if (type === BurnType.id) {
        url = `${api.card}/burn`;
        body = {
          discordId: interaction.user.id,
          cardId: value,
        };
      } else {
        url = `${api.card}/burn/all`;
        body = {
          discordId: interaction.user.id,
          rarity: value,
        };
      }

      const response = await axios.post(url, body);

      const data = response?.data;

      const embedBuilder = new MessageEmbed();
      embedBuilder.setColor("GOLD");
      if (type === BurnType.id) {
        embedBuilder.setAuthor(
          `Card With ID ${data.cardId} is added to the burn queue`
        );
        embedBuilder.setTitle(
          `${data.serialNumber} | ${data.rarity} | ${data.fullName}`
        );
        if (data.imageName !== null) {
          embedBuilder.setDescription(
            `${data.groupName} - ${data.stageName} ( ${data.imageName} )`
          );
        } else {
          embedBuilder.setDescription(`${data.groupName} - ${data.stageName}`);
        }

        if (data.imageUrl !== null) {
          embedBuilder.setImage(`${data.imageUrl}`);
        } else {
          embedBuilder.setThumbnail(
            getAvatarUrl(
              interaction.client.user?.id,
              interaction.client.user?.avatar
            )
          );
        }
      } else {
        embedBuilder.setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

        embedBuilder.setAuthor(
          `Cards With ${value} Star Rarity Is Added To The Queue`
        );
        data.cards.length > 0
          ? embedBuilder.setTitle(
              `${data.cards.length} Cards is added to the queue`
            )
          : embedBuilder.setTitle(`No Cards is added to the queue`);
        embedBuilder.setDescription(
          `Cards that are locked is going to be exempted from the queue`
        );
      }

      interaction.reply({ embeds: [embedBuilder], ephemeral: true });
    } catch (error) {
      console.log(error);
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("pending-burn", {
    description: "Display your unconfirmed burn requests",
  })
  async pendingBurnCardList(interaction: CommandInteraction): Promise<void> {
    try {
      var url = `${api.card}/burn/pending?page=0&size=9`;
      var response;
      var body = {
        discordId: `${interaction.user.id}`,
      };

      response = await axios.post(url, body);

      const data = response?.data;

      const embeds = [];

      var embedBuilder = new MessageEmbed()
        .setAuthor(`${interaction.user.username} Burning Queue`)
        .setColor("GOLD");

      if (data.numberOfElements === 0) {
        embedBuilder.setTitle(`No Cards In The Queue`);
        interaction.reply({ embeds: [embedBuilder] });
      } else {
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
          url = `${api.card}/burn/pending?page=${i}&size=9`;

          var tempResponse = await axios.post(url, body);

          const tempData = tempResponse?.data;

          var tempEmbed = new MessageEmbed()
            .setAuthor(`${interaction.user.username} Cards`)
            .setColor("GOLD");

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
      }
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("remove-burn", { description: "Remove cards from the burn requests" })
  async removePendingBurnCard(
    @SlashOption("private", {
      description: "Whether or not the response is private",
      required: true,
    })
    hidden: boolean,
    @SlashOption("id", {
      description: "Card ID - This will remove only one card from queue",
      required: false,
    })
    id: number,
    interaction: CommandInteraction
  ) {
    try {
      const embedBuilder = new MessageEmbed().setColor("GOLD");
      if (id !== undefined) {
        let body = {
          discordId: interaction.user.id,
          cardId: id,
        };

        const response = await axios.post(
          `${api.card}/burn/single-cancel`,
          body
        );

        const data = response?.data;

        embedBuilder.setAuthor(
          `Card With ID ${data.cardId} is added to the burn queue`
        );
        embedBuilder.setTitle(
          `${data.serialNumber} | ${data.rarity} | ${data.fullName}`
        );
        if (data.imageName !== null) {
          embedBuilder.setDescription(
            `${data.groupName} - ${data.stageName} ( ${data.imageName} )`
          );
        } else {
          embedBuilder.setDescription(`${data.groupName} - ${data.stageName}`);
        }

        if (data.imageUrl !== null) {
          embedBuilder.setImage(`${data.imageUrl}`);
        } else {
          embedBuilder.setThumbnail(
            getAvatarUrl(
              interaction.client.user?.id,
              interaction.client.user?.avatar
            )
          );
        }
      } else {
        await axios.post(
          `${api.card}/burn/cancel?discordId=${interaction.user.id}`
        );

        embedBuilder.setAuthor(`Canceled Pending Card Queue`);
        embedBuilder.setTitle(`Removed All Cards In The Queue`);
        embedBuilder.setDescription(`All cards have been returned`);
        embedBuilder.setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );
      }

      interaction.reply({ embeds: [embedBuilder], ephemeral: hidden });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("confirm-burn", { description: "Confirm your burn requests" })
  async confirmBurn(interaction: CommandInteraction) {
    try {
      const embedBuilder = new MessageEmbed();
      const response = await axios.post(
        `${api.card}/burn/confirm?discordId=${interaction.user.id}`
      );

      embedBuilder.setAuthor(`Burned Successfully`);
      embedBuilder.setTitle(`Burned All The Cards In The Queue`);
      embedBuilder.setDescription(`You Gained All These Items`);
      embedBuilder.setThumbnail(
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      );
      embedBuilder.setFooter(
        `Check your inventory to see the items`,
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      );

      response?.data.items.forEach((e: { itemName: any; shardQty: any }) => {
        embedBuilder.addField(
          `${e.itemName}`,
          `You Gained ${e.shardQty} `,
          false
        );
      });

      interaction.reply({ embeds: [embedBuilder], ephemeral: true });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("card")
  @Slash("upgrade", { description: "Upgrade your card rarity" })
  async upgradeCard(
    @SlashOption("id", {
      description: "Card ID - Id of the card to be upgraded",
      required: true,
    })
    id: number,
    @SlashOption("private", {
      description: "Whether or not the response is private",
      required: true,
    })
    hidden: boolean,
    interaction: CommandInteraction
  ) {
    try {
      let body = {
        discordId: interaction.user.id,
        cardId: id,
      };

      body;

      const response = await axios.post(`${api.card}/upgrade`, body);

      const data = response?.data;
      const embedBuilder = new MessageEmbed();

      embedBuilder.setColor(`#${data.cardColor.replaceAll(`#`, ``)}`);
      embedBuilder.setAuthor(
        `Card With ID ${data.cardId} Successfully Upgraded`
      );
      embedBuilder.setTitle(
        `${data.serialNumber} | ${data.rarity} | ${data.fullName}`
      );
      if (data.imageName !== null) {
        embedBuilder.setDescription(
          `${data.groupName} - ${data.stageName} ( ${data.imageName} )`
        );
      } else {
        embedBuilder.setDescription(`${data.groupName} - ${data.stageName}`);
      }

      if (data.imageUrl !== null) {
        embedBuilder.setImage(`${data.imageUrl}`);
      } else {
        embedBuilder.setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );
      }

      interaction.reply({ embeds: [embedBuilder], ephemeral: hidden });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
