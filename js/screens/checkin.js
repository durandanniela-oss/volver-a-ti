import { get, put, getSetting } from '../db.js';
import { icon, esc, dayKey, longDate, greeting } from '../ui.js';
import { MOODS, BODY, NEEDS, SLEEP, MOOD_ADJ, movementSuggestion } from '../data.js';

// Check-in paso a paso: una pregunta por pantalla.
const ENERGY_WORDS = ['Sin batería', 'Baja', 'Media', 'Buena', 'Llena'];
const STEPS = ['mente', 'energia', 'cuerpo', 'necesito'];

// Qué sugerir según lo que necesitas hoy.
const NEED_SUGGESTION = {
  Descansar: ['Una pausa para descansar', '#/pausa/descansar'],
  Moverme: ['Elige un movimiento para hoy', '#/movimiento'],
  Crear: ['Escribe o crea algo solo por gusto', '#/entrada/nueva?q=¿Qué%20me%20gustaría%20crear%20hoy%3F'],
  Hablar: ['Escribe lo que quieres decir', '#/entrada/nueva?q=¿Qué%20necesito%20decir%20y%20a%20quién%3F'],
  Desconectarme: ['Un ritual sin pantallas', '#/rituales'],
  Organizarme: ['Revisa tu lista de hoy', '#/hoy'],
  'Estar conmigo': ['Un momento para escribirte', '#/entrada/nueva?q=¿Cómo%20estoy%2C%20de%20verdad%3F'],
};

const chips = (group, options, selected) =>
  options
    .map((label) => `<button type="button" class="chip big" data-group="${group}" data-value="${esc(label)}" aria-pressed="${selected.includes(label)}">${esc(label)}</button>`)
    .join('');

