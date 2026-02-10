import axios from 'axios';

export const command = {
    name: 'ذكاء',
    alias: ['ai', 'بوت'],
    category: 'أدوات',
    async execute(sock, from, msg, args) {
        const question = args.join(' ').trim();

        // 1. التحقق من وجود سؤال
        if (!question) {
            return sock.sendMessage(from, { 
                text: '🤖 مرحباً بك! يرجى كتابة سؤالك بعد الأمر.\n\n*مثال:* .ذكاء ما هي عاصمة السودان؟' 
            }, { quoted: msg });
        }

        // 2. فلتر الاحترام
        const badWords = ['غبي', 'حمار', 'وسخ', 'حقير'];
        if (badWords.some(word => question.includes(word))) {
            return sock.sendMessage(from, { 
                text: '⚠️ عذراً، يرجى الالتزام بآداب الحوار لضمان استمرار الخدمة.' 
            }, { quoted: msg });
        }

        try {
            // المحاولة الأولى: سيرفر مستقر
            const response = await axios.get(`https://bk9.fun/ai/GPT4?q=${encodeURIComponent(question)}`, { timeout: 15000 });
            
            if (response.data && response.data.BK9) {
                return await sock.sendMessage(from, { text: response.data.BK9 }, { quoted: msg });
            }
            throw new Error();

        } catch (error) {
            // رسالة اعتذار احترافية في حال تعطل السيرفر أو الشبكة
            await sock.sendMessage(from, { 
                text: '🤖 عذراً، النظام يواجه صعوبة في الاتصال حالياً. يرجى المحاولة مرة أخرى بعد قليل.' 
            }, { quoted: msg });
        }
    }
};

