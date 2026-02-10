export const command = {
    name: 'قفل', // سيعمل للقفل والفتح معاً
    async execute(sock, from, msg, args) {
        const item = msg.key.participant || msg.key.remoteJid;
        const meta = await sock.groupMetadata(from);
        const isAdmin = meta.participants.find(p => p.id === item)?.admin;

        if (!isAdmin) return; // صمت تام إذا لم يكن أدمن

        const cmd = msg.message.conversation || msg.message.extendedTextMessage.text;
        
        if (cmd.startsWith('.قفل')) {
            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, { text: '🔒 تم إغلاق المجموعة (للمشرفين فقط)' });
        } else if (cmd.startsWith('.فتح')) {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { text: '🔓 تم فتح المجموعة للجميع' });
        }
    }
};
// ملاحظة: أضف أمر 'فتح' أيضاً في التعرف على الملف

