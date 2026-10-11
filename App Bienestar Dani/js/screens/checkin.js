import { get, put } from '../db.js';
import { icon, esc, dayKey, longDate, greeting, toast } from '../ui.js';
import { MOODS, BODY, NEEDS } from '../data.js';

const chips = (group, options, selected) =>
  options
    .map((label) => `<button type="button" class="chip" data-group="${group}" data-value="${esc(label)}" aria-pressed="${selected.includes(label)}">${esc(label)}</button>`)
    .join('');

export default async function checkin(root) {
  const today = dayKey();
  const saved = (await get('checkins', today)) || {};
  const state = {
    moods: saved.moods || [],
    body: saved.body || [],
    needs: saved.needs || [],
    energy: saved.energy || 0,
    note: saved.note || '',
  };

  root.innerHTML = `
  <main class="screen no-nav" style="gap: 24px">
    <header class="topbar">
      <span class="eyebrow">${longDate()}</span>
      <a class="icon-btn" href="#/perfil" aria-label="Mi perfil">${icon.user({ size: 20 })}</a>
    </header>

    <section style="display: flex; flex-direction: column; gap: 10px">
      <h1 class="h1 xl" style="display: flex; align-items: center; gap: 10px">${greeting()} ${icon.sun({ size: 32, sw: 1.4 })}</h1>
      <p class="lead">No todos los días necesitan comenzar con un plan. Algunos solo necesitan <em style="color: var(--ink)">comenzar contigo.</em></p>
    </section>

    <section aria-labelledby="q-mente" style="display: flex; flex-direction: column; gap: 12px">
      <h2 id="q-mente" class="h2">¿Cómo está tu mente hoy?</h2>
      <div class="chips">${chips('moods', MOODS, state.moods)}</div>
    </section>

    <section aria-labelledby="q-cuerpo" style="display: flex; flex-direction: column; gap: 12px">
      <div class="card-row">
        <h2 id="q-cuerpo" class="h2">¿Cómo está tu cuerpo?</h2>
        <span class="eyebrow sm" id="energy-label">Energía ${state.energy || '–'}/5</span>
      </div>
      <div class="energy" role="radiogroup" aria-label="Energía del 1 al 5">
        ${[1, 2, 3, 4, 5].map((n) => `<button type="button" role="radio" data-energy="${n}" aria-label="Energía ${n} de 5" aria-checked="${state.energy === n}" class="${n <= state.energy ? 'on' : ''}">${n}</button>`).join('')}
      </div>
      <div class="chips">${chips('body', BODY, state.body)}</div>
    </section>

    <section aria-labelledby="q-necesito" style="display: flex; flex-direction: column; gap: 12px">
      <h2 id="q-necesito" class="h2">¿Qué necesitas hoy?</h2>
      <div class="chips">${chips('needs', NEEDS, state.needs)}</div>
    </section>

    <section class="card" style="padding: 14px 18px">
      <div class="field">
        <label for="note">Una nota para ti (opcional)</label>
        <textarea id="note" class="textarea" rows="2" style="font-size: 16px" placeholder="¿Algo que quieras recordar de hoy?">${esc(state.note)}</textarea>
      </div>
    </section>

    <button class="cta" id="save" type="button"><span>Comenzar mi día</span><span class="cta-dot">${icon.arrow()}</span></button>
  </main>`;

  root.addEventListener('click', onClick);

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
    const energyBtn = event.target.closest('[data-energy]');
    if (energyBtn) {
      state.energy = Number(energyBtn.dataset.energy);
      root.querySelectorAll('[data-energy]').forEach((btn) => {
        const n = Number(btn.dataset.energy);
        btn.classList.toggle('on', n <= state.energy);
        btn.setAttribute('aria-checked', String(n === state.energy));
      });
      root.querySelector('#energy-label').textContent = `Energía ${state.energy}/5`;
      return;
    }
    if (event.target.closest('#save')) save();
  }

  async function save() {
    state.note = root.querySelector('#note').value.trim();
    await put('checkins', { ...state, date: today, updatedAt: new Date().toISOString() }, today);
    toast('Check-in guardado');
    location.hash = '#/hoy';
  }

  return () => root.removeEventListener('click', onClick);
}
