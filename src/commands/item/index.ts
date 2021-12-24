import axios from "axios";
import { CommandInteraction, MessageEmbed } from "discord.js";
import { Discord, Slash, SlashChoice, SlashGroup, SlashOption } from "discordx";
import api from "../../configs/api/index.js";
import {
  getAvatarUrl,
  handleErrorMessage,
} from "../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive-item", "SIVE K-Pop Card Game", {
  fragment: "Commands revolving fragment",
  exp: "Commands revolving exp card",
})
class ItemCommand {
  @SlashGroup("fragment")
  @Slash("upgrade", {
    description: "Upgrade fragment rarity",
  })
  async upgradeFragment(
    @SlashChoice("★☆☆☆☆ Fragment -> ★★☆☆☆ Fragment", 1)
    @SlashChoice("★★☆☆☆ Fragment -> ★★★☆☆ Fragment", 2)
    @SlashChoice("★★★☆☆ Fragment -> ★★★★☆ Fragment", 3)
    @SlashChoice("★★★★☆ Fragment -> ★★★★★ Fragment", 4)
    @SlashOption("rarity", {
      description: "Select Upgrade Level",
      required: true,
    })
    rarity: number,
    @SlashOption("amount", {
      description: "Amount of dust to be converted is 3 to 1",
      required: true,
    })
    amount: number,
    interaction: CommandInteraction
  ) {
    try {
      let body = {
        discordId: interaction.user.id,
        quantity: amount,
        type: rarity,
      };

      const response = await axios.post(`${api.item}/fragment/upgrade`, body);
      var data = response?.data;

      const embedBuilder = new MessageEmbed()
        .setAuthor(`Successfully Upgrade Fragment`)
        .setTitle(`You used ${amount} ${data.existingFragment.name}!`)
        .setDescription(`**Tip: The convert rate is 3 to 1**`)
        .setColor(`GOLD`)
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        );

      embedBuilder.addField(
        `Base Fragment:`,
        `${data.existingFragment.qty} ${data.existingFragment.name}`
      );
      embedBuilder.addField(
        `New Fragment:`,
        `${data.upgradedFragment.qty} ${data.upgradedFragment.name}`
      );

      interaction.reply({ embeds: [embedBuilder] });
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
