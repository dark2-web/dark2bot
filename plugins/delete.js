export const command = {
    name: 'حذف',
    alias: ['دليت', 'مسح'],
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        if (!isGroup) return; // الأمر لا يعمل إلا في المجموعات

        try {
            // 1. جلب بيانات المشرفين الحقيقية
            const groupMetadata = await sock.groupMetadata(from);
            const admins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            const isSenderAdmin = admins.includes(sender);
            const isBotAdmin = admins.includes(botId);

            // 2. فحص الأمان (لو العضو مو مشرف يوقف هنا فوراً)
            if (!isSenderAdmin) {
                return sock.sendMessage(from, { 
                    text: '🚫 *عذراً، هذا الأمر مخصص للمشرفين فقط!*' 
                }, { quoted: msg });
            }

            // 3. فحص صلاحيات البوت
            if (!isBotAdmin) {
                return sock.sendMessage(from, { 
                    text: '⚠️ *ارفعني مشرف (Admin) أولاً عشان أقدر أحذف رسائل الآخرين.*' 
                }, { quoted: msg });
            }

            // 4. الحصول على الرسالة المراد حذفها (الرد)
            const quoted = msg.message?.extendedTextMessage?.contextInfo;
            if (!quoted || !quoted.stanzaId) {
                return sock.sendMessage(from, { 
                    text: '⚠️ *رد على الرسالة التي تريد حذفها بالأمر .حذف*' 
                }, { quoted: msg });
            }

            // 5. بناء مفتاح الحذف الصارم
            const key = {
                remoteJid: from,
                fromMe: quoted.participant === botId, // لو كانت رسالة البوت نفسه
                id: quoted.stanzaId,
                participant: quoted.participant
            };

            // 6. التنفيذ
            await sock.sendMessage(from, { delete: key });

        } catch (err) {
            console.error('Delete Error:', err);
            // لو فشل الحذف غالباً بسبب صلاحيات
        }
    }
};

