import { get, put, getAll, remove } from '../db.js';
import { icon, nav, tabs, esc, chips, handleChip, dayKey, lastDays, weekdayInitial, dayMonth, toast, uid, refresh } from '../ui.js';
import { WORKOUT_TYPES, INTENSITY, WORKOUT_FEELINGS } from '../data.js';

const TYPE_COLORS = {
  Yoga: 'var(--lilac)', Pilates: 'var(--peach)', Reformer: 'var(--peach)', Fuerza: '#C9A0A6',
  Caminata: 'var(--teal)', Movilidad: 'var(--sky)', Stretching: 'var(--sky)', Otra: 'var(--blush)',
};

const SUGGESTIONS = {
  Baja: [['Yoga restaurativo', '20 min · suave y sin impacto'], ['Movilidad suave', '10 min · cadera y espalda']],
  Media: [['Pilates', '35 min · core sin impacto'], ['Caminata', '30 min · a tu ritmo']],
  Alta: [['Fuerza', '45 min · a tu nivel'], ['Clase dinámica', '50 min · Reformer o cardio suave']],
};

export default async function movimiento(root) {
  const today = dayKey();
  const [checkin, cycleLog, workouts] = await Promise.all([get('checkins', today), get('cycleLogs', today), getAll('workouts')]);
  workouts.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  const energy = checkin?.energy;
  const state = {
    level: energy ? (energy <= 2 ? 'Baja' : energy === 3 ? 'Media' : 'Alta') : 'Media',
    type: null, intensity: 'Media', before: null, after: null,
  };
  const considerations = [
    ...(checkin?.body || []).filter((b) => b === 'Con molestias' || b === 'Con tensión' || b === 'Cansada'),
    ...(cycleLog?.pain && cycleLog.pain !== 'Sin dolor' ? [`dolor ${cycleLog.pain.toLowerCase()}`] : []),
    ...(cycleLog?.symptoms || []).filter((s) => s === 'Cólicos' || s === 'Dolor de espalda'),
  ];
  const week = lastDays(7);
  const byDay = Object.groupBy ? Object.groupBy(workouts, (w) => w.date) : workouts.reduce((acc, w) => ((acc[w.date] ||= []).push(w), acc), {});
  const weekCount = week.reduce((n, d) => n + (byDay[d]?.length || 0), 0);
  const weekMinutes = week.reduce((n, d) => n + (byDay[d] || []).reduce((m, w) => m + (w.minutes || 0), 0), 0);

  const suggestionsHTML = () => SUGGESTIONS[state.level].map(([name, detail]) => `
    <div class="list-row" style="border-color: rgba(245,240,230,0.12)">
      <span style="flex: 1; display: flex; flex-direction: column; gap: 2px">
        <strong style="font-size: 18px; font-weight: 500">${name}</strong>
        <span class="small">${detail}</span>
      </span>
      <button type="button" class="btn sm btn-sig" data-use="${name}" style="height: 40px; padding: 0 14px">Registrar</button>
    </div>`).join('');

  root.innerHTML = `
  <main class="screen">
    <header class="header"><div class="stack">
      <span class="eyebrow">Mi cuerpo</span>
      <h1 class="h1">Muévete como te sientas</h1>
    </div></header>
    ${tabs('cuerpo', 'movimiento')}

    <section class="card" aria-labelledby="q-energia">
      <h2 id="q-energia" class="h2">¿Cómo está tu energía hoy?</h2>
      <div class="seg" role="group" aria-labelledby="q-energia">
        ${['Baja', 'Media', 'Alta'].map((l) => `<button type="button" data-level="${l}" aria-pressed="${l === state.level}">${l}</button>`).join('')}
      </div>
      ${considerations.length ? `<p class="small">Considerando: ${esc(considerations.join(', ').toLowerCase())}. Si algo duele, elige lo más suave.</p>` : ''}
    </section>

    <section class="card card-dark" aria-label="Sugerencias de movimiento" style="gap: 4px">
      <span class="eyebrow sm" style="color: #EADFCB; padding-bottom: 6px" id="level-label">Para tu energía ${state.level.toLowerCase()}</span>
      <div id="suggestions">${suggestionsHTML()}</div>
      <p class="small" style="font-size: 12px; padding-top: 8px">Son sugerencias. Escucha siempre a tu cuerpo y a tus profesionales de salud.</p>
    </section>

    <section class="card" aria-labelledby="semana">
      <div class="card-row">
        <h2 id="semana" class="h2">Últimos 7 días</h2>
        <span class="small">${weekCount} ${weekCount === 1 ? 'sesión' : 'sesiones'} · ${weekMinutes} min</span>
      </div>
      <div class="week">${week.map((d) => {
        const w = byDay[d]?.[0];
        return `<div><span class="num" style="font-size: 13px">${weekdayInitial(d)}</span><span class="day ${w ? 'on' : ''} ${d === today ? 'today' : ''}" style="${w ? `background: ${TYPE_COLORS[w.type] || 'var(--blush)'}` : ''}" title="${w ? esc(w.type) : 'Sin registro'}"></span></div>`;
      }).join('')}</div>
    </section>

    <form class="card" id="workout-form" aria-labelledby="nueva">
      <h2 id="nueva" class="h2">Registrar actividad</h2>
      <div class="chips">${chips('type', WORKOUT_TYPES, state.type, { single: true, size: 'sm' })}</div>
      <div class="form-grid">
        <div class="field"><label for="minutes">Minutos</label><input class="mini-input" id="minutes" type="number" inputmode="numeric" min="1" max="600" value="30"></div>
        <div class="field"><label for="w-date">Fecha</label><input class="mini-input" id="w-date" type="date" value="${today}" max="${today}"></div>
      </div>
      <span class="small" style="font-weight: 700">Intensidad</span>
      <div class="chips">${chips('intensity', INTENSITY, state.intensity, { single: true, size: 'sm' })}</div>
      <span class="small" style="font-weight: 700">Antes me sentía</span>
      <div class="chips">${chips('before', WORKOUT_FEELINGS, state.before, { single: true, size: 'sm' })}</div>
      <span class="small" style="font-weight: 700">Después me sentí</span>
      <div class="chips">${chips('after', WORKOUT_FEELINGS, state.after, { single: true, size: 'sm' })}</div>
      <label for="w-note" class="sr-only">Notas</label>
      <input class="mini-input" id="w-note" type="text" placeholder="Notas sobre tu progreso (opcional)">
      <button class="btn" type="submit">Guardar actividad</button>
    </form>

    ${workouts.length ? `
    <section class="card" aria-labelledby="historial" style="gap: 4px">
      <h2 id="historial" class="h2" style="padding-bottom: 6px">Historial</h2>
      ${workouts.slice(0, 10).map((w) => `
      <div class="list-row">
        <span aria-hidden="true" style="width: 36px; height: 36px; flex-shrink: 0; border-radius: 18px; background: ${TYPE_COLORS[w.type] || 'var(--blush)'}"></span>
        <span style="flex: 1; display: flex; flex-direction: column; gap: 2px">
          <strong style="font-size: 15px; font-weight: 600">${esc(w.name || w.type)} · ${w.minutes} min</strong>
          <span class="small">${dayMonth(w.date)} · ${esc(w.intensity || '')}${w.before || w.after ? ` · ${esc(w.before || '–')} → ${esc(w.after || '–')}` : ''}</span>
        </span>
        <button type="button" class="icon-btn" data-delete="${w.id}" aria-label="Eliminar actividad" style="width: 40px; height: 40px">${icon.trash({ size: 16 })}</button>
      </div>`).join('')}
    </section>` : ''}
  </main>
  ${nav('cuerpo')}`;

  let pickedName = null;

  const onClick = async (event) => {
    if (handleChip(event, root, state)) {
      pickedName = null;
      return;
    }
    const levelBtn = event.target.closest('[data-level]');
    if (levelBtn) {
      state.level = levelBtn.dataset.level;
      root.querySelectorAll('[data-level]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === state.level)));
      root.querySelector('#suggestions').innerHTML = suggestionsHTML();
      root.querySelector('#level-label').textContent = `Para tu energía ${state.level.toLowerCase()}`;
      return;
    }
    const use = event.target.closest('[data-use]');
    if (use) {
      const name = use.dataset.use;
      const type = WORKOUT_TYPES.find((t) => name.includes(t)) || (name.includes('Clase') ? 'Reformer' : name.includes('Movilidad') ? 'Movilidad' : 'Otra');
      state.type = type;
      pickedName = name;
      root.querySelectorAll('[data-chip="type"]').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === type)));
      root.querySelector('#minutes').value = parseInt(SUGGESTIONS[state.level].find(([n]) => n === name)[1], 10);
      root.querySelector('#workout-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const del = event.target.closest('[data-delete]');
    if (del && confirm('¿Eliminar esta actividad?')) {
      await remove('workouts', del.dataset.delete);
      refresh();
    }
  };

  const onSubmit = async (event) => {
    if (event.target.id !== 'workout-form') return;
    event.preventDefault();
    if (!state.type) {
      toast('Elige el tipo de actividad');
      return;
    }
    const minutes = Number(root.querySelector('#minutes').value);
    if (!minutes || minutes < 1) {
      toast('Escribe cuántos minutos');
      return;
    }
    await put('workouts', {
      id: uid(),
      createdAt: new Date().toISOString(),
      date: root.querySelector('#w-date').value || today,
      type: state.type,
      name: pickedName || state.type,
      minutes,
      intensity: state.intensity,
      before: state.before,
      after: state.after,
      note: root.querySelector('#w-note').value.trim(),
    });
    toast('Actividad guardada');
    refresh();
  };

  root.addEventListener('click', onClick);
  root.addEventListener('submit', onSubmit);
  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('submit', onSubmit);
  };
}
