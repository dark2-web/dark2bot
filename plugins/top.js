import fs from 'fs';

export const command = {
    name: 'توب',
    alias: ['الترتيب', 'اغنى', 'المتصدرين'],
    category: 'ألعاب',
    async execute(sock, from, msg, args) {
        try {
            // 1. التأكد من وجود ملف النقاط
            if (!fs.existsSync('./points.json')) {
                return sock.sendMessage(from, { text: '⚠️ لا توجد بيانات نقاط حالياً.' });
            }

            // 2. قراءة البيانات
            let data = JSON.parse(fs.readFileSync('./points.json', 'utf8') || '{}');
            
            // 3. ترتيب المستخدمين من الأكثر نقاطاً للأقل
            let sorted = Object.entries(data)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10); // أفضل 10 لاعبين

            if (sorted.length === 0) {
                return sock.sendMessage(from, { text: '⚠️ القائمة فارغة حالياً، ابدأ اللعب لتتصدر!' });
            }

            // 4. بناء نص القائمة
            let leaderboard = `*🏆 قـائـمـة أغـنـى 10 لاعـبـيـن 🏆*\n\n`;
            let mentions = [];

            sorted.forEach((user, index) => {
                let userId = user[0];
                let points = user[1];
                leaderboard += `${index + 1} - @${userId.split('@')[0]} ➪ *${points}* نقطة\n`;
                mentions.push(userId);
            });

            leaderboard += `\n*BY: 𝗗𝗔𝗥𝗞 𝗭𝗘𝗡𝗜𝗡 𝗦𝗬𝗦𝗧𝗘𝗠*`;

            // 5. إرسال القائمة مع المنشن
            await sock.sendMessage(from, { 
                text: leaderboard, 
                mentions: mentions 
            }, { quoted: msg });

        } catch (error) {
            console.error("Error in top command:", error);
            await sock.sendMessage(from, { text: '❌ حدث خطأ أثناء جلب قائمة المتصدرين.' });
        }
    }
};

