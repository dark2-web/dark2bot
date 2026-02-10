import axios from 'axios';

export const command = {
    name: 'صورة',
    alias: ['img', 'image'],
    category: 'أدوات',
    async execute(sock, from, msg, args) {
        let query = args.join(' ');
        if (!query) return sock.sendMessage(from, { text: '⚠️ اكتب ما تريد البحث عنه، مثال: .صورة لوفي' });

        await sock.sendMessage(from, { text: `🔍 جاري البحث عن *(${query})*...` }, { quoted: msg });

        // ترجمة البحث للإنجليزية (لنتائج أفضل) بدون إزعاج المستخدم
        let finalQuery = query;
        try {
            const tr = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(query)}`);
            if (tr.data && tr.data[0] && tr.data[0][0]) {
                finalQuery = tr.data[0][0][0];
            }
        } catch (e) {}

        // 🛡️ هيدر لتمويه السيرفرات
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        };

        // 🔗 قائمة المصادر (الأولوية لـ Pinterest ثم Google ثم AI)
        const sources = [
            `https://bk9.fun/pinterest/search?q=${encodeURIComponent(finalQuery)}`, // Pinterest
            `https://api.akuari.my.id/search/googleimage?query=${encodeURIComponent(finalQuery)}` // Google
        ];

        let imageUrl = null;

        // 1️⃣ محاولة البحث في المصادر الأساسية
        for (const url of sources) {
            try {
                const res = await axios.get(url, { headers, timeout: 8000 });
                
                if (url.includes('bk9.fun') && res.data.BK9 && res.data.BK9.length > 0) {
                    imageUrl = res.data.BK9[Math.floor(Math.random() * res.data.BK9.length)];
                    break;
                } else if (url.includes('akuari') && res.data.result && res.data.result.length > 0) {
                    imageUrl = res.data.result[Math.floor(Math.random() * res.data.result.length)];
                    break;
                }
            } catch (err) {
                continue;
            }
        }

        // 2️⃣ الحل النهائي (الجوكر): Pollinations (صورة مضمونة 100%)
        if (!imageUrl) {
            imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(finalQuery)}?width=1080&height=1080&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
        }

        // 📤 إرسال النتيجة النهائية (تنسيق موحد)
        if (imageUrl) {
            await sock.sendMessage(from, {
                image: { url: imageUrl },
                caption: `✅ تم العثور على طلبك: *${query}*\n\n*BY: 𝗗𝗔𝗥𝗞 𝗭𝗘𝗡𝗜𝗡 𝗦𝗬𝗦𝗧𝗘𝗠*`
            }, { quoted: msg });
        } else {
            // حالة مستحيلة تقريباً مع وجود Pollinations
            await sock.sendMessage(from, { text: '❌ حدث خطأ غير متوقع في جلب الصورة.' }, { quoted: msg });
        }
    }
};

