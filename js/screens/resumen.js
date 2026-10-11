import { getAll, getEntries, getSetting } from '../db.js';
import { icon, esc, dayKey, addDays, dayMonth, toast } from '../ui.js';
import { perMedAdherence, asNeededCount } from '../meds.js';
import { cycleStats, sortPeriods } from '../cycle.js';

const RANGE = 28;

export default async function resumen(root) {
  const today = dayKey();
  const from = addDays(today, -(RANGE - 1));
  const [meds, doseList, periods, checkinList, logList, appointments, name] = await Promise.all([
    getAll('meds'), getEntries('doses'), getAll('periods'), getEntries('checkins'), getEntries('cycleLogs'), getAll('appointments'), getSetting('name', ''),
  ]);
  const doses = Object.fromEntries(doseList);
  const sortedPeriods = sortPeriods(periods);
  const stats = cycleStats(sortedPeriods);
  const lastPeriod = sortedPeriods[sortedPeriods.length - 1];
  const checkins = checkinList.filter(([d]) => d >= from).map(([, v]) => v);
  const logs = logList.filter(([d]) => d >= from).map(([, v]) => v);
  const next = appointments.filter((a) => a.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];

  // Síntomas: los del registro del ciclo y las molestias del check-in.
  const counts = {};
  for (const log of logs) {
    for (const s of log.symptoms || []) counts[s] = (counts[s] || 0) + 1;
    if (log.pain && log.pain !== 'Sin dolor') counts[`Dolor ${log.pain.toLowerCase()}`] = (counts[`Dolor ${log.pain.toLowerCase()}`] || 0) + 1;
  }
  for (const c of checkins) {
    for (const b of c.body || []) if (b !== 'Bien' && b !== 'Descansada') counts[b] = (counts[b] || 0) + 1;
  }
  const topSymptoms = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCount = topSymptoms[0]?.[1] || 1;

  const energies = checkins.map((c) => c.energy).filter(Boolean);
  const avgEnergy = energies.length ? (energies.reduce((a, b) => a + b, 0) / energies.length).toFixed(1) : null;
  const sleep = { 'Dormí mal': 0, Regular: 0, 'Dormí bien': 0 };
  for (const c of checkins) if (c.sleep in sleep) sleep[c.sleep]++;

  const medRows = meds.filter((m) => m.active || Object.keys(doses).some((k) => k.includes(`|${m.id}|`))).map((m) => {
    if (m.frequency === 'Diario') {
      const start = m.startDate && m.startDate > from ? m.startDate : from;
      const { scheduled, taken } = perMedAdherence(m, doses, start, today);
      return { label: `${m.name}${m.dose ? ` · ${m.dose}` : ''}`, value: scheduled ? `${taken}/${scheduled}` : '—' };
    }
    return { label: `${m.name}${m.dose ? ` · ${m.dose}` : ''} (si lo necesita)`, value: `${asNeededCount(m, doses, from, today)} tomas` };
  });

  const section = (title, body) => `<section style="padding: 14px 0; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 8px">
    <h2 class="eyebrow sm" style="margin: 0">${title}</h2>${body}</section>`;
  const row = (l, v) => `<div class="card-row" style="font-size: 15px"><span>${esc(l)}</span><span class="num">${esc(v)}</span></div>`;

  root.innerHTML = `
  <main class="screen no-nav">
    <header class="topbar no-print">
      <a class="icon-btn" href="#/cuidado" aria-label="Volver a Mi cuidado">${icon.back()}</a>
      <span class="eyebrow sm">${dayMonth(from)} — ${dayMonth(today)}</span>
      <span style="width: 44px"></span>
    </header>
    <h1 class="h1" style="padding: 0 4px">Resumen para mi médico</h1>
    ${name ? `<p class="small" style="padding: 0 4px">${esc(name)} · últimos ${RANGE} días</p>` : ''}

    <article class="card" style="background: #fff; border-color: var(--line); gap: 0; padding-top: 4px">
      ${section('Medicamentos', medRows.length
        ? medRows.map((r) => row(r.label, r.value)).join('') + '<span class="small" style="font-size: 12px">Tomas registradas / programadas</span>'
        : '<p class="small">Sin medicamentos registrados.</p>')}
      ${section('Ciclo', lastPeriod
        ? row('Último periodo', `${dayMonth(lastPeriod.start)}${lastPeriod.end ? ` – ${dayMonth(lastPeriod.end)}` : ' (en curso)'}`)
          + (stats.measured ? row('Duración promedio del ciclo', `${stats.cycleLength} días`) : '')
          + row('Duración promedio del periodo', `${stats.periodLength} días`)
        : '<p class="small">Sin periodos registrados.</p>')}
      ${section('Síntomas más registrados', topSymptoms.length
        ? topSymptoms.map(([s, n]) => `<div style="display: flex; align-items: center; gap: 10px; font-size: 15px">
            <span style="width: 140px">${esc(s)}</span>
            <span aria-hidden="true" style="height: 8px; border-radius: 4px; background: var(--peach); width: ${Math.max(8, (n / maxCount) * 120)}px"></span>
            <span class="num" style="font-size: 13px; margin-left: auto">${n} ${n === 1 ? 'DÍA' : 'DÍAS'}</span></div>`).join('')
        : '<p class="small">Sin síntomas registrados.</p>')}
      ${section('Energía y sueño', `
        ${row('Energía promedio', avgEnergy ? `${avgEnergy}/5` : '—')}
        ${row('Noches en que dormí mal', String(sleep['Dormí mal']))}
        ${row('Check-ins registrados', String(checkins.length))}`)}
      ${next?.notes ? section('Mis notas para la consulta', `<p style="margin: 0; font-size: 14px; line-height: 1.45; white-space: pre-line">${esc(next.notes)}</p>`) : ''}
    </article>

    <p class="small" style="padding: 0 6px">Muestra solo tus registros, sin interpretaciones ni diagnósticos. Tú eliges con quién compartirlo.</p>

    <div class="grid-2 no-print">
      <button class="btn btn-ghost" type="button" id="print">${icon.doc()} PDF / Imprimir</button>
      <button class="btn" type="button" id="share">${icon.share()} Compartir</button>
    </div>
  </main>`;

  const asText = () => {
    const lines = [`Resumen de salud${name ? ` · ${name}` : ''}`, `${dayMonth(from)} — ${dayMonth(today)}`, ''];
    lines.push('MEDICAMENTOS', ...(medRows.length ? medRows.map((r) => `- ${r.label}: ${r.value}`) : ['- Sin registros']), '');
    if (lastPeriod) lines.push('CICLO', `- Último periodo: ${dayMonth(lastPeriod.start)}${lastPeriod.end ? ` – ${dayMonth(lastPeriod.end)}` : ''}`, ...(stats.measured ? [`- Ciclo promedio: ${stats.cycleLength} días`] : []), '');
    lines.push('SÍNTOMAS', ...(topSymptoms.length ? topSymptoms.map(([s, n]) => `- ${s}: ${n} días`) : ['- Sin registros']), '');
    lines.push('ENERGÍA Y SUEÑO', `- Energía promedio: ${avgEnergy || '—'}/5`, `- Noches en que dormí mal: ${sleep['Dormí mal']}`);
    if (next?.notes) lines.push('', 'NOTAS', next.notes);
    lines.push('', 'Registros personales, sin interpretación médica.');
    return lines.join('\n');
  };

  const onClick = async (event) => {
    if (event.target.closest('#print')) {
      window.print();
      return;
    }
    if (event.target.closest('#share')) {
      try {
        if (navigator.share) await navigator.share({ title: 'Resumen para mi médico', text: asText() });
        else {
          await navigator.clipboard.writeText(asText());
          toast('Resumen copiado');
        }
      } catch {
        /* Compartir cancelado. */
      }
    }
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
