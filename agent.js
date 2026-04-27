const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
const app = express();
app.use(cors());
app.use(express.json());
const port = 3000;
app.post('/api/chat', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  // Implementação da rota /api/chat
  res.write('data: Conectado ao servidor\n\n');
  // Simula envio de eventos
  setInterval(() => {
    res.write('data: Mensagem do servidor\n\n');
  }, 1000);
});
