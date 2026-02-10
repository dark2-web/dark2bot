export const command = {
    name: 'اكتم',
    alias: ['كتم_عضو', 'اسكت'],
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        if (!from.endsWith('@g.us')) return;

        // تحديد الشخص (بالرد أو المنشن)
        let victim = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                     msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!victim) return sock.sendMessage(from, { text: '⚠️ *رد على الشخص اللي تبي تكتمه أو سوي له منشن!*' });

        // تحديد المدة (مثلاً: .اكتم 5) تعني 5 دقائق
        let duration = parseInt(args[0]) || 5; // الافتراضي 5 دقائق لو ما كتب رقم
        
        // تحويل الدقائق لميلي ثانية
        let muteTime = duration * 60 * 1000;

        try {
            // تخزين بيانات الشخص المكتوم في "ذاكرة البوت المؤقتة"
            if (!global.mutedUsers) global.mutedUsers = {};
            global.mutedUsers[victim] = true;

            await sock.sendMessage(from, { 
                text: `🔇 *تـم كـتـم الـعـضـو @${victim.split('@')[0]} لـمـدة ${duration} دقـائـق.* \nسيتم حذف رسائله تلقائياً!`,
                mentions: [victim]
            }, { quoted: msg });

            // إلغاء الكتم تلقائياً بعد انتهاء الوقت
            setTimeout(() => {
                if (global.mutedUsers[victim]) {
                    delete global.mutedUsers[victim];
                    sock.sendMessage(from, { text: `🔊 *انتهت مدة كتم العضو @${victim.split('@')[0]}، يمكنه الإرسال الآن.*`, mentions: [victim] });
                }
            }, muteTime);

        } catch (e) {
            console.error(e);
        }
    }
};

