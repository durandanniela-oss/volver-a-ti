import { getAll, getEntries, put, remove } from '../db.js';
import { icon, nav, tabs, esc, dayKey, dayMonth, lastDays, weekdayInitial, addDays, toast, refresh } from '../ui.js';
import { scheduledFor, doseKey, asNeededCount } from '../meds.js';

export default async function cuidado(root) {
  const today = dayKey();
  const [meds, doseList, appointments, checkinList, cycleLogList] = await Promise.all([
    getAll('meds'), getEntries('doses'), getAll('appointments'), getEntries('checkins'), getEntries('cycleLogs'),
  ]);
  const doses = Object.fromEntries(doseList);
  const active = meds.filter((m) => m.active);
  const todayDoses = scheduledFor(meds, today);
  const asNeeded = active.filter((m) => m.frequency === 'Si lo necesito');
  const upcoming = appointments.filter((a) => a.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const next = upcoming[0];

  const from14 = addDays(today, -13);
  const recentCheckins = checkinList.filter(([d]) => d >= from14).map(([, v]) => v);
  const energies = recentCheckins.map((c) => c.energy).filter(Boolean);
  const avgEnergy = energies.length ? (energies.reduce((a, b) => a + b, 0) / energies.length).toFixed(1) : '–';
  const badSleep = recentCheckins.filter((c) => c.sleep === 'Dormí mal').length;
  const symptomDays = cycleLogList.filter(([d, v]) => d >= from14 && (v.symptoms?.length || (v.pain && v.pain !== 'Sin dolor'))).length;

  const statusOf = (key) => doses[key]?.status;

  function doseRow({ med, time, key }) {
    const status = statusOf(key);
    const right = status === 'taken'
      ? `<button type="button" class="status-pill" data-undo="${esc(key)}" style="background: var(--teal); border: none" aria-label="Tomada a las ${esc(doses[key].at)}. Tocar para deshacer">${icon.check()} Tomada ${esc(doses[key].at)}</button>`
      : status === 'skipped'
        ? `<button type="button" class="status-pill" data-undo="${esc(key)}" style="background: rgba(43,42,36,0.08); border: none" aria-label="Omitida. Tocar para deshacer">Omitida</button>`
        : `<span style="display: flex; gap: 6px">
            <button type="button" class="btn sm" data-take="${esc(key)}" style="height: 40px; padding: 0 14px">Tomada</button>
            <button type="button" class="btn sm btn-ghost" data-skip="${esc(key)}" style="height: 40px; padding: 0 12px">Omitir</button>
          </span>`;
    return `<div class="list-row" style="flex-wrap: wrap; padding: 6px 0">
      <span class="num" style="font-size: 14px; width: 48px; color: ${status ? 'var(--muted)' : 'var(--ink)'}">${esc(time)}</span>
      <span style="flex: 1; min-width: 120px; display: flex; flex-direction: column; gap: 1px">
        <span style="font-size: 15px; font-weight: 500">${esc(med.name)}</span>
        <span class="small" style="font-size: 12px">${esc(med.dose || 'Dosis no indicada')}</span>
      </span>
      ${right}
    </div>`;
  }

  const week = lastDays(7);
  const weekDots = week.map((d) => {
    const list = scheduledFor(meds, d);
    if (!list.length) return `<div><span class="num" style="font-size: 13px">${weekdayInitial(d)}</span><span class="day" title="Sin dosis programadas"></span></div>`;
    const taken = list.filter((x) => statusOf(x.key) === 'taken').length;
    const style = taken === list.length ? 'background: var(--ink); border: none' : taken ? 'background: var(--lilac); border: none' : '';
    return `<div><span class="num" style="font-size: 13px">${weekdayInitial(d)}</span><span class="day ${d === today ? 'today' : ''}" style="${style}" title="${taken} de ${list.length} dosis"></span></div>`;
  }).join('');

  root.innerHTML = `
  <main class="screen">
    <header class="header" style="align-items: flex-end">
      <div class="stack">
        <span class="eyebrow">Mi cuerpo</span>
        <h1 class="h1">Mi cuidado</h1>
      </div>
      <span class="tag" style="background: var(--glass); border: 1px solid var(--glass-border); margin-bottom: 6px">${icon.lock({ size: 12 })}&nbsp;Solo en tu teléfono</span>
    </header>
    ${tabs('cuerpo', 'cuidado')}

    <section class="card" aria-labelledby="hoy-meds" style="gap: 4px">
      <div class="card-row" style="padding-bottom: 6px">
        <h2 id="hoy-meds" class="h2">Medicamentos de hoy</h2>
        <a class="link-pill" href="#/medicamento/nuevo">${icon.plus({ size: 14 })} Añadir</a>
      </div>
      ${todayDoses.length ? todayDoses.map(doseRow).join('') : ''}
      ${asNeeded.map((m) => `
      <div class="list-row" style="padding: 6px 0">
        <span class="small" style="width: 48px; font-size: 11px; font-weight: 700">Si lo necesito</span>
        <span style="flex: 1; display: flex; flex-direction: column; gap: 1px">
          <span style="font-size: 15px; font-weight: 500">${esc(m.name)}</span>
          <span class="small" style="font-size: 12px">${esc(m.dose || '')}${asNeededCount(m, doses, today) ? ` · hoy: ${asNeededCount(m, doses, today)}` : ''}</span>
        </span>
        <button type="button" class="btn sm btn-ghost" data-prn="${m.id}" style="height: 40px; padding: 0 12px">Registrar toma</button>
      </div>`).join('')}
      ${!todayDoses.length && !asNeeded.length ? '<p class="small">Aún no registras medicamentos. Añádelos con la dosis que te indicó tu médico.</p>' : ''}
      ${todayDoses.length ? `<div class="card-row" style="border-top: 1px solid var(--line); padding-top: 12px; margin-top: 4px">
        <span class="small">Últimos 7 días</span>
        <div class="week" style="width: 230px; gap: 2px">${weekDots}</div>
      </div>` : ''}
    </section>

    ${active.length ? `
    <section class="card" aria-labelledby="mis-meds" style="gap: 0">
      <h2 id="mis-meds" class="h2" style="padding-bottom: 6px">Mis medicamentos</h2>
      ${meds.map((m) => `<a class="row-link" href="#/medicamento/${encodeURIComponent(m.id)}">
        <span style="flex: 1; display: flex; flex-direction: column; gap: 1px">
          <strong style="font-size: 15px; font-weight: 600; ${m.active ? '' : 'color: var(--muted)'}">${esc(m.name)}${m.active ? '' : ' · ya no lo tomo'}</strong>
          <span class="small" style="font-size: 12px">${esc(m.dose || '')} · ${m.frequency === 'Diario' ? esc((m.times || []).join(', ')) : 'Si lo necesito'}</span>
        </span>${icon.chevron()}</a>`).join('')}
    </section>` : ''}

    <section class="card" style="background: var(--sky); border-color: rgba(255,255,255,0.9)" aria-labelledby="consulta">
      <div class="card-row">
        <span class="eyebrow sm">Próxima consulta</span>
        ${next ? `<span class="eyebrow sm">${dayMonth(next.date)}${next.time ? ` · ${esc(next.time)}` : ''}</span>` : ''}
      </div>
      ${next ? `
      <h2 id="consulta" style="margin: 0; font-size: 22px; font-weight: 500">${esc([next.specialty, next.doctor].filter(Boolean).join(' · ') || 'Consulta')}</h2>
      ${next.notes ? `<div style="border-radius: 18px; background: rgba(255,255,255,0.6); padding: 12px 14px; font-size: 14px; line-height: 1.45; white-space: pre-line">${esc(next.notes)}</div>` : ''}
      <a class="link-pill" href="#/cita/${encodeURIComponent(next.id)}" style="align-self: flex-start">${icon.pen({ size: 14 })} Editar y notas</a>` : `
      <h2 id="consulta" style="margin: 0; font-size: 18px; font-weight: 500">Sin consultas agendadas</h2>`}
      <a class="link-pill" href="#/cita/nueva" style="align-self: flex-start">${icon.plus({ size: 14 })} Nueva cita</a>
    </section>

    <section class="card" aria-labelledby="seguimiento">
      <h2 id="seguimiento" class="h2">Mi seguimiento · 14 días</h2>
      <div class="grid-2" style="grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
        <div style="border-radius: 18px; background: rgba(43,42,36,0.04); padding: 10px 12px"><span class="small" style="font-size: 12px">Energía</span><strong class="num" style="display: block; font-size: 18px">${avgEnergy}/5</strong></div>
        <div style="border-radius: 18px; background: rgba(43,42,36,0.04); padding: 10px 12px"><span class="small" style="font-size: 12px">Dormí mal</span><strong class="num" style="display: block; font-size: 18px">${badSleep}</strong></div>
        <div style="border-radius: 18px; background: rgba(43,42,36,0.04); padding: 10px 12px"><span class="small" style="font-size: 12px">Días con síntomas</span><strong class="num" style="display: block; font-size: 18px">${symptomDays}</strong></div>
      </div>
      <a class="btn" href="#/resumen">${icon.doc()} Resumen para mi médico</a>
      <p class="small" style="font-size: 12px">La app no atribuye síntomas a un medicamento ni sugiere cambios de dosis: eso lo decides con tu médico.</p>
    </section>
  </main>
  ${nav('cuerpo')}`;

  const timeNow = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const onClick = async (event) => {
    const take = event.target.closest('[data-take]');
    const skip = event.target.closest('[data-skip]');
    const undo = event.target.closest('[data-undo]');
    const prn = event.target.closest('[data-prn]');
    if (take) {
      await put('doses', { status: 'taken', at: timeNow() }, take.dataset.take);
      toast('Toma registrada');
    } else if (skip) {
      await put('doses', { status: 'skipped', at: timeNow() }, skip.dataset.skip);
      toast('Dosis omitida');
    } else if (undo) {
      await remove('doses', undo.dataset.undo);
    } else if (prn) {
      const t = timeNow();
      await put('doses', { status: 'taken', at: t }, doseKey(today, prn.dataset.prn, `${t}:${Date.now() % 1000}`));
      toast('Toma registrada');
    } else {
      return;
    }
    refresh();
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
