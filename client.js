const ably = new Ably.Realtime('umHU7A.hC4OoQ:aTXn36O3XZtSrRldLOSBsbajUB9z-pnvo0inyqAIJdU');
const channel = ably.channels.get('foil-room');

let currentCount = 0;
let nomeUsuario = '';
let modoExcluir = false;

// ---------- Contador ----------
const countEl = document.getElementById('count');
document.getElementById('increment').onclick = () => atualizarContador(1);
document.getElementById('decrement').onclick = () => atualizarContador(-1);

channel.subscribe('update', msg => {
  currentCount = msg.data.count;
  countEl.textContent = currentCount;
});

function atualizarContador(delta) {
  currentCount = Math.max(0, currentCount + delta);
  countEl.textContent = currentCount;
  channel.publish('update', { count: currentCount });
}

// ---------- Nome ----------
const nomeInput = document.getElementById('nome');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-chat');
const imageInput = document.getElementById('image-file');

nomeInput.addEventListener('input', () => {
  nomeUsuario = nomeInput.value.trim();
  const habilitar = nomeUsuario.length > 0;
  chatInput.disabled = !habilitar;
  sendBtn.disabled = !habilitar;
  imageInput.disabled = !habilitar;
});

// ---------- Galeria ----------
const grid = document.getElementById('image-grid');
const btnExcluir = document.getElementById('btn-excluir');

btnExcluir.addEventListener('click', () => {
  modoExcluir = !modoExcluir;
  btnExcluir.style.background = modoExcluir ? '#ff5555' : '';
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Envie apenas imagens!');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    adicionarImagem(dataUrl, nomeUsuario);
    salvarImagem({ url: dataUrl, autor: nomeUsuario });
    channel.publish('image', { url: dataUrl, autor: nomeUsuario });
  };
  reader.readAsDataURL(file);
});

channel.subscribe('image', msg => {
  adicionarImagem(msg.data.url, msg.data.autor);
  salvarImagem(msg.data);
});

function adicionarImagem(url, autor) {
  const wrapper = document.createElement('div');

  const img = document.createElement('img');
  img.src = url;
  img.title = autor;

  img.addEventListener('click', () => {
    if (modoExcluir) {
      wrapper.remove();
      removerImagem(url);
    } else {
      abrirModal(url);
    }
  });

  wrapper.appendChild(img);
  grid.prepend(wrapper);
}

function salvarImagem(obj) {
  const lista = JSON.parse(localStorage.getItem('galeria') || '[]');
  if (!lista.some(i => i.url === obj.url)) lista.unshift(obj);
  localStorage.setItem('galeria', JSON.stringify(lista));
}

function removerImagem(url) {
  const lista = JSON.parse(localStorage.getItem('galeria') || '[]').filter(i => i.url !== url);
  localStorage.setItem('galeria', JSON.stringify(lista));
}

function carregarImagens() {
  const lista = JSON.parse(localStorage.getItem('galeria') || '[]');
  lista.forEach(i => adicionarImagem(i.url, i.autor));
}
carregarImagens();

// ---------- Modal ----------
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');

function abrirModal(url) {
  modal.style.display = 'flex';
  modalImg.src = url;
}

function fecharModal() {
  modal.style.display = 'none';
  modalImg.src = '';
}

// ---------- Chat ----------
const chatBox = document.getElementById('chat-box');

sendBtn.addEventListener('click', enviarMsg);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') enviarMsg();
});

// Evita duplicação de mensagens próprias
channel.subscribe('chat', msg => {
  if (msg.data.autor !== nomeUsuario) {
    adicionarMsg(msg.data.text, msg.data.autor, false);
    salvarMsg(msg.data.text, msg.data.autor, false);
  }
});

function enviarMsg() {
  const texto = chatInput.value.trim();
  if (!texto || !nomeUsuario) return;
  adicionarMsg(texto, nomeUsuario, true);
  salvarMsg(texto, nomeUsuario, true);
  channel.publish('chat', { text: texto, autor: nomeUsuario });
  chatInput.value = '';
}

function adicionarMsg(texto, autor, meu) {
  const div = document.createElement('div');
  div.className = 'msg ' + (meu ? 'me' : 'other');
  div.innerHTML = `${texto}<small>${autor}</small>`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function salvarMsg(texto, autor, meu) {
  const msgs = JSON.parse(localStorage.getItem('chat') || '[]');
  msgs.push({ text: texto, autor, meu });
  localStorage.setItem('chat', JSON.stringify(msgs));
}

function carregarMsgs() {
  const msgs = JSON.parse(localStorage.getItem('chat') || '[]');
  msgs.forEach(m => adicionarMsg(m.text, m.autor, m.meu));
}
carregarMsgs();


