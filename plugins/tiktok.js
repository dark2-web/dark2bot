import axios from 'axios';

export const command = {
    name: 'تيك',
    alias: ['tt', 'tiktok'],
    category: 'تحميل',
    async execute(sock, from, msg, args) {
        if (!args[0]) return sock.sendMessage(from, { text: '⚠️ يرجى وضع رابط الفيديو بعد الأمر.' });

        try {
            await sock.sendMessage(from, { text: '🔄 جاري المعالجة... انتظر قليلاً' });

            const res = await axios.get(`https://www.tikwm.com/api/?url=${args[0]}`);
            const data = res.data.data;

            if (!data) return sock.sendMessage(from, { text: '❌ فشل في العثور على الفيديو.' });

            // الزخرفة الجديدة الفخمة كما طلبت
            const cleanCaption = `*─── 📥 𝖣𝖮𝖶𝖭𝖫𝖮𝖠𝖣𝖤𝖱 ───*\n\n` +
                               `✅ تـم الـتـحـمـيـل بـنـجـاح بـواسـطـة بـوت دارك\n\n` +
                               `*⌞ 𝖣𝖠𝖱𝖪 𝖹𝖤𝖭𝖨𝖭 𝖡𝖮𝖳 𐙚 ⌟*`;

            await sock.sendMessage(from, { 
                video: { url: data.play }, 
                caption: cleanCaption
            }, { quoted: msg });

        } catch (error) {
            await sock.sendMessage(from, { text: '❌ حدث خطأ، تأكد من الرابط.' });
        }
    }
};

