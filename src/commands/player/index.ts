import axios from "axios";
import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import api from "../../configs/api/index.js";
import {
  convertDate,
  getAvatarUrl,
  handleErrorMessage,
} from "../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive", "SIVE K-Pop Card Game", {
  player: "Player Commands",
})
class PlayerCommand {
  @Slash("profile", {description: "Display your profile"})
  @SlashGroup("player")
  async profile(interaction: CommandInteraction) {
    try {
      const response = await axios.get(`${api.players}/${interaction.user.id}`);

      const profile = response.data;

      var registerDate = convertDate(profile.createdAt);
      var loginDate = convertDate(profile.lastLogin);

      const embedBuilder = new MessageEmbed()
        .setTitle(interaction.user.tag)
        .setThumbnail(
          getAvatarUrl(interaction.user.id, interaction.user.avatar)
        )
        .setColor("GOLD")
        .addField("Registration Date", registerDate!, false)
        .addField("Last Login", loginDate!, false)
        .addField("Statistics", "===================", false)
        .addField("Total Balance", profile.currentBalance!, false)
        .addField("Badges", profile.badges.join("\n"))
        .addField("Total Power", profile.totalPower!, false);

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @Slash("inventory", {description: "Display your inventory"})
  @SlashGroup("player")
  async inventory(
    @SlashOption("private", {
      description:
        "This flag will show whether you wish to display your inventory to yourself or to the channel",
      required: true,
    })
    hidden: boolean,
    interaction: CommandInteraction
  ) {
    try {
      const response = await axios.get(
        `${api.players}/${interaction.user.id}/inventory`
      );

      const inv = response.data;

      const embedBuilder = new MessageEmbed()
        .setTitle(`${interaction.user.tag} Inventory`)
        .setThumbnail(
          getAvatarUrl(interaction.user.id, interaction.user.avatar)
        )
        .setColor("GOLD");

      if (Array.isArray(inv.items) && inv.items.lenght) {
        embedBuilder.setDescription("```**No Item Left In Inventory**```");
      } else {
        inv.items.forEach(
          (e: { name: string; qty: string; description: string }) => {
            embedBuilder.addField(
              e.name,
              `Stock: ${e.qty} \n ${e.description}`,
              false
            );
          }
        );
      }

      interaction.reply({ embeds: [embedBuilder], ephemeral: hidden });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @Slash("balance", {description: "Display your current balance"})
  @SlashGroup("player")
  async balance(interaction: CommandInteraction) {
    try {
      const response = await axios.get(
        `${api.players}/${interaction.user.id}/balance`
      );

      const data = response.data;

      const embedBuilder = new MessageEmbed()
        .setAuthor(`Your Current Balance`)
        .setTitle(`${interaction.user.username.toUpperCase()} Balance`)
        .setDescription(`${data.balance}$`)
        .setThumbnail(
          getAvatarUrl(interaction.user.id, interaction.user.avatar)
        )
        .setColor("GOLD");

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @Slash("register", {description: "Transfer balance to your friend"})
  @SlashGroup("player")
  async register(interaction: CommandInteraction) {
    try {
      let request = {
        discordId: interaction.user.id,
        guildId: interaction.guild?.id,
      };
      await axios.post(`${api.players}`, request);

      const embedBuilder = new MessageEmbed()
        .setAuthor(`Successfully Registered`)
        .setTitle(
          `${interaction.user.username.toUpperCase()} Is now registered to SIVE!`
        )
        .setDescription(
          `Please do **/help** to familiarize yourself with the commands ^^`
        )
        .setThumbnail(
          getAvatarUrl(interaction.user.id, interaction.user.avatar)
        )
        .setColor("GOLD");

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @Slash("login", {description: "Login daily to receive extra reward"})
  @SlashGroup("player")
  async login(interaction: CommandInteraction) {
    try {
      let request = {
        discordId: interaction.user.id,
      };
      const response = await axios.post(`${api.game}/login`, request);

      const data = response.data;

      const embedBuilder = new MessageEmbed()
        .setAuthor(`Successfully Claimed Daily`)
        .setTitle(`***** Current Streak: ${data.streak}*****`)
        .setDescription(
          `***** Tip of the day: Each Streak will increase your daily *****`
        )
        .addField(
          `Congratulations, you get ${data.bonus}`,
          `Your current balance is now: ${data.newBalance}`,
          true
        )
        .setThumbnail(
          getAvatarUrl(interaction.user.id, interaction.user.avatar)
        )
        .setColor("GOLD");

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @Slash("transfer", {description: "Transfer balance to your friend"})
  @SlashGroup("player")
  async transferBalance(
    @SlashOption("amount", {
      description: "Amount of value transfered",
      required: true,
    })
    amount: number,
    @SlashOption("opposition", {
      description: "Destination player to sent money",
      required: true,
    })
    opposition: User,
    @SlashOption("message", {
      description: "Message to send alongside the transfer",
      required: false,
    })
    message: string,
    interaction: CommandInteraction
  ) {
    try {
      var request;
      if (message !== undefined) {
        request = {
          receiverId: opposition.id,
          discordId: interaction.user.id,
          message: message,
          amount: amount,
        };
      } else {
        request = {
          receiverId: opposition.id,
          discordId: interaction.user.id,
          amount: amount,
        };
      }

      const response = await axios.post(
        `${api.game}/balance/transfer`,
        request
      );

      const data = response.data;

      const embedBuilder = new MessageEmbed()
        .setAuthor(`Transfer Completed`)
        .setTitle(
          `You have transfered ${data.amount} to ${opposition.username}`
        )
        .setDescription(`Your Current Balance is now: ${data.newBalance}$`)
        .setThumbnail(
          getAvatarUrl(interaction.user.id, interaction.user.avatar)
        )
        .setColor("GOLD");

      if (data.message !== null) {
        embedBuilder.addField(`Additional Message`, data.message, false);
      }

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
