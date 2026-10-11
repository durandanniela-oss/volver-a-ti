import { icon } from '../ui.js';

const PHASES = [
  { label: 'Inhala', seconds: 4 },
  { label: 'Sostén', seconds: 2 },
  { label: 'Exhala', seconds: 6 },
];
const TOTAL = 180;

export default async function pausa(root) {
  let remaining = TOTAL;
  let running = true;
  let phaseIndex = 0;
  let phaseLeft = PHASES[0].seconds;

  root.innerHTML = `
  <main class="pause">
    <header class="topbar">
      <span class="eyebrow" style="color: #E6DDF6">Mi pausa</span>
      <a class="icon-btn" href="#/hoy" aria-label="Cerrar y volver a Mi día">${icon.close()}</a>
    </header>
    <div class="orb-wrap" aria-hidden="true">
      <div class="orb-ring"></div>
      <div class="orb run" id="orb"></div>
    </div>
    <div class="phase" id="phase" aria-live="polite">INHALA · 4</div>
    <p class="small" style="color: var(--on-dark-muted); text-align: center; max-width: 280px; margin-top: 10px; font-size: 16px">Sigue el círculo. Cuando crezca, inhala; cuando se haga pequeño, suelta el aire.</p>
    <div class="timer">
      <span class="num" style="font-size: 22px" id="clock">03:00</span>
      <button type="button" id="toggle" aria-label="Pausar">${icon.pause()}</button>
    </div>
  </main>`;

  const orb = root.querySelector('#orb');
  const phaseEl = root.querySelector('#phase');
  const clock = root.querySelector('#clock');
  const toggle = root.querySelector('#toggle');

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const paint = () => {
    phaseEl.textContent = remaining > 0 ? `${PHASES[phaseIndex].label.toUpperCase()} · ${phaseLeft}` : 'BIEN HECHO';
    clock.textContent = fmt(remaining);
  };

  const tick = setInterval(() => {
    if (!running || remaining <= 0) return;
    remaining -= 1;
    phaseLeft -= 1;
    if (phaseLeft <= 0) {
      phaseIndex = (phaseIndex + 1) % PHASES.length;
      phaseLeft = PHASES[phaseIndex].seconds;
    }
    if (remaining <= 0) {
      running = false;
      orb.classList.add('paused');
    }
    paint();
  }, 1000);

  const onClick = (event) => {
    if (!event.target.closest('#toggle')) return;
    if (remaining <= 0) {
      remaining = TOTAL;
      phaseIndex = 0;
      phaseLeft = PHASES[0].seconds;
      orb.classList.remove('run');
      void orb.offsetWidth; // reinicia la animación desde el principio
      orb.classList.add('run');
    }
    running = !running;
    orb.classList.toggle('paused', !running);
    toggle.innerHTML = running ? icon.pause() : icon.play();
    toggle.setAttribute('aria-label', running ? 'Pausar' : 'Continuar');
    paint();
  };
  root.addEventListener('click', onClick);

  return () => {
    clearInterval(tick);
    root.removeEventListener('click', onClick);
  };
}
