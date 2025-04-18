// index.js

const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@adiwajshing/baileys'); const { Boom } = require('@hapi/boom'); const qrcode = require('qrcode-terminal'); const fs = require('fs');

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startSock() { const sock = makeWASocket({ auth: state, printQRInTerminal: true, browser: ['BanglaBot', 'Chrome', '4.0.0'] });

sock.ev.on('creds.update', saveState);

sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
        qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
        const shouldReconnect = (lastDisconnect.error = new Boom(lastDisconnect?.error))?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log('connection closed, reconnecting:', shouldReconnect);
        if (shouldReconnect) {
            startSock();
        }
    } else if (connection === 'open') {
        console.log('Connected to WhatsApp Web');
    }
});

sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify') {
        const msg = messages[0];
        if (!msg.key.fromMe) {
            const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
            if (text) {
                console.log('Received message:', text);
                await sock.sendMessage(msg.key.remoteJid, { text: 'ধন্যবাদ! আপনার মেসেজটি পেয়েছি।' });
            }
        }
    }
});

}

startSock();

