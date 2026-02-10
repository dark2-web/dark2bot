import fs from 'fs';

const ownersFile = './owners.json';
const blockedFile = './blocked.json';

function readData(path) {
    try {
        if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
        return JSON.parse(fs.readFileSync(path, 'utf8') || '[]');
    } catch { return []; }
}

export const command = {
    name: 'ادمن',
    alias: ['التحكم', 'admin'],
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const owners = readData(ownersFile);
        
        // حماية المطور الأساسي (DARK)
        const isDeveloper = msg.key.fromMe || sender.includes('14019192692816') || sender.includes('249966162613') || owners.includes(sender);
        if (!isDeveloper) return sock.sendMessage(from, { text: '⚠️ هذا القسم مخصص لـ سادة البوت فقط.\nــــــــــــــــــــــــــــــــــــــــــــــــ' });

        if (!args.length) {
            const menu = `*─── ⌊ 𐙚 𝖹𝖤𝖭𝖨𝖭 𝖢𝖮𝖳𝖱𝖮𝖫 𐙚 ⌉ ───*

*⚙️┇ غـرفـة الـتـحـكـم (𝗗𝗔𝗥𝗞)*

*👑┇ إدارة الادمن*
│ .ادمن ترقية [منشن/رقم] 
│ .ادمن عزل [منشن/رقم] 
│ .الادمن ← عرض القائمة

*🚫┇ إدارة الـحـظر*
│ .ادمن بلوك [منشن/رقم] 
│ .ادمن سماح [منشن/رقم] 
│ .المحظورين ← عرض القائمة

*─── ⌊ 𐙚 𝖯𝖮𝖶𝖤𝖱𝖤𝖣 𝖡𝖸 𝖣𝖠𝖱𝖪 ⌉ ───*`;
            return sock.sendMessage(from, { text: menu });
        }

        const action = args[0].toLowerCase();
        
        // تطوير: جلب الهدف سواء منشن، رد، أو رقم مكتوب
        let target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                     msg.message?.extendedTextMessage?.contextInfo?.participant;
        
        if (!target && args[1]) {
            // تنظيف الرقم من أي رموز وإضافة صيغة الواتساب
            let rawNumber = args[1].replace(/[^0-9]/g, '');
            if (rawNumber.length >= 10) {
                target = rawNumber + '@s.whatsapp.net';
            }
        }

        if (!target && ['ترقية', 'عزل', 'بلوك', 'سماح'].includes(action)) {
            return sock.sendMessage(from, { text: `⚠️ يرجى منشن الشخص، الرد عليه، أو كتابة رقمه كاملاً.` });
        }

        const senderTag = `@${sender.split('@')[0]}`;
        const targetTag = `@${target?.split('@')[0]}`;

        switch (action) {
            case 'ترقية':
                owners.push(target);
                fs.writeFileSync(ownersFile, JSON.stringify([...new Set(owners)], null, 2));
                await sock.sendMessage(from, { 
                    text: `👑 تم رفع ${targetTag} لمرتبة "ادمن"\n\nبواسطة المطور: ${senderTag}`, 
                    mentions: [target, sender] 
                });
                break;

            case 'عزل':
                const filteredOwners = owners.filter(o => o !== target);
                fs.writeFileSync(ownersFile, JSON.stringify(filteredOwners, null, 2));
                await sock.sendMessage(from, { 
                    text: `📉 تم عزل ${targetTag} من قائمة الادمن\n\nبواسطة: ${senderTag}`, 
                    mentions: [target, sender] 
                });
                break;

            case 'بلوك':
                let blocked = readData(blockedFile);
                blocked.push(target);
                fs.writeFileSync(blockedFile, JSON.stringify([...new Set(blocked)], null, 2));
                await sock.sendMessage(from, { 
                    text: `🚫 تم حظر ${targetTag} من البوت نهائياً\n\nبواسطة: ${senderTag}`, 
                    mentions: [target, sender] 
                });
                break;

            case 'سماح':
                let listB = readData(blockedFile).filter(b => b !== target);
                fs.writeFileSync(blockedFile, JSON.stringify(listB, null, 2));
                await sock.sendMessage(from, { 
                    text: `✅ تم فك الحظر عن ${targetTag}\n\nبواسطة: ${senderTag}`, 
                    mentions: [target, sender] 
                });
                break;
        }
    }
};

