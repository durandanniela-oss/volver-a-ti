import { icon } from '../ui.js';
import { PAUSES } from '../data.js';

// Ruido suave (marrón) generado en el teléfono: no descarga audio.
function startNoise() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const length = ctx.sampleRate * 6;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  return ctx;
}

export default async function pausa(root, { params }) {
  const preset = PAUSES.find((p) => p.id === params[0] && p.pattern) || PAUSES[0];
  const total = preset.minutes * 60;
  const pattern = preset.pattern;
  let remaining = total;
  let running = true;
  let phaseIndex = 0;
  let phaseLeft = pattern[0][1];
  let audio = null;

  root.innerHTML = `
  <main class="pause">
    <header class="topbar">
      <span class="eyebrow" style="color: #EADFCB">${preset.need}</span>
      <a class="icon-btn" href="#/biblioteca" aria-label="Cerrar">${icon.close()}</a>
    </header>
    <div class="orb-wrap" aria-hidden="true">
      <div class="orb-ring"></div>
      <div class="orb js" id="orb"></div>
    </div>
    <div class="phase" id="phase" aria-live="polite"></div>
    <p class="small" style="color: var(--on-dark-muted); text-align: center; max-width: 290px; margin-top: 10px; font-size: 16px">${preset.hint || 'Sigue el círculo. Cuando crezca, inhala; cuando se haga pequeño, suelta el aire.'}</p>
    <div style="margin-top: auto; align-self: stretch; display: flex; flex-direction: column; gap: 12px">
      <button type="button" id="sound" class="btn btn-ghost" aria-pressed="false" style="color: var(--on-dark); border-color: rgba(245,240,230,0.25)">Sonido suave: no</button>
      <div class="timer" style="margin-top: 0">
        <span class="num" style="font-size: 22px" id="clock"></span>
        <button type="button" id="toggle" aria-label="Pausar">${icon.pause()}</button>
      </div>
    </div>
  </main>`;

  const orb = root.querySelector('#orb');
  const phaseEl = root.querySelector('#phase');
  const clock = root.querySelector('#clock');
  const toggleBtn = root.querySelector('#toggle');
  const soundBtn = root.querySelector('#sound');

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Mueve el círculo al ritmo de la fase actual.
  const animate = () => {
    const [label, secs] = pattern[phaseIndex];
    orb.style.transitionDuration = `${secs}s`;
    if (label === 'Inhala') orb.style.transform = 'scale(1)';
    else if (label === 'Exhala') orb.style.transform = 'scale(0.6)';
    else if (label === 'Descansa') orb.style.transform = orb.style.transform === 'scale(0.9)' ? 'scale(0.78)' : 'scale(0.9)';
  };

  const paint = () => {
    phaseEl.textContent = remaining > 0 ? `${pattern[phaseIndex][0].toUpperCase()} · ${phaseLeft}` : 'BIEN HECHO';
    clock.textContent = fmt(remaining);
  };

  orb.style.transform = 'scale(0.6)';
  const start = setTimeout(animate, 60); // deja que el navegador pinte el tamaño inicial antes de animar
  paint();

  const tick = setInterval(() => {
    if (!running || remaining <= 0) return;
    remaining -= 1;
    phaseLeft -= 1;
    if (phaseLeft <= 0) {
      phaseIndex = (phaseIndex + 1) % pattern.length;
      phaseLeft = pattern[phaseIndex][1];
      animate();
    }
    if (remaining <= 0) {
      running = false;
      toggleBtn.innerHTML = icon.play();
      toggleBtn.setAttribute('aria-label', 'Empezar de nuevo');
    }
    paint();
  }, 1000);

  const onClick = (event) => {
    if (event.target.closest('#toggle')) {
      if (remaining <= 0) {
        remaining = total;
        phaseIndex = 0;
        phaseLeft = pattern[0][1];
        animate();
      }
      running = !running;
      toggleBtn.innerHTML = running ? icon.pause() : icon.play();
      toggleBtn.setAttribute('aria-label', running ? 'Pausar' : 'Continuar');
      paint();
      return;
    }
    if (event.target.closest('#sound')) {
      if (audio) {
        audio.close();
        audio = null;
      } else {
        audio = startNoise();
      }
      soundBtn.setAttribute('aria-pressed', String(!!audio));
      soundBtn.textContent = `Sonido suave: ${audio ? 'sí' : 'no'}`;
    }
  };
  root.addEventListener('click', onClick);

  return () => {
    clearTimeout(start);
    clearInterval(tick);
    root.removeEventListener('click', onClick);
    if (audio) audio.close();
  };
}
