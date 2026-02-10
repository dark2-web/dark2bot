import fs from 'fs';

export const command = {
    name: 'الادمن',
    category: 'إدارة',
    async execute(sock, from, msg) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const owners = JSON.parse(fs.readFileSync('./owners.json', 'utf8') || '[]');
        
        const isDeveloper = msg.key.fromMe || sender.includes('14019192692816') || owners.includes(sender);
        if (!isDeveloper) return;

        if (!owners.length) return sock.sendMessage(from, { text: '📭 لا يوجد ملاك مسجلين حالياً.' });

        let list = `*─── ⌊ 𐙚 𝖮𝖶𝖭𝖤𝖱𝖲 𝖫𝖨𝖲𝖳 𐙚 ⌉ ───*\n\n`;
        owners.forEach((o, i) => {
            list += `*${i + 1}* ┃ @${o.split('@')[0]}\n`;
        });
        list += `\n*─── ⌊ 𐙚 𝖹𝖤𝖭𝖨𝖭 𝖡𝖮𝖳 𐙚 ⌉ ───*`;

        await sock.sendMessage(from, { text: list, mentions: owners });
    }
};

