import { keepAlive } from './plugins/keep_alive.js';
import { makeWASocket, useMultiFileAuthState, delay, getContentType } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import qrcode from 'qrcode-terminal';

// ⚙️ إعدادات البوت
const config = {
    prefix: '.',
    owner: '966xxxxxxx' 
};

// 🔇 مخزن المكتومين العالمي
global.mutedUsers = global.mutedUsers || {};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, 
        logger: pino({ level: 'silent' }),
        browser: ["Dark Zenin", "Safari", "3.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) {
            console.log('📢 DARK ZENIN: مسح الكود لربط الجلسة:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') console.log('✅ DARK ZENIN: ONLINE');
        else if (connection === 'close') startBot();
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return; // حذفنا شرط fromMe
            const from = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const type = getContentType(msg.message);

//شوف هل نجحت + ده كود مراقبة المحظورين 
        const blockedList = JSON.parse(fs.readFileSync('./blocked.json', 'utf8') || '[]');
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

            // 🛡️ [1] فحص الكتم (يحذف فوراً)
            if (global.mutedUsers[sender]) {
                if (isBotAdmin) {
                    await sock.sendMessage(from, { delete: msg.key });
                }
                return; 
            }

            // 🚫 [2] حماية الروابط
            if (isGroup && text.includes('chat.whatsapp.com') && isBotAdmin && !isSenderAdmin) {
                await sock.sendMessage(from, { delete: msg.key });
                return;
            }

            // 🎮 [3] نظام الألعاب (بدون نقطة)
            if (sock.fkk && sock.fkk[from] && text === sock.fkk[from]) {
                await sock.sendMessage(from, { text: `✅ كفو! إجابة صحيحة: *${text}*` }, { quoted: msg });
                delete sock.fkk[from];
                return;
            }

            // ⚙️ [4] معالجة الأوامر
            if (!text.startsWith(config.prefix)) return;

            const args = text.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            // 🛑 أوامر الكتم (بالشكل الفخم اللي طلبته)
            if (commandName === 'اكتم' || commandName === 'ميوت') {
                if (!isSenderAdmin) return;
                let victim = msg.message?.extendedTextMessage?.contextInfo?.participant || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                if (!victim) return sock.sendMessage(from, { text: '⚠️ رد على الشخص لكتمه' });
                
                global.mutedUsers[victim] = true;
                const muteMsg = `🔇 *تـم كـتـم الـعـضـو @${victim.split('@')[0]} لـمـدة 5 دقـائـق.*\nسيتم حذف رسائله تلقائياً!`;
                
                return sock.sendMessage(from, { text: muteMsg, mentions: [victim] }, { quoted: msg });
            }

            if (commandName === 'تكلم' || commandName === 'فك_الكتم') {
                if (!isSenderAdmin) return;
                let victim = msg.message?.extendedTextMessage?.contextInfo?.participant || msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
                if (!victim) return sock.sendMessage(from, { text: '⚠️ رد على الشخص لفك كتمه' });
                
                delete global.mutedUsers[victim];
                const unmuteMsg = `🔊 *تـم فـك الـكـتـم عـن @${victim.split('@')[0]}*\nيمكنك التحدث الآن بحرية!`;
                
                return sock.sendMessage(from, { text: unmuteMsg, mentions: [victim] }, { quoted: msg });
            }

            // [5] تشغيل الأوامر من مجلد plugins
            const files = fs.readdirSync('./plugins');
            for (const file of files) {
                if (file.endsWith('.js')) {
                    try {
                        const plugin = await import(`./plugins/${file}?update=${Date.now()}`);
                        if (plugin.command && (plugin.command.name === commandName || (plugin.command.alias && plugin.command.alias.includes(commandName)))) {
                            await plugin.command.execute(sock, from, msg, args);
                            break; 
                        }
                    } catch (err) {
                        console.error(`Error in ${file}:`, err);
                    }
                }
            }

        } catch (err) {
            console.error(err);
        }
    });
}

keepAlive();
startBot();
