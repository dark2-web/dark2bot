import fs from 'fs';

export const command = {
    name: 'المحظورين',
    category: 'إدارة',
    async execute(sock, from, msg) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const owners = JSON.parse(fs.readFileSync('./owners.json', 'utf8') || '[]');
        const blocked = JSON.parse(fs.readFileSync('./blocked.json', 'utf8') || '[]');

        const isDeveloper = msg.key.fromMe || sender.includes('14019192692816') || owners.includes(sender);
        if (!isDeveloper) return;

        if (!blocked.length) return sock.sendMessage(from, { text: '✅ القائمة السوداء فارغة حالياً.' });

        let list = `*─── ⌊ 𐙚 𝖡𝖫𝖠𝖢𝖪 𝖫𝖨𝖲𝖳 𐙚 ⌉ ───*\n\n`;
        blocked.forEach((b, i) => {
            list += `*${i + 1}* ┃ @${b.split('@')[0]}\n`;
        });
        list += `\n*─── ⌊ 𐙚 𝖯𝖮𝖶𝖤𝖱𝖤𝖣 𝖡𝖸 𝖣𝖠𝖱𝖪 ⌉ ───*`;

        await sock.sendMessage(from, { text: list, mentions: blocked });
    }
};

