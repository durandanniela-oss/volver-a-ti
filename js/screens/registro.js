import { get, put, getAll } from '../db.js';
import { icon, esc, chips, handleChip, dayKey, dayMonth, diffDays, toast, uid } from '../ui.js';
import { FLOW, PAIN, CYCLE_SYMPTOMS, CYCLE_MOODS } from '../data.js';
import { sortPeriods } from '../cycle.js';

export default async function registro(root) {
  const today = dayKey();
  const saved = (await get('cycleLogs', today)) || {};
  const state = {
    flow: saved.flow || null,
    pain: saved.pain || null,
    symptoms: [...(saved.symptoms || [])],
    moods: [...(saved.moods || [])],
  };

  root.innerHTML = `
  <main class="screen no-nav">
    <header class="topbar">
      <a class="icon-btn" href="#/ciclo" aria-label="Volver a Mi ciclo">${icon.back()}</a>
      <span class="eyebrow sm">${dayMonth(today)}</span>
      <span style="width: 44px"></span>
    </header>
    <h1 class="h1" style="padding: 0 4px">Registrar hoy</h1>

    <section class="card" aria-labelledby="flujo">
      <h2 id="flujo" class="h2">Flujo</h2>
      <div class="chips">${chips('flow', FLOW, state.flow, { single: true })}</div>
    </section>
    <section class="card" aria-labelledby="dolor">
      <h2 id="dolor" class="h2">Dolor</h2>
      <div class="chips">${chips('pain', PAIN, state.pain, { single: true })}</div>
    </section>
    <section class="card" aria-labelledby="sintomas">
      <h2 id="sintomas" class="h2">Síntomas</h2>
      <div class="chips">${chips('symptoms', CYCLE_SYMPTOMS, state.symptoms)}</div>
    </section>
    <section class="card" aria-labelledby="emociones">
      <h2 id="emociones" class="h2">Cambios emocionales</h2>
      <div class="chips">${chips('moods', CYCLE_MOODS, state.moods)}</div>
      <label for="nota" class="sr-only">Nota</label>
      <textarea id="nota" class="textarea" rows="2" style="font-size: 16px; border-top: 1px solid var(--line); padding-top: 12px" placeholder="Añade una nota (opcional)">${esc(saved.note || '')}</textarea>
    </section>

    <button class="btn block" id="save" type="button">Guardar registro</button>
  </main>`;

  const onClick = async (event) => {
    if (handleChip(event, root, state)) return;
    if (!event.target.closest('#save')) return;
    await put('cycleLogs', { ...state, note: root.querySelector('#nota').value.trim(), updatedAt: new Date().toISOString() }, today);

    // Si registras flujo y no hay un periodo en curso, pregunta si empezó hoy.
    if (state.flow && state.flow !== 'Ninguno') {
      const periods = sortPeriods(await getAll('periods'));
      const last = periods[periods.length - 1];
      const inPeriod = last && (last.end ? today <= last.end : diffDays(last.start, today) <= 10);
      if (!inPeriod && confirm('¿Empezó hoy tu periodo?')) {
        await put('periods', { id: uid(), start: today, end: null });
      }
    }
    toast('Registro guardado');
    location.hash = '#/ciclo';
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
