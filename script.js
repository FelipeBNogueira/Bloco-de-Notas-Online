const textarea = document.getElementById('note');
const tabsContainer = document.getElementById('tabs');
const newTabBtn = document.getElementById('newTabBtn');

let currentTabId = null;

function loadTabs() {
  const tabs = getAllTabs();
  tabsContainer.innerHTML = '';

  for (const id of tabs) {
    const btn = document.createElement('button');
    btn.textContent = `Aba ${id}`;
    btn.className = id === currentTabId ? 'active' : '';
    btn.onclick = () => switchTab(id);
    tabsContainer.appendChild(btn);
  }
}

function getAllTabs() {
  const raw = localStorage.getItem('abas');
  return raw ? JSON.parse(raw) : [];
}

function saveAllTabs(tabs) {
  localStorage.setItem('abas', JSON.stringify(tabs));
}

function createNewTab() {
  const tabs = getAllTabs();
  const newId = Date.now().toString();
  tabs.push(newId);
  saveAllTabs(tabs);
  localStorage.setItem(`nota-${newId}`, '');
  switchTab(newId);
}

function switchTab(id) {
  currentTabId = id;
  textarea.value = localStorage.getItem(`nota-${id}`) || '';
  loadTabs();
}

textarea.addEventListener('input', () => {
  if (currentTabId) {
    localStorage.setItem(`nota-${currentTabId}`, textarea.value);
  }
});

newTabBtn.addEventListener('click', createNewTab);

function downloadTxt() {
  if (!currentTabId) return;
  const blob = new Blob([textarea.value], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = `nota-${currentTabId}.txt`;
  link.href = URL.createObjectURL(blob);
  link.click();
}

async function downloadPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(textarea.value, 180);
  doc.text(lines, 10, 20);
  doc.save(`nota-${currentTabId}.pdf`);
}

function clearNote() {
  if (confirm('Tem certeza que deseja apagar esta aba?')) {
    localStorage.removeItem(`nota-${currentTabId}`);
    const tabs = getAllTabs().filter(t => t !== currentTabId);
    saveAllTabs(tabs);
    currentTabId = tabs[0] || null;
    if (currentTabId) {
      switchTab(currentTabId);
    } else {
      textarea.value = '';
      loadTabs();
    }
  }
}

// Inicializa
window.onload = () => {
  const tabs = getAllTabs();
  if (tabs.length === 0) {
    createNewTab();
  } else {
    switchTab(tabs[0]);
  }
};
