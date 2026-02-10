import axios from 'axios';

export const command = {
    name: 'سورة',
    alias: ['قرآن', 'قران'],
    category: 'إسلاميات',
    async execute(sock, from, msg, args) {

        if (!args[0] || isNaN(args[0])) {
            return sock.sendMessage(from, {
                text:
`📖 *طريقة الاستخدام*
.سورة 1
.سورة 112 عفاسي
.سورة 36 عبدالباسط
.سورة 55 ماهر`
            });
        }

        const surahNumber = Number(args[0]);
        if (surahNumber < 1 || surahNumber > 114) {
            return sock.sendMessage(from, { text: '❌ رقم السورة يجب أن يكون من 1 إلى 114' });
        }

        const readerArg = args[1]?.toLowerCase() || 'عفاسي';
        const formatted = surahNumber.toString().padStart(3, '0');

        // 🎙️ القرّاء
        const reciters = {
            'عفاسي': {
                name: 'مشاري العفاسي',
                url: `https://server8.mp3quran.net/afs/${formatted}.mp3`
            },
            'عبدالباسط': {
                name: 'عبدالباسط عبدالصمد',
                url: `https://server7.mp3quran.net/basit/${formatted}.mp3`
            },
            'ماهر': {
                name: 'ماهر المعيقلي',
                url: `https://server12.mp3quran.net/maher/${formatted}.mp3`
            }
        };

        const reciter = reciters[readerArg] || reciters['عفاسي'];

        try {
            await sock.sendMessage(from, {
                text: `⏳ *جاري تشغيل سورة رقم ${surahNumber}*\n🎙️ القارئ: *${reciter.name}*`
            }, { quoted: msg });

            // إرسال الصوت (Audio عادي – يفتح بدون مشاكل)
            await sock.sendMessage(from, {
                audio: { url: reciter.url },
                mimetype: 'audio/mpeg'
            }, { quoted: msg });

        } catch (err) {
            console.error('Quran Error:', err);
            await sock.sendMessage(from, {
                text: '❌ حدث خطأ أثناء تشغيل السورة، حاول لاحقًا.'
            });
        }
    }
};
