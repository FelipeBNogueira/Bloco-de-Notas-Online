const tabsContainer = document.getElementById('tabs');
const newTabBtn = document.getElementById('newTab');
const lastUpdated = document.getElementById('lastUpdated');
let currentTabId = null;
let quill;

let tabs = {};

function updateLastUpdated() {
  const now = new Date().toLocaleString();
  if (currentTabId) {
    tabs[currentTabId].updated = now;
    renderLastUpdated();
  }
}

function renderLastUpdated() {
  lastUpdated.textContent = currentTabId && tabs[currentTabId]?.updated ? `Última atualização: ${tabs[currentTabId].updated}` : '-';
}

function initQuill() {
  Quill.register('modules/imageResize', window.ImageResize);

  quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      imageResize: {
        displaySize: true,
      },
      toolbar: [
        [{ 'font': [] }, { 'size': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ]
    }
  });

  quill.on('text-change', () => {
    updateLastUpdated();
    saveCurrentTabContent();
  });
}

function createTab(title = 'Nova Aba') {
  const id = Date.now().toString();
  tabs[id] = {
    title,
    content: '',
    updated: '-',
    editing: false
  };

  renderTabs();
  switchTab(id);
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
        tabs[id].title = input.value || 'Sem título';
        tabs[id].editing = false;
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
      span.textContent = tabData.title.slice(0, 15);
      span.ondblclick = () => {
        tabs[id].editing = true;
        renderTabs();
      };
      tab.appendChild(span);
    }

    const close = document.createElement('span');
    close.className = 'close';
    close.textContent = 'x';
    close.onclick = (e) => {
      e.stopPropagation();
      delete tabs[id];
      if (currentTabId === id) currentTabId = null;
      renderTabs();
      if (Object.keys(tabs).length > 0) {
        switchTab(Object.keys(tabs)[0]);
      } else {
        quill.setContents([]);
        lastUpdated.textContent = '-';
      }
    };

    tab.onclick = () => {
      if (!tabs[id].editing) switchTab(id);
    };

    tab.appendChild(close);
    tabsContainer.appendChild(tab);
  });
}

function switchTab(id) {
  if (!tabs[id]) return;
  saveCurrentTabContent();
  currentTabId = id;
  renderTabs();
  quill.root.innerHTML = tabs[id].content || '';
  renderLastUpdated();
}

function saveCurrentTabContent() {
  if (currentTabId && quill) {
    tabs[currentTabId].content = quill.root.innerHTML;
  }
}

function downloadTxt() {
  saveCurrentTabContent();
  const content = tabs[currentTabId]?.content || '';
  const blob = new Blob([content], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = `${tabs[currentTabId].title}.txt`;
  link.href = URL.createObjectURL(blob);
  link.click();
}

async function downloadPdf() {
  saveCurrentTabContent();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = quill.getText();
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 20);
  doc.save(`${tabs[currentTabId].title}.pdf`);
}

function clearNote() {
  if (confirm('Tem certeza que deseja apagar suas anotações?')) {
    quill.setContents([]);
    updateLastUpdated();
  }
}

newTabBtn.onclick = () => {
  saveCurrentTabContent();
  createTab();
};

window.onload = () => {
  initQuill();
  createTab('Primeira Aba');
};
