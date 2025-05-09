
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');

// Configuración del bot de Discord
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const token = 'MTM3MDQ1NTQxMTczNTY2MjY1Mw.GzlE1x.nMKag9w2-jWKxE53jRmXntjEl0vfYl6ePSfOHM';  // Reemplaza con el token de tu bot

// Configuración del servidor web Express
const app = express();
const upload = multer({ dest: 'uploads/' });  // Carpeta donde se guardarán los archivos subidos

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Comando para subir archivo a Discord a través del bot
client.on('messageCreate', async message => {
  if (message.content.startsWith('!subir')) {
    const args = message.content.slice('!subir'.length).trim().split(';');
    const username = args[0].trim(); // Nombre del usuario
    const grade = args[1].trim();    // Grado del usuario
    const fileUrl = args[2].trim();  // URL del archivo (si es necesario)

    // Verifica si hay archivo adjunto
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();

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

      const channel = message.guild.channels.cache.get('1370460199520833606'); // Reemplaza con el ID del canal
      channel.send({ embeds: [embed] });

      // Confirmación de subida
      message.channel.send('¡Archivo subido con éxito!');
    } else {
      message.channel.send('Por favor, adjunta un archivo al mensaje.');
    }
  }
});

// Ruta para el formulario de subida de archivos
app.post('/upload', upload.single('archivo'), (req, res) => {
  const { nombre, grado } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send('No se ha subido ningún archivo.');
  }

  const canalId = '1370460199520833606';  // Reemplaza con el ID de tu canal de Discord
  const channel = client.channels.cache.get(canalId);

  if (channel) {
    channel.send({
      content: `Archivo subido por ${nombre} (Grado: ${grado})`,
      files: [path.join(__dirname, file.path)] // Ruta del archivo subido
    }).then(() => {
      res.send('Archivo enviado correctamente a Discord.');
    }).catch(err => {
      res.status(500).send('Hubo un error al enviar el archivo.');
      console.error(err);
    });
  } else {
    res.status(404).send('Canal no encontrado.');
  }
});

// Iniciar el servidor Express
app.listen(3000, () => {
  console.log('Servidor Express corriendo en http://localhost:3000');
});

// Iniciar el bot de Discord
client.login(token);
