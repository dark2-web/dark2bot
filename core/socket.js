// core/socket.js
import makeWASocket, { 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    DisconnectReason 
} from '@whiskeysockets/baileys';
import P from 'pino';

export async function connectToWhatsApp() {
    // 1. إدارة جلسة تسجيل الدخول (مجلد auth)
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    
    // 2. جلب أحدث إصدار من واتساب لضمان عدم الحظر
    const { version } = await fetchLatestBaileysVersion();

    // 3. إعدادات السوكيت الأساسية
    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: 'silent' }), // عشان ما تطلعش رسايل كتير مزعجة في تيرمكس
        browser: ["Dark Zenin Bot", "Chrome", "3.0"], // شكل البوت في الأجهزة المرتبطة
        printQRInTerminal: true // إظهار الـ QR في تيرمكس
    });

    // 4. وظيفة حفظ بيانات الدخول تلقائياً
    sock.ev.on('creds.update', saveCreds);

    return sock;
}

