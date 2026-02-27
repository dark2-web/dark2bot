import { keepAlive } from './plugins/keep_alive.js';
import baileys from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { Boom } from '@hapi/boom';

// استخراج الوظائف من المكتبة بشكل يتوافق مع Wileys
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    getContentType 
} = baileys;

// ⚙️ إعدادات البوت
const config = {
    prefix: '.',
    owner: '249966162613' 
};

global.mutedUsers = global.mutedUsers || {};

async function startBot() {
    const authPath = path.join(process.cwd(), 'auth');
    const { state, saveCreds } = await useMultiFileAuthState(authPath);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // خلها true عشان لو طلب QR يظهر لك
        logger: pino({ level: 'silent' }),
        browser: ["Dark Zenin", "Chrome", "20.0.04"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📢 DARK ZENIN: امسح الكود لتفعيل الأزرار!');
        }

        if (connection === 'open') {
            console.log('✅ DARK ZENIN: ONLINE (Wileys Edition)');
        } else if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg || !msg.message || msg.key.remoteJid === 'status@broadcast') return;

            const from = msg.key.remoteJid;
            const type = getContentType(msg.message);

            let text = "";
            if (type === 'conversation') text = msg.message.conversation;
            else if (type === 'extendedTextMessage') text = msg.message.extendedTextMessage.text;
            else if (type === 'imageMessage') text = msg.message.imageMessage.caption;
            // دعم قراءة الأزرار
            else if (type === 'buttonsResponseMessage') text = msg.message.buttonsResponseMessage.selectedButtonId;
            else if (type === 'listResponseMessage') text = msg.message.listResponseMessage.singleSelectReply.selectedRowId;
            
            text = text ? text.trim() : "";

            if (!text.startsWith(config.prefix)) return;

            const args = text.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const pluginsDir = path.join(process.cwd(), 'plugins');
            const files = fs.readdirSync(pluginsDir);

            for (const file of files) {
                if (file.endsWith('.js') && file !== 'keep_alive.js') {
                    try {
                        const fileUrl = pathToFileURL(path.join(pluginsDir, file)).href;
                        const plugin = await import(`${fileUrl}?update=${Date.now()}`);
                        
                        if (plugin.command && (plugin.command.name === commandName || (plugin.command.alias && plugin.command.alias.includes(commandName)))) {
                            await plugin.command.execute(sock, from, msg, args);
                            break; 
                        }
                    } catch (err) {
                        console.error(`خطأ في تشغيل ${file}:`, err);
                    }
                }
            }
        } catch (err) {
            console.error('❌ خطأ في استقبال الرسالة:', err);
        }
    });
}

keepAlive();
startBot();

