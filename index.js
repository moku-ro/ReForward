require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

// Configuración del servidor web
const app = express();
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
  res.send('El bot está en funcionamiento!');
});

// Configuración del cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const TOKEN = process.env.DISCORD_TOKEN;
const ARTE_CHANNEL_ID = process.env.ARTE_CHANNEL_ID;
const ANUNCIOS_CHANNEL_ID = process.env.ANUNCIOS_CHANNEL_ID;

// Modelo de configuración (deberás crear este modelo en un archivo separado)
const Config = require('./models/Config');

client.once('ready', async () => {
  console.log('Bot está listo!');
  
  // Conectar a MongoDB
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
  }
});

client.on('messageCreate', async message => {
  // Obtener la configuración actual de la base de datos
  const config = await Config.findOne();
  if (!config) {
    console.error('No se encontró configuración');
    return;
  }

  if (message.author.bot || message.channel.id !== config.arteChannelId) return;

  const containsKeyword = config.keywords.some(keyword => 
    message.content.toLowerCase().includes(keyword.toLowerCase())
  );

  if (containsKeyword) {
    const anunciosChannel = client.channels.cache.get(config.anunciosChannelId);
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
        .setDescription(`Por: @${message.author.username}`)
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

client.login(TOKEN);

// Iniciar el servidor web
app.listen(PORT, () => {
  console.log(`Servidor web activo en el puerto ${PORT}`);
});