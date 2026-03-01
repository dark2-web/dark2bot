import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../data/chatbot.json');

if (!fs.existsSync(path.join(__dirname, '../data'))) fs.mkdirSync(path.join(__dirname, '../data'));

export const command = {
    name: 'ذكاء',
    alias: ['ai', 'chatbot', 'بوت', 'زينين'],
    category: 'ذكاء اصطناعي',
    async execute(sock, from, msg, args) {
        const text = args.join(" ");

        if (text === 'on') {
            updateConfig(from, true);
            return await sock.sendMessage(from, { text: "✅ تم تفعيل الذكاء التلقائي (منشن/ريبلاي) بنجاح!" });
        }
        if (text === 'off') {
            updateConfig(from, false);
            return await sock.sendMessage(from, { text: "❌ تم إيقاف الرد التلقائي." });
        }

        if (!text) return await sock.sendMessage(from, { text: "أبشر يا كينج.. اسألني أي حاجة أو فعل الرد التلقائي بـ .ذكاء on" });

        await getAIResponse(sock, from, msg, text);
    }
};

async function getAIResponse(sock, from, msg, query) {
    try {
        await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

        const res = await axios.get(`https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(query)}`);
        const result = res.data.answer || res.data.reply || res.data.result;

        if (!result) throw new Error("No response");

        await sock.sendMessage(from, { 
            text: `*─── ⌊ 𐙚 𝖹𝖤𝖭𝖨𝖭 𝖠𝖨 ⌉ ───*\n\n${result}\n\n*─── ⌊ 𝖯𝖮𝖶𝖤𝖱𝖤𝖣 𝖡𝖸 𝖣𝖠𝖱𝖪 ⌉ ───*`,
            quoted: msg 
        });
    } catch (e) {
        try {
            const res2 = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(query)}&lc=ar`);
            const fallbackResult = res2.data.success || "يا غالي السيرفر مضغوط شوية، جرب تاني.";
            await sock.sendMessage(from, { 
                text: `*─── ⌊ 𐙚 𝖹𝖤𝖭𝖨𝖭 𝖠𝖨 ⌉ ───*\n\n${fallbackResult}\n\n*─── ⌊ 𝖯𝖮𝖶𝖤𝖱𝖤𝖣 𝖡𝖸 𝖣𝖠𝖱𝖪 ⌉ ───*`,
                quoted: msg 
            });
        } catch (err) {
            await sock.sendMessage(from, { text: "والله يا كينج السيرفرات كلها قافلة، جرب بعد ثواني." });
        }
    }
}

function updateConfig(id, status) {
    let config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)) : {};
    config[id] = { enabled: status };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export async function handleAutoAI(sock, from, msg, userText) {
    if (!fs.existsSync(configPath)) return;
    const config = JSON.parse(fs.readFileSync(configPath));
    if (config[from]?.enabled) {
        const botId = sock.user.id.split(':')[0];
        
        // كشف المنشن (التاق)
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const isBotMentioned = mentioned.some(jid => jid.startsWith(botId));
        
        // كشف الريبلاي (الرد على رسالة البوت)
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant || "";
        const isReplyToBot = quotedParticipant.startsWith(botId);

        if (isBotMentioned || isReplyToBot) {
            const cleanText = userText.replace(/@\d+/g, '').trim();
            await getAIResponse(sock, from, msg, cleanText || "هلا");
        }
    }
}

