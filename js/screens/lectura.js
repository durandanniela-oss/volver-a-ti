import { getSetting } from '../db.js';
import { icon, esc, parseKey } from '../ui.js';
import { readingFor, TYPES } from '../lecturas.js';
import { lineArt } from '../lineart.js';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const pad = (n) => String(n).padStart(2, '0');
const when = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:00`;

export default async function lectura(root, { params, query }) {
  const birthDate = await getSetting('birthDate', '');
  const fecha = query.get('fecha');
  const date = fecha ? new Date(parseKey(fecha).setHours(12)) : new Date();
  const r = readingFor(params[0], birthDate, date);
  const t = r.transit;

  let duration = '';
  if (t) {
    const hours = Math.round((t.end - t.start) / 3600e3);
    duration = hours > 48 ? `Durante ${Math.round(hours / 24)} días` : `Durante unas ${Math.max(6, hours)} horas`;
  }

  root.innerHTML = `
  <main class="screen no-nav" style="align-items: center; text-align: center; gap: 16px">
    <header class="topbar" style="align-self: stretch">
      <a class="icon-btn" href="#/universo${fecha ? '?vista=proximos' : ''}" aria-label="Volver a Mi universo">${icon.back()}</a>
      <span class="af-wordmark" style="font-size: 22px">mi universo</span>
      <span style="width: 44px"></span>
    </header>

    <span style="color: var(--muted); margin-top: 8px">${lineArt('sol', 48)}</span>
    <span class="af-caps" style="font-size: 14px; letter-spacing: 0.32em; color: ${r.type === 'Reto' ? '#A65A44' : r.type === 'Oportunidad' ? '#647659' : 'var(--ink)'}">${esc(r.type)}</span>
    <h1 class="af-title" style="max-width: 320px">${esc(r.reading.title)}</h1>
    <p class="af-italic" style="margin: 0; font-size: 18px; color: var(--muted)">${esc(t ? t.label : `Luna en ${r.moonSign}`)}</p>
    ${t ? `<p class="small" style="margin: 0">${when(t.start)} — ${when(t.end)}<br>${duration}</p>` : `<p class="small" style="margin: 0">${esc(TYPES[r.type])}</p>`}

    <div class="af-plus" role="img" aria-label="Intensidad ${r.intensity} de 5">
      ${[5, 4, 3, 2, 1].map((n) => `<span class="${n <= r.intensity ? 'on' : ''}">+</span>`).join('')}
    </div>

    <div style="display: flex; flex-direction: column; gap: 2px">
      <span class="small">Área</span>
      <span class="af-caps" style="font-size: 18px">${esc(r.area.name)}</span>
    </div>
    <span style="color: var(--ink); opacity: 0.8">${lineArt(r.area.art, 88)}</span>

    <p style="margin: 0; font-size: 17px; line-height: 1.6; text-align: left; max-width: 360px">${esc(r.reading.body)}</p>

    <section class="af-card" style="display: flex; flex-direction: column; min-height: 0; padding: 4px 18px; align-self: stretch; text-align: left">
      <div style="display: flex; gap: 12px; padding: 14px 0">
        <span class="af-caps" style="font-size: 12px; width: 76px; flex-shrink: 0; padding-top: 3px">Pregunta</span>
        <span class="af-italic" style="font-size: 19px; line-height: 1.35">${esc(r.reading.question)}</span>
      </div>
      <div style="display: flex; gap: 12px; padding: 14px 0; border-top: 1px solid var(--af-line)">
        <span class="af-caps" style="font-size: 12px; width: 76px; flex-shrink: 0; padding-top: 3px">Acción</span>
        <span style="font-size: 15px; line-height: 1.45">${esc(r.reading.action)}</span>
      </div>
    </section>

    <a class="cta" href="#/entrada/nueva?q=${encodeURIComponent(r.reading.question)}"><span>Escribir sobre esto</span><span class="cta-dot">${icon.pen({ size: 18, sw: 1.8 })}</span></a>
    <p class="small" style="font-size: 12px">Para reflexionar y entretenerte, no es una predicción.</p>
  </main>`;
}
