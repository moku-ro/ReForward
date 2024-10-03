require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// Configura tu token aquí
const TOKEN = process.env.DISCORD_TOKEN;
// ID de los canales
const ARTE_CHANNEL_ID = process.env.ARTE_CHANNEL_ID;
const ANUNCIOS_CHANNEL_ID = process.env.ANUNCIOS_CHANNEL_ID;

// Palabras clave que activarán el bot
const KEYWORDS = ['[A]'];

client.once('ready', () => {
  console.log('Bot está listo!');
});

client.on('messageCreate', async message => {
  // Ignora mensajes del bot y mensajes que no son del canal "arte"
  if (message.author.bot || message.channel.id !== ARTE_CHANNEL_ID) return;

  // Comprueba si el mensaje contiene alguna palabra clave
  const containsKeyword = KEYWORDS.some(keyword => 
    message.content.toLowerCase().includes(keyword)
  );

  if (containsKeyword) {
    const anunciosChannel = client.channels.cache.get(ANUNCIOS_CHANNEL_ID);
    if (!anunciosChannel) return console.error('Canal de anuncios no encontrado');

    // Busca contenido multimedia en el mensaje
    const attachment = message.attachments.first();
    if (attachment) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Nuevo Arte Compartido!')
        .setDescription(message.content)
        .setImage(attachment.url)
        .setTimestamp()
        .setFooter({ text: `Compartido por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      await anunciosChannel.send({ embeds: [embed] });
    }
  }
});

client.login(TOKEN);