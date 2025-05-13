const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');

// ==== Configurar Discord Bot ====
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const token = process.env.BOT_TOKEN;
const canalId = '1370460199520833606'; // ID del canal de destino

// ==== Asegurar que la carpeta 'uploads/' exista ====
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ==== Configurar Multer (almacenamiento con nombre original) ====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// ==== Configurar servidor Express ====
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// **Servir el archivo HTML desde la carpeta 'public'**
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para mostrar el HTML cuando se accede a la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==== Ruta para subir archivos desde formulario web ====
app.post('/upload', upload.single('archivo'), async (req, res) => {
  const { nombre, grado, titulo, comentario } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).send('❌ No se ha subido ningún archivo.');
  }

  const channel = client.channels.cache.get(canalId);
  if (!channel) return res.status(404).send('❌ Canal no encontrado.');

  try {
    await channel.send({
      content: `📤 **${titulo || 'Archivo sin título'}**\n👤 Subido por: ${nombre} (Grado: ${grado})\n📝 ${comentario || 'Sin comentarios.'}`,
      files: [path.resolve(file.path)]
    });

    res.send('✅ Archivo enviado correctamente a Discord.');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Hubo un error al enviar el archivo.');
  }
});

// ==== Comando para subir archivos desde Discord ====
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!subir')) return;

  const args = message.content.slice('!subir'.length).trim().split(';');
  if (args.length < 2) {
    return message.channel.send('❌ Formato incorrecto. Usa: `!subir nombre;grado;[título];[comentario]` y adjunta un archivo.');
  }

  const [username, grade, titulo = 'Archivo sin título', comentario = 'Sin comentarios.'] = args.map(arg => arg.trim());

  if (message.attachments.size === 0) {
    return message.channel.send('❌ Por favor, adjunta un archivo al mensaje.');
  }

  const attachment = message.attachments.first();
  const embed = {
    title: `📁 ${titulo}`,
    description: `**Grado:** ${grade}\n📝 ${comentario}`,
    fields: [
      { name: 'Nombre', value: username },
      { name: 'Archivo', value: `[Haz clic aquí para descargar](${attachment.url})` }
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
});

// ==== Iniciar Express Server ====
app.listen(3000, () => {
  console.log('🌐 Servidor Express corriendo en http://localhost:3000');
});

// ==== Iniciar Bot ====
client.login(token);
