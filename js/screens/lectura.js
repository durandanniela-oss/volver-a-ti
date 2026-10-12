import { getSetting } from '../db.js';
import { icon, esc, parseKey, intDots } from '../ui.js';
import { readingFor, TYPES, EXTRAS, ASPECT_MEANING, BODY_MEANING, MOON_SIGNS } from '../lecturas.js';
import { lineArt } from '../lineart.js';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const pad = (n) => String(n).padStart(2, '0');
const when = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:00`;

const pills = (items, done) => items.map((t) => `
  <span class="check-pill ${done ? 'done' : ''}" style="min-height: 42px">
    <span class="ring">${done ? icon.check({ size: 12 }) : ''}</span>
    <span class="t" style="text-decoration: none; opacity: 1">${esc(t)}</span>
  </span>`).join('');

export default async function lectura(root, { params, query }) {
  const birthDate = await getSetting('birthDate', '');
  const fecha = query.get('fecha');
  const date = fecha ? new Date(parseKey(fecha).setHours(12)) : new Date();
  const r = readingFor(params[0], birthDate, date);
  const extra = EXTRAS[r.area.id][r.type];
  const t = r.transit;
  const moon = MOON_SIGNS[r.moonSign];

  let duration = '';
  if (t) {
    const hours = Math.round((t.end - t.start) / 3600e3);
    duration = hours > 48 ? `durante ${Math.round(hours / 24)} días` : `durante unas ${Math.max(6, hours)} horas`;
  }

  root.innerHTML = `
  <main class="screen no-nav">
    <header class="topbar">
      <a class="icon-btn" href="#/universo${fecha ? '?vista=proximos' : ''}" aria-label="Volver a Mi universo">${icon.back()}</a>
      <span class="eyebrow sm">Lectura · ${esc(r.area.name)}</span>
      <span style="width: 44px"></span>
    </header>

    <section class="tile tile-sig" style="min-height: 0; gap: 12px">
      <div class="card-row">
        <span class="type-label type-${r.type.toLowerCase()}">${esc(r.type)}</span>
        ${intDots(r.intensity)}
      </div>
      <span class="reading-icon">${lineArt(r.area.art, 72)}</span>
      <h1 class="h1" style="font-size: 32px">${esc(r.reading.title)}</h1>
      <span style="font-size: 15px; font-weight: 600">${esc(t ? t.label : `Luna en ${r.moonSign}`)}</span>
      <span class="small" style="color: #3A362E">${t ? `${when(t.start)} — ${when(t.end)} · ${duration}` : esc(TYPES[r.type])}</span>
    </section>

    <section class="tile tile-glass" style="min-height: 0">
      <span class="eyebrow sm">${esc(r.area.name)}</span>
      <p style="margin: 0; font-size: 17px; line-height: 1.6">${esc(r.reading.body)}</p>
      <p style="margin: 0; font-size: 15px; line-height: 1.55; color: var(--muted)">Con la Luna en ${esc(r.moonSign)}: ${esc(moon.mood.charAt(0).toLowerCase() + moon.mood.slice(1))} ${esc(moon.tip)}</p>
    </section>

    <div style="display: flex; flex-direction: column; gap: 12px">
      <section class="tile tile-dark" aria-labelledby="favorece" style="min-height: 0">
        <h2 id="favorece" class="dot-title" style="font-size: 18px">Favorece</h2>
        <div style="display: flex; flex-direction: column; gap: 6px">${pills(extra.favor, true)}</div>
      </section>
      <section class="tile tile-glass" aria-labelledby="cuida" style="min-height: 0">
        <h2 id="cuida" class="dot-title" style="font-size: 18px">Cuida</h2>
        <div style="display: flex; flex-direction: column; gap: 6px">${extra.care.map((c) => `<span class="check-pill light" style="min-height: 42px"><span class="ring"></span><span class="t">${esc(c)}</span></span>`).join('')}</div>
      </section>
    </div>

    ${t ? `
    <section class="tile tile-glass" aria-labelledby="significa" style="min-height: 0">
      <h2 id="significa" class="h2">Qué significa este tránsito</h2>
      <p style="margin: 0; font-size: 15px; line-height: 1.5">${esc(ASPECT_MEANING[t.name] || '')}</p>
      <p class="small" style="font-size: 13px">${esc(BODY_MEANING[t.body] || '')}</p>
    </section>` : ''}

    <section class="tile tile-glass" style="min-height: 0; gap: 6px">
      <div class="check-pill light" style="min-height: 0; padding: 12px 14px; align-items: flex-start">
        <span class="type-label" style="font-size: 11px; width: 74px; flex-shrink: 0; padding-top: 3px">Pregunta</span>
        <span style="font-size: 16px; line-height: 1.4; font-weight: 500">${esc(r.reading.question)}</span>
      </div>
      <div class="check-pill light" style="min-height: 0; padding: 12px 14px; align-items: flex-start">
        <span class="type-label" style="font-size: 11px; width: 74px; flex-shrink: 0; padding-top: 3px">Acción</span>
        <span style="font-size: 15px; line-height: 1.4">${esc(r.reading.action)}</span>
      </div>
    </section>

    <section class="tile tile-sig" style="min-height: 0; align-items: center; text-align: center">
      <span class="eyebrow sm">Afirmación</span>
      <p style="margin: 0; font-size: 21px; line-height: 1.35; font-weight: 500">${esc(extra.affirmation)}</p>
    </section>

    <a class="cta" href="#/entrada/nueva?q=${encodeURIComponent(r.reading.question)}"><span>Escribir sobre esto</span><span class="cta-dot">${icon.pen({ size: 18, sw: 1.8 })}</span></a>
    <p class="small" style="font-size: 12px">Para reflexionar y entretenerte, no es una predicción.</p>
  </main>`;
}
