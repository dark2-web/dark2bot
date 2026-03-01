import { GoogleGenerativeAI } from "@google/generative-ai";

// مفتاحك شغال وسليم، المشكلة كانت في اسم الموديل
const genAI = new GoogleGenerativeAI("AIzaSyD8aPZE-gQ0HRGhDvgrgnLvo_hxcchA9zs");

// حنستخدم الموديل بضبط المصنع عشان يشتغل مع المكتبة الجديدة
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "أنت Zenin Bot، بوت واتساب ذكي ومرح من السودان، مطورك هو Dark Zenin. رد بلهجة سودانية خفيفة ومحببة."
});

export const command = {
    name: 'ذكاء',
    alias: ['ai', 'بوت', 'جيمناي', 'زينين'],
    category: 'ذكاء اصطناعي',
    async execute(sock, from, msg, args) {
        const text = args.join(" ");
        if (!text) return await sock.sendMessage(from, { text: "أبشر يا كينج.. اسألني أي حاجة في بالك." }, { quoted: msg });

        try {
            // تفاعل سريع
            await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

            // إرسال النص مباشرة للموديل
            const result = await model.generateContent(text);
            const response = result.response;
            const aiText = response.text();

            // إرسال الرد
            await sock.sendMessage(from, { text: aiText }, { quoted: msg });

        } catch (error) {
            console.error("AI Error Detailed:", error);
            
            // لو الموديل لسه معصلج (نادر جداً الحين)، حنحاول بموديل بديل فوراً
            try {
                const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
                const result = await fallbackModel.generateContent(text);
                await sock.sendMessage(from, { text: result.response.text() }, { quoted: msg });
            } catch (fallbackError) {
                await sock.sendMessage(from, { text: "يا غالي الشبكة عالمياً فيها تعليق، جرب كمان دقيقة." }, { quoted: msg });
            }
        }
    }
};

