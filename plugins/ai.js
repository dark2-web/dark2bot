import { GoogleGenerativeAI } from "@google/generative-ai";

// المفتاح اللي أرسلته يا بطل
const genAI = new GoogleGenerativeAI("AIzaSyD8aPZE-gQ0HRGhDvgrgnLvo_hxcchA9zs");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const command = {
    name: 'ذكاء',
    alias: ['ai', 'بوت', 'جيمناي', 'زينين'],
    category: 'ذكاء اصطناعي',
    async execute(sock, from, msg, args) {
        const text = args.join(" ");
        
        // لو المستخدم ما كتب سؤال
        if (!text) return await sock.sendMessage(from, { text: "أبشر يا غالي.. أنا معاك، اسألني أي حاجة. \n\nمثلاً: .ذكاء كيف حالك؟" }, { quoted: msg });

        try {
            // إضافة ريأكشن "تفكير"
            await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

            // صياغة الطلب ليكون باللهجة السودانية وشخصية زينين
            const prompt = `أنت هو Zenin Bot، بوت واتساب ذكي جداً ومرح. 
            مطورك الأساسي هو Dark Zenin. 
            رد بذكاء وبلهجة سودانية محببة وخفيفة على هذا السؤال: ${text}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const aiText = response.text();

            // إرسال الرد النهائي
            await sock.sendMessage(from, { text: aiText }, { quoted: msg });
            
        } catch (error) {
            console.error("AI Error:", error);
            await sock.sendMessage(from, { text: "والله يا حبيب حصل ضغط شوية في الشبكة، جرب تسألني تاني." }, { quoted: msg });
        }
    }
};

