// Substitua pela sua chave Ably gratuita
const ably = new Ably.Realtime('umHU7A.hC4OoQ:aTXn36O3XZtSrRldLOSBsbajUB9z-pnvo0inyqAIJdU');
const channel = ably.channels.get('foil-counter');

// Contador
const countEl = document.getElementById('count');
const incrementBtn = document.getElementById('increment');
const decrementBtn = document.getElementById('decrement');
let currentCount = 0;

channel.subscribe('update', msg => {
    currentCount = msg.data.count;
    countEl.textContent = currentCount;
});

function updateCount(delta) {
    currentCount += delta;
    if(currentCount < 0) currentCount = 0;
    channel.publish('update', { count: currentCount });
}

incrementBtn.addEventListener('click', () => updateCount(1));
decrementBtn.addEventListener('click', () => updateCount(-1));

// Imagem via upload
const imageFileInput = document.getElementById('image-file');
const sharedImage = document.getElementById('shared-image');

imageFileInput.addEventListener('change', () => {
    const file = imageFileInput.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = reader.result;
            sharedImage.src = dataUrl;
            channel.publish('image', { url: dataUrl });
        };
        reader.readAsDataURL(file);
    }
});

channel.subscribe('image', msg => {
    sharedImage.src = msg.data.url;
});

// Chat
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');

function addMessage(text) {
    const p = document.createElement('p');
    p.textContent = text;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendChatBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if(text) {
        channel.publish('chat', { text });
        chatInput.value = '';
    }
});

chatInput.addEventListener('keydown', e => {
    if(e.key === 'Enter') sendChatBtn.click();
});

channel.subscribe('chat', msg => {
    addMessage(msg.data.text);
});
