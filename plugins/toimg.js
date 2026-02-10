import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';

export const command = {
    name: 'لصورة',
    alias: ['toimg'],
    async execute(sock, from, msg, args) {
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        if (!quoted) return sock.sendMessage(from, { text: '⚠️ رد على ملصق لتحويله لصورة!' });

        const stream = await downloadContentFromMessage(quoted, 'sticker');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

        const input = './temp.webp';
        const output = './temp.png';
        fs.writeFileSync(input, buffer);

        exec(`ffmpeg -i ${input} ${output}`, async (err) => {
            if (err) return sock.sendMessage(from, { text: '❌ حدث خطأ' });
            await sock.sendMessage(from, { image: fs.readFileSync(output), caption: '✅ تم التحويل بنجاح' });
            fs.unlinkSync(input);
            fs.unlinkSync(output);
        });
    }
};

