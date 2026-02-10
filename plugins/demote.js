export const command = {
    name: 'تنزيل',
    alias: ['نزله', 'خفض'],
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        if (!from.endsWith('@g.us')) return;

        // تحديد الشخص (رد أو منشن)
        let victim = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                     msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!victim) return sock.sendMessage(from, { text: '⚠️ *رد على الشخص اللي تبي تنزله أو سوي له منشن!*' });

        try {
            // تنفيذ التنزيل مباشرة بدون فحص الرتبة يدوياً
            await sock.groupParticipantsUpdate(from, [victim], 'demote');
            
            await sock.sendMessage(from, { 
                text: `📉 *تـم تـنـزيـل @${victim.split('@')[0]} بـنـجـاح.*`,
                mentions: [victim]
            });
        } catch (e) {
            console.log("Demote Error:", e);
            await sock.sendMessage(from, { text: '❌ *فـشـل الـتـنزيـل.. تـأكـد إنـي آدمن وأن الـشـخـص مشرف!*' });
        }
    }
};

