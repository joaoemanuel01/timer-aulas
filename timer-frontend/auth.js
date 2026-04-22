// ═══════════════════════════════════════
//  CONFIG — troque pela URL do Railway após o deploy
// ═══════════════════════════════════════
const API_URL = 'https://timer-aulas-production.up.railway.app';

// ═══════════════════════════════════════
//  HELPERS DE SESSÃO
// ═══════════════════════════════════════
function getToken()    { return localStorage.getItem('token'); }
function isLoggedIn()  { return !!getToken(); }
function isGuest()     { return localStorage.getItem('guest') === 'true'; }
function getAulaMode() { return localStorage.getItem('aulaMode') || 'cronometro'; }
function getAulaImageUrl() {
  const url = localStorage.getItem('aulaImageUrl');
  return url && url !== 'null' && url !== '' ? url : null;
}

// ═══════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════
function doLogout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// ═══════════════════════════════════════
//  APLICA MODO DA ABA AULA
//  Chamado pelo script.js no setMode('aula')
// ═══════════════════════════════════════
function applyAulaMode() {
  const aulaMode     = getAulaMode();
  const aulaImageUrl = getAulaImageUrl();
  const panel        = document.getElementById('timerPanel');
  const badge        = document.getElementById('aulaBadge');
  const bg           = document.getElementById('sceneBg');

  // Guest ou usuário com modo cronômetro → slideshow + cronômetro visível
  if (isGuest() || aulaMode === 'cronometro') {
    // Mostra o painel do timer
    panel.classList.remove('hidden');
    badge.style.display = 'none';
    // Inicia slideshow (definido no script.js)
    bg.className = 'scene-bg';
    startSlideshow();
    return;
  }

  // Usuário com modo personalizado → imagem própria + sem cronômetro
  if (aulaMode === 'personalizado' && aulaImageUrl) {
    panel.classList.add('hidden');
    badge.style.display = 'none';
    stopSlideshow();
    bg.className = 'scene-bg';
    bg.style.backgroundImage = `url('${aulaImageUrl}')`;
    return;
  }

  // Fallback: se logado mas sem imagem ainda → slideshow
  panel.classList.remove('hidden');
  badge.style.display = 'none';
  bg.className = 'scene-bg';
  startSlideshow();
}

// ═══════════════════════════════════════
//  INIT DO APP (chamado ao carregar index.html)
// ═══════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Se não tem sessão (nem logado nem guest), manda para login
  if (!isLoggedIn() && !isGuest()) {
    window.location.href = 'login.html';
    return;
  }

  // Mostra/oculta botões da navbar
  const navActions = document.getElementById('navActions');
  if (navActions) {
    navActions.style.display = isLoggedIn() ? 'flex' : 'none';
  }
});