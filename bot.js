
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');

// ==== Configuración del bot de Discord ====
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const token = process.env.BOT_TOKEN;
const canalId = '1370460199520833606'; // Reemplaza con el ID del canal donde se envían los archivos

// ==== Configuración del almacenamiento con nombre original ====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Se asegura de mantener el nombre original
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// ==== Configuración del servidor web Express ====
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==== Ruta para subir archivos desde un formulario web ====
app.post('/upload', upload.single('archivo'), (req, res) => {
  const { nombre, grado } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send('No se ha subido ningún archivo.');
  }

  const channel = client.channels.cache.get(canalId);

  if (channel) {
    channel.send({
      content: `📎 **Archivo subido por ${nombre} (Grado: ${grado})**`,
      files: [path.join(__dirname, file.path)]
    }).then(() => {
      res.send('✅ Archivo enviado correctamente a Discord.');
    }).catch(err => {
      console.error(err);
      res.status(500).send('❌ Hubo un error al enviar el archivo.');
    });
  } else {
    res.status(404).send('❌ Canal no encontrado.');
  }
});

// ==== Comando para subir archivo a Discord a través del bot ====
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  if (message.content.startsWith('!subir')) {
    const args = message.content.slice('!subir'.length).trim().split(';');

    if (args.length < 2) {
      return message.channel.send('❌ Formato incorrecto. Usa: `!subir nombre;grado` y adjunta un archivo.');
    }

    const username = args[0].trim();
    const grade = args[1].trim();

    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();

      const embed = {
        title: `📁 Nuevo archivo subido por ${username}`,
        description: `**Grado:** ${grade}`,
        fields: [
          { name: 'Nombre', value: username },
          { name: 'Grado', value: grade },
          { name: 'Archivo', value: `[Haz clic aquí para descargar el archivo](${attachment.url})` }
        ],
        color: 0x00ff00
      };

      const channel = message.guild.channels.cache.get(canalId);
      if (channel) {
        await channel.send({ embeds: [embed] });
        message.channel.send('✅ ¡Archivo subido con éxito!');
      } else {
        message.channel.send('❌ No se encontró el canal de destino.');
      }
    } else {
      message.channel.send('❌ Por favor, adjunta un archivo al mensaje.');
    }
  }
});

// ==== Iniciar servidor Express ====
app.listen(3000, () => {
  console.log('Servidor Express corriendo en http://localhost:3000');
});

// ==== Iniciar el bot ====
client.login(token);
