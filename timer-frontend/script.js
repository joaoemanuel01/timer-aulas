// ═══════════════════════════════════════
//  STATE
// ═══════════════════════════════════════
let currentMode   = 'aula';       // aula | atividade | intervalo | almoco
let timerMode     = 'cronometro'; // cronometro | horario
let timerInterval = null;
let totalSeconds  = 0;
let running       = false;
let finished      = false;

const MODE_LABELS = {
  atividade: 'ATIVIDADE EM SALAS',
  intervalo: 'INTERVALO',
  almoco:    'PAUSA ALMOÇO',
};

const BG_MAP = {
  aula: 'aula.png',
};

// Imagens em loop para atividade, intervalo e almoço
const SLIDESHOW_IMAGES = [
  'https://timer-backend.carreira.group/v1/files/771609c0-7c68-48ff-87c9-8e61ebd6900d.jpeg',
  'https://timer-backend.carreira.group/v1/files/5e2d2f34-febe-4d1b-b1b6-9631a614e1d7.jpeg',
  'https://timer-backend.carreira.group/v1/files/38015519-2380-4ebf-8027-1b11ee138091.jpeg',
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
  const bg  = document.getElementById('sceneBg');
  const url = SLIDESHOW_IMAGES[slideshowIndex];
  bg.style.backgroundImage = `url('${url}')`;
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

  // nav highlight
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mode === mode)
  );

  // background
  const bg = document.getElementById('sceneBg');
  bg.classList.remove('pulse-on-end');
  bg.style.backgroundImage = '';

  if (mode === 'aula') {
    stopSlideshow();
    bg.className = 'scene-bg bg-aula';
  } else {
    bg.className = 'scene-bg';
    startSlideshow();
  }

  // finish overlay
  document.getElementById('finishOverlay').classList.remove('active');

  // panel visibility
  const panel = document.getElementById('timerPanel');
  const badge = document.getElementById('aulaBadge');

  if (mode === 'aula') {
    panel.classList.add('hidden');
    badge.style.display = 'block';
  } else {
    panel.classList.remove('hidden');
    badge.style.display = 'none';
  }

  // reset clock display
  showConfig(true);
  document.getElementById('clockDigits').classList.remove('alarm-flash');
  document.getElementById('clockDigits').textContent = '00:00:00';
  document.getElementById('startBtn').textContent    = '▶ INICIAR';
  document.getElementById('startBtn').classList.remove('running');

  // close mobile menu
  document.getElementById('navTabs').classList.remove('open');
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
    // Horário Final: diff from now to target time today (or tomorrow)
    const now    = new Date();
    const target = new Date();
    target.setHours(h, m, s, 0);
    let diff = Math.floor((target - now) / 1000);
    if (diff <= 0) diff += 86400; // next day
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

  // Botão chamada: só no intervalo
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
  const safe = Math.max(0, totalSeconds);
  const formatted = formatTime(safe);
  document.getElementById('clockDigits').textContent    = formatted;
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

  // Play alarm
  const audio = document.getElementById('alarmeAudio');
  audio.currentTime = 0;
  audio.play().catch(() => {
    playBeep();
  });
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
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
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
setMode('aula');