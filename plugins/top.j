import fs from 'fs';

const command = {
    name: 'توب',
    alias: ['الترتيب', 'اغنى'],
    category: 'ألعاب',
    async execute(sock, from, msg, args) {
        if (!fs.existsSync('./points.json')) return sock.sendMessage(from, { text: 'لا توجد بيانات نقاط بعد!' });
        
        let data = JSON.parse(fs.readFileSync('./points.json', 'utf8'));
        let sorted = Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        let leaderboard = `*🏆 قـائـمـة الـمـتـصـدريـن 🏆*\n\n`;
        sorted.forEach((user, index) => {
            leaderboard += `${index + 1} - @${user[0].split('@')[0]} ➪ *${user[1]}* ن\n`;
        });

        await sock.sendMessage(from, { text: leaderboard, mentions: sorted.map(u => u[0]) }, { quoted: msg });
    }
};

export default command;

