export const command = {
    name: 'الالعاب',
    alias: ['ألعاب', 'العاب'],
    category: 'ألعاب',
    async execute(sock, from, msg, args) {
        const gameMenu = `*─── ⌊ 🎮 𝖹𝖤𝖭𝖨𝖭 𝖦𝖠𝖬𝖤𝖲 ⌉ ───*

*🧩┇ لـعـبـة فـكـك*
• اكتب: *.فكك*

*🤔┇ لـعـبـة حـزورة*
• اكتب: *.حزورة*

*🎲┇ لـعـبـة حـظ*
• اكتب: *.حظ*

*💬┇ لـعـبـة صـراحـة*
• اكتب: *.صراحة*

*⚖️┇ لـعـبـة لـو خـيـروك*
• اكتب: *.لو_خيروك*

*💍┇ لـعـبـة زواج*
• اكتب: *.زواج*

*❌┇ لـعـبـة XO*
• اكتب: *.xo*

*─── ⌊ 𐙚 𝖯𝖮𝖶𝖤𝖱𝖤𝖣 𝖡𝖸 𝖣𝖠𝖱𝖪 ⌉ ───*`;

        try {
            await sock.sendMessage(from, {
                image: { url: 'https://i.ibb.co/x8tBGJq7/6452905276-81b59b2a.jpg' },
                caption: gameMenu
            }, { quoted: msg });
        } catch (e) {
            // في حال فشل تحميل الصورة يرسل النص مباشرة
            await sock.sendMessage(from, { text: gameMenu }, { quoted: msg });
        }
    }
};

