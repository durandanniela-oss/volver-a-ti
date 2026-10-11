import { get, put, getSetting, setSetting } from '../db.js';
import { icon, nav, esc, chips, dayKey, toast, uid, shrinkPhoto } from '../ui.js';
import { SKIN, SMALL_RITUALS, DEFAULT_SKINCARE } from '../data.js';

const toSteps = (names) => names.map((name) => ({ id: uid(), name }));

export default async function rituales(root) {
  const today = dayKey();
  let routine = await getSetting('skincare', null);
  if (!routine) {
    routine = { morning: toSteps(DEFAULT_SKINCARE.morning), night: toSteps(DEFAULT_SKINCARE.night) };
    await setSetting('skincare', routine);
  }
  const day = (await get('rituals', today)) || {};
  const state = {
    morning: day.morning || [],
    night: day.night || [],
    small: day.small || [],
    skin: day.skin || [],
    photo: day.photo || null,
  };
  let mode = new Date().getHours() < 15 ? 'morning' : 'night';
  let editing = false;
  let photoURL = state.photo ? URL.createObjectURL(state.photo) : null;

  const saveDay = () => put('rituals', { ...state, updatedAt: new Date().toISOString() }, today);

  function routineHTML() {
    const steps = routine[mode];
    if (editing) {
      return `${steps.map((s, i) => `
        <div class="list-row">
          <span class="num" style="width: 26px">${String(i + 1).padStart(2, '0')}</span>
          <span style="flex: 1; font-size: 15px">${esc(s.name)}</span>
          ${i > 0 ? `<button type="button" class="icon-btn" data-up="${s.id}" aria-label="Subir ${esc(s.name)}" style="width: 36px; height: 36px">${icon.up()}</button>` : ''}
          <button type="button" class="icon-btn" data-remove-step="${s.id}" aria-label="Quitar ${esc(s.name)}" style="width: 36px; height: 36px">${icon.close({ size: 12 })}</button>
        </div>`).join('')}
        <form id="add-step" class="form-grid" style="padding-top: 8px">
          <label class="sr-only" for="step-name">Nuevo paso</label>
          <input class="mini-input" id="step-name" type="text" placeholder="Ej. Contorno de ojos">
          <button class="btn sm" type="submit">Añadir</button>
        </form>`;
    }
    const done = state[mode];
    const pills = steps.map((s, i) => `
      <label class="check-pill light ${done.includes(s.id) ? 'done' : ''}" style="cursor: pointer; min-height: 48px">
        <input type="checkbox" class="sr-only" data-step="${s.id}"${done.includes(s.id) ? ' checked' : ''}>
        <span class="ring">${done.includes(s.id) ? icon.check({ size: 12 }) : ''}</span>
        <span class="t" style="font-size: 15px">${esc(s.name)}</span>
        <span class="when">${String(i + 1).padStart(2, '0')}</span>
      </label>`).join('');
    return pills
      ? `<div style="display: flex; flex-direction: column; gap: 6px; padding-top: 6px">${pills}</div>`
      : '<p class="small">Tu rutina está vacía. Toca Editar para añadir pasos.</p>';
  }

  const progress = () => {
    const ids = routine[mode].map((s) => s.id);
    return `${state[mode].filter((id) => ids.includes(id)).length}/${ids.length}`;
  };

  const photoSlot = () => photoURL
    ? `<div class="photo" style="width: 84px"><img src="${photoURL}" alt="Foto de tu piel de hoy"><button type="button" class="remove" id="remove-photo" aria-label="Quitar foto">${icon.close({ size: 12, sw: 2.4 })}</button></div>`
    : `<label class="photo-add" for="skin-photo" style="width: 84px">${icon.image({ size: 20 })}<span style="font-size: 11px">Foto (opcional)</span></label>`;

  root.innerHTML = `
  <main class="screen">
    <header class="header"><div class="stack">
      <span class="eyebrow">Mis rituales</span>
      <h1 class="h1">Cuidarte también es disfrutar</h1>
    </div></header>

    <section class="card" aria-labelledby="rutina" style="gap: 6px">
      <div class="card-row" style="padding-bottom: 6px">
        <h2 id="rutina" class="h2">Rutina facial <span class="num" id="progress" style="font-size: 13px; margin-left: 6px">${progress()}</span></h2>
        <button type="button" class="link-pill" id="edit">${editing ? 'Listo' : 'Editar'}</button>
      </div>
      <div class="seg" role="group" aria-label="Momento del día">
        <button type="button" data-mode="morning" aria-pressed="${mode === 'morning'}">Mañana</button>
        <button type="button" data-mode="night" aria-pressed="${mode === 'night'}">Noche</button>
      </div>
      <div id="routine">${routineHTML()}</div>
    </section>

    <section aria-labelledby="pequenos" style="display: flex; flex-direction: column; gap: 10px">
      <h2 id="pequenos" class="h2" style="padding: 0 4px">Pequeños rituales de hoy</h2>
      <div class="chips">${chips('small', SMALL_RITUALS, state.small)}</div>
    </section>

    <section class="card" aria-labelledby="piel">
      <h2 id="piel" class="h2">¿Cómo está tu piel hoy?</h2>
      <div style="display: flex; gap: 12px; align-items: flex-start">
        <div class="chips" style="flex: 1">${chips('skin', SKIN, state.skin, { size: 'sm' })}</div>
        <div id="photo-slot">${photoSlot()}</div>
        <input id="skin-photo" class="sr-only" type="file" accept="image/*">
      </div>
      <p class="small" style="font-size: 12px">Las fotos de progreso se guardan solo en tu teléfono.</p>
    </section>
  </main>
  ${nav('rituales')}`;

  const paintRoutine = () => {
    root.querySelector('#routine').innerHTML = routineHTML();
    root.querySelector('#progress').textContent = progress();
    root.querySelector('#edit').textContent = editing ? 'Listo' : 'Editar';
  };

  const onClick = async (event) => {
    const chip = event.target.closest('[data-chip]');
    if (chip) {
      const group = chip.dataset.chip;
      const value = chip.dataset.value;
      const list = state[group];
      const i = list.indexOf(value);
      if (i === -1) list.push(value);
      else list.splice(i, 1);
      chip.setAttribute('aria-pressed', String(i === -1));
      await saveDay();
      return;
    }
    const modeBtn = event.target.closest('[data-mode]');
    if (modeBtn) {
      mode = modeBtn.dataset.mode;
      root.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
      paintRoutine();
      return;
    }
    if (event.target.closest('#edit')) {
      editing = !editing;
      paintRoutine();
      return;
    }
    const up = event.target.closest('[data-up]');
    if (up) {
      const steps = routine[mode];
      const i = steps.findIndex((s) => s.id === up.dataset.up);
      [steps[i - 1], steps[i]] = [steps[i], steps[i - 1]];
      await setSetting('skincare', routine);
      paintRoutine();
      return;
    }
    const rm = event.target.closest('[data-remove-step]');
    if (rm) {
      routine[mode] = routine[mode].filter((s) => s.id !== rm.dataset.removeStep);
      await setSetting('skincare', routine);
      paintRoutine();
      return;
    }
    if (event.target.closest('#remove-photo')) {
      state.photo = null;
      if (photoURL) URL.revokeObjectURL(photoURL);
      photoURL = null;
      await saveDay();
      root.querySelector('#photo-slot').innerHTML = photoSlot();
    }
  };

  const onChange = async (event) => {
    if (event.target.matches('[data-step]')) {
      const id = event.target.dataset.step;
      const list = state[mode];
      if (event.target.checked) list.push(id);
      else list.splice(list.indexOf(id), 1);
      await saveDay();
      paintRoutine();
      return;
    }
    if (event.target.id === 'skin-photo') {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      state.photo = await shrinkPhoto(file);
      if (photoURL) URL.revokeObjectURL(photoURL);
      photoURL = URL.createObjectURL(state.photo);
      await saveDay();
      root.querySelector('#photo-slot').innerHTML = photoSlot();
      toast('Foto guardada');
    }
  };

  const onSubmit = async (event) => {
    if (event.target.id !== 'add-step') return;
    event.preventDefault();
    const input = root.querySelector('#step-name');
    const name = input.value.trim();
    if (!name) return;
    routine[mode].push({ id: uid(), name });
    await setSetting('skincare', routine);
    paintRoutine();
    root.querySelector('#step-name').focus();
  };

  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  root.addEventListener('submit', onSubmit);
  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('change', onChange);
    root.removeEventListener('submit', onSubmit);
    if (photoURL) URL.revokeObjectURL(photoURL);
  };
}
