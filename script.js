let quill;
let tabs = {};
let currentTabId = null;
const lastUpdated = document.getElementById('lastUpdated');
const tabsContainer = document.getElementById('tabs');

function initQuill(content = '') {
  if (quill) {
    quill.off('text-change');
    quill.root.innerHTML = content;
  } else {
    quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'super' }, { script: 'sub' }],
          [{ header: 1 }, { header: 2 }, 'blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['direction', { align: [] }],
          ['link', 'image', 'video', 'formula'],
          ['clean']
        ]
      }
    });

    quill.root.style.minHeight = '350px';

    // Permitir redimensionar imagens clicando nelas
    quill.root.addEventListener('click', e => {
      if (e.target && e.target.tagName === 'IMG') {
        e.target.style.maxWidth = '100%'; // Pode ajustar manualmente
      }
    });
  }

  quill.setContents(quill.clipboard.convert(content));

  quill.on('text-change', () => {
    if (!currentTabId) return;

    tabs[currentTabId].content = quill.root.innerHTML;
    tabs[currentTabId].lastUpdated = new Date().toLocaleString();

    updateLastUpdated(tabs[currentTabId].lastUpdated);
    saveTabs();
  });
}

function updateLastUpdated(text) {
  lastUpdated.textContent = text || '-';
}

function saveTabs() {
  localStorage.setItem('blocoDeNotasTabs', JSON.stringify(tabs));
  localStorage.setItem('blocoDeNotasCurrentTab', currentTabId);
}

function loadTabs() {
  const savedTabs = localStorage.getItem('blocoDeNotasTabs');
  const savedCurrentTab = localStorage.getItem('blocoDeNotasCurrentTab');
  if (savedTabs) {
    tabs = JSON.parse(savedTabs);
    if (savedCurrentTab && tabs[savedCurrentTab]) {
      currentTabId = savedCurrentTab;
    } else {
      currentTabId = Object.keys(tabs)[0];
    }
  } else {
    tabs = {};
    currentTabId = null;
  }
}

function createTab(title = 'Sem título') {
  const id = 'tab-' + Date.now();
  tabs[id] = {
    title,
    content: '',
    lastUpdated: new Date().toLocaleString(),
    editing: false
  };
  currentTabId = id;
  renderTabs();
  initQuill('');
  updateLastUpdated(tabs[id].lastUpdated);
  saveTabs();
}

function switchTab(id) {
  if (!tabs[id]) return;
  saveCurrentTabContent();
  currentTabId = id;
  renderTabs();
  initQuill(tabs[id].content || '');
  updateLastUpdated(tabs[id].lastUpdated);
  saveTabs();
}

function saveCurrentTabContent() {
  if (!currentTabId || !quill) return;
  tabs[currentTabId].content = quill.root.innerHTML;
  tabs[currentTabId].lastUpdated = new Date().toLocaleString();
  updateLastUpdated(tabs[currentTabId].lastUpdated);
  saveTabs();
}

function renderTabs() {
  tabsContainer.innerHTML = '';
  Object.entries(tabs).forEach(([id, tabData]) => {
    const tab = document.createElement('div');
    tab.className = 'tab' + (id === currentTabId ? ' active' : '');

    if (tabData.editing) {
      const input = document.createElement('input');
      input.value = tabData.title;
      input.onblur = () => {
        tabs[id].title = input.value.trim() || 'Sem título';
        tabs[id].editing = false;
        saveTabs();
        renderTabs();
      };
      input.onkeydown = (e) => {
        if (e.key === 'Enter') input.blur();
      };
      tab.appendChild(input);
      input.focus();
    } else {
      const span = document.createElement('span');
      span.className = 'title';
      span.textContent = tabData.title.length > 15 ? tabData.title.slice(0, 15) + '…' : tabData.title;
      span.ondblclick = (e) => {
        e.stopPropagation();
        tabs[id].editing = true;
        renderTabs();
      };
      tab.appendChild(span);
    }

    const close = document.createElement('span');
    close.className = 'close';
    close.textContent = '×'; // caractere "x" mais bonito
    close.title = 'Fechar aba';
    close.onclick = (e) => {
      e.stopPropagation();
      delete tabs[id];
      if (currentTabId === id) {
        const tabIds = Object.keys(tabs);
        currentTabId = tabIds.length > 0 ? tabIds[0] : null;
        if (currentTabId) initQuill(tabs[currentTabId].content);
        else quill.root.innerHTML = '';
        updateLastUpdated(currentTabId ? tabs[currentTabId].lastUpdated : '-');
      }
      renderTabs();
      saveTabs();
    };
    tab.appendChild(close);

    tab.onclick = () => {
      if (id !== currentTabId) switchTab(id);
    };

    tabsContainer.appendChild(tab);
  });
}

document.getElementById('addTabBtn').addEventListener('click', () => {
  createTab('Nova aba');
});

window.addEventListener('beforeunload', () => {
  saveCurrentTabContent();
});

// Inicialização
loadTabs();

if (!currentTabId) {
  createTab('Primeira aba');
} else {
  renderTabs();
  initQuill(tabs[currentTabId].content);
  updateLastUpdated(tabs[currentTabId].lastUpdated);
}
