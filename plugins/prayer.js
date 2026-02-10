// plugins/prayer.js
import axios from 'axios';

export const command = {
    name: 'وقت',
    category: 'إسلاميات',
    async execute(sock, from, msg, args) {
        if (!args[0]) return sock.sendMessage(from, { text: '⚠️ اكتب اسم المدينة (بالإنجليزي) بعد الأمر.' });

        try {
            const res = await axios.get(`http://api.aladhan.com/v1/timingsByCity?city=${args[0]}&country=Arab`);
            const t = res.data.data.timings;
            const text = `🕌 *مواقيت الصلاة في ${args[0]}*\n\nالفجر: ${t.Fajr}\nالظهر: ${t.Dhuhr}\nالعصر: ${t.Asr}\nالمغرب: ${t.Maghrib}\nالعشاء: ${t.Isha}`;
            await sock.sendMessage(from, { text: text });
        } catch {
            await sock.sendMessage(from, { text: '❌ تعذر العثور على المدينة.' });
        }
    }
};

