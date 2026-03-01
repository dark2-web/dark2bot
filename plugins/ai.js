import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../data/chatbot.json');

// قائمة أرقام المطور (دارك) المسموح لهم بالتحكم فقط
const sudoNumbers = ['249112520567@s.whatsapp.net', '249966162613@s.whatsapp.net'];

// التأكد من وجود مجلد البيانات
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
}

export const command = {
    name: 'ذكاء',
    alias: ['ai', 'chatbot', 'بوت', 'زينين'],
    category: 'ذكاء اصطناعي',
    async execute(sock, from, msg, args) {
        const text = args.join(" ");
        const sender = msg.key.participant || msg.key.remoteJid;

        // التحقق من صلاحية التحكم (هل هو دارك؟)
        const isSudo = sudoNumbers.includes(sender);

        if (text === 'on') {
            if (!isSudo) {
                return await sock.sendMessage(from, { 
                    text: "❌ *عذراً يا حبيبنا..* ما عندك الصلاحية دي. الصلاحيات دي عند الكينج *دارك* بس! 🥷" 
                }, { quoted: msg });
            }
            updateConfig(from, true);
            return await sock.sendMessage(from, { text: "✅ تم تفعيل الذكاء التلقائي بنجاح بواسطة الكينج!" });
        }
        
        if (text === 'off') {
            if (!isSudo) {
                return await sock.sendMessage(from, { 
                    text: "❌ *أقيف مكانك!* ما مسموح ليك تقفل البوت. الكينج *دارك* هو الوحيد اللي بيتحكم هنا! 🥷" 
                }, { quoted: msg });
            }
            updateConfig(from, false);
            return await sock.sendMessage(from, { text: "❌ تم إيقاف الرد التلقائي بأمر من الكينج." });
        }

        if (!text) return await sock.sendMessage(from, { text: "أبشر يا كينج.. اسألني أي حاجة أو استخدم *.ذكاء on* (للكينج دارك فقط)" });

        await getAIResponse(sock, from, msg, text);
    }
};

async function getAIResponse(sock, from, msg, query) {
    try {
        await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

        // المحرك الأساسي (Sandip GPT)
        const res = await axios.get(`https://sandipbaruwal.onrender.com/gpt?prompt=${encodeURIComponent(query)}`);
        const result = res.data.answer || res.data.reply || res.data.result;

        if (!result) throw new Error("No response");

        await sock.sendMessage(from, { 
            text: `*─── ⌊ 𐙚 𝖹𝖤𝖭𝖨𝖭 𝖠𝖨 ⌉ ───*\n\n${result}\n\n*─── ⌊ 𝖯𝖮𝖶𝖤𝖱𝖤𝖣 𝖡𝖸 𝖣𝖠𝖱𝖪 ⌉ ───*`,
            quoted: msg 
        });
    } catch (e) {
        try {
            // المحرك الاحتياطي (SimSimi) في حال فشل الأول
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
        
        // كشف التاق (المنشن)
        const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        const isBotMentioned = mentions.some(jid => jid.startsWith(botId));
        
        // كشف الريبلاي
        const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant || "";
        const isReplyToBot = quotedParticipant.startsWith(botId);

        // كشف المنشن اليدوي
        const isManualMention = userText.includes(botId);

        if (isBotMentioned || isReplyToBot || isManualMention) {
            const cleanText = userText.replace(new RegExp(`@${botId}`, 'g'), '').replace(/@\d+/g, '').trim();
            await getAIResponse(sock, from, msg, cleanText || "هلا");
        }
    }
}

