import makeWASocket from '@whiskeysockets/baileys';
import {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  getContentType
} from '@whiskeysockets/baileys';
import P from 'pino';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

// استيراد وظيفة الرد التلقائي من ملف الـ AI
import { handleAutoAI } from './plugins/ai.js';

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = (makeWASocket.default || makeWASocket)({
    version,
    logger: P({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"]
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('\n📌 Scan this QR:\n');
      qrcode.generate(qr, { small: true });
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('🔁 Reconnecting...');
        startBot();
      }
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
      const prefix = '.';
      let body = "";

      if (type === 'conversation') {
        body = m.message.conversation;
      } else if (type === 'extendedTextMessage') {
        body = m.message.extendedTextMessage.text;
      } else if (type === 'imageMessage') {
        body = m.message.imageMessage.caption;
      } else if (type === 'videoMessage') {
        body = m.message.videoMessage.caption;
      } else if (type === 'buttonsResponseMessage') {
        body = m.message.buttonsResponseMessage.selectedButtonId;
      } else if (type === 'listResponseMessage') {
        body = m.message.listResponseMessage.singleSelectReply.selectedRowId;
      } else if (type === 'templateButtonReplyMessage') {
        body = m.message.templateButtonReplyMessage.selectedId;
      }

      if (!body) return;

      // 🤖 تشغيل الرد التلقائي (المنشن والريبلاي)
      await handleAutoAI(sock, from, m, body);

      // ⚙️ نظام تنفيذ الأوامر بالبريفكس (.)
      if (body.startsWith(prefix)) {
        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const pluginsDir = path.join(process.cwd(), 'plugins');

        if (!fs.existsSync(pluginsDir)) return;
        const files = fs.readdirSync(pluginsDir);

        for (const file of files) {
          if (file.endsWith('.js') && file !== 'keep_alive.js') {
            const fileUrl = pathToFileURL(path.join(pluginsDir, file)).href;
            const plugin = await import(`${fileUrl}?update=${Date.now()}`);

            if (plugin.command && (plugin.command.name === commandName || (plugin.command.alias && plugin.command.alias.includes(commandName)))) {
              await plugin.command.execute(sock, from, m, args);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.log('❌ Error in messages.upsert:', err);
    }
  });
}

startBot();

