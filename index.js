import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    getContentType
} from '@whiskeysockets/baileys'

import { Boom } from '@hapi/boom'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import fs from 'fs'

const config = {
    prefix: '.',
    owner: '249966162613'
};

global.mutedUsers = global.mutedUsers || {};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: ['Dark Zenin', 'Chrome', '1.0.0']
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        if (qr) {
            console.clear()
            console.log('📢 DARK ZENIN: امسح الكود التالي للربط:')
            qrcode.generate(qr, { small: true })
        }
        if (connection === 'open') {
            console.clear()
            console.log('✅ DARK ZENIN: ONLINE')
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error instanceof Boom && lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) startBot()
        }
    })

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

            const from = msg.key.remoteJid;
            const type = getContentType(msg.message);
            let text = "";
            if (type === 'conversation') text = msg.message.conversation;
            else if (type === 'extendedTextMessage') text = msg.message.extendedTextMessage.text;
            else if (type === 'imageMessage') text = msg.message.imageMessage.caption;
            
            text = text ? text.trim() : "";
            if (!text.startsWith(config.prefix)) return;

            const args = text.slice(config.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const files = fs.readdirSync('./plugins');
            for (const file of files) {
                if (file.endsWith('.js')) {
                    try {
                        const plugin = await import(`./plugins/${file}?update=${Date.now()}`);
                        if (plugin.command && (plugin.command.name === commandName || (plugin.command.alias && plugin.command.alias.includes(commandName)))) {
                            await plugin.command.execute(sock, from, msg, args);
                            break; 
                        }
                    } catch (err) {}
                }
            }
        } catch (err) {
            console.log('❌ خطأ:', err);
        }
    });
}

startBot();

