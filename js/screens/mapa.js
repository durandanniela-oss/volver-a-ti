import { getEntries, getAll } from '../db.js';
import { icon, nav, tabs, esc, dayKey, lastDays, weekdayInitial, parseKey } from '../ui.js';
import { STOPWORDS } from '../data.js';
import { energyTrend } from '../cycle.js';

const MOOD_COLORS = {
  Tranquilidad: '#7E9A8E', Alegría: '#E38A52', Ansiedad: '#5E4B57', Tristeza: '#8E949B',
  Frustración: '#A65A44', Motivación: '#D7A674', Sensibilidad: '#B88A9A', Agotamiento: '#7A6E62',
};
const WEEKDAYS = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'];
const avg = (list) => list.reduce((a, b) => a + b, 0) / list.length;

export default async function mapa(root) {
  const [checkinList, workouts, entries, periods] = await Promise.all([getEntries('checkins'), getAll('workouts'), getAll('entries'), getAll('periods')]);
  const checkins = Object.fromEntries(checkinList);
  const workoutDays = new Set(workouts.map((w) => w.date));
  let range = 'Semana';

  function insights(days) {
    const list = days.map((d) => [d, checkins[d]]).filter(([, c]) => c);
    if (list.length < 5) {
      return [`Con ${5 - list.length} check-in${5 - list.length === 1 ? '' : 's'} más empezarás a ver tus patrones aquí.`];
    }
    const out = [];

    const moodCount = {};
    for (const [, c] of list) for (const m of c.moods || []) moodCount[m] = (moodCount[m] || 0) + 1;
    const top = Object.entries(moodCount).sort((a, b) => b[1] - a[1])[0];
    if (top) out.push(`La emoción que más registraste fue <strong>${esc(top[0].toLowerCase())}</strong> (${top[1]} ${top[1] === 1 ? 'día' : 'días'}).`);

    // Patrones de más largo plazo: últimos 60 días.
    const long = lastDays(60).map((d) => [d, checkins[d]]).filter(([, c]) => c?.energy);
    const byWeekday = {};
    for (const [d, c] of long) (byWeekday[parseKey(d).getDay()] ||= []).push(c.energy);
    const best = Object.entries(byWeekday).filter(([, v]) => v.length >= 2).sort((a, b) => avg(b[1]) - avg(a[1]))[0];
    if (best && Object.keys(byWeekday).length >= 3) out.push(`Tus días con más energía suelen ser los <strong>${WEEKDAYS[best[0]]}</strong>.`);

    const moved = long.filter(([d]) => workoutDays.has(d)).map(([, c]) => c.energy);
    const still = long.filter(([d]) => !workoutDays.has(d)).map(([, c]) => c.energy);
    if (moved.length >= 3 && still.length >= 3 && avg(moved) - avg(still) >= 0.4) {
      out.push(`Los días que te moviste registraste más energía (${avg(moved).toFixed(1)} frente a ${avg(still).toFixed(1)}).`);
    }

    const badSleep = long.filter(([, c]) => c.sleep === 'Dormí mal');
    if (badSleep.length >= 2) {
      const anxious = badSleep.filter(([, c]) => c.moods?.includes('Ansiedad')).length;
      if (anxious) out.push(`Cuando dormiste mal, registraste ansiedad en ${anxious} de ${badSleep.length} días.`);
    }

    const trend = energyTrend(periods, checkins);
    if (trend) out.push(esc(trend));

    const from = days[0];
    const words = {};
    for (const e of entries) {
      if (e.createdAt.slice(0, 10) < from) continue;
      for (const w of `${e.title} ${e.text}`.toLowerCase().match(/[a-záéíóúñü]{4,}/g) || []) {
        if (!STOPWORDS.has(w)) words[w] = (words[w] || 0) + 1;
      }
    }
    const frequent = Object.entries(words).filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([w]) => w);
    if (frequent.length) out.push(`En tu diario mencionaste con frecuencia: <strong>${frequent.map(esc).join(', ')}</strong>.`);

    return out;
  }

  function chartHTML() {
    const days = lastDays(range === 'Semana' ? 7 : 30);
    const today = dayKey();
    const cols = days.length;
    const bars = days.map((d, i) => {
      const c = checkins[d];
      const mood = c?.moods?.[0];
      const label = range === 'Semana' ? weekdayInitial(d) : i % 7 === 6 || d === today ? String(parseKey(d).getDate()) : '';
      return `<div title="${d}${c?.energy ? ` · energía ${c.energy}` : ''}">
        <span class="m" style="${mood ? `background: ${MOOD_COLORS[mood]}` : 'visibility: hidden'}"></span>
        <span class="b ${c?.energy ? '' : 'empty'}" style="${c?.energy ? `height: ${c.energy * 22}px;` : ''}${d === today ? 'outline: 2px solid var(--ink); outline-offset: 2px;' : ''}${cols > 7 ? 'max-width: 8px;' : ''}"></span>
        <span class="num" style="font-size: ${cols > 7 ? 10 : 13}px; min-height: 14px">${label}</span>
      </div>`;
    }).join('');
    const present = [...new Set(days.flatMap((d) => checkins[d]?.moods?.slice(0, 1) || []))];
    const recorded = days.filter((d) => checkins[d]?.energy).length;
    return `
      <div class="bars" role="img" aria-label="Energía por día: ${recorded} días registrados" style="grid-template-columns: repeat(${cols}, minmax(0, 1fr)); gap: ${cols > 7 ? 3 : 8}px">${bars}</div>
      ${present.length ? `<div class="legend" style="justify-content: flex-start">${present.map((m) => `<span><i style="background: ${MOOD_COLORS[m]}"></i>${esc(m)}</span>`).join('')}</div>` : ''}
      <div id="insights" style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--line); padding-top: 12px">
        ${insights(days).map((t, i) => `<div class="insight"><i style="background: ${['var(--teal)', 'var(--peach)', 'var(--lilac)', 'var(--sky)'][i % 4]}"></i><p>${t}</p></div>`).join('')}
      </div>`;
  }

  root.innerHTML = `
  <main class="screen">
    <header class="header"><div class="stack">
      <span class="eyebrow">Mi bienestar</span>
      <h1 class="h1">Mi mapa emocional</h1>
      <p class="lead" style="font-size: 15px">Para comprender tus emociones, no para calificarlas.</p>
    </div></header>
    ${tabs('bienestar', 'mapa')}
    <a class="card card-sig" href="#/semana" style="text-decoration: none; color: inherit; flex-direction: row; align-items: center; padding: 14px 18px">
      <span style="flex: 1; display: flex; flex-direction: column; gap: 2px">
        <span class="eyebrow sm">Resumen</span>
        <strong style="font-size: 17px; font-weight: 500">Tu semana</strong>
      </span>
      ${icon.chevron()}
    </a>
    <div class="seg" role="group" aria-label="Periodo">
      <button type="button" data-range="Semana" aria-pressed="true">Semana</button>
      <button type="button" data-range="Mes" aria-pressed="false">Mes</button>
    </div>
    <section class="card" aria-label="Energía y ánimo">
      <h2 class="h2">Energía y ánimo</h2>
      <div id="chart" style="display: flex; flex-direction: column; gap: 14px">${chartHTML()}</div>
    </section>
    <p class="small" style="padding: 0 6px; font-size: 12px">Son observaciones de tus propios registros, no conclusiones médicas.</p>
  </main>
  ${nav('bienestar')}`;

  const onClick = (event) => {
    const btn = event.target.closest('[data-range]');
    if (!btn) return;
    range = btn.dataset.range;
    root.querySelectorAll('[data-range]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.range === range)));
    root.querySelector('#chart').innerHTML = chartHTML();
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
