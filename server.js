const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let foilCount = 0;

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Broadcast para todos os clientes
function broadcastCount() {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ count: foilCount }));
        }
    });
}

wss.on('connection', ws => {
    // Enviar valor atual ao conectar
    ws.send(JSON.stringify({ count: foilCount }));

    // Receber mensagem de incremento/decremento
    ws.on('message', message => {
        const data = JSON.parse(message);
        if (data.action === 'increment') foilCount++;
        if (data.action === 'decrement' && foilCount > 0) foilCount--;
        broadcastCount();
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
