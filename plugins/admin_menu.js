export const command = {
    name: 'الادارة',
    alias: ['ادمن'],
    category: 'إدارة',
    async execute(sock, from, msg) {
        const adminMenu = `*─── ⌊ ⚙️ 𝖠𝖣𝖬𝖨𝖭 𝖯𝖠𝖭𝖤𝖫 ⌉ ───*

*⚠️┇ أوامـر الـتـحـكـم*
│ .طرد │ .اضف │ .ارفع │ .نزله
│ .اكتم │ .فك_الكتم
│ .قفل │ .فتح

*─── ⌊ 𐙚 𝖣𝖠𝖱𝖪 𝖢𝖮𝖭𝖳𝖱𝖮𝖫 ⌉ ───*`;

        await sock.sendMessage(from, { 
            text: adminMenu,
            contextInfo: {
                externalAdReply: {
                    title: "𝖹𝖤𝖭𝖨𝖭 𝖢𝖮𝖭𝖳𝖱𝖮𝖫",
                    body: "System Administration",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: msg });
    }
};

