export const command = {
    name: "help",
    alias: ["مساعدة", "اوامر"],
    category: "general",
    desc: "يعرض قائمة الأوامر مع أزرار",
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

        await sock.sendMessage(from, buttonMessage, { quoted: msg })
    }
}

