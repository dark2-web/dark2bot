import baileys from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import express from 'express';
import qrcode from 'qrcode-terminal';
import { handleAutoAI } from './plugins/ai.js';

const makeWASocket = baileys.default || baileys;
const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    getContentType 
} = baileys;

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('✅ ZENIN BOT IS LIVE!'));
app.listen(port, () => console.log(`🌐 Web Server on port: ${port}`));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
        printQRInTerminal: false, // بنطبع الـ QR يدوي عشان نتحكم في الحجم
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n📌 SCAN THIS QR CODE:\n');
            qrcode.generate(qr, { small: true }); // 'small: true' بتخلي الـ QR أوضح في شاشات Render
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`📡 Connection closed. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ DARK ZENIN: ONLINE AND READY');
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m || !m.message || m.key.remoteJid === 'status@broadcast') return;

            const from = m.key.remoteJid;
            const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "";
            
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
        } catch (err) { console.error('❌ Error:', err); }
    });
}

startBot().catch(err => console.log("Critical Error:", err));

