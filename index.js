import makeWASocket from '@whiskeysockets/baileys';
import {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  getContentType
} from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import express from 'express';
import { handleAutoAI } from './plugins/ai.js';

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('✅ DARK ZENIN BOT IS LIVE!'));
app.listen(port, () => console.log(`🌐 Web Server active on port: ${port}`));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = (makeWASocket.default || makeWASocket)({
    version,
    logger: P({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false, // عطلنا الـ QR عشان نعتمد الكود
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });

  // --- ميزة الربط بالأرقام (Pairing Code) لـ رقم البوت ---
  if (!sock.authState.creds.registered) {
    const botNumber = "249966162613"; // رقم البوت اللي هيرسل الكود
    setTimeout(async () => {
      let code = await sock.requestPairingCode(botNumber);
      code = code?.match(/.{1,4}/g)?.join("-") || code;
      console.log(`\n\n🔑 PAIRING CODE FOR BOT: 【 ${code} 】\n\n`);
    }, 5000); 
  }
  // ----------------------------------------

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log('✅ DARK ZENIN: ONLINE');
    }
  });

  sock.ev.on('messages.upsert', async (chatUpdate) => {
    try {
      const m = chatUpdate.messages[0];
      if (!m.message || m.key.remoteJid === 'status@broadcast') return;
      const from = m.key.remoteJid;
      const type = getContentType(m.message);
      let body = (type === 'conversation') ? m.message.conversation : 
                 (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                 (type === 'imageMessage' || type === 'videoMessage') ? m.message[type.split('M')[0]].caption : "";

      if (!body) return;
      await handleAutoAI(sock, from, m, body);

      if (body.startsWith('.')) {
        const args = body.slice(1).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const pluginsDir = path.join(process.cwd(), 'plugins');
        if (fs.existsSync(pluginsDir)) {
          const files = fs.readdirSync(pluginsDir);
          for (const file of files) {
            if (file.endsWith('.js')) {
              const fileUrl = pathToFileURL(path.join(pluginsDir, file)).href;
              const plugin = await import(`${fileUrl}?update=${Date.now()}`);
              if (plugin.command && (plugin.command.name === commandName || (plugin.command.alias && plugin.command.alias.includes(commandName)))) {
                await plugin.command.execute(sock, from, m, args);
                break;
              }
            }
          }
        }
      }
    } catch (err) { console.log('❌ Error:', err); }
  });
}

startBot();

