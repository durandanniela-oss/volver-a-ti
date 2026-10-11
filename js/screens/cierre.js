import { get, put, getSetting } from '../db.js';
import { icon, esc, dayKey, longDate } from '../ui.js';
import { GOOD_THINGS } from '../data.js';

// Cierre del día: tres preguntas cortas antes de dormir.
const ENERGY_WORDS = ['Sin batería', 'Baja', 'Media', 'Buena', 'Llena'];
const STEPS = ['energia', 'bueno', 'soltar'];

export default async function cierre(root) {
  const today = dayKey();
  const [saved, name] = await Promise.all([get('evenings', today), getSetting('name', '')]);
  const state = {
    energy: saved?.energy || 0,
    good: [...(saved?.good || [])],
    goodText: saved?.goodText || '',
    letGo: saved?.letGo || '',
  };
  let step = 0;
  let direction = 1;

  function stepHTML() {
    switch (STEPS[step]) {
      case 'energia':
        return `
          <h1 class="h1 xl">Buenas noches${name ? `,<br>${esc(name)}` : ''}</h1>
          <p class="lead">Antes de dormir, un momento para cerrar el día con calma.</p>
          <h2 class="question">¿Cómo terminó tu energía?</h2>
          <div class="energy-list" role="radiogroup" aria-label="Energía al final del día">
            ${[5, 4, 3, 2, 1].map((n) => `
            <button type="button" role="radio" class="energy-row" data-energy="${n}" aria-checked="${state.energy === n}">
              <span class="energy-dots" aria-hidden="true">${[1, 2, 3, 4, 5].map((d) => `<i class="${d <= n ? 'on' : ''}"></i>`).join('')}</span>
              <span>${ENERGY_WORDS[n - 1]}</span>
            </button>`).join('')}
          </div>`;
      case 'bueno':
        return `
          <h2 class="question">Algo bueno de hoy</h2>
          <p class="small">Aunque sea pequeño. Elige o escribe.</p>
          <div class="chips">${GOOD_THINGS.map((g) => `<button type="button" class="chip big" data-good="${esc(g)}" aria-pressed="${state.good.includes(g)}">${esc(g)}</button>`).join('')}</div>
          <div class="card" style="padding: 14px 18px; margin-top: 8px">
            <label for="good-text" class="sr-only">Algo bueno de hoy</label>
            <textarea id="good-text" class="textarea" rows="3" placeholder="Hoy agradezco…">${esc(state.goodText)}</textarea>
          </div>`;
      default:
        return `
          <h2 class="question">¿Qué quieres soltar antes de dormir?</h2>
          <p class="small">Escríbelo aquí y déjalo ir por hoy.</p>
          <div class="card" style="padding: 14px 18px">
            <label for="let-go" class="sr-only">Lo que quieres soltar</label>
            <textarea id="let-go" class="textarea" rows="5" placeholder="Hoy suelto…">${esc(state.letGo)}</textarea>
          </div>`;
    }
  }

  function doneHTML() {
    return `
      <div class="done-mark" aria-hidden="true">${icon.check({ size: 34 })}</div>
      <h1 class="h1 xl" style="text-align: center">Que descanses</h1>
      <p class="lead" style="text-align: center">Lo que hiciste hoy fue suficiente.</p>
      <a class="card card-sig" href="#/pausa/dormir" style="text-decoration: none; color: inherit; flex-direction: row; align-items: center; margin-top: 12px">
        <span style="flex: 1; display: flex; flex-direction: column; gap: 4px">
          <span class="eyebrow sm">Para dormir mejor</span>
          <strong style="font-size: 18px; font-weight: 500">Respiración 4-7-8 · 6 min</strong>
        </span>
        ${icon.chevron()}
      </a>
      <a class="cta" href="#/hoy" style="margin-top: auto"><span>Volver a Mi día</span><span class="cta-dot">${icon.arrow()}</span></a>`;
  }

  function render(done = false) {
    const last = step === STEPS.length - 1;
    root.innerHTML = `
    <main class="screen no-nav" style="gap: 18px">
      <header class="topbar">
        ${done || step === 0
          ? `<a class="icon-btn" href="#/hoy" aria-label="Volver a Mi día">${icon.close()}</a>`
          : `<button type="button" class="icon-btn" id="back" aria-label="Pregunta anterior">${icon.back()}</button>`}
        <span class="eyebrow sm">${longDate()}</span>
        ${done ? '<span style="width: 44px"></span>' : '<button type="button" class="link-pill" id="skip">Saltar</button>'}
      </header>
      ${done ? '' : `<div class="progress" role="progressbar" aria-label="Pregunta ${step + 1} de ${STEPS.length}" aria-valuemin="1" aria-valuemax="${STEPS.length}" aria-valuenow="${step + 1}">
        ${STEPS.map((_, i) => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}
      </div>`}
      <section class="step ${direction > 0 ? 'from-right' : 'from-left'}" style="flex: 1">${done ? doneHTML() : stepHTML()}</section>
      ${done ? '' : `<button class="cta" id="next" type="button"><span>${last ? 'Cerrar mi día' : 'Siguiente'}</span><span class="cta-dot">${last ? icon.check({ size: 18 }) : icon.arrow()}</span></button>`}
    </main>`;
    window.scrollTo(0, 0);
  }

  const keepText = () => {
    const good = root.querySelector('#good-text');
    if (good) state.goodText = good.value.trim();
    const letGo = root.querySelector('#let-go');
    if (letGo) state.letGo = letGo.value.trim();
  };

  async function next() {
    keepText();
    if (step < STEPS.length - 1) {
      step++;
      direction = 1;
      render();
      return;
    }
    await put('evenings', { ...state, date: today, updatedAt: new Date().toISOString() }, today);
    render(true);
  }

  function onClick(event) {
    const energyBtn = event.target.closest('[data-energy]');
    if (energyBtn) {
      state.energy = Number(energyBtn.dataset.energy);
      root.querySelectorAll('[data-energy]').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.energy) === state.energy)));
      return;
    }
    const good = event.target.closest('[data-good]');
    if (good) {
      const i = state.good.indexOf(good.dataset.good);
      if (i === -1) state.good.push(good.dataset.good);
      else state.good.splice(i, 1);
      good.setAttribute('aria-pressed', String(i === -1));
      return;
    }
    if (event.target.closest('#next') || event.target.closest('#skip')) {
      next();
      return;
    }
    if (event.target.closest('#back')) {
      keepText();
      step = Math.max(0, step - 1);
      direction = -1;
      render();
    }
  }

  render();
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
