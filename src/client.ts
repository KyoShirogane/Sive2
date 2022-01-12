import { dirname, importx } from "@discordx/importer";
import { Intents, Interaction, Message } from "discord.js";
import { Client } from "discordx";
import "dotenv/config";

const client = new Client({
  simpleCommand: {
    prefix: "!",
  },
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  // If you only want to use guild commands, uncomment this line
  // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
  // botGuilds: ["918015788257017937"],
  silent: true,
});

client.once("ready", async () => {
  // init all application commands
  await client.initApplicationCommands({
    guild: { log: true },
    global: { log: true },
  });

  await client.guilds.fetch();
  // init permissions; enabled log to see changes
  await client.initApplicationPermissions(true);

  await client.clearApplicationCommands(
    ...client.guilds.cache.map((g) => g.id)
  );

  console.log("Bot started");
});

client.on("interactionCreate", (interaction: Interaction) => {
  client.executeInteraction(interaction);
});

client.on("messageCreate", (message: Message) => {
  client.executeCommand(message);
});

async function run() {
  // with cjs
  // await importx(__dirname + "/{events,commands}/**/*.{ts,js}");
  // with ems
  await importx(dirname(import.meta.url) + "/{events,commands}/**/*.{ts,js}");
  client.login(process.env.BOT_TOKEN ?? ""); // provide your bot token
}

run();