export default async function checkin(root) {
  const today = dayKey();
  const [saved, name] = await Promise.all([get('checkins', today), getSetting('name', '')]);
  const state = {
    moods: saved?.moods || [],
    body: saved?.body || [],
    needs: saved?.needs || [],
    energy: saved?.energy || 0,
    sleep: saved?.sleep || null,
    note: saved?.note || '',
  };
  let step = 0;
  let direction = 1;

  function stepHTML() {
    switch (STEPS[step]) {
      case 'mente':
        return `
          <h1 class="h1 xl" style="display: flex; align-items: center; gap: 10px">${greeting()}${name ? `,<br>${esc(name)}` : ''} ${icon.sun({ size: 30, sw: 1.4 })}</h1>
          <p class="lead">No todos los días necesitan comenzar con un plan. Algunos solo necesitan <em style="color: var(--ink)">comenzar contigo.</em></p>
          <h2 class="question">¿Cómo está tu mente hoy?</h2>
          <p class="small">Elige todas las que sientas.</p>
          <div class="chips">${chips('moods', MOODS, state.moods)}</div>`;
      case 'energia':
        return `
          <h2 class="question">¿Cuánta energía tienes?</h2>
          <div class="energy-list" role="radiogroup" aria-label="Energía del 1 al 5">
            ${[5, 4, 3, 2, 1].map((n) => `
            <button type="button" role="radio" class="energy-row" data-energy="${n}" aria-checked="${state.energy === n}">
              <span class="energy-dots" aria-hidden="true">${[1, 2, 3, 4, 5].map((d) => `<i class="${d <= n ? 'on' : ''}"></i>`).join('')}</span>
              <span>${ENERGY_WORDS[n - 1]}</span>
            </button>`).join('')}
          </div>
          <h2 class="question" style="font-size: 20px; margin-top: 8px">¿Cómo dormiste?</h2>
          <div class="chips">${SLEEP.map((s) => `<button type="button" class="chip big" data-sleep="${esc(s)}" aria-pressed="${state.sleep === s}">${esc(s)}</button>`).join('')}</div>`;
      case 'cuerpo':
        return `
          <h2 class="question">¿Cómo está tu cuerpo?</h2>
          <p class="small">Puedes elegir varias, o ninguna.</p>
          <div class="chips">${chips('body', BODY, state.body)}</div>`;
      default:
        return `
          <h2 class="question">¿Qué necesitas hoy?</h2>
          <div class="chips">${chips('needs', NEEDS, state.needs)}</div>
          <div class="card" style="padding: 14px 18px; margin-top: 8px">
            <div class="field">
              <label for="note">Una nota para ti (opcional)</label>
              <textarea id="note" class="textarea" rows="2" style="font-size: 16px" placeholder="¿Algo que quieras recordar de hoy?">${esc(state.note)}</textarea>
            </div>
          </div>`;
    }
  }

  function doneHTML() {
    const feelings = state.moods.map((m) => MOOD_ADJ[m]).filter(Boolean);
    let suggestion;
    if (state.moods.includes('Ansiedad')) suggestion = ['Respiración guiada de 3 minutos', '#/pausa/ansiedad'];
    else if (state.needs.length && NEED_SUGGESTION[state.needs[0]]) suggestion = NEED_SUGGESTION[state.needs[0]];
    else {
      const move = movementSuggestion(state);
      suggestion = [`${move.name} · ${move.time}`, '#/movimiento'];
    }
    return `
      <div class="done-mark" aria-hidden="true">${icon.check({ size: 34 })}</div>
      <h1 class="h1 xl" style="text-align: center">Listo${name ? `, ${esc(name)}` : ''}</h1>
      <p class="lead" style="text-align: center">${feelings.length ? `Hoy te sientes ${esc(feelings.length > 1 ? `${feelings.slice(0, -1).join(', ')} y ${feelings[feelings.length - 1]}` : feelings[0])}.` : 'Gracias por darte este momento.'} Tu energía está en ${state.energy || '–'} de 5.</p>
      <a class="card card-sig" href="${suggestion[1]}" style="text-decoration: none; color: inherit; flex-direction: row; align-items: center; margin-top: 12px">
        <span style="flex: 1; display: flex; flex-direction: column; gap: 4px">
          <span class="eyebrow sm">Una idea para hoy</span>
          <strong style="font-size: 18px; font-weight: 500">${esc(suggestion[0])}</strong>
        </span>
        ${icon.chevron()}
      </a>
      <a class="cta" href="#/hoy" style="margin-top: auto"><span>Ir a Mi día</span><span class="cta-dot">${icon.arrow()}</span></a>`;
  }

  function render(done = false) {
    const last = step === STEPS.length - 1;
    root.innerHTML = `
    <main class="screen no-nav" style="gap: 18px">
      <header class="topbar">
        ${done || step === 0
          ? `<span class="eyebrow">${longDate()}</span>`
          : `<button type="button" class="icon-btn" id="back" aria-label="Pregunta anterior">${icon.back()}</button>`}
        ${done ? '' : `<button type="button" class="link-pill" id="skip">Saltar</button>`}
      </header>
      ${done ? '' : `<div class="progress" role="progressbar" aria-label="Pregunta ${step + 1} de ${STEPS.length}" aria-valuemin="1" aria-valuemax="${STEPS.length}" aria-valuenow="${step + 1}">
        ${STEPS.map((_, i) => `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}
      </div>`}
      <section class="step ${direction > 0 ? 'from-right' : 'from-left'}" style="flex: 1">${done ? doneHTML() : stepHTML()}</section>
      ${done ? '' : `<button class="cta" id="next" type="button"><span>${last ? 'Guardar mi check-in' : 'Siguiente'}</span><span class="cta-dot">${last ? icon.check({ size: 18 }) : icon.arrow()}</span></button>`}
    </main>`;
    window.scrollTo(0, 0);
  }

  const keepNote = () => {
    const note = root.querySelector('#note');
    if (note) state.note = note.value.trim();
  };

  async function next() {
    keepNote();
    if (step < STEPS.length - 1) {
      step++;
      direction = 1;
      render();
      return;
    }
    await put('checkins', { ...state, date: today, updatedAt: new Date().toISOString() }, today);
    direction = 1;
    render(true);
  }

  function onClick(event) {
    const chip = event.target.closest('[data-group]');
    if (chip) {
      const list = state[chip.dataset.group];
      const value = chip.dataset.value;
      const index = list.indexOf(value);
      if (index === -1) list.push(value);
      else list.splice(index, 1);
      chip.setAttribute('aria-pressed', String(index === -1));
      return;
    }
    const sleepBtn = event.target.closest('[data-sleep]');
    if (sleepBtn) {
      state.sleep = state.sleep === sleepBtn.dataset.sleep ? null : sleepBtn.dataset.sleep;
      root.querySelectorAll('[data-sleep]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sleep === state.sleep)));
      return;
    }
    const energyBtn = event.target.closest('[data-energy]');
    if (energyBtn) {
      state.energy = Number(energyBtn.dataset.energy);
      root.querySelectorAll('[data-energy]').forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.energy) === state.energy)));
      return;
    }
    if (event.target.closest('#next') || event.target.closest('#skip')) {
      next();
      return;
    }
    if (event.target.closest('#back')) {
      keepNote();
      step = Math.max(0, step - 1);
      direction = -1;
      render();
    }
  }

  render();
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
