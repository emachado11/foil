const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

let contador = 0;

app.get('/contador', (req, res) => {
  res.json({ value: contador });
});

app.post('/contador', (req, res) => {
  const op = req.query.op;
  if (op === 'inc') contador++;
  if (op === 'dec' && contador > 0) contador--;
  res.json({ value: contador });
});

app.listen(3000, () => {
  console.log('✅ Servidor rodando em http://localhost:3000');
});
