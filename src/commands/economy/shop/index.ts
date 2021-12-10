import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import api from "../../../configs/api/index.js";
import {
  getAvatarUrl,
  handleErrorMessage,
} from "../../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive", "SIVE K-Pop Card Game", {
  shop: "Shop Related Commands for Card Game",
})
class ShopCommand {
  @SlashGroup("shop")
  @Slash("list", {description: "Display available items in the store"})
  async displayShop(interaction: CommandInteraction) {
    try {
      const response = await axios.get(`${api.game}/shop/list`);
      const data = response?.data;

      const embedBuilder = new MessageEmbed()
        .setColor("GOLD")
        .setAuthor("Available Items In Shop")
        .setTitle(`To Buy Item here The ID is indicated inside the []`);
      data.forEach(
        (e: { id: any; name: any; description: any; price: any }) => {
          embedBuilder.addField(
            `[${e.id}] ${e.name}`,
            `**${e.description}**\nPrice: ${e.price}$`
          );
        }
      );

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }

  @SlashGroup("shop")
  @Slash("buy", {description: "Purchase item from the shop"})
  async purchaseItem(
    @SlashOption("id", {
      description: "Item ID",
      required: true,
    })
    id: number,
    @SlashOption("amount", {
      description: "Amount of items to purchase",
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
      let body = {
        discordId: interaction.user.id,
        itemId: id,
        qty: qty,
      };

      await axios.post(`${api.game}/shop/purchase`, body);

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
}
