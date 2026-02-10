export const command = {
    name: 'حزورة',
    category: 'ألعاب',
    async execute(sock, from, msg, args) {
        const riddles = [
            { q: 'شيء تذبحونه وتبكون عليه؟', a: 'البصل' },
            { q: 'ما هو الشيء الذي يكتب ولا يقرأ؟', a: 'القلم' },
            { q: 'ما هو الشيء الذي له أسنان ولا يعض؟', a: 'المشط' }
        ];
        const riddle = riddles[Math.floor(Math.random() * riddles.length)];
        
        sock.hazoora = sock.hazoora ? sock.hazoora : {};
        sock.hazoora[from] = riddle.a;

        await sock.sendMessage(from, { text: `🤔 حزورة اليوم:\n\n*${riddle.q}*` });
    }
};

