import { keepAlive } from './plugins/keep_alive.js';
import baileys from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { Boom } from '@hapi/boom';

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    getContentType
} = baileys;

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
        printQRInTerminal: false, // قفلنا الـ QR عشان نستخدم الرقم
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- كود طلب رقم الهاتف (الربط بالكود) ---
    if (!sock.authState.creds.registered) {
        // رقمك المسجل عندي في المعلومات المحفوظة
        const phoneNumber = "249966162613"; 
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log('\n\n-----------------------------------');
                console.log(`🟢 كود الربط الخاص بك هو: ${code}`);
                console.log('-----------------------------------\n\n');
            } catch (error) {
                console.error('❌ فشل طلب كود الربط:', error);
            }
        }, 3000);
    }
    // ---------------------------------------

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

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
console.log('نوع الرسالة المستلمة:', type); // سطر لمراقبة المشكلة

            let text = "";
            if (type === 'conversation') text = msg.message.conversation;
            else if (type === 'extendedTextMessage') text = msg.message.extendedTextMessage.text;
            else if (type === 'imageMessage') text = msg.message.imageMessage.caption;
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

