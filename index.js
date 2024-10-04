require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

// Importar el modelo Config
const Config = require('./models/Config');

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

// Función para inicializar la configuración
async function initializeConfig() {
  try {
    let config = await Config.findOne();
    if (!config) {
      config = new Config({
        arteChannelId: process.env.ARTE_CHANNEL_ID,
        anunciosChannelId: process.env.ANUNCIOS_CHANNEL_ID,
        keywords: ['[A]', '[WIP]']
      });
      await config.save();
      console.log('Configuración inicial creada');
    }
  } catch (error) {
    console.error('Error al inicializar la configuración:', error);
  }
}

// Conectar a MongoDB y inicializar la configuración
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    return initializeConfig();
  })
  .then(() => {
    console.log('Configuración inicializada');
    // Iniciar el bot de Discord después de que la configuración esté lista
    client.login(TOKEN);
  })
  .catch(err => console.error('Error al conectar a MongoDB o inicializar la configuración:', err));

client.once('ready', () => {
  console.log('Bot está listo!');
});

client.on('messageCreate', async message => {
  try {
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
  } catch (error) {
    console.error('Error al procesar el mensaje:', error);
  }
});

// Iniciar el servidor web
app.listen(PORT, () => {
  console.log(`Servidor web activo en el puerto ${PORT}`);
});