const ably = new Ably.Realtime('umHU7A.hC4OoQ:aTXn36O3XZtSrRldLOSBsbajUB9z-pnvo0inyqAIJdU');
const channel = ably.channels.get('foil-room');

let currentCount = Number(localStorage.getItem('contador') || 0);
let nomeUsuario = '';
let modoExcluir = false;

// ---------- Contador ----------
const countEl = document.getElementById('count');
countEl.textContent = currentCount;

document.getElementById('increment').onclick = () => atualizarContador(1);
document.getElementById('decrement').onclick = () => atualizarContador(-1);

function atualizarContador(delta) {
  currentCount = Math.max(0, currentCount + delta);
  countEl.textContent = currentCount;
  localStorage.setItem('contador', currentCount);
  channel.publish('update', { count: currentCount });
}

channel.subscribe('update', msg => {
  if (msg.data.count !== undefined) {
    currentCount = msg.data.count;
    countEl.textContent = currentCount;
    localStorage.setItem('contador', currentCount);
  }
});

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
    adicionarImagem(dataUrl, nomeUsuario, true);
  };
  reader.readAsDataURL(file);
});

function adicionarImagem(url, autor, enviar = false) {
  if ([...grid.querySelectorAll('img')].some(i => i.src === url)) return;

  const wrapper = document.createElement('div');
  const img = document.createElement('img');
  img.src = url;
  img.title = autor;

  img.addEventListener('click', () => {
    if (modoExcluir) {
      wrapper.remove();
      removerImagem(url, true);
    } else {
      abrirModal(url);
    }
  });

  wrapper.appendChild(img);
  grid.prepend(wrapper);

  if (enviar) {
    salvarImagem({ url, autor });
    channel.publish('image', { url, autor });
  }
}

function salvarImagem(obj) {
  const lista = JSON.parse(localStorage.getItem('galeria') || '[]');
  if (!lista.some(i => i.url === obj.url)) lista.unshift(obj);
  localStorage.setItem('galeria', JSON.stringify(lista));
}

function removerImagem(url, enviar = false) {
  const lista = JSON.parse(localStorage.getItem('galeria') || '[]').filter(i => i.url !== url);
  localStorage.setItem('galeria', JSON.stringify(lista));
  if (enviar) channel.publish('image', { url, excluir: true });
}

channel.subscribe('image', msg => {
  if (msg.data.reset) {
    grid.innerHTML = '';
    localStorage.removeItem('galeria');
  } else if (msg.data.excluir) {
    const img = [...grid.querySelectorAll('img')].find(i => i.src === msg.data.url);
    if (img) img.parentElement.remove();
    removerImagem(msg.data.url, false);
  } else {
    adicionarImagem(msg.data.url, msg.data.autor, false);
    salvarImagem(msg.data);
  }
});

// Recupera histórico de imagens
channel.history((err, page) => {
  if (err) return console.error(err);
  page.items.filter(i => i.name === 'image').forEach(msg => {
    if (!msg.data.excluir && !msg.data.reset) adicionarImagem(msg.data.url, msg.data.autor, false);
  });
});

// ---------- Modal ----------
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
function abrirModal(url){ modal.style.display='flex'; modalImg.src=url; }
function fecharModal(){ modal.style.display='none'; modalImg.src=''; }

// ---------- Chat ----------
const chatBox = document.getElementById('chat-box');

sendBtn.addEventListener('click', enviarMsg);
chatInput.addEventListener('keydown', e => { if(e.key==='Enter') enviarMsg(); });

channel.subscribe('chat', msg => {
  if(msg.data.reset){
    chatBox.innerHTML='';
    localStorage.removeItem('chat');
  } else if(msg.data.autor!==nomeUsuario){
    adicionarMsg(msg.data.text, msg.data.autor, false);
    salvarMsg(msg.data.text, msg.data.autor, false);
  }
});

function enviarMsg(){
  const texto = chatInput.value.trim();
  if(!texto||!nomeUsuario) return;
  adicionarMsg(texto, nomeUsuario, true);
  salvarMsg(texto, nomeUsuario, true);
  channel.publish('chat', {text:texto, autor:nomeUsuario});
  chatInput.value='';
}

function adicionarMsg(texto, autor, meu){
  const div=document.createElement('div');
  div.className='msg '+(meu?'me':'other');
  div.innerHTML=`${texto}<small>${autor}</small>`;
  chatBox.appendChild(div);
  chatBox.scrollTop=chatBox.scrollHeight;
}

function salvarMsg(texto, autor, meu){
  const msgs=JSON.parse(localStorage.getItem('chat')||'[]');
  msgs.push({text:texto, autor, meu});
  localStorage.setItem('chat', JSON.stringify(msgs));
}

// Histórico do chat
channel.history((err,page)=>{
  if(err) return console.error(err);
  page.items.filter(i=>i.name==='chat').forEach(msg=>{
    if(!msg.data.reset) adicionarMsg(msg.data.text,msg.data.autor,msg.data.autor===nomeUsuario);
  });
});

// Carrega localStorage
JSON.parse(localStorage.getItem('chat')||'[]').forEach(m=>adicionarMsg(m.text,m.autor,m.meu));
JSON.parse(localStorage.getItem('galeria')||'[]').forEach(i=>adicionarImagem(i.url,i.autor,false));

// ---------- Reset ----------
const resetBtn=document.createElement('button');
resetBtn.id='reset';
resetBtn.textContent='🔄 Resetar Tudo';
resetBtn.style.marginTop='10px';
document.getElementById('foil').appendChild(resetBtn);

resetBtn.addEventListener('click',()=>{
  if(!confirm('Tem certeza que deseja resetar todos os valores?')) return;
  
  currentCount=0;
  countEl.textContent=currentCount;
  localStorage.setItem('contador',currentCount);
  channel.publish('update',{count:currentCount});
  
  grid.innerHTML='';
  localStorage.removeItem('galeria');
  channel.publish('image',{reset:true});
  
  chatBox.innerHTML='';
  localStorage.removeItem('chat');
  channel.publish('chat',{reset:true});
  
  nomeInput.value='';
  chatInput.value='';
  nomeUsuario='';
  chatInput.disabled=true;
  sendBtn.disabled=true;
  imageInput.disabled=true;
});
