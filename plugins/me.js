export const command = {
    name: 'انا',
    alias: ['me'], // سيعمل بالعربية والانجليزية
    category: 'حساب',
    async execute(sock, from, msg, args) {
        const sender = msg.key.participant || msg.key.remoteJid;
        const name = msg.pushName || 'مستخدم';
        const number = sender.split('@')[0];
        
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(sender, 'image');
        } catch {
            profilePic = 'https://telegra.ph/file/029648939c0587289874a.jpg'; 
        }

        const infoText = `*👤┇ مـعـلـومـاتـك | YOUR INFO*\n\n` +
                         `*📌 الاسم:* ${name}\n` +
                         `*📱 الرقم:* ${number}\n` +
                         `*🛡️ الرتبة:* مستخدم (User)`;

        await sock.sendMessage(from, { 
            image: { url: profilePic }, 
            caption: infoText 
        });
    }
};

