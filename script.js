// ═══════════════════════════════════════
//  STATE
// ═══════════════════════════════════════
let currentMode   = 'aula';
let timerMode     = 'cronometro';
let timerInterval = null;
let totalSeconds  = 0;
let running       = false;
let finished      = false;

const MODE_LABELS = {
  atividade: 'ATIVIDADE EM SALAS',
  intervalo: 'INTERVALO',
  almoco:    'PAUSA ALMOÇO',
};

// ═══════════════════════════════════════
//  VÍDEO AULA + WIPE LOOP
// ═══════════════════════════════════════
function initAulaVideo() {
  const video = document.getElementById('aulaVideo');
  if (!video) return;

  video.addEventListener('ended', () => {
    const bg = document.getElementById('sceneBg');

    if (IS_SEXTA) {
      // Cross dissolve: imagem aparece por baixo enquanto vídeo some
      const targetUrl = "url('https://i.postimg.cc/1t4pn1vc/sexta.jpg')";
      bg.style.backgroundImage = targetUrl;

      // Fade out do vídeo (cross dissolve)
      video.style.transition = 'opacity 1.5s ease';
      video.style.opacity = '0';

      setTimeout(() => {
        // Vídeo sumiu, imagem já está visível
        video.style.transition = '';
        video.style.opacity = '1';
        video.style.display = 'none';
        video.pause();

        // Fica 10s na imagem, depois wipe para voltar ao vídeo
        setTimeout(() => {
          triggerWipe(() => {
            bg.style.backgroundImage = '';
            showAulaVideo();
          });
        }, 10000);

      }, 1500); // aguarda o fade completar

    } else {
      triggerWipe(() => {
        video.currentTime = 0;
        video.play();
      });
    }
  });
}

function triggerWipe(callback) {
  const overlay = document.getElementById('wipeOverlay');
  overlay.classList.remove('animate');
  void overlay.offsetWidth; // força reflow para reiniciar animação
  overlay.classList.add('animate');
  setTimeout(callback, 660);          // restart no meio (tela coberta)
  setTimeout(() => overlay.classList.remove('animate'), 1300);
}

function showAulaVideo() {
  const video = document.getElementById('aulaVideo');
  if (!video) return;
  video.style.display = 'block';
  video.currentTime = 0;
  video.play();
}

function hideAulaVideo() {
  const video = document.getElementById('aulaVideo');
  if (!video) return;
  video.pause();
  video.style.display = 'none';
}

const IS_SEXTA = new Date().getDay() === 5;
const IS_DOMINGO = new Date().getDay() === 0;

const SLIDESHOW_IMAGES = [
  ...(IS_SEXTA ? ['https://i.postimg.cc/hv7CQgNP/sexta.jpg'] : []),
  'https://i.postimg.cc/y8FFfmcP/atendimento.png',
  'https://timer-backend.carreira.group/v1/files/7e70147d-80fa-457f-8c42-8dfc29fdafda.jpeg',
  'https://timer-backend.carreira.group/v1/files/78adfa78-55dd-4448-a42f-744c4f5ab6a4.jpeg',
  'https://timer-backend.carreira.group/v1/files/8ee42381-543c-4f45-a077-528e9c798ffe.jpeg',
  'https://timer-backend.carreira.group/v1/files/18c6a854-dca7-4d67-a11b-bd393e8562aa.jpeg',
  'https://timer-backend.carreira.group/v1/files/4145379e-061e-490f-bf00-e27c26d9bbf7.jpeg',
  'https://timer-backend.carreira.group/v1/files/201e1b15-0a83-4561-aadd-f3f47cf7147e.jpeg'
];

let slideshowIndex    = 0;
let slideshowInterval = null;

function startSlideshow() {
  stopSlideshow();
  slideshowIndex = 0;
  applySlideshowBg();
  slideshowInterval = setInterval(() => {
    slideshowIndex = (slideshowIndex + 1) % SLIDESHOW_IMAGES.length;
    applySlideshowBg();
  }, 10000);
}

