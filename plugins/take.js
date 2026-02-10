import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';

export const command = {
    name: 'سرق',
    alias: ['حقوقي'],
    async execute(sock, from, msg, args) {
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        if (!quoted) return sock.sendMessage(from, { text: '⚠️ رد على ملصق لسرقة حقوقه!' });

        const stream = await downloadContentFromMessage(quoted, 'sticker');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

        // إرسال الملصق مع إضافة حقوقك (سيتم استخدام الاسم من config.js تلقائياً)
        await sock.sendMessage(from, { sticker: buffer }, { quoted: msg });
    }
};

