import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { SimpleCommandMessage } from "discordx";
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

export function handleErrorMessage(interaction: CommandInteraction, error: any) {
  console.log(error);
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
    var errorMessage;

    if(error.response === undefined){
      console.error(error)
      errorMessage = "Looks-Like-The-Bot-Need-Something-To-Fix"
    }
     errorMessage = error.response.data.message
      .replaceAll("player-not-found", "User-Is-Not-Registered")
      .replaceAll("-", " ")
      .replaceAll("error.", "")
      .toUpperCase();

    const embedBuilder = new MessageEmbed()

      .setThumbnail(
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      )
      .setColor("GOLD")
      .setAuthor("Oops, Something Went Wrong!")
      .setTitle(error.response.data.error.toUpperCase())
      .setDescription(errorMessage)
      .setFooter(error.response.headers.date);

      interaction.reply({ embeds: [embedBuilder], ephemeral: true });
  }
}
