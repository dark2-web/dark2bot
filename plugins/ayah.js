import axios from 'axios';

export const command = {
    name: 'قرآن',
    category: 'إسلاميات',
    async execute(sock, from, msg, args) {
        try {
            // جلب آية عشوائية من API القرآن الكريم
            const randomAyah = Math.floor(Math.random() * 6236) + 1;
            const res = await axios.get(`https://api.alquran.cloud/v1/ayah/${randomAyah}/ar.alafasy`);
            const ayah = res.data.data;

            const text = `*🕋┇ قـال تـعـالـى:*\n\n` +
                         `*﴿ ${ayah.text} ﴾*\n\n` +
                         `*📌 سورة:* ${ayah.surah.name}\n` +
                         `*📖 آية رقم:* ${ayah.numberInSurah}`;

            await sock.sendMessage(from, { text: text });
        } catch (error) {
            await sock.sendMessage(from, { text: '❌ حدث خطأ أثناء جلب الآية.' });
        }
    }
};

