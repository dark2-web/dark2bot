export const command = {
    name: 'مخفي',
    async execute(sock, from, msg, args) {
        const item = msg.key.participant || msg.key.remoteJid;
        const meta = await sock.groupMetadata(from);
        const isAdmin = meta.participants.find(p => p.id === item)?.admin;

        if (!isAdmin) return;

        const participants = meta.participants.map(p => p.id);
        const content = args.join(' ') || '📢 تنبيه من الإدارة';

        await sock.sendMessage(from, { 
            text: content, 
            mentions: participants 
        });
    }
};

