const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());

let count = 0;

// Tenta carregar valor salvo em arquivo
try {
  count = parseInt(fs.readFileSync('contador.txt', 'utf8')) || 0;
} catch {}

function save() {
  fs.writeFileSync('contador.txt', String(count));
}

app.get('/contador', (req, res) => {
  res.json({ value: count });
});

app.post('/contador', (req, res) => {
  const op = req.query.op;
  if (op === 'inc') count++;
  if (op === 'dec' && count > 0) count--;
  save();
  res.json({ value: count });
});

app.listen(3000, () => console.log('Servidor iniciado em http://localhost:3000'));
