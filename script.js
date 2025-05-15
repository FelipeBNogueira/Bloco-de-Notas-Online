const textarea = document.getElementById('note');

// Salvar automaticamente no navegador
textarea.addEventListener('input', () => {
  localStorage.setItem('blocoDeNotas', textarea.value);
});

// Carregar ao abrir
window.onload = () => {
  const saved = localStorage.getItem('blocoDeNotas');
  if (saved) textarea.value = saved;
};

// Baixar em TXT
function downloadTxt() {
  const blob = new Blob([textarea.value], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = 'anotacao.txt';
  link.href = window.URL.createObjectURL(blob);
  link.click();
}

// Baixar em PDF
async function downloadPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = textarea.value;
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 20);
  doc.save('anotacao.pdf');
}

// Limpar notas
function clearNote() {
  if (confirm('Tem certeza que deseja apagar suas anotações?')) {
    textarea.value = '';
    localStorage.removeItem('blocoDeNotas');
  }
}
