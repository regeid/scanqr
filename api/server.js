const { default: makeWASocket } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>QR WhatsApp Baileys</title>
        <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
      </head>
      <body>
        <h1>Scan QR Code WhatsApp</h1>
        <div id="qr-container">
          <p>Menunggu QR...</p>
        </div>
        <script>
          const socket = io();
          socket.on('qr', (qrImage) => {
            document.getElementById('qr-container').innerHTML = '<img src="' + qrImage + '" alt="QR Code" />';
          });

          socket.on('connected', () => {
            document.getElementById('qr-container').innerHTML = '<h2>Berhasil Terhubung!</h2>';
          });
        </script>
      </body>
    </html>
  `);
});

io.on('connection', (socket) => {
  console.log('Client terhubung');

  const sock = makeWASocket({
    printQRInTerminal: false,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr } = update;
    if (qr) {
      const qrImageUrl = await qrcode.toDataURL(qr);
      socket.emit('qr', qrImageUrl);
    } else if (connection === 'open') {
      socket.emit('connected');
    }
  });
});

module.exports = server;
