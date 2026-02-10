import axios from 'axios';

export const command = {
    name: 'يوت',
    alias: ['ytv', 'فيديو'],
    category: 'تحميل',
    async execute(sock, from, msg, args) {
        if (!args[0]) return sock.sendMessage(from, { text: '⚠️ اكتب اسم الفيديو أو ضع الرابط بعد الأمر!' });

        try {
            const query = args.join(' ');
            await sock.sendMessage(from, { text: `🔍 جاري البحث والتحميل: *${query}*` });

            // استخدام API قوي للبحث والتحميل من يوتيوب
            const res = await axios.get(`https://api. screenshot-api.net/yt/download?query=${encodeURIComponent(query)}`); 
            // ملحوظة: إذا واجهت مشكلة في هذا السيرفر، سنستخدم محرك Vreden كبديل مستقر
            const response = await axios.get(`https://api.vreden.my.id/api/ytplayv2?query=${encodeURIComponent(query)}`);
            const data = response.data.result;

            if (!data || !data.video) {
                return sock.sendMessage(from, { text: '❌ تعذر العثور على الفيديو، جرب كتابة الاسم بدقة.' });
            }

            await sock.sendMessage(from, { 
                video: { url: data.video }, 
                caption: `✅ *تم التحميل بنجاح*\n\n📌 *العنوان:* ${data.title}\n⚔️ *المطور:* 𝖣𝖠𝖱𝖪 𝖹𝖤𝖭𝖨𝖭`,
                mimetype: 'video/mp4'
            }, { quoted: msg });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: '❌ حدث خطأ أثناء التحميل، تأكد من جودة الاتصال أو جرب لاحقاً.' });
        }
    }
};

