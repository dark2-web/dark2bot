import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import { exec } from 'child_process';

export const command = {
    name: 'ملصق',
    alias: ['s', 'sticker'],
    async execute(sock, from, msg, args) {
        const quoted = msg.message.imageMessage || msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || msg.message.videoMessage || msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
        
        if (!quoted) return sock.sendMessage(from, { text: '⚠️ رد على صورة أو فيديو قصير لعمل ملصق!' });

        const stream = await downloadContentFromMessage(quoted, quoted.mimetype.split('/')[0] === 'image' ? 'image' : 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

        const input = './temp.media';
        const output = './temp.webp';
        fs.writeFileSync(input, buffer);

        exec(`ffmpeg -i ${input} -vcodec libwebp -filter:v "scale='if(gt(a,1),512,-1)':'if(gt(a,1),-1,512)',pad=512:512:(512-iw)/2:(512-ih)/2:color=white@0" -lossless 1 -loop 0 -an -vsync 0 ${output}`, async (err) => {
            if (err) return sock.sendMessage(from, { text: '❌ خطأ في المعالجة' });
            await sock.sendMessage(from, { sticker: fs.readFileSync(output) });
            fs.unlinkSync(input);
            fs.unlinkSync(output);
        });
    }
};

