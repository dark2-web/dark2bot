import os from 'os';

export const command = {
    name: "بينج",
    alias: ["ping", "سرعة", "السرعة"],
    category: "النظام",
    async execute(sock, from, m) {
        try {
            const start = Date.now();
            await sock.sendMessage(from, { react: { text: '⚡', key: m.key } });

            // حساب الرام والوقت
            const uptime = process.uptime();
            const ramUsed = (os.totalmem() - os.freemem()) / (1024 * 1024 * 1024);
            const end = Date.now();
            const ping = end - start;

            const pingMsg = `*─── ⚡ 𝖡𝖮𝖳 𝖲𝖳𝖠𝖳𝖴𝖲 ───*

🚀 *ســرعـة الاستجابة:* ${ping}ms
💻 *الـنـــظـام:* ${os.platform()}
🔄 *مـدة التشغيل:* ${formatTime(uptime)}
💾 *استهـلاك الـرام:* ${ramUsed.toFixed(2)}GB

*⌞ 𝖣𝖠𝖱𝖪 𝖹𝖤𝖭𝖨𝖭 𝖡𝖮𝖳 𐙚 ⌟*`;

            // إرسال الرسالة مع الأزرار
            await sock.sendMessage(from, {
                text: pingMsg,
                footer: "DARK ZENIN SYSTEM",
                buttons: [
                    { buttonId: '.اوامر', buttonText: { displayText: '📋 القـائمة الرئيسية' }, type: 1 },
                    { buttonId: '.مطور', buttonText: { displayText: '👑 المـطـور' }, type: 1 }
                ],
                headerType: 1,
                viewOnce: true
            }, { quoted: m });

        } catch (error) {
            console.error(error);
            sock.sendMessage(from, { text: "❌ فشل في جلب حالة النظام." }, { quoted: m });
        }
    }
};

function formatTime(seconds) {
    const d = Math.floor(seconds / (24 * 60 * 60));
    const h = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const m = Math.floor((seconds % (60 * 60)) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? d + 'd ' : ''}${h > 0 ? h + 'h ' : ''}${m > 0 ? m + 'm ' : ''}${s}s`;
}

