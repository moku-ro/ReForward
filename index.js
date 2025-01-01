require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const client = require("./config/discordClient");

const app = express();
const PORT = process.env.PORT || 3000;

let sourceChannelId = null;
let targetChannelId = null;

client.once("ready", () => {
  console.log("Bot is ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "configure") {
    sourceChannelId = options.getChannel("source").id;
    targetChannelId = options.getChannel("target").id;
    await interaction.reply(
      `Source channel set to <#${sourceChannelId}> and target channel set to <#${targetChannelId}>`
    );
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.channel.id !== sourceChannelId) return;

  const containsKeyword = process.env.KEYWORDS.split(",").some((keyword) =>
    message.content.toLowerCase().includes(keyword.toLowerCase())
  );

  if (containsKeyword) {
    const targetChannel = client.channels.cache.get(targetChannelId);
    if (!targetChannel) {
      console.error("Target channel not found");
      return;
    }

    const attachment = message.attachments.first();
    if (attachment) {
      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle(
          message.content.length > 100
            ? message.content.substring(0, 97) + "..."
            : message.content
        )
        .setURL(message.url)
        .setDescription(`By: <@${message.author.id}>`)
        .setImage(attachment.url)
        .setTimestamp()
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

      try {
        await targetChannel.send({ embeds: [embed] });
        console.log("Message successfully forwarded to target channel");
      } catch (error) {
        console.error("Error sending message to target channel:", error);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

client.login(process.env.DISCORD_TOKEN);
