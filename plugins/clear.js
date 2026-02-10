export const command = {
    name: 'حذف',
    alias: ['del', 'مسح'],
    category: 'إدارة',
    async execute(sock, from, msg) {

        // لازم يكون جروب
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ الأمر ده للجروبات بس' }, { quoted: msg });
        }

        // التحقق إن المستخدم أدمن
        const metadata = await sock.groupMetadata(from);
        const admins = metadata.participants
            .filter(p => p.admin)
            .map(p => p.id);

        if (!admins.includes(msg.key.participant || msg.key.remoteJid)) {
            return sock.sendMessage(from, { text: '🚫 الأمر ده للأدمن فقط' }, { quoted: msg });
        }

        // لازم يكون رد على رسالة
        if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            return sock.sendMessage(from, { text: '⚠️ رد على الرسالة اللي عاوز تحذفها' }, { quoted: msg });
        }

        const quoted = msg.message.extendedTextMessage.contextInfo;

        await sock.sendMessage(from, {
            delete: {
                remoteJid: from,
                fromMe: false,
                id: quoted.stanzaId,
                participant: quoted.participant
            }
        });
    }
};
