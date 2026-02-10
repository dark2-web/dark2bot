import fs from 'fs';

export const command = {
    name: 'رصيدي',
    alias: ['نقاطي', 'فلوسي'],
    category: 'ألعاب',
    async execute(sock, from, msg, args) {
        try {
            // 1. تحديد المستخدم بشكل صحيح
            const senderId = msg.key.participant || msg.key.remoteJid;
            
            // 2. قراءة الملف مع معالجة الأخطاء إذا كان الملف مفقوداً
            let data = {};
            if (fs.existsSync('./points.json')) {
                const content = fs.readFileSync('./points.json', 'utf8');
                if (content) {
                    data = JSON.parse(content);
                }
            } else {
                fs.writeFileSync('./points.json', JSON.stringify({}));
            }

            const points = data[senderId] || 0;

            // 3. إرسال الرسالة
            await sock.sendMessage(from, { 
                text: `🏦 *مـصـرف زِيـنـيـن* 🏦\n\n👤 المستخدم: @${senderId.split('@')[0]}\n💰 رصيدك: ${points} نقطة`,
                mentions: [senderId]
            }, { quoted: msg });

        } catch (error) {
            // لو في خطأ بيطلع لك في التيرمكس عشان نعرفه
            console.log("❌ Error in balance.js:", error);
        }
    }
};

