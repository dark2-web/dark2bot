export const command = {
    name: 'اضف',
    alias: ['أضف', 'add', 'اضافة'],
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        if (!from.endsWith('@g.us')) return;

        // جلب الرقم من الرسالة (سواء كتبه بعد الأمر أو رد على شخص)
        let num = args[0]?.replace(/[^0-9]/g, '');
        
        // لو رد على رسالة شخص وما كتب رقم، يأخذ رقم صاحب الرسالة
        if (!num && msg.message?.extendedTextMessage?.contextInfo?.participant) {
            num = msg.message.extendedTextMessage.contextInfo.participant.split('@')[0];
        }

        if (!num) return sock.sendMessage(from, { text: '⚠️ *اكتب الرقم بعد الأمر، مثال: .اضف 966xxxx*' });

        try {
            const jid = num + '@s.whatsapp.net';
            
            // محاولة الإضافة مباشرة
            const response = await sock.groupParticipantsUpdate(from, [jid], 'add');
            
            // فحص النتيجة (بايليز ترجع مصفوفة فيها حالة الإضافة)
            const result = response[0];

            if (result.status === '200') {
                return sock.sendMessage(from, { text: `✅ *تمت إضافة @${num} بنجاح!*`, mentions: [jid] });
            } else if (result.status === '403') {
                return sock.sendMessage(from, { text: '❌ *العضو مفعل الخصوصية، لا يمكن إضافته يدوياً (أرسل له رابط الجروب).* ' });
            } else if (result.status === '408') {
                return sock.sendMessage(from, { text: '❌ *العضو غادر المجموعة مؤخراً، لا يمكن إضافته الآن.*' });
            } else if (result.status === '409') {
                return sock.sendMessage(from, { text: '⚠️ *العضو موجود في المجموعة فعلياً.*' });
            } else {
                return sock.sendMessage(from, { text: `⚠️ *حدث خطأ (كود: ${result.status})، تأكد من صحة الرقم.*` });
            }

        } catch (e) {
            console.log("Add Error:", e);
            await sock.sendMessage(from, { text: '❌ *فشل الأمر، تأكد أنني آدمن وأن الرقم صحيح.*' });
        }
    }
};

