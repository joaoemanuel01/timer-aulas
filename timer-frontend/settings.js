// ═══════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════
const API_URL = 'https://seu-backend.up.railway.app';

// ═══════════════════════════════════════
//  GUARDS — redireciona se não logado
// ═══════════════════════════════════════
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

// ═══════════════════════════════════════
//  STATE
// ═══════════════════════════════════════
let selectedPref = localStorage.getItem('aulaMode') || 'cronometro';
let selectedFile = null;

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  // Preenche nome e email
  document.getElementById('userName').textContent  = localStorage.getItem('userName') || '—';
  document.getElementById('userEmail').textContent = localStorage.getItem('userEmail') || '—';

  // Tenta buscar dados atualizados da API
  try {
    const res  = await fetch(`${API_URL}/api/user/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('userName').textContent  = data.name;
      document.getElementById('userEmail').textContent = data.email;
      localStorage.setItem('userName',     data.name);
      localStorage.setItem('userEmail',    data.email);
      localStorage.setItem('aulaMode',     data.aulaMode);
      localStorage.setItem('aulaImageUrl', data.aulaImageUrl || '');
      selectedPref = data.aulaMode;

      // Mostra imagem atual se existir
      if (data.aulaImageUrl && data.aulaMode === 'personalizado') {
        showCurrentImage(data.aulaImageUrl);
      }
    }
  } catch (e) {
    // usa dados do localStorage se offline
  }

  // Aplica seleção visual inicial
  applyPrefSelection(selectedPref);
});

// ═══════════════════════════════════════
//  SELECIONAR PREFERÊNCIA
// ═══════════════════════════════════════
function selectPref(pref) {
  selectedPref = pref;
  applyPrefSelection(pref);
}

function applyPrefSelection(pref) {
  document.getElementById('prefCron').classList.toggle('selected',   pref === 'cronometro');
  document.getElementById('prefCustom').classList.toggle('selected', pref === 'personalizado');

  const uploadArea       = document.getElementById('uploadArea');
  const currentImageWrap = document.getElementById('currentImageWrap');

  if (pref === 'personalizado') {
    uploadArea.classList.add('visible');
    const existingUrl = localStorage.getItem('aulaImageUrl');
    if (existingUrl && existingUrl !== 'null' && existingUrl !== '') {
      showCurrentImage(existingUrl);
    }
  } else {
    uploadArea.classList.remove('visible');
    currentImageWrap.style.display = 'none';
    selectedFile = null;
    document.getElementById('uploadPreview').classList.remove('visible');
  }
}

// ═══════════════════════════════════════
//  PREVIEW DA IMAGEM SELECIONADA
// ═══════════════════════════════════════
function previewImage(event) {
  selectedFile = event.target.files[0];
  if (!selectedFile) return;

  const preview = document.getElementById('uploadPreview');
  preview.src = URL.createObjectURL(selectedFile);
  preview.classList.add('visible');

  // Esconde imagem atual ao selecionar nova
  document.getElementById('currentImageWrap').style.display = 'none';
}

function showCurrentImage(url) {
  const wrap = document.getElementById('currentImageWrap');
  document.getElementById('currentImage').src = url;
  wrap.style.display = 'flex';
}

// ═══════════════════════════════════════
//  SALVAR CONFIGURAÇÕES
// ═══════════════════════════════════════
async function saveSettings() {
  const errorEl   = document.getElementById('settingsError');
  const successEl = document.getElementById('settingsSuccess');
  errorEl.textContent   = '';
  successEl.textContent = '';

  if (selectedPref === 'personalizado' && !selectedFile) {
    const existingUrl = localStorage.getItem('aulaImageUrl');
    if (!existingUrl || existingUrl === 'null' || existingUrl === '') {
      errorEl.textContent = 'Envie uma imagem para o modo personalizado.';
      return;
    }
    // Tem imagem existente, só atualiza o modo
    await updatePrefsOnly(selectedPref);
    return;
  }

  // Se tem arquivo novo, faz upload primeiro
  if (selectedFile) {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res  = await fetch(`${API_URL}/api/user/upload-aula-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro no upload.');

      localStorage.setItem('aulaImageUrl', data.url);
      localStorage.setItem('aulaMode',     'personalizado');
      successEl.textContent = 'Salvo com sucesso!';
    } catch (e) {
      errorEl.textContent = e.message;
      return;
    }
  } else {
    await updatePrefsOnly(selectedPref);
  }
}

async function updatePrefsOnly(mode) {
  const errorEl   = document.getElementById('settingsError');
  const successEl = document.getElementById('settingsSuccess');

  try {
    const res  = await fetch(`${API_URL}/api/user/prefs`, {
      method: 'PATCH',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ aulaMode: mode })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao salvar.');

    localStorage.setItem('aulaMode',     data.aulaMode);
    localStorage.setItem('aulaImageUrl', data.aulaImageUrl || '');
    successEl.textContent = 'Salvo com sucesso!';
  } catch (e) {
    errorEl.textContent = e.message;
  }
}

// ═══════════════════════════════════════
//  REMOVER IMAGEM
// ═══════════════════════════════════════
async function removeImage() {
  const errorEl   = document.getElementById('settingsError');
  const successEl = document.getElementById('settingsSuccess');
  errorEl.textContent   = '';
  successEl.textContent = '';

  try {
    const res  = await fetch(`${API_URL}/api/user/aula-image`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao remover.');

    localStorage.setItem('aulaMode',     'cronometro');
    localStorage.setItem('aulaImageUrl', '');

    selectedPref = 'cronometro';
    selectedFile = null;
    applyPrefSelection('cronometro');
    document.getElementById('currentImageWrap').style.display = 'none';
    successEl.textContent = 'Imagem removida. Modo alterado para Cronômetro.';
  } catch (e) {
    errorEl.textContent = e.message;
  }
}

// ═══════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════
function doLogout() {
  localStorage.clear();
  window.location.href = 'login.html';
}