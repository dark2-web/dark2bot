export const command = {
    name: "رصيدي",
    alias: ["رصيد", "balance", "بنك"],
    category: "اقتصاد",
    async execute(sock, from, m) {
        try {
            // التأكد من وجود بيانات المستخدم أو وضع قيم افتراضية
            let user = global.db?.data?.users?.[m.sender] || { money: 1000, limit: 10, level: 1 };
            
            // استخراج الرقم بأمان لتجنب خطأ الـ split
            const senderNumber = m.sender ? m.sender.split('@')[0] : 'المستخدم';

            const balMsg = `*─── 📥 𝖡𝖠𝖭𝖪 𝖲𝖸𝖲𝖳𝖤𝖬 ───*

👤 *المستخدم:* @${senderNumber}
💰 *رصيدك:* ${user.money || 0} جنية
💎 *الماس:* ${user.limit || 0}
📊 *المستوى:* ${user.level || 1}

*⌞ 𝖣𝖠𝖱𝖪 𝖹𝖤𝖭𝖨𝖭 𝖡𝖮𝖳 𐙚 ⌟*`;

            // أزرار البروكسي المضمونة
            const buttons = [
                { buttonId: '.متجر', buttonText: { displayText: '🛒 المتجر' }, type: 1 },
                { buttonId: '.يومي', buttonText: { displayText: '🎁 مكافأة يومية' }, type: 1 }
            ];

            await sock.sendMessage(from, {
                text: balMsg,
                mentions: [m.sender],
                footer: "DARK ZENIN ECONOMY",
                buttons: buttons,
                headerType: 1
            }, { quoted: m });

        } catch (e) {
            console.error("Balance Error:", e);
            // رسالة طوارئ في حال فشل الكود تماماً
            sock.sendMessage(from, { text: "⚠️ عذراً، هناك مشكلة في الوصول لبياناتك البنكية حالياً." }, { quoted: m });
        }
    }
};

