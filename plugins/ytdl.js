import axios from 'axios';

export const command = {
    name: "يوتيوب",
    alias: ["فيديو", "yt", "ytdl"],
    category: "تحميل",
    async execute(sock, from, m, args) {
        const query = args.join(" ");
        if (!query) return sock.sendMessage(from, { text: "⚠️ أرسل رابط يوتيوب أو اسم الفيديو يا كينج" }, { quoted: m });

        try {
            // رسالة المعالجة الموحدة
            await sock.sendMessage(from, { text: "🔄 جاري المعالجة... انتظر قليلاً" }, { quoted: m });
            await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

            let videoUrl = query;

            // إذا لم يكن الرابط رابط يوتيوب مباشر، نبحث عنه
            if (!query.includes('youtu.be') && !query.includes('youtube.com')) {
                const search = await axios.get(`https://api.agatz.xyz/api/ytsearch?message=${encodeURIComponent(query)}`);
                if (search.data?.data?.[0]) {
                    videoUrl = search.data.data[0].url;
                } else {
                    throw new Error("لم يتم العثور على نتائج");
                }
            }

            // استخدام API التحميل المباشر (الأكثر استقراراً حالياً)
            const res = await axios.get(`https://api.giftedtech.my.id/api/download/dl?url=${encodeURIComponent(videoUrl)}`);
            
            if (res.data?.success && res.data.result) {
                const data = res.data.result;

                await sock.sendMessage(from, { 
                    video: { url: data.download_url }, 
                    caption: `*─── 📥 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣𝖤𝖱 ───*\n\n📌 *العنوان:* ${data.title}\n✅ تـم الـتـحـمـيـل بـنـجـاح بـواسـطـة بـوت دارك\n\n*⌞ 𝖣𝖠𝖱𝖪 𝖹𝖤𝖭𝖨𝖭 𝖡𝖮𝖳 𐙚 ⌟*`,
                    mimetype: "video/mp4"
                }, { quoted: m });
                
                return await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
            }

            throw new Error("فشل التحميل من السيرفر الرئيسي");

        } catch (error) {
            console.error("YT ERROR:", error.message);
            await sock.sendMessage(from, { react: { text: '❌', key: m.key } });
            await sock.sendMessage(from, { text: "❌ السيرفر مضغوط حالياً أو الفيديو محمي. جرب فيديو آخر أو Shorts." }, { quoted: m });
        }
    }
};

