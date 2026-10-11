import { getAll, put, remove, getEntries, get } from '../db.js';
import { icon, nav, tabs, esc, dayKey, addDays, diffDays, dayMonth, toast, uid, refresh } from '../ui.js';
import { cycleToday, phaseOf, PHASE_COLORS, energyTrend, sortPeriods } from '../cycle.js';
import { PHASE_GUIDE } from '../data.js';

export default async function ciclo(root) {
  const today = dayKey();
  const [periods, checkinList, todayLog] = await Promise.all([getAll('periods'), getEntries('checkins'), get('cycleLogs', today)]);
  const checkins = Object.fromEntries(checkinList);
  const sorted = sortPeriods(periods);
  const now = cycleToday(sorted, today);
  const trend = energyTrend(sorted, checkins);

  function ringHTML() {
    const total = Math.max(now.cycleLength, now.day);
    const r = 124;
    const c = 136;
    let dots = '';
    for (let d = 1; d <= total; d++) {
      const angle = ((d - 1) / total) * Math.PI * 2 - Math.PI / 2;
      const size = d === now.day ? 22 : 12;
      const x = c + Math.cos(angle) * r - size / 2;
      const y = c + Math.sin(angle) * r - size / 2;
      const color = PHASE_COLORS[d === now.day ? now.phase : phaseOf(d, now)];
      const style = d === now.day
        ? `background: var(--ink); box-shadow: 0 0 0 4px rgba(163,133,201,0.45)`
        : d > now.day
          ? `border: 1.5px dashed ${color}`
          : `background: ${color}`;
      dots += `<span class="dot" style="left: ${x.toFixed(1)}px; top: ${y.toFixed(1)}px; width: ${size}px; height: ${size}px; ${style}"></span>`;
    }
    return dots;
  }

  // Tu fase hoy: qué es común sentir y qué podría acompañarte.
  function phaseCard(phase) {
    const g = PHASE_GUIDE[phase];
    if (!g) return '';
    const row = (label, text) => `<div style="display: flex; gap: 12px; padding: 10px 0; border-top: 1px solid var(--line)"><span style="font-size: 12px; font-weight: 700; width: 86px; flex-shrink: 0; padding-top: 2px">${label}</span><span style="font-size: 14px; line-height: 1.4">${esc(text)}</span></div>`;
    return `
    <section class="card" aria-labelledby="tu-fase" style="gap: 8px">
      <div class="card-row">
        <h2 id="tu-fase" class="h2" style="display: flex; align-items: center; gap: 8px"><i style="width: 12px; height: 12px; border-radius: 6px; background: ${PHASE_COLORS[phase]}; display: inline-block"></i>Tu fase hoy · ${esc(g.title.replace('Fase ', ''))}</h2>
      </div>
      <p style="margin: 0; font-size: 16px; line-height: 1.45">${esc(g.feel)}</p>
      <div>
        ${row('Movimiento', g.move)}
        ${row('Comida', g.eat)}
        ${row('Autocuidado', g.care)}
      </div>
      <a class="btn sm" href="#/entrada/nueva?q=${encodeURIComponent(g.prompt)}" style="align-self: flex-start; height: auto; min-height: 44px; padding: 10px 16px; text-align: left; line-height: 1.3">${icon.pen({ size: 16, sw: 1.8 })} ${esc(g.prompt)}</a>
      <p class="small" style="font-size: 12px">Orientación general. Cada cuerpo es distinto: escucha el tuyo.</p>
    </section>`;
  }

  function nextText() {
    if (now.daysToNext >= 0) {
      return `Próximo periodo: <strong>entre el ${dayMonth(addDays(now.next, -2))} y el ${dayMonth(addDays(now.next, 2))}</strong>`;
    }
    return `Según tu promedio, tu periodo lleva <strong>${-now.daysToNext} ${now.daysToNext === -1 ? 'día' : 'días'} de diferencia</strong>. Los ciclos varían; si te preocupa, consulta a tu médico.`;
  }

  function historyHTML() {
    const rows = [...sorted].reverse().slice(0, 8).map((p) => {
      const idx = sorted.indexOf(p);
      const nextStart = sorted[idx + 1]?.start;
      const length = p.end ? diffDays(p.start, p.end) + 1 : null;
      const cycle = nextStart ? diffDays(p.start, nextStart) : null;
      return `<div class="list-row">
        <span style="flex: 1; display: flex; flex-direction: column; gap: 2px">
          <strong style="font-size: 15px; font-weight: 600">${dayMonth(p.start)}${p.end ? ` – ${dayMonth(p.end)}` : ' · en curso'}</strong>
          <span class="small">${length ? `${length} días de periodo` : 'Periodo abierto'}${cycle ? ` · ciclo de ${cycle} días` : ''}</span>
        </span>
        <button type="button" class="icon-btn" data-delete="${p.id}" aria-label="Eliminar el periodo del ${dayMonth(p.start)}" style="width: 40px; height: 40px">${icon.trash({ size: 16 })}</button>
      </div>`;
    });
    return rows.join('');
  }

  const logChips = todayLog
    ? [todayLog.flow && todayLog.flow !== 'Ninguno' ? `Flujo ${todayLog.flow.toLowerCase()}` : null, todayLog.pain && todayLog.pain !== 'Sin dolor' ? `Dolor ${todayLog.pain.toLowerCase()}` : null, ...(todayLog.symptoms || []), ...(todayLog.moods || [])].filter(Boolean)
    : [];

  root.innerHTML = `
  <main class="screen">
    <header class="header">
      <div class="stack">
        <span class="eyebrow">Mi cuerpo</span>
        <h1 class="h1">Mi ciclo</h1>
      </div>
      <a class="btn sm" href="#/registro">${icon.plus({ size: 16 })} Registrar</a>
    </header>
    ${tabs('cuerpo', 'ciclo')}

    ${now ? `
    <section class="card" aria-label="Día ${now.day} del ciclo, fase ${now.phase.toLowerCase()}" style="align-items: center; padding: 22px 18px; gap: 16px">
      <div class="ring" aria-hidden="true">
        ${ringHTML()}
        <div class="center">
          <span class="small" style="font-weight: 600">Día</span>
          <span class="num" style="font-size: 54px; line-height: 1">${now.day}</span>
          <span style="font-size: 15px; font-weight: 600">Fase ${now.phase.toLowerCase()}</span>
        </div>
      </div>
      <div class="legend">${Object.entries(PHASE_COLORS).map(([name, color]) => `<span><i style="background: ${color}"></i>${name}</span>`).join('')}</div>
      <p style="margin: 0; font-size: 15px; text-align: center">${nextText()}</p>
      <p class="small" style="text-align: center; font-size: 12px; max-width: 300px">Fechas y fases estimadas con tus registros${now.measured ? '' : ' (por ahora con un ciclo de 28 días; mejorará cuando registres dos periodos)'}. No son un método anticonceptivo.</p>
    </section>
    ${phaseCard(now.phase)}` : `
    <section class="card card-sig">
      <span class="eyebrow sm">Empecemos</span>
      <h2 style="margin: 0; font-size: 22px; font-weight: 400">¿Cuándo empezó tu último periodo?</h2>
      <p class="small">Con esa fecha la app estima tu fase y tu próximo periodo. Puedes corregirla después.</p>
    </section>`}

    <form class="card" id="period-form">
      <h2 class="h2">${now?.open ? 'Tu periodo está en curso' : now ? '¿Empezó tu periodo?' : 'Fecha de inicio'}</h2>
      ${now?.open ? `<p class="small">Empezó el ${dayMonth(now.last.start)}. Marca cuándo terminó.</p>` : ''}
      <div class="form-grid">
        <label class="sr-only" for="period-date">Fecha</label>
        <input class="mini-input" type="date" id="period-date" value="${today}" max="${today}">
        <button class="btn sm" type="submit">${now?.open ? 'Terminó' : 'Empezó'}</button>
      </div>
    </form>

    <a class="card" href="#/registro" style="text-decoration: none; color: inherit">
      <div class="card-row">
        <h2 class="h2">Hoy</h2>
        ${icon.chevron()}
      </div>
      ${logChips.length
        ? `<div class="chips" style="gap: 6px">${logChips.map((c, i) => `<span class="tag ${i % 2 ? 'peach' : ''}">${esc(c)}</span>`).join('')}</div>`
        : '<p class="small">Registra flujo, dolor, síntomas y cómo te sientes.</p>'}
    </a>

    ${trend ? `
    <section class="card card-sig">
      <span class="eyebrow sm">Tu cuerpo tiene sus ritmos</span>
      <p style="margin: 0; font-size: 19px; font-weight: 500; line-height: 1.3">${esc(trend)}</p>
      <p class="small">Una observación basada en tus registros, no una predicción médica.</p>
    </section>` : ''}

    ${sorted.length ? `
    <section class="card" aria-labelledby="historial" style="gap: 4px">
      <h2 id="historial" class="h2" style="padding-bottom: 6px">Historial</h2>
      ${historyHTML()}
    </section>` : ''}
  </main>
  ${nav('cuerpo')}`;

  const onSubmit = async (event) => {
    if (event.target.id !== 'period-form') return;
    event.preventDefault();
    const date = root.querySelector('#period-date').value || today;
    if (now?.open) {
      if (date < now.last.start) {
        toast('La fecha es anterior al inicio');
        return;
      }
      await put('periods', { ...now.last, end: date });
      toast('Fin de periodo guardado');
    } else {
      const previous = sorted.filter((p) => p.start < date).pop();
      if (previous && !previous.end) {
        await put('periods', { ...previous, end: addDays(previous.start, Math.min(now?.periodLength || 5, diffDays(previous.start, date)) - 1) });
      }
      if (sorted.some((p) => p.start === date)) {
        toast('Ya tienes un periodo con esa fecha');
        return;
      }
      await put('periods', { id: uid(), start: date, end: null });
      toast('Inicio de periodo guardado');
    }
    refresh();
  };

  const onClick = async (event) => {
    const del = event.target.closest('[data-delete]');
    if (!del) return;
    if (!confirm('¿Eliminar este periodo del historial?')) return;
    await remove('periods', del.dataset.delete);
    refresh();
  };

  root.addEventListener('submit', onSubmit);
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('submit', onSubmit);
    root.removeEventListener('click', onClick);
  };
}
