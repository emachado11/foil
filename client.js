// Substitua pela sua chave Ably gratuita
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


// -------- GALERIA --------
const imageFileInput = document.getElementById('image-file');
const imageGrid = document.getElementById('image-grid');


function addImage(url) {
const img = document.createElement('img');
img.src = url;
imageGrid.prepend(img);
}


imageFileInput.addEventListener('change', () => {
const file = imageFileInput.files[0];
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
const list = JSON.parse(localStorage.getItem('gallery') || '[]');
list.forEach(addImage);
}
loadImages();


// -------- CHAT --------
const chatBox = document.getElementById('chat-box');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat');


function addMessage(text) {
const p = document.createElement('p');
p.textContent = text;
chatBox.appendChild(p);
chatBox.scrollTop = chatBox.scrollHeight;
}


function saveMessage(text) {
const msgs = JSON.parse(localStorage.getItem('chat') || '[]');
msgs.push(text);
localStorage.setItem('chat', JSON.stringify(msgs));
}


function loadMessages() {
const msgs = JSON.parse(localStorage.getItem('chat') || '[]');
msgs.forEach(addMessage);
}
loadMessages();


sendChatBtn.addEventListener('click', () => {
const text = chatInput.value.trim();
if (!text) return;
addMessage(text);
saveMessage(text);
channel.publish('chat', { text });
chatInput.value = '';
});


chatInput.addEventListener('keydown', e => {
if (e.key === 'Enter') sendChatBtn.click();
});


channel.subscribe('chat', msg => {
addMessage(msg.data.text);
saveMessage(msg.data.text);
});