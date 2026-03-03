import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import webp from 'node-webpmux';
import crypto from 'crypto';

export const command = {
    name: "ملصق",
    alias: ["ستيكر", "s", "sticker"],
    category: "أدوات",
    desc: "تحويل الصور والفيديوهات لملصقات احترافية",
    async execute(sock, from, m, args) {
        // تحديد الرسالة المستهدفة (سواء ريبلاي أو الرسالة نفسها)
        let targetMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage ? 
            { key: { remoteJid: from, id: m.message.extendedTextMessage.contextInfo.stanzaId, participant: m.message.extendedTextMessage.contextInfo.participant }, message: m.message.extendedTextMessage.contextInfo.quotedMessage } : m;

        const mediaMessage = targetMessage.message?.imageMessage || targetMessage.message?.videoMessage;

        if (!mediaMessage) {
            return sock.sendMessage(from, { text: '⚠️ يا حب، لازم تعمل ريبلاي لصورة أو فيديو أو تبعت الأمر مع ميديا عشان أعملك الملصق!' }, { quoted: m });
        }

        try {
            await sock.sendMessage(from, { text: "⏳ أبشر.. جاري صناعة الملصق لعيونك..." }, { quoted: m });

            const mediaBuffer = await downloadMediaMessage(targetMessage, 'buffer', {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage });

            const tmpDir = path.join(process.cwd(), 'tmp');
            if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

            const tempInput = path.join(tmpDir, `input_${Date.now()}`);
            const tempOutput = path.join(tmpDir, `output_${Date.now()}.webp`);

            fs.writeFileSync(tempInput, mediaBuffer);

            const isAnimated = !!targetMessage.message?.videoMessage;

            // استخدام FFMPEG بنفس إعدادات الكود الأجنبي لضمان الجودة
            const ffmpegCommand = isAnimated
                ? `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`
                : `ffmpeg -i "${tempInput}" -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -c:v libwebp -preset default -loop 0 -vsync 0 -pix_fmt yuva420p -quality 75 -compression_level 6 "${tempOutput}"`;

            await new Promise((resolve, reject) => {
                exec(ffmpegCommand, (error) => error ? reject(error) : resolve());
            });

            // إضافة الـ Metadata (الحقوق)
            let webpBuffer = fs.readFileSync(tempOutput);
            const img = new webp.Image();
            await img.load(webpBuffer);

            const exif = {
                'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
                'sticker-pack-name': 'DARK ZENIN BOT 🇸🇩', // هنا تقدر تغير اسم الحقوق
                'sticker-author': 'Dark Zenin',
                'emojis': ['🤖']
            };

            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuffer = Buffer.from(JSON.stringify(exif), 'utf8');
            const exifBuffer = Buffer.concat([exifAttr, jsonBuffer]);
            exifBuffer.writeUIntLE(jsonBuffer.length, 14, 4);
            img.exif = exifBuffer;

            const finalBuffer = await img.save(null);

            await sock.sendMessage(from, { sticker: finalBuffer }, { quoted: m });

            // تنظيف الملفات المؤقتة
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);

        } catch (error) {
            console.error(error);
            sock.sendMessage(from, { text: '❌ حصل خطأ أثناء التحويل، غالباً حجم الملف كبير جداً!' }, { quoted: m });
        }
    }
};

