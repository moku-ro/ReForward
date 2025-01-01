require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("configure")
    .setDescription("Configure source and target channels")
    .addChannelOption((option) =>
      option
        .setName("source")
        .setDescription("The source channel")
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("target")
        .setDescription("The target channel")
        .setRequired(true)
    ),
].map((command) => command.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
