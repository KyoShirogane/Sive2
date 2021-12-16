import { Pagination } from "@discordx/utilities";
import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import api from "../../configs/api/index.js";
import {
  combineQuestReward,
  handleErrorMessage,
} from "../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive", "SIVE K-Pop Card Game", {
  quest: "Quest Related Commands for Card Game",
})
class QuestCommand {
  @SlashGroup("quest")
  @Slash("list", {
    description: "Available quests {you can only take 5 simultaneously}",
  })
  async getQuestList(interaction: CommandInteraction): Promise<void> {
    try {
      var url = `${api.quest}?page=0&size=5`;
      var response;

      response = await axios.get(url);

      const data = response?.data;

      const embeds = [];

      var embedBuilder = new MessageEmbed()
        .setAuthor(`Available Quests`)
        .setColor("GOLD");

      if (data.totalElements === 0) {
        embedBuilder.setTitle(`No Available Quests`);
        interaction.reply({ embeds: [embedBuilder] });
      } else {
        data.content.forEach(
          (e: {
            id: any;
            name: any;
            narration: any;
            duration: any;
            rarity: any;
            prize: { money: any; items: any };
            items: any;
          }) => {
            embedBuilder.addField(
              `Quest ID - ${e.id}\n**${e.name}**\n${e.narration} \n${e.duration} Minutes\n${e.rarity}Star\n**Rewards**\n${e.prize.money}`,
              `${combineQuestReward(e.prize.items)}`,
              true
            );
          }
        );
        embeds.push(embedBuilder);

        for (var i = 1; i < data.totalPages; i++) {
          url = `${api.quest}?page=${i}&size=5`;

          var tempResponse = await axios.get(url);

          const tempData = tempResponse?.data;

          var tempEmbed = new MessageEmbed()
            .setAuthor(`${interaction.user.username} Quests`)
            .setColor("GOLD");

          tempData.content.forEach(
            (e: {
              id: any;
              name: any;
              narration: any;
              duration: any;
              rarity: any;
              prize: { money: any; items: any };
              items: any;
            }) => {
              embedBuilder.addField(
                `Quest ID - ${e.id}\n**${e.name}**\n${e.narration} \n${e.duration} Minutes\n${e.rarity}Star\n**Rewards**\n${e.prize.money}`,
                `${combineQuestReward(e.prize.items)}`,
                true
              );
            }
          );

          embeds.push(tempEmbed);
        }
      }

      const pagination = new Pagination(interaction, embeds);
      await pagination.send();
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("quest")
  @Slash("running", { description: "Display your current ongoing quests" })
  async getPlayerQuests(interaction: CommandInteraction) {
    try {
      var url = `${api.quest}/player/${interaction.user.id}?page=0&size=5`;
      var response;

      response = await axios.get(url);

      const data = response?.data;

      var embedBuilder = new MessageEmbed()
        .setAuthor(`${interaction.user.username.toUpperCase()} Quests`)
        .setColor("GOLD");

      if (data.quest.length > 0) {
        data.quest.forEach(
          (e: {
            durationLeft: any;
            quest: {
              id: any;
              name: any;
              narration: any;
              rarity: any;
              prize: { money: any; items: any };
            };
          }) => {
            var duration =
              e.durationLeft > 0
                ? `${e.durationLeft} Minutes Remaining`
                : `Completed`;

            embedBuilder.addField(
              `Quest ID - ${e.quest.id}`,
              `**${e.quest.name}**\n${e.quest.narration} \n${duration}\n${
                e.quest.rarity
              }Star\n**Rewards**\n${e.quest.prize.money}$\n${combineQuestReward(
                e.quest.prize.items
              )}\n`,
              true
            );
          }
        );
      } else {
        embedBuilder.setTitle(`**You have no running quest**`);
        embedBuilder.setDescription(
          `You can take more quests with **sive quest take** command`
        );
      }

      interaction.reply({ embeds: [embedBuilder], ephemeral: true });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("quest")
  @Slash("take", { description: "Take quest" })
  async takeQuest(
    @SlashOption("id", {
      description: "Quest ID",
      required: true,
    })
    id: number,
    @SlashOption("amount", {
      description: "Amount of times you to take the quest",
      required: true,
    })
    qty: number,
    @SlashOption("hidden", {
      description: "The flag to indicate whether the message is private or not",
      required: true,
    })
    hidden: boolean,

    interaction: CommandInteraction
  ) {
    try {
      const embedBuilder = new MessageEmbed()
        .setAuthor(`Quests obtained!`)
        .setColor(`GOLD`)
        .setDescription(`**Rewards List**`);

      let body = {
        discordId: interaction.user.id,
        questId: id,
        qty: qty,
      };

      const response = await axios.post(`${api.quest}/run`, body);
      const data = response?.data;

      data.forEach(
        (e: {
          id: any;
          quest: {
            id: any;
            name: any;
            duration: any;
            prize: { money: any; items: any };
          };
        }) => {
          embedBuilder.addField(
            `[${e.id}] ${e.quest.name}`,
            `${e.quest.duration} Minutes\n${
              e.quest.prize.money
            }$\n${combineQuestReward(e.quest.prize.items)}`,
            false
          );
        }
      );

      interaction.reply({ embeds: [embedBuilder], ephemeral: hidden });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("quest")
  @Slash("submit", { description: "Submit your ongoing quests" })
  async completeQuest(
    @SlashOption("hidden", {
      description: "The flag to indicate whether the message is private or not",
      required: true,
    })
    hidden: boolean,
    @SlashOption("id", {
      description: "Your Quest ID - See in the your running quest",
      required: false,
    })
    id: number,
    interaction: CommandInteraction
  ) {
    const embedBuilder = new MessageEmbed()
      .setAuthor(`Quests Submitted!`)
      .setColor(`GOLD`)
      .setTitle(`**Rewards List**`);

    if (id !== undefined) {
      let body = {
        discordId: interaction.user.id,
        questId: id,
      };
      const response = await axios.post(`${api.quest}/submit`, body);
      const data = response?.data;

      if (response.data.length > 0) {
        embedBuilder.addField(
          `[${data.id}] ${data.quest.name}`,
          `${data.quest.prize.money}$\n${combineQuestReward(
            data.quest.prize.items
          )}`,
          false
        );
      } else {
        embedBuilder.setTitle(`**Quests are still ongoing!**`);
        embedBuilder.setDescription(
          `Check their progress by using **sive quest running** command!`
        );
      }
    } else {
      let body = {
        discordId: interaction.user.id,
      };

      const response = await axios.post(`${api.quest}/submit/all`, body);
      const data = response?.data;

      if (response.data.length > 0) {
        data.forEach(
          (e: {
            id: any;
            quest: { id: any; name: any; prize: { money: any; items: any } };
          }) => {
            embedBuilder.addField(
              `[${e.id}] ${e.quest.name}`,
              `${e.quest.prize.money}$\n${combineQuestReward(
                e.quest.prize.items
              )}`,
              false
            );
          }
        );
      } else {
        embedBuilder.setTitle(`**Quests are still ongoing!**`);
        embedBuilder.setDescription(
          `Check their progress by using **sive quest running** command!`
        );
      }
    }

    interaction.reply({ embeds: [embedBuilder], ephemeral: hidden });
  }
}
