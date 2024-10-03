require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
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

const KEYWORDS = ['[A]', '[WIP]'];

client.once('ready', () => {
  console.log('Bot está listo!');
  console.log(`ID del canal de arte: ${ARTE_CHANNEL_ID}`);
  console.log(`ID del canal de anuncios: ${ANUNCIOS_CHANNEL_ID}`);
});

client.on('messageCreate', async message => {
  console.log(`Mensaje recibido en el canal: ${message.channel.id}`);
  
  if (message.author.bot) {
    console.log('Mensaje ignorado: es de un bot');
    return;
  }
  
  if (message.channel.id !== ARTE_CHANNEL_ID) {
    console.log('Mensaje ignorado: no es del canal de arte');
    return;
  }

  console.log('Contenido del mensaje:', message.content);

  const containsKeyword = KEYWORDS.some(keyword => 
    message.content.toLowerCase().includes(keyword.toLowerCase())
  );

  console.log('¿Contiene palabra clave?', containsKeyword);

  if (containsKeyword) {
    const anunciosChannel = client.channels.cache.get(ANUNCIOS_CHANNEL_ID);
    if (!anunciosChannel) {
      console.error('Canal de anuncios no encontrado');
      return;
    }

    const attachment = message.attachments.first();
    if (attachment) {
      console.log('Attachment encontrado:', attachment.url);
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('Nuevo Arte Compartido!')
        .setDescription(message.content)
        .setImage(attachment.url)
        .setTimestamp()
        .setFooter({ text: `Compartido por ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      try {
        await anunciosChannel.send({ embeds: [embed] });
        console.log('Mensaje reenviado con éxito al canal de anuncios');
      } catch (error) {
        console.error('Error al enviar el mensaje al canal de anuncios:', error);
      }
    } else {
      console.log('No se encontró ningún attachment en el mensaje');
    }
  }
});

client.login(TOKEN);