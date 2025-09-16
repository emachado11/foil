const ably = new Ably.Realtime('SUA_CHAVE_DO_ABLY');
const channel = ably.channels.get('foil-counter');

// -------- Contador --------
const countEl = document.getElementById('count');
let currentCount = 0;

channel.subscribe('update', msg => {
  currentCount = msg.data.count;
  countEl.textContent = currentCount;
});

function updateCount(delta) {
  currentCount += delta;
  if (currentCount < 0) currentCount = 0;
  channel.publish('update', { count: currentCount });
}

document.getElementById('increment').onclick = () => updateCount(1);
document.getElementById('decrement').onclick = () => updateCount(-1);

// -------- Galeria --------
const imageInput = document.getElementById('image-file');
const imageGrid = document.getElementById('image-grid');

function addImage(url) {
  const img = document.createElement('img');
  img.src = url;
  imageGrid.prepend(img);
}

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    addImage(dataUrl);
    saveImage(dataUrl);
    channel.publish('image', { url: dataUrl });
  };
  reader.readAsDataURL(file);
});

channel.subscribe('image', msg => {
  addImage(msg.data.url);
  saveImage(msg.data.url);
});

function saveImage(url) {
  const list = JSON.parse(localStorage.getItem('gallery') || '[]');
  list.unshift(url);
  localStorage.setItem('gallery', JSON.stringify(list));
}

function loadImages() {
  (JSON.parse(localStorage.getItem('gallery') || '[]')).forEach(addImage);
}
loadImages();

// -------- Chat --------
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-chat');

function addMessage(text, fromMe) {
  const div = document.createElement('div');
  div.className = 'msg ' + (fromMe ? 'me' : 'other');
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function saveMessage(msg) {
  const list = JSON.parse(localStorage.getItem('chat') || '[]');
  list.push(msg);
  localStorage.setItem('chat', JSON.stringify(list));
}

function loadMessages() {
  (JSON.parse(localStorage.getItem('chat') || '[]'))
    .forEach(m => addMessage(m.text, m.fromMe));
}
loadMessages();

sendBtn.onclick = () => {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text, true);
  saveMessage({ text, fromMe: true });
  channel.publish('chat', { text });
  chatInput.value = '';
};

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendBtn.click();
});

channel.subscribe('chat', msg => {
  addMessage(msg.data.text, false);
  saveMessage({ text: msg.data.text, fromMe: false });
});
