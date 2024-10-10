require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const ARTE_CHANNEL_ID = process.env.ARTE_CHANNEL_ID;
const ANUNCIOS_CHANNEL_ID = process.env.ANUNCIOS_CHANNEL_ID;
const KEYWORDS = (process.env.KEYWORDS || '[A],[WIP]').split(',');

client.once('ready', () => {
  console.log('Bot está listo!');
});

client.on('messageCreate', async message => {
  if (message.author.bot || message.channel.id !== ARTE_CHANNEL_ID) return;

  const containsKeyword = KEYWORDS.some(keyword => 
    message.content.toLowerCase().includes(keyword.toLowerCase())
  );

  if (containsKeyword) {
    const anunciosChannel = client.channels.cache.get(ANUNCIOS_CHANNEL_ID);
    if (!anunciosChannel) {
      console.error('Canal de anuncios no encontrado');
      return;
    }

    const attachment = message.attachments.first();
    if (attachment) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle(message.content.length > 100 ? message.content.substring(0, 97) + '...' : message.content)
        .setURL(message.url)
        .setDescription(`Por: [${message.author.username}](https://discord.com/users/${message.author.id})`)
        .setImage(attachment.url)
        .setTimestamp()
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }));

      try {
        await anunciosChannel.send({ embeds: [embed] });
        console.log('Mensaje reenviado con éxito al canal de anuncios');
      } catch (error) {
        console.error('Error al enviar el mensaje al canal de anuncios:', error);
      }
    }
  }
});

// Ruta simple para verificar que el servidor está funcionando
app.get('/', (req, res) => {
  res.send('Bot is running!');
});

// Inicia el servidor Express
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Inicia sesión del bot de Discord
client.login(process.env.DISCORD_TOKEN);