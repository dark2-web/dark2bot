import fs from 'fs';

// دالة النقاط
function addPoints(userId, amount) {
    let data = JSON.parse(fs.readFileSync('./points.json', 'utf8') || '{}');
    if (!data[userId]) data[userId] = 0;
    data[userId] += amount;
    fs.writeFileSync('./points.json', JSON.stringify(data, null, 2));
    return data[userId];
}

let fakakSession = {}; // تخزين مؤقت للعبة

export const command = {
    name: 'فكك',
    category: 'ألعاب',
    async execute(sock, from, msg, args) {
        if (fakakSession[from]) return sock.sendMessage(from, { text: '❌ فيه لعبة شغالة، فكك الكلمة الأولى!' });

        const words = ['لوفي', 'زورو', 'مادارا', 'مستشفى', 'تكنولوجيا', 'خوارزمية', 'فلسطين', 'إمبراطورية'];
        const word = words[Math.floor(Math.random() * words.length)];
        
        fakakSession[from] = { word, startTime: Date.now() };

        await sock.sendMessage(from, { 
            text: `🧩 | فكك الكلمة التالية:\n\n*${word}*\n\n• أمامك دقيقة للإجابة (الجائزة 50 نقطة)!` 
        }, { quoted: msg });

        const handler = async ({ messages }) => {
            const m = messages[0];
            if (!fakakSession[from] || m.key.remoteJid !== from || !m.message) return;

            const userText = (m.message.conversation || m.message.extendedTextMessage?.text || "").replace(/\s+/g, '');
            const senderId = m.key.participant || m.key.remoteJid;

            if (userText === fakakSession[from].word) {
                const total = addPoints(senderId, 50);
                await sock.sendMessage(from, { 
                    text: `✅ | كفو يا وحش! @${senderId.split('@')[0]}\n💰 | فزت بـ 50 نقطة\n🏦 | رصيدك: ${total}`,
                    mentions: [senderId]
                }, { quoted: m });

                delete fakakSession[from];
                sock.ev.off('messages.upsert', handler);
            }
        };

        sock.ev.on('messages.upsert', handler);
        setTimeout(() => {
            if (fakakSession[from]) {
                sock.sendMessage(from, { text: `⏰ انتهى الوقت! الكلمة كانت: ${fakakSession[from].word}` });
                delete fakakSession[from];
                sock.ev.off('messages.upsert', handler);
            }
        }, 60000);
    }
};

