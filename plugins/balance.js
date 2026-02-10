import fs from 'fs';

console.log('✅ تم تحميل أمر رصيدي بنجاح!'); // هذا السطر عشان تظهر ألوان في التيرمكس

export const command = {
    name: 'رصيدي',
    alias: ['نقاطي', 'فلوسي'],
    category: 'ألعاب',
    async execute(sock, from, msg, args) {
        try {
            const senderId = msg.key.participant || msg.key.remoteJid;
            
            // التأكد من وجود الملف وقراءته بأمان
            if (!fs.existsSync('./points.json')) {
                fs.writeFileSync('./points.json', JSON.stringify({}));
            }

            const data = JSON.parse(fs.readFileSync('./points.json', 'utf8') || '{}');
            const points = data[senderId] || 0;

            await sock.sendMessage(from, { 
                text: `🏦 *مـصـرف زِيـنـيـن* 🏦\n\n👤 المستخدم: @${senderId.split('@')[0]}\n💰 رصيدك: ${points} نقطة`,
                mentions: [senderId]
            }, { quoted: msg });

        } catch (e) {
            console.log('❌ خطأ في أمر رصيدي:', e);
        }
    }
};

