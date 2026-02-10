export const command = {
    name: 'حاسبة',
    alias: ['احسب', 'calc'],
    category: 'أدوات',
    async execute(sock, from, msg, args) {

        if (!args.length) {
            return sock.sendMessage(from, {
                text:
`🧮 *طريقة الاستخدام*
.حاسبة 5+3
.حاسبة (5+3)*2
.حاسبة 20/5
.حاسبة 2^4
.حاسبة 50%
.حاسبة جذر 16
.حاسبة √16
.حاسبة مضروب 5
.حاسبة 5!`
            }, { quoted: msg });
        }

        try {
            let input = args.join(' ').trim();

            /* ========= الجذر ========= */
            if (input.startsWith('جذر')) {
                const num = parseFloat(input.replace('جذر', '').trim());
                if (num < 0) throw new Error();
                const result = Math.sqrt(num);

                return sock.sendMessage(from, {
                    text: `√${num} = *${result}*`
                }, { quoted: msg });
            }

            if (input.startsWith('√')) {
                const num = parseFloat(input.replace('√', '').trim());
                if (num < 0) throw new Error();
                const result = Math.sqrt(num);

                return sock.sendMessage(from, {
                    text: `√${num} = *${result}*`
                }, { quoted: msg });
            }

            /* ========= المضروب ========= */
            if (input.startsWith('مضروب')) {
                const num = parseInt(input.replace('مضروب', '').trim());
                if (num < 0) throw new Error();

                let fact = 1;
                for (let i = num; i >= 1; i--) fact *= i;

                return sock.sendMessage(from, {
                    text: `${num}! = *${fact}*`
                }, { quoted: msg });
            }

            if (input.endsWith('!')) {
                const num = parseInt(input.replace('!', '').trim());
                if (num < 0) throw new Error();

                let fact = 1;
                for (let i = num; i >= 1; i--) fact *= i;

                return sock.sendMessage(from, {
                    text: `${num}! = *${fact}*`
                }, { quoted: msg });
            }

            /* ========= العمليات العادية ========= */
            let expression = input
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/\^/g, '**')
                .replace(/(\d+(\.\d+)?)%/g, '($1/100)');

            // حماية
            if (!/^[0-9+\-*/().**%]+$/.test(expression)) {
                throw new Error();
            }

            const result = Function(`"use strict"; return (${expression})`)();
            if (!isFinite(result)) throw new Error();

            await sock.sendMessage(from, {
                text:
`🧮 *الحاسبة*
📥 العملية:
${input}

📤 النتيجة:
*${result}*`
            }, { quoted: msg });

        } catch {
            await sock.sendMessage(from, {
                text:
`❌ *عملية غير صحيحة*
تأكد من الصيغة

أمثلة:
جذر 16
√25
مضروب 5
5!
(5+3)*2`
            }, { quoted: msg });
        }
    }
};
