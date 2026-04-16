
const API_URL = 'timer-aulas-production.up.railway.app';

// ═══════════════════════════════════════
//  INIT — se já logado, vai direto pro app
// ═══════════════════════════════════════
if (localStorage.getItem('token') || localStorage.getItem('guest')) {
  window.location.href = 'index.html';

}


// ═══════════════════════════════════════
//  PARTÍCULAS DE FUNDO
// ═══════════════════════════════════════
(function spawnParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left              = Math.random() * 100 + 'vw';
    p.style.width             = (Math.random() * 2 + 1) + 'px';
    p.style.height            = p.style.width;
    p.style.animationDuration = (Math.random() * 12 + 8) + 's';
    p.style.animationDelay    = (Math.random() * 10) + 's';
    p.style.opacity           = Math.random() * 0.5;
    p.style.background        = Math.random() > 0.5 ? '#00d4ff' : '#7c3aed';
    container.appendChild(p);
  }
})();

// ═══════════════════════════════════════
//  NAVEGAÇÃO ENTRE TELAS
// ═══════════════════════════════════════
function goTo(screenId) {
  document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  clearErrors();
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(e => e.textContent = '');
}

// ═══════════════════════════════════════
//  MOSTRAR/OCULTAR SENHA
// ═══════════════════════════════════════
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type      = 'text';
    btn.textContent = '🙈';
  } else {
    input.type      = 'password';
    btn.textContent = '👁';
  }
}

// ═══════════════════════════════════════
//  VALIDAÇÃO DE SENHA
// ═══════════════════════════════════════
const PW_RULES = {
  'rule-len':   v => v.length >= 8,
  'rule-upper': v => /[A-Z]/.test(v),
  'rule-lower': v => /[a-z]/.test(v),
  'rule-num':   v => /[0-9]/.test(v),
};

function checkPwRules(value) {
  for (const [id, fn] of Object.entries(PW_RULES)) {
    document.getElementById(id).classList.toggle('ok', fn(value));
  }
}

function isPasswordValid(value) {
  return Object.values(PW_RULES).every(fn => fn(value));
}

// ═══════════════════════════════════════
//  SIGN IN
// ═══════════════════════════════════════
async function handleSignIn() {
  const email    = document.getElementById('siEmail').value.trim();
  const password = document.getElementById('siPassword').value;
  const errorEl  = document.getElementById('siError');

  if (!email || !password) {
    errorEl.textContent = 'Preencha todos os campos.';
    return;
  }

  try {
    const res  = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login.');

    saveSession(data);
    window.location.href = 'index.html';

  } catch (e) {
    errorEl.textContent = e.message;
  }
}

// ═══════════════════════════════════════
//  CADASTRO
// ═══════════════════════════════════════
async function handleRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;
  const errorEl  = document.getElementById('regError');

  if (!name || !email || !password || !confirm) {
    errorEl.textContent = 'Preencha todos os campos.';
    return;
  }

  if (!isPasswordValid(password)) {
    errorEl.textContent = 'A senha não atende aos requisitos.';
    return;
  }

  if (password !== confirm) {
    errorEl.textContent = 'As senhas não coincidem.';
    document.getElementById('regConfirm').classList.add('error');
    return;
  }

  document.getElementById('regConfirm').classList.remove('error');

  try {
    const res  = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar.');

    saveSession(data);
    goTo('screenPrefs'); // vai para escolha de preferências

  } catch (e) {
    errorEl.textContent = e.message;
  }
}

// ═══════════════════════════════════════
//  USAR SEM CADASTRO
// ═══════════════════════════════════════
function handleGuest() {
  localStorage.clear();
  localStorage.setItem('guest', 'true');
  window.location.href = 'index.html';
}

// ═══════════════════════════════════════
//  PREFERÊNCIAS (pós-cadastro)
// ═══════════════════════════════════════
let selectedPref = null;
let selectedFile = null;

function selectPref(pref) {
  selectedPref = pref;
  document.getElementById('prefCron').classList.toggle('selected',   pref === 'cronometro');
  document.getElementById('prefCustom').classList.toggle('selected', pref === 'personalizado');

  const uploadArea = document.getElementById('uploadArea');
  if (pref === 'personalizado') {
    uploadArea.classList.add('visible');
  } else {
    uploadArea.classList.remove('visible');
    selectedFile = null;
    document.getElementById('uploadPreview').classList.remove('visible');
  }
}

function previewImage(event) {
  selectedFile = event.target.files[0];
  if (!selectedFile) return;

  const preview = document.getElementById('uploadPreview');
  preview.src = URL.createObjectURL(selectedFile);
  preview.classList.add('visible');
}

async function handleSavePrefs() {
  const errorEl = document.getElementById('prefError');

  if (!selectedPref) {
    errorEl.textContent = 'Escolha uma opção para continuar.';
    return;
  }

  if (selectedPref === 'personalizado' && !selectedFile) {
    errorEl.textContent = 'Envie uma imagem para o fundo personalizado.';
    return;
  }

  localStorage.setItem('aulaMode', selectedPref);

  // Faz upload da imagem se necessário
  if (selectedPref === 'personalizado' && selectedFile) {
    try {
      const token    = localStorage.getItem('token');
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
    } catch (e) {
      errorEl.textContent = e.message;
      return;
    }
  }

  window.location.href = 'index.html';
}

// ═══════════════════════════════════════
//  SESSÃO
// ═══════════════════════════════════════
function saveSession(data) {
  localStorage.setItem('token',        data.token);
  localStorage.setItem('userName',     data.name);
  localStorage.setItem('aulaMode',     data.aulaMode     || 'cronometro');
  localStorage.setItem('aulaImageUrl', data.aulaImageUrl || '');
}