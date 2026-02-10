export const command = {
    name: 'زواج',
    category: 'مرح',
    async execute(sock, from, msg) {
        let mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        let m1, m2;

        try {
            const chat = await sock.groupMetadata(from);
            const participants = chat.participants;

            // تحديد العرسان
            if (mentions.length >= 2) {
                m1 = mentions[0];
                m2 = mentions[1];
            } else if (mentions.length === 1) {
                m1 = mentions[0];
                let randomPerson = participants[Math.floor(Math.random() * participants.length)].id;
                while (randomPerson === m1) {
                    randomPerson = participants[Math.floor(Math.random() * participants.length)].id;
                }
                m2 = randomPerson;
            } else {
                if (participants.length < 2) return sock.sendMessage(from, { text: '👀 الجروب مهجور ما في أحد يتزوج!' });
                let shuffled = participants.sort(() => 0.5 - Math.random());
                m1 = shuffled[0].id;
                m2 = shuffled[1].id;
            }

            // قائمة نصوص التهنئة المتنوعة
            const greetings = [
                "🥂 تهانينا القلبية! نتمنى لكم حياة مليئة بالحب ❤️ والفرح 🎉", // حقيقية
                "😂 منك المال ومنها العيال.. أو العكس، المهم ما نشوفكم تتخانقوا بكره!", // مضحكة
                "💀 الله يعينكم على بعض، جهزوا المحامي من الحين للطلاق!", // ساخرة
                "🌹 بارك الله لكما وبارك عليكما وجمع بينكما في خير.", // دينية/رسمية
                "💍 وأخيراً وقعتوا في الفخ! لا مجال للهروب الآن.. استمتعوا بالقفص الذهبي.", // ساخرة/مضحكة
                "✨ الحب ليس أن تنظرا لبعضكما، بل أن تنظرا في نفس الاتجاه (للثلاجة غالباً)!" // فكاهية
            ];

            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

            // 📝 النص الاحترافي النهائي
            const text = `
╔═════════════════════╗
║       💖 *مـراسـم الـزواج* 💖      ║
╠═════════════════════╣
║                         
║  👰 *الـعـروس:* @${m1.split('@')[0]}
║                         
║  🤵 *الـعـريـس:* @${m2.split('@')[0]}
║                         
╠═════════════════════╣
║  ✨ *رسـالة الـحـفـل:*
║  ${randomGreeting}
╚═════════════════════╝

*BY: 𝗗𝗔𝗥𝗞 𝗭𝗘𝗡𝗜𝗡 𝗦𝗬𝗦𝗧𝗘𝗠*
*ᴄᴏᴘʏʀɪɢʜᴛ © 2026*`;

            await sock.sendMessage(from, {
                text: text,
                mentions: [m1, m2]
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: '❌ حدث خطأ في إتمام المراسم!' });
        }
    }
};

