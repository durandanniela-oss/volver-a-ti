import { get, put, remove } from '../db.js';
import { icon, esc, dayKey, toast, uid } from '../ui.js';
import { MED_FREQUENCY } from '../data.js';

export default async function medicamento(root, { params }) {
  const id = params[0] ? decodeURIComponent(params[0]) : 'nuevo';
  const existing = id === 'nuevo' ? null : await get('meds', id);
  if (id !== 'nuevo' && !existing) {
    location.replace('#/cuidado');
    return;
  }
  const med = existing
    ? { ...existing, times: [...(existing.times || [])] }
    : { id: uid(), name: '', dose: '', frequency: 'Diario', times: ['09:00'], notes: '', active: true, startDate: dayKey() };

  const timesHTML = () => med.times.map((t, i) => `
    <span style="display: inline-flex; align-items: center; gap: 4px">
      <label class="sr-only" for="time-${i}">Horario ${i + 1}</label>
      <input class="mini-input" type="time" id="time-${i}" data-time="${i}" value="${esc(t)}" style="width: 120px">
      ${med.times.length > 1 ? `<button type="button" class="icon-btn" data-remove-time="${i}" aria-label="Quitar horario ${i + 1}" style="width: 36px; height: 36px">${icon.close({ size: 12 })}</button>` : ''}
    </span>`).join('');

  root.innerHTML = `
  <main class="screen no-nav">
    <header class="topbar">
      <a class="icon-btn" href="#/cuidado" aria-label="Volver a Mi cuidado">${icon.close()}</a>
      <span class="eyebrow">Mi cuidado</span>
      <span style="width: 44px"></span>
    </header>
    <h1 class="h1" style="padding: 0 4px">${existing ? esc(existing.name) : 'Nuevo medicamento'}</h1>

    <form id="med-form" style="display: flex; flex-direction: column; gap: 14px">
      <section class="card" style="gap: 14px">
        <div class="field"><label for="name">Nombre</label><input id="name" class="input" type="text" required value="${esc(med.name)}" placeholder="Ej. Magnesio"></div>
        <div class="field" style="border-top: 1px solid var(--line); padding-top: 12px"><label for="dose">Dosis prescrita</label><input id="dose" class="input" type="text" value="${esc(med.dose)}" placeholder="Tal como te la indicó tu médico"></div>
      </section>

      <section class="card" aria-labelledby="frecuencia">
        <h2 id="frecuencia" class="h2">Frecuencia</h2>
        <div class="seg" role="group" aria-labelledby="frecuencia">
          ${MED_FREQUENCY.map((f) => `<button type="button" data-freq="${f}" aria-pressed="${f === med.frequency}">${f}</button>`).join('')}
        </div>
        <div id="times-block" ${med.frequency === 'Diario' ? '' : 'hidden'} style="display: flex; flex-direction: column; gap: 10px">
          <h2 class="h2">Horarios</h2>
          <div id="times" style="display: flex; flex-wrap: wrap; gap: 8px">${timesHTML()}</div>
          <button type="button" class="link-pill" id="add-time" style="align-self: flex-start">${icon.plus({ size: 14 })} Añadir horario</button>
        </div>
        <p class="small" style="font-size: 12px">Los recordatorios con notificación necesitan una versión nativa de la app. Por ahora verás tus tomas pendientes en Mi día y en Mi cuidado.</p>
      </section>

      <section class="card">
        <div class="field"><label for="notes">Notas</label><textarea id="notes" class="textarea" rows="2" style="font-size: 16px" placeholder="Ej. tomar con la cena">${esc(med.notes)}</textarea></div>
        ${existing ? `<label class="switch-row" for="active" style="border-top: 1px solid var(--line)"><span>Lo sigo tomando</span><input type="checkbox" class="switch" id="active"${med.active ? ' checked' : ''}></label>` : ''}
      </section>

      <p class="small" style="padding: 0 6px">Registra la dosis tal como te la indicaron. La app no sugiere ni modifica dosis.</p>
      <button class="btn" type="submit">Guardar medicamento</button>
      ${existing ? `<button class="btn btn-danger" type="button" id="delete">${icon.trash()} Eliminar</button>` : ''}
    </form>
  </main>`;

  const syncTimes = () => {
    root.querySelectorAll('[data-time]').forEach((input) => { med.times[Number(input.dataset.time)] = input.value; });
  };

  const onClick = async (event) => {
    const freq = event.target.closest('[data-freq]');
    if (freq) {
      med.frequency = freq.dataset.freq;
      root.querySelectorAll('[data-freq]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.freq === med.frequency)));
      root.querySelector('#times-block').hidden = med.frequency !== 'Diario';
      return;
    }
    if (event.target.closest('#add-time')) {
      syncTimes();
      med.times.push('21:00');
      root.querySelector('#times').innerHTML = timesHTML();
      return;
    }
    const rm = event.target.closest('[data-remove-time]');
    if (rm) {
      syncTimes();
      med.times.splice(Number(rm.dataset.removeTime), 1);
      root.querySelector('#times').innerHTML = timesHTML();
      return;
    }
    if (event.target.closest('#delete')) {
      if (!confirm('¿Eliminar este medicamento? Su historial de tomas dejará de mostrarse.')) return;
      await remove('meds', med.id);
      toast('Medicamento eliminado');
      location.hash = '#/cuidado';
    }
  };

  const onSubmit = async (event) => {
    if (event.target.id !== 'med-form') return;
    event.preventDefault();
    syncTimes();
    med.name = root.querySelector('#name').value.trim();
    med.dose = root.querySelector('#dose').value.trim();
    med.notes = root.querySelector('#notes').value.trim();
    med.times = [...new Set(med.times.filter(Boolean))].sort();
    if (existing) med.active = root.querySelector('#active').checked;
    if (!med.name) {
      toast('Escribe el nombre');
      return;
    }
    if (med.frequency === 'Diario' && !med.times.length) {
      toast('Añade al menos un horario');
      return;
    }
    await put('meds', med);
    toast('Medicamento guardado');
    location.hash = '#/cuidado';
  };

  root.addEventListener('click', onClick);
  root.addEventListener('submit', onSubmit);
  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('submit', onSubmit);
  };
}
