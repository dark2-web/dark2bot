import axios from 'axios';

export const command = {
    name: 'الأنمي',
    alias: ['انمي'],
    category: 'أنمي',
    async execute(sock, from, msg, args) {
        if (!args[0]) return sock.sendMessage(from, { text: '⚠️ *يـرجـى كـتـابـة اسـم الأنـمـي بـعـد الأمـر..*' }, { quoted: msg });

        try {
            const query = args.join(' ');
            const { data } = await axios.get(`https://api.animegarden.net/v1/animeiat/anime?search=${encodeURIComponent(query)}`);

            if (!data.data || !data.data[0]) {
                return sock.sendMessage(from, { text: '❌ *عـذراً، لـم أتـمـكـن مـن الـعـثـور عـلـى هـذا الأنـمـي.*' }, { quoted: msg });
            }

            const ani = data.data[0];
            const animeInfo = `*─── ⌊ ⛩️ تـفـاصـيـل الأنمـي ⌉ ───*

*📌 الاسـم:* ${ani.name}
*⭐ الـتـقـيـيـم:* ${ani.rating || 'غير محدد'}
*📺 الـحـالـة:* ${ani.status === 'currently_airing' ? 'مستمر 🟢' : 'منتهي 🔴'}
*🔢 الـحـلـقـات:* ${ani.episodes || 'غير محدد'}

*📖 الـقـصـة:* ${ani.synopsis ? ani.synopsis.replace(/<[^>]*>?/gm, '').slice(0, 300) + '...' : 'لا يوجد ملخص متاح.'}

*🔗 الـرابـط:* https://animeiat.tv/anime/${ani.slug}

*─── ⌊ 𐙚 𝖣𝖠𝖱𝖪 𝖹𝖤𝖭𝖨𝖭 𐙚 ⌉ ───*`;

            await sock.sendMessage(from, { 
                image: { url: ani.poster?.url }, 
                caption: animeInfo 
            }, { quoted: msg });

        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: '❌ *حـدث خـطأ أثـنـاء الـبـحث، حـاول لاحقـاً.*' }, { quoted: msg });
        }
    }
};
