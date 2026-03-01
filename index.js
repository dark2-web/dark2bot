import baileys from '@whiskeysockets/baileys';
import P from 'pino';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import express from 'express';
import { handleAutoAI } from './plugins/ai.js';

// --- حل مشكلة الاستيراد (Import Fix) ---
const makeWASocket = baileys.default || baileys;
const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    getContentType 
} = baileys;
// ----------------------------------------

const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('✅ ZENIN BOT IS ACTIVE'));
app.listen(port, () => console.log(`🌐 Server Port: ${port}`));

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
        printQRInTerminal: false,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered) {
        const botNumber = "249966162613";
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(botNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n\n🔑 PAIRING CODE: 【 ${code} 】\n\n`);
            } catch (e) {
                console.log("❌ Pairing code error:", e.message);
            }
        }, 10000);
    }

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

