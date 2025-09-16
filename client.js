// Substitua pelo sua chave Ably gratuita
const ably = new Ably.Realtime('umHU7A.hC4OoQ:aTXn36O3XZtSrRldLOSBsbajUB9z-pnvo0inyqAIJdU');
const channel = ably.channels.get('foil-counter');

const countEl = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');

let currentCount = 0;

// Recebe mensagens do Ably
channel.subscribe('update', message => {
    currentCount = message.data.count;
    countEl.textContent = currentCount;
});

// Envia atualização para o Ably
function updateCount(delta) {
    currentCount += delta;
    if (currentCount < 0) currentCount = 0;
    channel.publish('update', { count: currentCount });
}

// Botões
incrementBtn.addEventListener('click', () => updateCount(1));
decrementBtn.addEventListener('click', () => updateCount(-1));
