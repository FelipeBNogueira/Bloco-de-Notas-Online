const textarea = document.getElementById('note');
const listaAbas = document.getElementById('listaAbas');

let notas = JSON.parse(localStorage.getItem('notas')) || {};
let notaAtual = localStorage.getItem('notaAtual') || null;

function renderAbas() {
  listaAbas.innerHTML = '';
  for (const id in notas) {
    const btn = document.createElement('button');
    btn.textContent = notas[id].titulo || `Nota ${id}`;
    btn.onclick = () => abrirNota(id);
    btn.style.fontWeight = id === notaAtual ? 'bold' : 'normal';
    listaAbas.appendChild(btn);
  }
}

function novaNota() {
  const id = 'nota_' + Date.now();
  notas[id] = { titulo: `Nota ${Object.keys(notas).length + 1}`, conteudo: '' };
  notaAtual = id;
  localStorage.setItem('notas', JSON.stringify(notas));
  localStorage.setItem('notaAtual', notaAtual);
  renderAbas();
  abrirNota(id);
}

function abrirNota(id) {
  notaAtual = id;
  textarea.value = notas[id].conteudo || '';
  localStorage.setItem('notaAtual', notaAtual);
  renderAbas();
}

function salvarNota() {
  if (!notaAtual) return;
  notas[notaAtual].conteudo = textarea.value;
  localStorage.setItem('notas', JSON.stringify(notas));
  alert('Nota salva!');
}

function excluirNota() {
  if (!notaAtual || !confirm('Deseja excluir esta nota?')) return;
  delete notas[notaAtual];
  notaAtual = Object.keys(notas)[0] || null;
  localStorage.setItem('notas', JSON.stringify(notas));
  localStorage.setItem('notaAtual', notaAtual);
  if (notaAtual) abrirNota(notaAtual);
  else textarea.value = '';
  renderAbas();
}

// Baixar em TXT
function downloadTxt() {
  const blob = new Blob([textarea.value], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = (notas[notaAtual]?.titulo || 'anotacao') + '.txt';
  link.href = URL.createObjectURL(blob);
  link.click();
}

// Baixar em PDF
async function downloadPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(textarea.value, 180);
  doc.text(lines, 10, 20);
  doc.save((notas[notaAtual]?.titulo || 'anotacao') + '.pdf');
}

// Início
window.onload = () => {
  renderAbas();
  if (notaAtual && notas[notaAtual]) abrirNota(notaAtual);
};
