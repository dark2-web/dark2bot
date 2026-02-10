let sessions = {}; // لتخزين الألعاب الشغالة

export const command = {
    name: 'xo',
    alias: ['اكس_او', 'لعبة_اكس'],
    category: 'ألعاب',
    async execute(sock, from, msg, args) {
        // إذا كان الشخص يريد إنهاء اللعبة
        if (args[0] === 'خروج') {
            delete sessions[from];
            return sock.sendMessage(from, { text: '❌ تم إنهاء اللعبة.' });
        }

        // إذا لم تكن هناك لعبة قائمة في هذا الجروب
        if (!sessions[from]) {
            sessions[from] = {
                board: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
                turn: 'X',
                players: [], // اللاعب الأول هو اللي يبدأ
                status: 'waiting'
            };
        }

        let session = sessions[from];

        // تسجيل اللاعبين
        if (session.players.length < 2) {
            if (!session.players.includes(msg.pushName)) {
                session.players.push(msg.pushName);
            }
            if (session.players.length < 2) {
                return sock.sendMessage(from, { text: `🎮 انضم *${msg.pushName}* للعبة.\nبانتظار لاعب ثاني يكتب *.xo* للمنافسة!` });
            }
        }

        // عرض الجدول بعد اكتمال اللاعبين
        const renderBoard = (board) => {
            return `
┏───╼
│ ${board[0]} | ${board[1]} | ${board[2]}
│-----------
│ ${board[3]} | ${board[4]} | ${board[5]}
│-----------
│ ${board[6]} | ${board[7]} | ${board[8]}
┗───╼

اللاعب الحالي: *${session.turn === 'X' ? session.players[0] : session.players[1]}* (${session.turn})
أرسل الرقم اللي تبي تضع فيه علامتك.`;
        };

        // معالجة الحركات
        let move = parseInt(args[0]);
        if (isNaN(move) || move < 1 || move > 9 || session.board[move - 1] === 'X' || session.board[move - 1] === 'O') {
            return sock.sendMessage(from, { text: renderBoard(session.board) });
        }

        // التأكد إن اللي يلعب هو صاحب الدور
        let currentPlayer = session.turn === 'X' ? session.players[0] : session.players[1];
        if (msg.pushName !== currentPlayer) {
            return sock.sendMessage(from, { text: `⚠️ مو دورك يا بطل! الدور عند *${currentPlayer}*` });
        }

        // وضع العلامة
        session.board[move - 1] = session.turn;

        // التحقق من الفوز
        const checkWin = (b) => {
            const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
            for (let l of lines) {
                if (b[l[0]] === b[l[1]] && b[l[1]] === b[l[2]]) return b[l[0]];
            }
            return b.every(s => s === 'X' || s === 'O') ? 'tie' : null;
        };

        let result = checkWin(session.board);

        if (result) {
            let winText = result === 'tie' ? '🤝 تعادل! لا يوجد فائز.' : `🎊 الفائز هو: *${currentPlayer}* (${result})!`;
            await sock.sendMessage(from, { text: `🏁 *انتهت اللعبة*\n\n${renderBoard(session.board)}\n${winText}` });
            delete sessions[from];
        } else {
            session.turn = session.turn === 'X' ? 'O' : 'X';
            await sock.sendMessage(from, { text: renderBoard(session.board) });
        }
    }
};

