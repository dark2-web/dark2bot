import axios from 'axios';

export const command = {
    name: 'صور',
    category: 'صور',
    async execute(sock, from, msg, args) {
        let count = parseInt(args[0]);
        let query = args.slice(1).join(' ');

        // لو ما حط عدد، نعتبر أول كلمة هي البحث والعدد 5
        if (isNaN(count)) {
            count = 5;
            query = args.join(' ');
        }
        if (!query) return sock.sendMessage(from, { text: '⚠️ مثال: .صور 3 مكة' });
        if (count > 10) count = 10; // حماية من الحظر

        try {
            // ترجمة البحث
            const trans = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(query)}`);
            const queryEn = trans.data[0][0][0];

            const url = `https://pixabay.com/api/?key=43210405-64506c888d36005c2a1369792&q=${encodeURIComponent(queryEn)}&per_page=${count}&image_type=photo`;
            const res = await axios.get(url);

            if (res.data.hits.length === 0) return sock.sendMessage(from, { text: '❌ لم أجد صوراً.' });

            for (let img of res.data.hits) {
                await sock.sendMessage(from, {
                    image: { url: img.largeImageURL },
                    caption: `📸 جودة عالية لـ: *${query}*`
                });
            }
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ حدث خطأ في الاتصال بالسيرفر.' });
        }
    }
};

