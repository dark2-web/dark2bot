export const command = {
    name: 'فتح',
    alias: ['افتح'],
    category: 'إدارة',
    async execute(sock, from, msg, args) {
        if (!from.endsWith('@g.us')) return;

        try {
            // تنفيذ الأمر مباشرة "هجوم"
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { text: '🔓 *تـم الـفـتح بـنـجـاح.. الـجـمـيـع يـقـدر يـسـولف الآن!*' });
        } catch (e) {
            // إذا فشل فعلاً (مثلاً البوت مش آدمن حقيقي) بيطلع هنا
            console.log("Open Error:", e);
            await sock.sendMessage(from, { text: '⚠️ *مـا قـدرت أفـتـحـها.. تـأكـد إنـي آدمن فـعـلياً!*' });
        }
    }
};

