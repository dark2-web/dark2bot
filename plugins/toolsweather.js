import axios from 'axios';

export const command = {
    name: 'طقس',
    category: 'أدوات',
    async execute(sock, from, msg, args) {
        let city = args.join(' ');
        if (!city) return sock.sendMessage(from, { text: '⚠️ اكتب اسم المدينة!' });

        try {
            // الترجمة للإنجليزية لضمان عمل السيرفر
            const trans = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(city)}`);
            const cityEn = trans.data[0][0][0];

            const res = await axios.get(`https://wttr.in/${encodeURIComponent(cityEn)}?format=3`);
            await sock.sendMessage(from, { text: `🌦️ الطقس في ${city}: ${res.data}` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ فشل جلب البيانات، تأكد من اسم المدينة.' });
        }
    }
};

