// plugins/ping.js

export const command = {
    name: 'بنج',        // اسم الأمر اللي هتكتبه في الواتساب
    category: 'تسلية',  // تصنيف الأمر (هينفعنا لما نعمل المنيو)
    
    async execute(sock, from, msg, args) {
        // حساب الوقت المستغرق
        const start = Date.now();
        
        // إرسال رسالة "انتظر..."
        const { key } = await sock.sendMessage(from, { text: '🚀 جاري الفحص...' });
        
        // تعديل الرسالة بالسرعة النهائية
        const end = Date.now();
        await sock.sendMessage(from, { 
            text: `*Dark Zenin-Bot 🚀 سرعة الاستجابة:* ${end - start}ms`, 
            edit: key 
        });
    }
};

