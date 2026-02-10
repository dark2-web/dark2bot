export const command = {
    name: 'طهر',
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        const quoted = msg.message.extendedTextMessage?.contextInfo;
        if (!quoted || !quoted.quotedMessage) return;

        const key = {
            remoteJid: from,
            fromMe: false,
            id: quoted.stanzaId,
            participant: quoted.participant
        };

        try {
            await sock.sendMessage(from, { delete: key });
            // إرسال نص التطهير بعد الحذف
            await sock.sendMessage(from, { 
                text: '✨ تـم الـتـطـهـيـر بـنـجـاح | *𝖣𝖠𝖱𝖪 𝖹𝖤𝖭𝖨𝖭*' 
            });
        } catch (err) {
            console.error(err);
        }
    }
};

