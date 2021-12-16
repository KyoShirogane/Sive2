import { Pagination } from "@discordx/utilities";
import {
  CommandInteraction,
  Interaction,
  MessageEmbed,
  User,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import {
  getAvatarUrl,
  handleErrorMessage,
} from "../../utilities/helper/index.js";

@Discord()
@SlashGroup("sive", "SIVE K-Pop Card Game", {
  game: "Game Commands",
  general: "General Commands",
})
class GeneralCommands {
  @SlashGroup(`general`)
  @Slash("bot-info", { description: "Bot Information" })
  async info(interaction: CommandInteraction) {
    const owner = await interaction.client.users.fetch(`297962724191895552`);

    const embedBuilder = new MessageEmbed()
      .setThumbnail(
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      )
      .setColor(`GOLD`);

    embedBuilder.setAuthor(`SIVE Bot`);
    embedBuilder.setTitle(`Bot Information`);
    embedBuilder.setColor(`GOLD`);
    embedBuilder.setImage(
      getAvatarUrl(interaction.client.user?.id, interaction.client.user?.avatar)
    );
    embedBuilder.setDescription(
      `Card K-Pop Bot created using Discordx and Spring Framework.`
    );
    embedBuilder.addField(`Created By`, `${owner.tag}`);
    embedBuilder.addField(`Node Version`, `${process.versions.node}`);
    embedBuilder.addField(`API Version`, `2.1.5`);
    embedBuilder.setFooter(
      `Requested By ${interaction.user.username.toUpperCase()}`
    );

    interaction.reply({ embeds: [embedBuilder] });
  }

  @SlashGroup(`general`)
  @Slash("server-info", { description: "Current Server Information" })
  async serverInfo(interaction: CommandInteraction) {
    const embedBuilder = new MessageEmbed()
      .setThumbnail(
        getAvatarUrl(
          interaction.client.user?.id,
          interaction.client.user?.avatar
        )
      )
      .setColor(`GOLD`);
    const owner = await interaction.guild?.fetchOwner();

    if (interaction.guild?.bannerURL() !== null) {
      embedBuilder.setImage(interaction.guild?.bannerURL()!);
    }

    if (interaction.guild?.iconURL() !== null) {
      embedBuilder.setThumbnail(interaction.guild?.iconURL()!);
    }
    embedBuilder.setAuthor(`${interaction.guild?.name.toUpperCase()}`);
    embedBuilder.setTitle(`Server Information`);
    embedBuilder.setColor(`GOLD`);
    embedBuilder.setDescription(`Owned By ${owner?.displayName}`);
    embedBuilder.addField(`Created At`, `${interaction.guild?.createdAt}`);
    embedBuilder.addField(`Member Counts`, `${interaction.guild?.memberCount}`);
    embedBuilder.addField(
      `Text Channels`,
      `${
        interaction.guild?.channels.cache.filter((c) => c.type === "GUILD_TEXT")
          .size
      }`
    );
    embedBuilder.addField(
      `Voice Channels`,
      `${
        interaction.guild?.channels.cache.filter(
          (c) => c.type === "GUILD_VOICE"
        ).size
      }`
    );
    embedBuilder.addField(`Emotes`, `${interaction.guild?.emojis.cache.size}`);
    embedBuilder.addField(`Roles`, `${interaction.guild?.roles.cache.size}`);
    embedBuilder.setFooter(
      `Requested By ${interaction.user.username.toUpperCase()}`
    );

    interaction.reply({ embeds: [embedBuilder] });
  }

  @SlashGroup(`game`)
  @Slash("help", { description: "Game Information" })
  async gameHelp(interaction: CommandInteraction): Promise<void> {
    try {
      let embeds = [];

      const introEmbed = new MessageEmbed()
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        )
        .setColor(`GOLD`);

      introEmbed.setAuthor(`SIVE Card Game`);
      introEmbed.setTitle(`Game Manual`);
      introEmbed.setDescription(
        `SIVE Card Game is a K-Pop based card game made using TypeScript and Discordx`
      );
      introEmbed.addField(`Page 1`, `Home Page`, false);
      introEmbed.addField(`Page 2`, `Player Commands`, false);
      introEmbed.addField(`Page 3`, `Card Commands`, false);
      introEmbed.addField(`Page 4`, `Deck Commands`, false);
      introEmbed.addField(`Page 5`, `Quest Commands`, false);
      introEmbed.addField(`Page 6`, `Shop Commands`, false);
      introEmbed.addField(`Page 7`, `Market Commands`, false);
      introEmbed.addField(`Page 8`, `Trade Commands`, false);

      embeds.push(introEmbed);

      const playerEmbed = new MessageEmbed()
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        )
        .setColor(`GOLD`);

      playerEmbed.setAuthor(`SIVE: Player Commands`);
      playerEmbed.setTitle(
        `Player Commands Generally Focused On The Player Related Commands`
      );
      playerEmbed.setDescription(`Commands:`);
      playerEmbed.addField(
        `**sive player register**`,
        `Register yourself as a player for SIVE Card Game`,
        false
      );
      playerEmbed.addField(
        `**sive player login**`,
        `Login Daily to receive extra rewards`,
        false
      );
      playerEmbed.addField(
        `**sive player profile**`,
        `Display your profile`,
        false
      );
      playerEmbed.addField(
        `**sive player inventory**`,
        `Display your inventory`,
        false
      );
      playerEmbed.addField(
        `**sive player balance**`,
        `Display your current balance`,
        false
      );
      playerEmbed.addField(
        `**sive player transfer**`,
        `Transfer balance to your friend`,
        false
      );

      embeds.push(playerEmbed);

      const cardEmbed = new MessageEmbed()
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        )
        .setColor(`GOLD`);

      cardEmbed.setAuthor(`SIVE: Card Commands`);
      cardEmbed.setTitle(
        `Card Commands Generally Focused On The Card Related Commands`
      );
      cardEmbed.setDescription(`Commands:`);
      cardEmbed.addField(
        `**sive card display**`,
        `List of the cards you owned in SIVE`,
        false
      );
      cardEmbed.addField(
        `**sive card view**`,
        `View a specific card by card ID`,
        false
      );
      cardEmbed.addField(
        `**sive card summon*`,
        `Summon idol cards {requiring tickets}`,
        false
      );
      cardEmbed.addField(`**sive card lock**`, `Lock/Unlock your card`, false);
      cardEmbed.addField(
        `**sive card upgrade**`,
        `Transfer balance to your friend`,
        false
      );
      cardEmbed.addField(
        `**sive card burn**`,
        `Burn idol cards to gain fragments`,
        false
      );
      cardEmbed.addField(
        `**sive card pending-burn**`,
        `Display your unconfirmed burn requests`,
        false
      );
      cardEmbed.addField(
        `**sive card remove-burn**`,
        `Display your inventory`,
        false
      );
      cardEmbed.addField(
        `**sive card confirm-burn**`,
        `Confirm your burn requests`,
        false
      );
      embeds.push(cardEmbed);

      const deckEmbed = new MessageEmbed()
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        )
        .setColor(`GOLD`);

      deckEmbed.setAuthor(`SIVE: Deck Commands`);
      deckEmbed.setTitle(
        `Card Commands Generally Focused On The Deck Related Commands`
      );
      deckEmbed.setDescription(`Commands:`);
      deckEmbed.addField(`**sive deck list**`, `List of all your decks`, false);
      deckEmbed.addField(`**sive card create**`, `Create a new deck`, false);
      deckEmbed.addField(
        `**sive card edit**`,
        `Add/Remove card from your deck`,
        false
      );

      embeds.push(deckEmbed);

      var questEmbed = new MessageEmbed()
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        )
        .setColor(`GOLD`);

      questEmbed.setAuthor(`SIVE: Quest Commands`);
      questEmbed.setTitle(
        `Quest Commands Generally Focused On The Quest Related Commands`
      );
      questEmbed.setDescription(`Commands:`);
      questEmbed.addField(
        `**sive quest list**`,
        `Available quests {you can only take 5 simultaneously}`,
        false
      );
      questEmbed.addField(
        `**sive quest running**`,
        `Display your current ongoing quests`,
        false
      );
      questEmbed.addField(`**sive quest take**`, `Take quest`, false);
      questEmbed.addField(
        `**sive quest submit**`,
        `Submit your ongoing quests`,
        false
      );

      embeds.push(questEmbed);

      var shopEmbed = new MessageEmbed()
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        )
        .setColor(`GOLD`);

      shopEmbed.setAuthor(`SIVE: Shop Commands`);
      shopEmbed.setTitle(
        `Shop Commands Generally Focused On The Shop Related Commands`
      );
      shopEmbed.setDescription(`Commands:`);
      shopEmbed.addField(
        `**sive shop list**`,
        `Display available items in the store`,
        false
      );
      shopEmbed.addField(
        `**sive shop buy**`,
        `Purchase item from the shop`,
        false
      );

      embeds.push(shopEmbed);

      var marketEmbed = new MessageEmbed()
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        )
        .setColor(`GOLD`);

      marketEmbed.setAuthor(`SIVE: Market Commands`);
      marketEmbed.setTitle(
        `Market Commands Generally Focused On The Market Related Commands`
      );
      marketEmbed.setDescription(`Commands:`);
      marketEmbed.addField(
        `**sive market list**`,
        `Display available items in the market`,
        false
      );
      marketEmbed.addField(
        `**sive market my-listing**`,
        `Display your market listing`,
        false
      );
      marketEmbed.addField(
        `**sive market buy**`,
        `Purchase item from the market`,
        false
      );
      marketEmbed.addField(
        `**sive market sell**`,
        `List your item into the market`,
        false
      );

      embeds.push(marketEmbed);

      var tradeEmbed = new MessageEmbed()
        .setThumbnail(
          getAvatarUrl(
            interaction.client.user?.id,
            interaction.client.user?.avatar
          )
        )
        .setColor(`GOLD`);

      tradeEmbed.setAuthor(`SIVE: Trade Commands`);
      tradeEmbed.setTitle(
        `Trade Commands Generally Focused On The Trade Related Commands`
      );
      tradeEmbed.setDescription(`Commands:`);
      tradeEmbed.addField(
        `**sive trade list**`,
        `Display list of your trades`,
        false
      );
      tradeEmbed.addField(
        `**sive trade create**`,
        `Create a new trade request`,
        false
      );
      tradeEmbed.addField(
        `**sive trade add**`,
        `Add a card to ongoing trade`,
        false
      );
      tradeEmbed.addField(
        `**sive trade confirm**`,
        `Confirm/Reject your side of the trade`,
        false
      );

      embeds.push(tradeEmbed);

      const pagination = new Pagination(interaction, embeds);
      await pagination.send();
    } catch (error) {
      handleErrorMessage(interaction, error);
    }
  }
}
