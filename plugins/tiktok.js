import axios from 'axios';

export const command = {
    name: "tiktok",
    alias: ["تيك", "tt", "tvideo", "taudio"],
    category: "download",
    desc: "تحميل فيديوهات تيك توك",
    async execute(sock, from, msg, args) {
        const type = Object.keys(msg.message)[0];
        const selectedId = type === 'buttonsResponseMessage' ? msg.message.buttonsResponseMessage.selectedButtonId : '';

        // --- 1. معالجة ضغطة الزر ---
        if (selectedId.startsWith('.tvideo|') || selectedId.startsWith('.taudio|')) {
            const [cmd, url] = selectedId.split('|');
            await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });

            if (cmd === '.tvideo') {
                return await sock.sendMessage(from, { video: { url: url }, caption: "🚀 تم التحميل - Zenin Bot" }, { quoted: msg });
            } else {
                return await sock.sendMessage(from, { audio: { url: url }, mimetype: 'audio/mp4', ptt: false }, { quoted: msg });
            }
        }

        // --- 2. معالجة الرابط الجديد ---
        if (!args[0]) return await sock.sendMessage(from, { text: "⚠️ أرسل رابط تيك توك مع الأمر." }, { quoted: msg });

        try {
            await sock.sendMessage(from, { react: { text: "🔍", key: msg.key } });
            const res = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${args[0]}`);
            const data = res.data;

            if (!data.video) return await sock.sendMessage(from, { text: "❌ فيديو غير موجود." });

            // مصفوفة الأزرار بتنسيق Baileys الرسمي
            const buttons = [
                { buttonId: `.tvideo|${data.video.noWatermark}`, buttonText: { displayText: '🎥 فيديو' }, type: 1 },
                { buttonId: `.taudio|${data.music.play_url}`, buttonText: { displayText: '🎵 صوت' }, type: 1 }
            ];

            const buttonMessage = {
                text: `✅ *تم العثور على الفيديو!*\n\n📌 *العنوان:* ${data.title}\n👤 *الحساب:* ${data.author.unique_id}`,
                footer: 'Dark Zenin Downloader 🚀',
                buttons: buttons,
                headerType: 1
            };

            await sock.sendMessage(from, buttonMessage, { quoted: msg });

        } catch (err) {
            await sock.sendMessage(from, { text: "❌ حدث خطأ، تأكد من الرابط." });
        }
    }
};

