
const { Client, Intents } = require('discord.js');
const fs = require('fs');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const token = 'MTM3MDQ1NTQxMTczNTY2MjY1Mw.GzlE1x.nMKag9w2-jWKxE53jRmXntjEl0vfYl6ePSfOHM'; // Reemplaza con el token de tu bot

client.on('messageCreate', async message => {
  // Comando para subir archivo
  if (message.content.startsWith('!subir')) {
    const args = message.content.slice('!subir'.length).trim().split(';');
    const username = args[0].trim(); // Nombre del usuario
    const grade = args[1].trim();    // Grado del usuario
    const fileUrl = args[2].trim();  // URL del archivo (si es necesario)

    // Verifica si hay archivo adjunto
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();

      // Aquí puedes enviar el archivo al canal, junto con los detalles
      const embed = {
        title: `Nuevo archivo subido por ${username}`,
        description: `**Grado:** ${grade}`,
        fields: [
          { name: 'Nombre', value: username },
          { name: 'Grado', value: grade },
          { name: 'Archivo', value: `[Haz clic aquí para descargar el archivo](${attachment.url})` }
        ],
        color: 0x00ff00
      };

      // Enviar el mensaje con el archivo y la información
      const channel = message.guild.channels.cache.get('1370460199520833606'); // Reemplaza con el ID del canal
      channel.send({ embeds: [embed] });

      // Confirmación de subida
      message.channel.send('¡Archivo subido con éxito!');
    } else {
      message.channel.send('Por favor, adjunta un archivo al mensaje.');
    }
  }
});

client.login(token);
