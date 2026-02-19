import { keepAlive } from './plugins/keep_alive.js';
import { makeWASocket, useMultiFileAuthState, delay, getContentType } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import qrcode from 'qrcode-terminal';

// ⚙️ إعدادات البوت
const config = {
    prefix: '.',
    owner: '249966162613' // تم وضع رقمك كصاحب للبوت
};

// 🔇 مخزن المكتومين العالمي
global.mutedUsers = global.mutedUsers || {};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // عطلنا الـ QR عشان نستخدم الكود
        logger: pino({ level: 'silent' }),
        browser: ["Dark Zenin", "Safari", "3.0"]
    });

    // --- كود الربط (Pairing Code) ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = '249966162613'; // رقم البوت الخاص بك
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;
            console.log(`\n\n📢 DARK ZENIN BOT: كود الربط الخاص بك هو: ${code}\n\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (connection === 'open') console.log('✅ DARK ZENIN: ONLINE');
        else if (connection === 'close') startBot();
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            // تم حذف شرط fromMe عشان يرد عليك وعلى الكل
            if (!msg.message) return;

            const from = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const type = getContentType(msg.message);

            // مراقبة المحظورين
            if (!fs.existsSync('./blocked.json')) fs.writeFileSync('./blocked.json', '[]');
            const blockedList = JSON.parse(fs.readFileSync('./blocked.json', 'utf8'));
            if (blockedList.includes(sender)) return; 

            let text = "";
            if (type === 'conversation') text = msg.message.conversation;
            else if (type === 'extendedTextMessage') text = msg.message.extendedTextMessage.text;
            else if (type === 'imageMessage') text = msg.message.imageMessage.caption;
            text = text ? text.trim() : "";

            const isGroup = from.endsWith('@g.us');
            let isBotAdmin = false;
            let isSenderAdmin = false;

            if (isGroup) {
                try {
                    const metadata = await sock.groupMetadata(from);
                    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    isBotAdmin = metadata.participants.some(p => p.id === botId && p.admin);
                    isSenderAdmin = metadata.participants.some(p => p.id === sender && p.admin);
                } catch { }
            }

            // 🛡️ فحص الكتم
            if (global.mutedUsers[sender]) {
                if (isBotAdmin) await sock.sendMessage(from, { delete: msg.key });
                return; 
            }

            // ⚙️ معالجة الأوامر من المجلد
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

