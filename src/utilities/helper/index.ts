import { CommandInteraction, MessageEmbed } from "discord.js";
import moment from "moment";

export const convertDate = (date: string) => {
  if (!date) return null;
  return moment(date).format("DD MMMM YYYY");
};

export const convertTime = (date: string) => {
  if (!date) return null;
  return moment(date).format("DD MMMM YYYY HH:MM:SS");
};

export function getAvatarUrl(discordId: any, avatar: any) {
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`;
}

export function getCardBody(card: any) {
  var totalPower = card.danceStats + card.vocalStats + card.rapStats;
  var eraName = card.imageName != null ? "(" + card.imageName + ")" : "";

  var res =
    "```" +
    card.serialNumber +
    "|" +
    card.rarity +
    " " +
    card.groupName +
    " " +
    card.stageName +
    " " +
    eraName +
    "\nPower: " +
    totalPower +
    "```";

  return res;
}

export function combineQuestReward(items: any) {
  let rewards: string[] = [];

  items.forEach((e: { qty: any; name: any }) => {
    let reward = `${e.qty}X - ${e.name}`;

    rewards.push(reward);
  });

  if (rewards.length === 0) {
    return "No Items";
  } else {
    return rewards.join("\n");
  }
}

export function handleErrorMessage(
  interaction: CommandInteraction,
  error: any
) {
  if (error.code === "ECONNREFUSED") {
    const embedBuilder = new MessageEmbed()

      .setThumbnail(
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      )
      .setColor("GOLD")
      .setAuthor("Oops, Something Went Wrong!")
      .setTitle("Service is currently offline")
      .setDescription("The Bot is currently offline/under maintenance")
      .setFooter(error.response.headers.date);

    interaction.reply({ embeds: [embedBuilder], ephemeral: true });
  } else {
    console.error(error)
    
    var errorMessage;
    var title;
    var footer;

    if (error.response === undefined || error.response.data === undefined) {
      console.error(error);
      title = "PLEASE CONTACT THE ADMINS";
      errorMessage = "sive-needs-to-be-fixed"
        .replaceAll("-", " ")
        .replaceAll("error.", "")
        .toUpperCase();
      footer = new Date().toTimeString();
    } else {
      title = error.response.data.error.toUpperCase();
      errorMessage = error.response.data.message
        .replaceAll("player-not-found", "User-Is-Not-Registered")
        .replaceAll("-", " ")
        .replaceAll("error.", "")
        .toUpperCase();
      footer = error.response.headers.date;
    }

    const embedBuilder = new MessageEmbed()

      .setThumbnail(
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      )
      .setColor("GOLD")
      .setAuthor("Oops, Something Went Wrong!")
      .setTitle(title)
      .setDescription(errorMessage)
      .setFooter(footer);

    interaction.reply({ embeds: [embedBuilder], ephemeral: true });
  }
}
