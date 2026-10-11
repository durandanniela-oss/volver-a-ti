import { get, put, remove } from '../db.js';
import { icon, esc, dayKey, toast, uid } from '../ui.js';

export default async function cita(root, { params }) {
  const id = params[0] ? decodeURIComponent(params[0]) : 'nueva';
  const existing = id === 'nueva' ? null : await get('appointments', id);
  if (id !== 'nueva' && !existing) {
    location.replace('#/cuidado');
    return;
  }
  const a = existing || { id: uid(), date: dayKey(), time: '', specialty: '', doctor: '', notes: '', results: '' };

  root.innerHTML = `
  <main class="screen no-nav">
    <header class="topbar">
      <a class="icon-btn" href="#/cuidado" aria-label="Volver a Mi cuidado">${icon.close()}</a>
      <span class="eyebrow">Mi cuidado</span>
      <span style="width: 44px"></span>
    </header>
    <h1 class="h1" style="padding: 0 4px">${existing ? 'Consulta' : 'Nueva cita'}</h1>

    <form id="cita-form" style="display: flex; flex-direction: column; gap: 14px">
      <section class="card" style="gap: 14px">
        <div class="form-grid">
          <div class="field"><label for="date">Fecha</label><input class="mini-input" id="date" type="date" required value="${esc(a.date)}"></div>
          <div class="field"><label for="time">Hora</label><input class="mini-input" id="time" type="time" value="${esc(a.time)}"></div>
        </div>
        <div class="field"><label for="specialty">Especialidad</label><input class="mini-input" id="specialty" type="text" value="${esc(a.specialty)}" placeholder="Ej. Ginecología"></div>
        <div class="field"><label for="doctor">Médico o centro (opcional)</label><input class="mini-input" id="doctor" type="text" value="${esc(a.doctor)}"></div>
      </section>
      <section class="card">
        <div class="field"><label for="notes">Notas para la consulta</label><textarea id="notes" class="textarea" rows="4" style="font-size: 16px" placeholder="Preguntas, síntomas que quieres comentar…">${esc(a.notes)}</textarea></div>
      </section>
      <section class="card">
        <div class="field"><label for="results">Estudios y resultados</label><textarea id="results" class="textarea" rows="3" style="font-size: 16px" placeholder="Qué te pidieron, resultados, indicaciones…">${esc(a.results)}</textarea></div>
      </section>
      <button class="btn" type="submit">Guardar</button>
      ${existing ? `<button class="btn btn-danger" type="button" id="delete">${icon.trash()} Eliminar cita</button>` : ''}
    </form>
  </main>`;

  const onSubmit = async (event) => {
    if (event.target.id !== 'cita-form') return;
    event.preventDefault();
    const value = (sel) => root.querySelector(sel).value.trim();
    await put('appointments', {
      ...a,
      date: value('#date'),
      time: value('#time'),
      specialty: value('#specialty'),
      doctor: value('#doctor'),
      notes: value('#notes'),
      results: value('#results'),
    });
    toast('Cita guardada');
    location.hash = '#/cuidado';
  };
  const onClick = async (event) => {
    if (!event.target.closest('#delete')) return;
    if (!confirm('¿Eliminar esta cita?')) return;
    await remove('appointments', a.id);
    location.hash = '#/cuidado';
  };
  root.addEventListener('submit', onSubmit);
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('submit', onSubmit);
    root.removeEventListener('click', onClick);
  };
}