function stopSlideshow() {
  if (slideshowInterval) {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
  }
}

function applySlideshowBg() {
  const bg = document.getElementById('sceneBg');
  bg.style.backgroundImage = `url('${SLIDESHOW_IMAGES[slideshowIndex]}')`;
}

// ═══════════════════════════════════════
//  INIT — populate selects
// ═══════════════════════════════════════
function pad(n) { return String(n).padStart(2, '0'); }

function populateSelect(id, max) {
  const sel = document.getElementById(id);
  for (let i = 0; i <= max; i++) {
    const o = document.createElement('option');
    o.value = i;
    o.text  = pad(i);
    sel.appendChild(o);
  }
}

populateSelect('selH', 23);
populateSelect('selM', 59);
populateSelect('selS', 59);

// ═══════════════════════════════════════
//  NAV
// ═══════════════════════════════════════
function setMode(mode) {
  if (running) stopTimer();

  currentMode = mode;
  finished    = false;

  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode)
  );

  const bg    = document.getElementById('sceneBg');
  const panel = document.getElementById('timerPanel');

  bg.classList.remove('pulse-on-end');
  bg.style.backgroundImage = '';
  document.getElementById('finishOverlay').classList.remove('active');

  if (mode === 'aula') {
  stopSlideshow();
  hideAulaVideo();
  bg.className = 'scene-bg bg-aula';
  bg.style.backgroundImage = '';
  showAulaVideo();
  document.getElementById('sceneBg').style.backgroundImage = '';
  panel.classList.add('hidden');
} else if (mode === 'avaliacao') {
  hideAulaVideo();
  stopSlideshow();
  bg.className = 'scene-bg bg-avaliacao';
  bg.style.backgroundImage = '';
  panel.classList.add('hidden');
} else {
  hideAulaVideo();
  bg.className = 'scene-bg';
  startSlideshow();
  panel.classList.remove('hidden');
}
  showConfig(true);
  document.getElementById('clockDigits').classList.remove('alarm-flash');
  document.getElementById('clockDigits').textContent = '00:00:00';
  document.getElementById('startBtn').textContent    = '▶ INICIAR';
  document.getElementById('startBtn').classList.remove('running');
  document.getElementById('navTabs').classList.remove('open');

  // Esconde botão voltar ao trocar de aba
  document.getElementById('voltarBtn').style.display = 'none';
  
}

function toggleMenu() {
  document.getElementById('navTabs').classList.toggle('open');
}

// ═══════════════════════════════════════
//  TIMER MODE
// ═══════════════════════════════════════
function selectTimerMode(mode) {
  timerMode = mode;
  document.getElementById('modeCron').classList.toggle('active', mode === 'cronometro');
  document.getElementById('modeHora').classList.toggle('active', mode === 'horario');
}

// ═══════════════════════════════════════
//  SHOW / HIDE config vs clock
// ═══════════════════════════════════════
function showConfig(show) {
  document.getElementById('configCard').style.display   = show ? 'flex' : 'none';
  document.getElementById('clockDisplay').style.display = show ? 'none' : 'block';
  document.getElementById('voltarBtn').style.display    = show ? 'none' : 'block';
  if (show) {
    document.getElementById('chamadaBtn').classList.remove('visible');
    document.getElementById('chamadaOverlay').classList.remove('active');
  }
}

// ═══════════════════════════════════════
//  CALCULATE SECONDS
// ═══════════════════════════════════════
function calcSeconds() {
  const h = parseInt(document.getElementById('selH').value);
  const m = parseInt(document.getElementById('selM').value);
  const s = parseInt(document.getElementById('selS').value);

  if (timerMode === 'cronometro') {
    return h * 3600 + m * 60 + s;
  } else {
    const now    = new Date();
    const target = new Date();
    target.setHours(h, m, s, 0);
    let diff = Math.floor((target - now) / 1000);
    if (diff <= 0) diff += 86400;
    return diff;
  }
}

