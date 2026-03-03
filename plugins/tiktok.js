import axios from 'axios';

export const command = {
    name: "تيكتوك",
    alias: ["تيك", "tt", "tiktok"],
    category: "تحميل",
    async execute(sock, from, m, args) {
        const url = args[0];
        if (!url) return sock.sendMessage(from, { text: "⚠️ وين الرابط يا كينج؟ أرسل رابط تيك توك مع الأمر." }, { quoted: m });

        try {
            // رسالة الانتظار الموحدة
            await sock.sendMessage(from, { text: "🔄 جاري المعالجة... انتظر قليلاً" }, { quoted: m });
            await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

            const res = await axios.post('https://www.tikwm.com/api/', { url: url });
            if (res.data?.data) {
                const data = res.data.data;

                return await sock.sendMessage(from, { 
                    video: { url: data.play }, 
                    caption: `*─── 📥 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣𝖤𝖱 ───*\n\n✅ تـم الـتـحـمـيـل بـنـجـاح بـواسـطـة بـوت دارك\n\n*⌞ 𝖣𝖠𝖱𝖪 𝖹𝖤𝖭𝖨𝖭 𝖡𝖮𝖳 𐙚 ⌟*`,
                    mimetype: "video/mp4"
                }, { quoted: m });
            }
            throw new Error("Failed");
        } catch (error) {
            sock.sendMessage(from, { text: "❌ فشل تحميل الفيديو. جرب رابط آخر." }, { quoted: m });
        }
    }
};

