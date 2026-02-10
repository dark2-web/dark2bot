export const command = {
    name: 'هو',
    alias: ['you'],
    category: 'حساب',
    async execute(sock, from, msg, args) {
        let target;

        // 1. فحص هل هناك رد على رسالة (Reply)
        if (msg.message.extendedTextMessage?.contextInfo?.participant) {
            target = msg.message.extendedTextMessage.contextInfo.participant;
        } 
        // 2. فحص هل هناك تاق (Tag/Mention)
        else if (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        } 
        // 3. فحص هل تم كتابة رقم
        else if (args[0]) {
            target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        } 
        else {
            return sock.sendMessage(from, { text: '⚠️ منشن شخصاً أو رد على رسالته أو اكتب رقمه!' });
        }

        try {
            const number = target.split('@')[0];
            let profilePic;
            try {
                profilePic = await sock.profilePictureUrl(target, 'image');
            } catch {
                profilePic = 'https://telegra.ph/file/029648939c0587289874a.jpg';
            }

            const infoText = `*👤┇ مـعـلـومـات الـمـسـتـخـدم*\n` +
                             `*USER INFO*\n\n` +
                             `*📱 الرقم:* ${number}\n` +
                             `*🔗 الرابط:* wa.me/${number}`;

            await sock.sendMessage(from, { 
                image: { url: profilePic }, 
                caption: infoText 
            });
        } catch (e) {
            await sock.sendMessage(from, { text: '❌ تعذر العثور على معلومات هذا الشخص.' });
        }
    }
};