// ═══════════════════════════════════════
//  FORMAT
// ═══════════════════════════════════════
function formatTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// ═══════════════════════════════════════
//  TOGGLE TIMER
// ═══════════════════════════════════════
function toggleTimer() {
  if (running) {
    stopTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  const secs = calcSeconds();
  if (secs <= 0) {
    alert('⚠️ Defina um tempo válido!');
    return;
  }

  totalSeconds = secs;
  finished     = false;
  running      = true;

  document.getElementById('clockDigits').classList.remove('alarm-flash');
  document.getElementById('finishOverlay').classList.remove('active');
  document.getElementById('sceneBg').classList.remove('pulse-on-end');
  document.getElementById('startBtn').textContent = '⏹ PARAR';
  document.getElementById('startBtn').classList.add('running');

  const modeLabel = MODE_LABELS[currentMode] || currentMode.toUpperCase();
  document.getElementById('clockLabel').textContent = modeLabel;

  const chamadaBtn = document.getElementById('chamadaBtn');
  if (currentMode === 'intervalo') {
    chamadaBtn.classList.add('visible');
  } else {
    chamadaBtn.classList.remove('visible');
  }

  showConfig(false);
  updateClock();

  timerInterval = setInterval(() => {
    totalSeconds--;
    updateClock();
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      timerFinished();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  running  = false;
  finished = false;

  document.getElementById('startBtn').textContent = '▶ INICIAR';
  document.getElementById('startBtn').classList.remove('running');
  document.getElementById('clockDigits').classList.remove('alarm-flash');
  document.getElementById('finishOverlay').classList.remove('active');
  document.getElementById('sceneBg').classList.remove('pulse-on-end');
  document.getElementById('chamadaBtn').classList.remove('visible');
  document.getElementById('chamadaOverlay').classList.remove('active');

  showConfig(true);
}

function updateClock() {
  const safe      = Math.max(0, totalSeconds);
  const formatted = formatTime(safe);
  document.getElementById('clockDigits').textContent      = formatted;
  document.getElementById('chamadaMiniTimer').textContent = formatted;
}

// ═══════════════════════════════════════
//  TIMER FINISHED
// ═══════════════════════════════════════
function timerFinished() {
  running  = false;
  finished = true;

  document.getElementById('clockDigits').textContent = '00:00:00';
  document.getElementById('clockDigits').classList.add('alarm-flash');
  document.getElementById('finishOverlay').classList.add('active');
  document.getElementById('sceneBg').classList.add('pulse-on-end');

  document.getElementById('startBtn').textContent = '▶ REINICIAR';
  document.getElementById('startBtn').classList.remove('running');

  const audio = document.getElementById('alarmeAudio');
  audio.currentTime = 0;
  audio.play().catch(() => playBeep());
}

// ═══════════════════════════════════════
//  CHAMADA LIBERADA
// ═══════════════════════════════════════
function ativarChamada() {
  document.getElementById('chamadaOverlay').classList.add('active');
}

function fecharChamada() {
  document.getElementById('chamadaOverlay').classList.remove('active');
}

// ═══════════════════════════════════════
//  WEB AUDIO BEEP (fallback)
// ═══════════════════════════════════════
function playBeep() {
  try {
    const ctx         = new (window.AudioContext || window.webkitAudioContext)();
    const beepPattern = [0, 0.3, 0.6, 0.9, 1.2];
    beepPattern.forEach(t => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.6, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.25);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.25);
    });
  } catch(e) { /* silent fail */ }
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
initAulaVideo();
const tabAvaliacao = document.getElementById('tabAvaliacao');
if (tabAvaliacao) {
  tabAvaliacao.style.display = IS_DOMINGO ? 'inline-block' : 'none';
}
setMode('aula');
setMode('aula');

