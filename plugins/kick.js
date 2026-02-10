export const command = {
    name: 'طرد',
    alias: ['kick', 'برا'],
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        try {
            // 1. التحقق أننا في مجموعة
            const isGroup = from.endsWith('@g.us');
            if (!isGroup) return sock.sendMessage(from, { text: '⚠️ هذا الأمر يعمل في المجموعات فقط.\nــــــــــــــــــــــــــــــــــــــــــــــــ' });

            // 2. التحقق من صلاحيات المرسل (هل هو أدمن؟)
            const groupMetadata = await sock.groupMetadata(from);
            const participants = groupMetadata.participants;
            const sender = msg.key.participant || msg.key.remoteJid;
            const isSenderAdmin = participants.find(p => p.id === sender)?.admin;

            if (!isSenderAdmin) {
                return sock.sendMessage(from, { text: '⚠️ عذراً، هذا الأمر للأدمن فقط.\nــــــــــــــــــــــــــــــــــــــــــــــــ' });
            }

            // 3. التحقق من صلاحيات البوت (هل البوت أدمن؟)
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = participants.find(p => p.id === botId)?.admin;
            if (!isBotAdmin) {
                return sock.sendMessage(from, { text: '⚠️ ارفع البوت أدمن أولاً لكي يستطيع الطرد.\nــــــــــــــــــــــــــــــــــــــــــــــــ' });
            }

            // 4. تحديد الشخص المطلوب طرده (منشن أو رد)
            let user = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                       msg.message?.extendedTextMessage?.contextInfo?.participant;

            if (!user) return sock.sendMessage(from, { text: '⚠️ منشن الشخص أو رد على رسالته لطره.\nــــــــــــــــــــــــــــــــــــــــــــــــ' });

            // 5. تنفيذ الطرد
            await sock.groupParticipantsUpdate(from, [user], 'remove');
            
            await sock.sendMessage(from, { 
                text: `✈️ تم طرد المستخدم @${user.split('@')[0]} بنجاح.\nــــــــــــــــــــــــــــــــــــــــــــــــ`, 
                mentions: [user] 
            });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '❌ حدث خطأ أثناء محاولة الطرد.' });
        }
    }
};

