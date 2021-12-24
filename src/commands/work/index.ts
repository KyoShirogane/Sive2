import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import api from "../../configs/api/index.js";
import {
  getAvatarUrl,
  handleErrorMessage,
} from "../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive-activity", "SIVE K-Pop Card Game", {
  work: "Work Related Commands for Card Game",
})
class WorkCommand {
  @SlashGroup("work")
  @Slash("current", {
    description: "Display your current training activity",
  })
  async ongoingWork(
    @SlashChoice("Farming", "FARM")
    @SlashChoice("Training", "TRAIN")
    @SlashOption("detail", {
      description: "If Chosen it will be more detailed version",
      required: false,
    })
    detail: string,
    interaction: CommandInteraction
  ) {
    try {
      const embedBuilder = new MessageEmbed()
        .setColor(`GOLD`)
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

      if (detail === undefined) {
        const trainingResponse = await axios.get(
          `${api.work}/status/training?discordId=${interaction.user.id}`
        );
        const farmingResponse = await axios.get(
          `${api.work}/status/farming?discordId=${interaction.user.id}`
        );

        if (!trainingResponse.data.visible && !farmingResponse.data.visible) {
          embedBuilder.setDescription(
            `You currently have no work in progress, do **/sive-activity work run** to start`
          );
        }

        embedBuilder.setAuthor(`Current Work Progress`);
        embedBuilder.setTitle(
          `Work Progress for ${interaction.user.username.toUpperCase()}`
        );

        if (
          trainingResponse.data.duration !== null &&
          trainingResponse.data.visible
        ) {
          if (trainingResponse.data.duration > 0) {
            embedBuilder.addField(
              `[Training Task] Time Left: ${trainingResponse.data.duration} Minutes`,
              `Please wait for the time to run out to submit!`
            );
          } else {
            embedBuilder.addField(
              `Training is complete!`,
              `Please submit your training to gain a reward.`
            );
          }
        }

        if (
          farmingResponse.data.duration !== null &&
          farmingResponse.data.visible
        ) {
          if (farmingResponse.data.duration > 0) {
            embedBuilder.addField(
              `[Farming Task] Time Left: ${farmingResponse.data.duration} Minutes`,
              `Please wait for the time to run out to submit!`
            );
          } else {
            embedBuilder.addField(
              `Farming is complete!`,
              `Please submit your Farming to gain a reward.`
            );
          }
        }

        interaction.reply({ embeds: [embedBuilder] });
      } else {
        if (detail === "FARM") {
          const response = await axios.get(
            `${api.work}/status/farming?discordId=${interaction.user.id}`
          );

          embedBuilder.setAuthor(
            `${interaction.user.username.toUpperCase} Farming Status `
          );

          if (response.data.visible) {
            embedBuilder.setTitle(`Time Left: ${response} Minutes`);
            embedBuilder.setDescription(`Reward upon completion`);

            response.data.items.forEach(
              (e: { qty: any; name: any; description: any }) => {
                embedBuilder.addField(
                  `${e.qty}X - ${e.name}`,
                  `${e.description}`,
                  false
                );
              }
            );
          } else {
            embedBuilder.setTitle(`You haven't start any farming.`);
            embedBuilder.setDescription(
              `Do **/sive-activity work run** to start working`
            );
          }
        } else {
          const response = await axios.get(
            `${api.work}/status/training?discordId=${interaction.user.id}`
          );

          embedBuilder.setAuthor(
            `${interaction.user.username.toUpperCase()} Training Status `
          );

          if (response.data.visible) {
            embedBuilder.setTitle(`Time Left: ${response} Minutes`);
            embedBuilder.setDescription(`Reward upon completion`);

            response.data.items.forEach(
              (e: { qty: any; name: any; description: any }) => {
                embedBuilder.addField(
                  `${e.qty}X - ${e.name}`,
                  `${e.description}`,
                  false
                );
              }
            );
          } else {
            embedBuilder.setTitle(`You haven't start any training.`);
            embedBuilder.setDescription(
              `Do **/sive-activity work run** to start working`
            );
          }
        }

        interaction.reply({ embeds: [embedBuilder] });
      }
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("work")
  @Slash("run", {
    description: "Start your grind",
  })
  async startWork(
    @SlashChoice("Farming", "FARM")
    @SlashChoice("Training", "TRAIN")
    @SlashOption("type", {
      description: "Choose your work type",
      required: true,
    })
    type: string,
    @SlashChoice("30 Minutes", 30)
    @SlashChoice("1 Hour", 60)
    @SlashChoice("2 Hours", 120)
    @SlashChoice("3 Hours", 180)
    @SlashOption("duration", {
      description:
        "Lenght of your training duration. the longer the greater the reward will be",
      required: true,
    })
    duration: number,
    interaction: CommandInteraction
  ) {
    try {
      let body = {
        discordId: interaction.user.id,
        duration: duration,
        type: type,
      };

      await axios.post(`${api.work}/create`, body);

      const embedBuilder = new MessageEmbed()
        .setTitle(
          `Check your work progress periodically with **/sive-activity work current**`
        )
        .setColor(`GOLD`)
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        )
        .setDescription(
          `**you can farm or train or you can do both at the same time!**`
        );

      if (type === "FARM") {
        embedBuilder.setAuthor(`Farming Started for ${duration} Minutes!`);
      } else {
        embedBuilder.setAuthor(`Training Started for ${duration} Minutes!`);
      }

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("work")
  @Slash("submit", {
    description: "Submit your work.",
  })
  async finishWork(
    @SlashChoice("Farming", "FARM")
    @SlashChoice("Training", "TRAIN")
    @SlashOption("type", {
      description: "Choose your work type",
      required: true,
    })
    type: string,
    interaction: CommandInteraction
  ) {
    try {
      let body = {
        discordId: interaction.user.id,
        type: type,
      };

      await axios.post(`${api.work}/submit`, body);

      const embedBuilder = new MessageEmbed()
        .setTitle(`Work is submitted!`)
        .setDescription(` Please check your inventory to see your items`)
        .setColor(`GOLD`)
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
