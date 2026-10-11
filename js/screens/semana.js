import { getAll, getEntries } from '../db.js';
import { icon, nav, esc, lastDays, dayMonth, weekdayInitial, dayKey, dayOfYear } from '../ui.js';
import { MOOD_ADJ, WEEK_QUESTIONS } from '../data.js';
import { cycleToday, PHASE_COLORS } from '../cycle.js';

const avg = (list) => (list.length ? (list.reduce((a, b) => a + b, 0) / list.length).toFixed(1) : null);

export default async function semana(root) {
  const days = lastDays(7);
  const from = days[0];
  const today = dayKey();
  const [checkinList, eveningList, workouts, entries, periods] = await Promise.all([
    getEntries('checkins'), getEntries('evenings'), getAll('workouts'), getAll('entries'), getAll('periods'),
  ]);
  const checkins = Object.fromEntries(checkinList.filter(([d]) => d >= from));
  const evenings = Object.fromEntries(eveningList.filter(([d]) => d >= from));
  const weekWorkouts = workouts.filter((w) => w.date >= from && w.date <= today);
  const weekEntries = entries.filter((e) => {
    const d = new Date(e.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return key >= from;
  });
  const entryDays = new Set(weekEntries.map((e) => new Date(e.createdAt).toDateString()));

  // Días en los que hiciste algo por ti: check-in, cierre, movimiento o escribir.
  const cared = days.map((d) => !!checkins[d] || !!evenings[d] || weekWorkouts.some((w) => w.date === d) || entryDays.has(new Date(`${d}T12:00`).toDateString()));
  const caredCount = cared.filter(Boolean).length;

  const moodCount = {};
  for (const c of Object.values(checkins)) for (const m of c.moods || []) moodCount[m] = (moodCount[m] || 0) + 1;
  const topMoods = Object.entries(moodCount).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const morning = avg(Object.values(checkins).map((c) => c.energy).filter(Boolean));
  const night = avg(Object.values(evenings).map((e) => e.energy).filter(Boolean));
  const minutes = weekWorkouts.reduce((n, w) => n + (w.minutes || 0), 0);
  const photos = weekEntries.reduce((n, e) => n + (e.photos?.length || 0), 0);

  const goods = [...new Set(Object.values(evenings).flatMap((e) => [...(e.good || []), ...(e.goodText ? [e.goodText] : [])]))];
  const phases = [...new Set(days.map((d) => cycleToday(periods, d)?.phase).filter(Boolean))];
  const question = WEEK_QUESTIONS[Math.floor(dayOfYear() / 7) % WEEK_QUESTIONS.length];

  const stat = (label, value, note = '') => `
    <div class="tile tile-glass" style="min-height: 0; gap: 4px">
      <span class="eyebrow sm">${label}</span>
      <span class="dot-title" style="font-size: 30px">${value}</span>
      ${note ? `<span class="small" style="font-size: 12px">${note}</span>` : ''}
    </div>`;

  root.innerHTML = `
  <main class="screen">
    <header class="topbar">
      <a class="icon-btn" href="#/hoy" aria-label="Volver a Mi día">${icon.back()}</a>
      <span class="eyebrow sm">${dayMonth(from)} — ${dayMonth(today)}</span>
      <span style="width: 44px"></span>
    </header>
    <h1 class="h1" style="padding: 0 4px">Tu semana</h1>

    <section class="tile tile-sig" style="min-height: 0">
      <span class="eyebrow sm">Días en que te cuidaste</span>
      <span class="dot-title" style="font-size: 44px">${caredCount}/7</span>
      <div class="week" aria-hidden="true">${days.map((d, i) => `<div><span class="num" style="font-size: 13px">${weekdayInitial(d)}</span><span class="day ${cared[i] ? 'on' : ''}" style="${cared[i] ? 'background: var(--ink)' : ''}"></span></div>`).join('')}</div>
      <p class="small" style="color: #3A362E">${caredCount >= 5 ? 'Te diste tiempo casi todos los días. Qué bonito.' : caredCount >= 2 ? 'Cada momento cuenta. Gracias por volver a ti.' : 'Esta semana fue distinta, y está bien. Siempre puedes volver.'}</p>
    </section>

    <div class="bento">
      ${stat('Energía', morning ? `${morning}` : '–', night ? `por la mañana · ${night} por la noche` : 'promedio por la mañana')}
      ${stat('Movimiento', weekWorkouts.length, `${minutes} min en total`)}
      ${stat('Diario', weekEntries.length, `${photos} ${photos === 1 ? 'foto' : 'fotos'}`)}
      ${stat('Cierres', Object.keys(evenings).length, 'del día')}
    </div>

    ${topMoods.length ? `
    <section class="card" aria-labelledby="animo">
      <h2 id="animo" class="h2">Lo que más sentiste</h2>
      <div class="chips">${topMoods.map(([m, n], i) => `<span class="tag ${['', 'peach', 'lilac'][i]}" style="height: 34px; padding: 0 14px; font-size: 14px">${esc(MOOD_ADJ[m] || m)} · ${n}</span>`).join('')}</div>
    </section>` : ''}

    ${phases.length ? `
    <section class="card" aria-labelledby="fases">
      <h2 id="fases" class="h2">Tu ciclo esta semana</h2>
      <p style="margin: 0; font-size: 15px">${phases.map((p) => `<span style="display: inline-flex; align-items: center; gap: 6px"><i style="width: 10px; height: 10px; border-radius: 5px; background: ${PHASE_COLORS[p]}; display: inline-block"></i>Fase ${p.toLowerCase()}</span>`).join(' → ')}</p>
    </section>` : ''}

    ${goods.length ? `
    <section class="tile tile-dark" aria-labelledby="gratitud" style="min-height: 0">
      <h2 id="gratitud" class="dot-title" style="font-size: 24px">Cosas buenas</h2>
      <div style="display: flex; flex-direction: column; gap: 6px">
        ${goods.slice(0, 8).map((g) => `<span class="check-pill done" style="min-height: 40px"><span class="ring">${icon.check({ size: 12 })}</span><span class="t" style="text-decoration: none; opacity: 1">${esc(g)}</span></span>`).join('')}
      </div>
    </section>` : ''}

    <section class="card card-sig" aria-labelledby="pregunta">
      <span class="eyebrow sm">Para la semana que empieza</span>
      <h2 id="pregunta" style="margin: 0; font-size: 21px; font-weight: 400; line-height: 1.3">${esc(question)}</h2>
      <a class="btn sm" href="#/entrada/nueva?q=${encodeURIComponent(question)}" style="align-self: flex-start">${icon.pen({ size: 16, sw: 1.8 })} Escribir</a>
    </section>
  </main>
  ${nav('bienestar')}`;
}
