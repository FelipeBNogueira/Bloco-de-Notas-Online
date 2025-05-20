const textarea = document.getElementById('note');
const tabsContainer = document.getElementById('tabs');
const newTabBtn = document.getElementById('newTabBtn');

let currentTabId = null;

function getAllTabs() {
  return JSON.parse(localStorage.getItem('abas') || '[]');
}

function saveAllTabs(tabs) {
  localStorage.setItem('abas', JSON.stringify(tabs));
}

function updateTabLabel(id, content) {
  const btn = document.querySelector(`.tab[data-id="${id}"] span`);
  if (btn) {
    btn.textContent = content.substring(0, 15) || 'Sem título';
  }
}

function loadTabs() {
  const tabs = getAllTabs();
  tabsContainer.innerHTML = '';

  tabs.forEach(id => {
    const content = localStorage.getItem(`nota-${id}`) || '';

    const tab = document.createElement('div');
    tab.className = 'tab';
    if (id === currentTabId) tab.classList.add('active');
    tab.dataset.id = id;

    const label = document.createElement('span');
    label.textContent = content.substring(0, 15) || 'Sem título';
    tab.appendChild(label);

    const close = document.createElement('button');
    close.className = 'close';
    close.textContent = '×';
    close.onclick = (e) => {
      e.stopPropagation();
      closeTab(id);
    };
    tab.appendChild(close);

    tab.onclick = () => switchTab(id);
    tabsContainer.appendChild(tab);
  });
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

function closeTab(id) {
  localStorage.removeItem(`nota-${id}`);
  const tabs = getAllTabs().filter(t => t !== id);
  saveAllTabs(tabs);

  if (currentTabId === id) {
    currentTabId = tabs[0] || null;
    if (currentTabId) {
      textarea.value = localStorage.getItem(`nota-${currentTabId}`) || '';
    } else {
      textarea.value = '';
    }
  }

  loadTabs();
}

textarea.addEventListener('input', () => {
  if (currentTabId) {
    localStorage.setItem(`nota-${currentTabId}`, textarea.value);
    updateTabLabel(currentTabId, textarea.value);
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
  if (!currentTabId) return;
  if (confirm('Deseja apagar esta anotação?')) {
    textarea.value = '';
    localStorage.setItem(`nota-${currentTabId}`, '');
    updateTabLabel(currentTabId, '');
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
