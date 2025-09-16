const ws = new WebSocket(`ws://${window.location.host}`);

const countEl = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');

// Receber atualização do servidor
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    countEl.textContent = data.count;
};

// Enviar ações ao servidor
incrementBtn.addEventListener('click', () => {
    ws.send(JSON.stringify({ action: 'increment' }));
});

decrementBtn.addEventListener('click', () => {
    ws.send(JSON.stringify({ action: 'decrement' }));
});
