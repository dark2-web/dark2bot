import { keepAlive } from './plugins/keep_alive.js';
import { makeWASocket, useMultiFileAuthState, delay, getContentType } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';

// ⚙️ إعدادات البوت
const config = {
    prefix: '.',
    owner: '249966162613' 
};

// 🔇 مخزن المكتومين العالمي
global.mutedUsers = global.mutedUsers || {};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, 
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- كود الربط (Pairing Code) مع تحسين الانتظار ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = '249966162613'; 
        console.log('⏳ جاري الاتصال بسيرفر واتساب لطلب الكود...');
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(`\n\n📢 DARK ZENIN BOT: كود الربط الخاص بك هو: ${code}\n\n`);
            } catch (err) {
                console.error('❌ تعذر الحصول على كود الربط. تأكد من استقرار الإنترنت وحاول مجدداً.');
            }
        }, 10000); // انتظار 10 ثواني لضمان استقرار الاتصال
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('✅ DARK ZENIN: ONLINE');
        } else if (connection === 'close') {
            console.log('🔄 إعادة الاتصال...');
            startBot();
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

            const from = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const type = getContentType(msg.message);

            let text = "";
            if (type === 'conversation') text = msg.message.conversation;
            else if (type === 'extendedTextMessage') text = msg.message.extendedTextMessage.text;
            else if (type === 'imageMessage') text = msg.message.imageMessage.caption;
            text = text ? text.trim() : "";

            if (!text.startsWith(config.prefix)) return;

            const args = text.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const files = fs.readdirSync('./plugins');
            for (const file of files) {
                if (file.endsWith('.js')) {
                    try {
                        const plugin = await import(`./plugins/${file}?update=${Date.now()}`);
                        if (plugin.command && (plugin.command.name === commandName || (plugin.command.alias && plugin.command.alias.includes(commandName)))) {
                            await plugin.command.execute(sock, from, msg, args);
                            break; 
                        }
                    } catch (err) {}
                }
            }
        } catch (err) {
            console.error(err);
        }
    });
}

keepAlive();
startBot();

