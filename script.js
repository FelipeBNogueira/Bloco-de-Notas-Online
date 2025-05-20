let currentTabId = null;

const tabsContainer = document.getElementById('tabs');
const newTabBtn = document.getElementById('newTabBtn');

const quill = new Quill('#editor', {
  modules: {
    toolbar: [
      [{ font: [] }, { size: [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'super' }, { script: 'sub' }],
      [{ header: '1' }, { header: '2' }, 'blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean']
    ]
  },
  theme: 'snow'
});

function getAllTabs() {
  return JSON.parse(localStorage.getItem('abas') || '[]');
}

function saveAllTabs(tabs) {
  localStorage.setItem('abas', JSON.stringify(tabs));
}

function updateTabLabel(id, html) {
  const text = quill.getText().trim();
  const label = text.substring(0, 15) || 'Sem título';
  const tab = document.querySelector(`.tab[data-id="${id}"] span`);
  if (tab) tab.textContent = label;
}

function loadTabs() {
  const tabs = getAllTabs();
  tabsContainer.innerHTML = '';

  tabs.forEach(id => {
    const content = localStorage.getItem(`nota-${id}`) || '';
    const label = (new DOMParser().parseFromString(content, 'text/html')).body.textContent.substring(0, 15);

    const tab = document.createElement('div');
    tab.className = 'tab';
    if (id === currentTabId) tab.classList.add('active');
    tab.dataset.id = id;

    const span = document.createElement('span');
    span.textContent = label || 'Sem título';
    tab.appendChild(span);

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
  const html = localStorage.getItem(`nota-${id}`) || '';
  quill.root.innerHTML = html;
  loadTabs();
}

function closeTab(id) {
  localStorage.removeItem(`nota-${id}`);
  const tabs = getAllTabs().filter(t => t !== id);
  saveAllTabs(tabs);

  if (currentTabId === id) {
    currentTabId = tabs[0] || null;
    if (currentTabId) {
      quill.root.innerHTML = localStorage.getItem(`nota-${currentTabId}`) || '';
    } else {
      quill.root.innerHTML = '';
    }
  }

  loadTabs();
}

quill.on('text-change', () => {
  if (currentTabId) {
    const html = quill.root.innerHTML;
    localStorage.setItem(`nota-${currentTabId}`, html);
    updateTabLabel(currentTabId, html);
  }
});

newTabBtn.addEventListener('click', createNewTab);

function downloadDoc() {
  if (!currentTabId) return;

  const blob = new Blob([quill.root.innerHTML], {
    type: 'application/msword'
  });

  const link = document.createElement('a');
  link.download = `nota-${currentTabId}.doc`;
  link.href = URL.createObjectURL(blob);
  link.click();
}

async function downloadPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = quill.getText();
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 20);
  doc.save(`nota-${currentTabId}.pdf`);
}

function clearEditor() {
  if (!currentTabId) return;
  if (confirm('Deseja apagar esta anotação?')) {
    quill.root.innerHTML = '';
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
