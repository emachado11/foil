// Substitua pela sua chave Ably gratuita
const ably = new Ably.Realtime('umHU7A.hC4OoQ:aTXn36O3XZtSrRldLOSBsbajUB9z-pnvo0inyqAIJdU');
const channel = ably.channels.get('foil-counter');

// Contador Foil
const countEl = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');

let currentCount = 0;

// Recebe atualização do contador
channel.subscribe('update', message => {
    currentCount = message.data.count;
    countEl.textContent = currentCount;
});

// Atualiza contador e envia para Ably
function updateCount(delta) {
    currentCount += delta;
    if(currentCount < 0) currentCount = 0;
    channel.publish('update', { count: currentCount });
}

// Botões
incrementBtn.addEventListener('click', () => updateCount(1));
decrementBtn.addEventListener('click', () => updateCount(-1));

// Imagem compartilhada
const imageUrlInput = document.getElementById('image-url');
const updateImageBtn = document.getElementById('update-image');
const sharedImage = document.getElementById('shared-image');

// Recebe atualização de imagem
channel.subscribe('image', message => {
    sharedImage.src = message.data.url;
    imageUrlInput.value = message.data.url;
});

// Envia atualização de imagem
updateImageBtn.addEventListener('click', () => {
    const url = imageUrlInput.value.trim();
    if(url) {
        channel.publish('image', { url });
        sharedImage.src = url;
    }
});
