export const command = {
    name: 'إدارة_مباشرة',
    alias: ['طرد', 'اضف', 'أضف'],
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        if (!from.endsWith('@g.us')) return;

        // فحص النص بشكل آمن تماماً
        const messageContent = msg.body || msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";
        if (!messageContent) return;
        
        const cmd = messageContent.split(' ')[0].toLowerCase().slice(1);
        
        // جلب الشخص المقصود (بالرد أو المنشن أو الرقم)
        let victim = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                     msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        if (!victim) return sock.sendMessage(from, { text: '⚠️ *مـن الـمـقـصـود؟ (رد عـلـى رسـالـتـه، مـنـشـنـه، أو اكـتـب رقـمـه)*' }, { quoted: msg });

        try {
            if (cmd === 'طرد') {
                await sock.groupParticipantsUpdate(from, [victim], 'remove');
                await sock.sendMessage(from, { text: '🚷 *تـم الـطـرد بـنـجـاح مـن عـريـن الـزكـي!*' }, { quoted: msg });
            } 
            
            if (cmd === 'اضف' || cmd === 'أضف') {
                const res = await sock.groupParticipantsUpdate(from, [victim], 'add');
                if (res && res[0] && res[0].status === '403') {
                    return sock.sendMessage(from, { text: '❌ *الـخـصـوصـيـة تـمـنـع الإضـافـة.. أرسـل لـه الـرابـط!*' });
                }
                await sock.sendMessage(from, { text: '✅ *تـمـت الإضـافـة بـنـجـاح!*' });
            }
        } catch (e) {
            console.log("Admin Error:", e);
            await sock.sendMessage(from, { text: '⚠️ *فـشل الأمـر.. تـأكـد أنـي مـشـرف (Admin) وأن الـشـخـص مـوجـود بالـمـجـمـوعـة!*' }, { quoted: msg });
        }
    }
};
