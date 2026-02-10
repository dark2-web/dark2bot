export const command = {
    name: 'ارفع',
    alias: ['نزله'],
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        // فحص هل المرسل مشرف
        const metadata = await sock.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isSenderAdmin = metadata.participants.some(p => p.id === sender && p.admin);
        
        if (!isSenderAdmin) return sock.sendMessage(from, { text: '⚠️ هـذا الأمر للـمشرفـين فـقـط!' });

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const commandUsed = text.startsWith('.ارفع') ? 'promote' : 'demote';
        
        let victim = msg.message?.extendedTextMessage?.contextInfo?.participant || 
                     msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

        if (!victim) return sock.sendMessage(from, { text: '⚠️ رد على الشخص أو سـوي لـه منـشن!' });

        if (commandUsed === 'promote') {
            await sock.groupParticipantsUpdate(from, [victim], 'promote');
            await sock.sendMessage(from, { text: `✅ تـم رفـع @${victim.split('@')[0]} لـرتبة مـشرف`, mentions: [victim] });
        } else {
            await sock.groupParticipantsUpdate(from, [victim], 'demote');
            await sock.sendMessage(from, { text: `📉 تـم تنـزيل @${victim.split('@')[0]} مـن الرتـبة`, mentions: [victim] });
        }
    }
};

