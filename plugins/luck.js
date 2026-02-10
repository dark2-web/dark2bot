export const command = {
    name: 'حظ',
    category: 'تسلية',
    async execute(sock, from, msg, args) {
        const percentage = Math.floor(Math.random() * 101);
        let comment = '';

        if (percentage > 80) comment = '🔥 حظك اليوم في السماء! استغله.';
        else if (percentage > 50) comment = '✨ حظك جيد جداً، يومك سعيد.';
        else if (percentage > 20) comment = '⚖️ حظ متوسط، لا بأس به.';
        else comment = '💀 حظك تحت الأرض، أنصحك بالنوم.';

        await sock.sendMessage(from, { 
            text: `*📊 نـسـبـة حـظـك الـيـوم:* [ *${percentage}%* ]\n\n${comment}` 
        });
    }
};

