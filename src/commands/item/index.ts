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

  @SlashGroup("exp")
  @Slash("use", {
    description: "Use EXP card to boost card statistics",
  })
  async useExpCard(
    @SlashChoice("Vocal EXP", 1)
    @SlashChoice("Rap EXP", 2)
    @SlashChoice("Dance EXP", 3)
    @SlashOption("attribute", {
      description: "Attribute to boost",
      required: true,
    })
    type: number,
    @SlashOption("amount", {
      description: "Amount of cards to use [Rate is quantity x 1.5]",
      required: true,
    })
    amount: number,
    @SlashOption("card-id", {
      description: "ID of card to upgrade",
      required: true,
    })
    cardId: number,
    interaction: CommandInteraction
  ) {
    try {
      let body = {
        cardId: cardId,
        amount: amount,
        discordId: interaction.user.id,
        expType: type
      }
  
      const response = await axios.post(`${api.item}/exp-card/use`, body);

      var data = response?.data;

      const embedBuilder = new MessageEmbed().setAuthor(`Successfully upgrade stats`).setTitle(`Used ${amount} EXP Card from your inventory`).setColor(`GOLD`).setThumbnail(getAvatarUrl(interaction.client.user?.id, interaction.client.user?.avatar));

      if(type === 1){
        embedBuilder.setDescription(`Vocal EXP: ${data.previousExp} -> ${data.newExp}`)
      }else if(type === 2){
        embedBuilder.setDescription(`Rap EXP: ${data.previousExp} -> ${data.newExp}`)
      }else{
        embedBuilder.setDescription(`Dance EXP: ${data.previousExp} -> ${data.newExp}`)
      }


      interaction.reply({embeds: [embedBuilder]})
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
