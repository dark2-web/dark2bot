import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';

export const command = {
    name: "لصورة",
    alias: ["صورة", "toimg"],
    async execute(sock, from, m) {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        if (!quoted) return sock.sendMessage(from, { text: "⚠️ قم بعمل ريبلاي لملصق (ستيكر)" }, { quoted: m });

        try {
            const stream = await downloadContentFromMessage(quoted, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

            const fileName = `./temp_${Date.now()}.webp`;
            fs.writeFileSync(fileName, buffer);
            const outName = fileName.replace('.webp', '.png');

            exec(`ffmpeg -i ${fileName} ${outName}`, async (err) => {
                if (err) throw err;
                await sock.sendMessage(from, { image: fs.readFileSync(outName), caption: "✅ تم تحويل الملصق لصورة" }, { quoted: m });
                fs.unlinkSync(fileName);
                fs.unlinkSync(outName);
            });
        } catch (e) {
            sock.sendMessage(from, { text: "❌ فشل تحويل الملصق" }, { quoted: m });
        }
    }
};

