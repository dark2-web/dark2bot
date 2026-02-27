export const command = {
    name: "help",
    alias: ["مساعدة", "أوامر"],
    category: "general",
    desc: "عرض قائمة الأوامر بالأزرار",
    async execute(sock, from, msg, args) {
        const buttons = [
            { buttonId: '.menu', buttonText: { displayText: '📜 قائمة الأوامر' }, type: 1 },
            { buttonId: '.owner', buttonText: { displayText: '👑 المطور' }, type: 1 }
        ]

        const buttonMessage = {
            text: "مرحباً بك في أوامر Dark Zenin 🤖\nكيف يمكنني مساعدتك اليوم؟",
            footer: 'Dark Zenin Bot v1.0',
            buttons: buttons,
            headerType: 1
        }

        try {
            await sock.sendMessage(from, buttonMessage, { quoted: msg });
        } catch (err) {
            console.error("خطأ في إرسال الأزرار:", err);
            // حل احتياطي لو الأزرار فشلت
            await sock.sendMessage(from, { text: "أهلاً بك! استخدم .menu لعرض الأوامر" }, { quoted: msg });
        }
    }
}

