import { getSetting } from '../db.js';
import { icon, nav, esc, longDate, dayOfYear, parseKey, dayKey } from '../ui.js';
import { moonPhase, moonSVG, sunSign, horoscope, SIGN_NAMES, moonLongitude, signOf, upcomingTransits } from '../astro.js';
import { cardOfDay } from '../data.js';
import { dailyReadings } from '../lecturas.js';
import { lineArt } from '../lineart.js';

const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

// Carta alta con dibujo de línea, etiqueta vertical y área abajo.
export function readingCard(r, href) {
  const plus = '+'.repeat(r.intensity);
  return `
  <a class="af-card ${r.type.toLowerCase()}" href="${href}">
    <span class="side af-caps">${esc(r.type)}</span>
    <span class="face">
      <span class="badge-int" aria-label="Intensidad ${r.intensity} de 5">${plus}</span>
      <span class="art">${lineArt(r.area.art, 104)}</span>
      <span class="hint">Toca para leer</span>
      <span style="color: var(--muted); opacity: 0.8">${lineArt('sol', 26)}</span>
      <span class="area af-caps">${esc(r.area.name)}</span>
    </span>
  </a>`;
}

export default async function universo(root, { query }) {
  const [enabled, birthDate, birthTime] = await Promise.all([
    getSetting('astrologyEnabled', true), getSetting('birthDate', ''), getSetting('birthTime', ''),
  ]);
  const now = new Date();
  const moon = moonPhase(now);
  const moonSign = signOf(moonLongitude(now));
  const sign = birthDate ? sunSign(parseKey(birthDate)) : null;
  const signIndex = sign ? SIGN_NAMES.indexOf(sign) : 0;
  const card = cardOfDay(dayOfYear());
  const readings = dailyReadings(birthDate, now);
  const main = readings[0].transit;
  let view = query.get('vista') === 'proximos' ? 'proximos' : 'hoy';
  let period = 'Día';

  // Luna natal: con hora de nacimiento es más precisa; sin hora, se calcula al mediodía.
  let natalMoon = null;
  if (birthDate) {
    const [y, m, d] = birthDate.split('-').map(Number);
    const [hh, mm] = (birthTime || '12:00').split(':').map(Number);
    natalMoon = signOf(moonLongitude(new Date(y, m - 1, d, hh, mm)));
  }

  const horoscopeHTML = () => {
    const h = horoscope(period, now, signIndex);
    return `
      <p style="margin: 0; font-family: var(--serif-af); font-size: 22px; line-height: 1.35">${esc(h.text)}</p>
      <div>
        ${[['Intención', h.intention], ['Pregunta', h.question], ['Acción', h.action]].map(([k, v]) => `
        <div style="display: flex; gap: 12px; padding: 12px 0; border-top: 1px solid var(--af-line)">
          <span class="af-caps" style="font-size: 12px; width: 82px; flex-shrink: 0; padding-top: 2px">${k}</span>
          <span style="font-size: 15px; line-height: 1.4">${esc(v)}</span>
        </div>`).join('')}
      </div>
      <a class="btn sm" href="#/entrada/nueva?q=${encodeURIComponent(h.question)}" style="align-self: flex-start">${icon.pen({ size: 16, sw: 1.8 })} Escribir sobre esto</a>`;
  };

  const windowText = (t) => {
    if (!t) return '';
    const hours = Math.round((t.end - t.start) / 3600e3);
    return hours > 48 ? `próximos ${Math.round(hours / 24)} días` : hours > 20 ? 'hoy y mañana' : 'hoy';
  };

  const todayHTML = () => `
    <section class="af-card" style="display: flex; min-height: 0; align-items: center; gap: 16px; padding: 16px 18px" aria-label="${esc(moon.name)} en ${esc(moonSign)}">
      ${moonSVG(moon.fraction, 56)}
      <span style="display: flex; flex-direction: column; gap: 4px">
        <span class="af-caps" style="font-size: 13px">${esc(moon.name)} en ${esc(moonSign)}</span>
        <span style="font-size: 14px; line-height: 1.4; color: var(--muted)">${esc(moon.text)}</span>
      </span>
    </section>

    ${main ? `
    <p class="af-italic" style="margin: 0; text-align: center; font-size: 18px">Tu tránsito principal: ${esc(main.label)} · ${windowText(main)}</p>` : birthDate ? `
    <p class="af-italic" style="margin: 0; text-align: center; font-size: 18px">Hoy la Luna no forma aspectos fuertes con tu Sol. Un día para observar.</p>` : `
    <a class="link-pill" href="#/perfil" style="align-self: center">Añade tu fecha de nacimiento para lecturas personales</a>`}

    <section aria-label="Tus lecturas de hoy" style="display: flex; flex-direction: column; gap: 12px">
      ${readings.map((r) => readingCard(r, `#/lectura/${r.area.id}`)).join('')}
    </section>

    <section aria-labelledby="natal" style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px">
      <h2 id="natal" class="af-caps" style="margin: 0; text-align: center; font-size: 15px">Tu carta natal</h2>
      <div class="af-natal">
        <a href="#/perfil"><span class="glyph" aria-hidden="true">☉</span><span class="what">Tu identidad esencial</span><span class="name af-caps">${sign ? esc(sign) : 'Añade tu fecha'}</span></a>
        <a href="#/perfil"><span class="glyph" aria-hidden="true">☽</span><span class="what">Tus emociones${natalMoon && !birthTime ? ' (aprox.)' : ''}</span><span class="name af-caps">${natalMoon ? esc(natalMoon) : 'Añade tu fecha'}</span></a>
        <div><span class="glyph" aria-hidden="true">↑</span><span class="what">Cómo te ven</span><span class="name af-caps" style="font-size: 11px">Próximamente</span></div>
      </div>
      ${birthDate && !birthTime ? '<p class="small" style="text-align: center; font-size: 12px">Añade tu hora de nacimiento en Mi perfil para precisar tu Luna.</p>' : ''}
    </section>

    <section class="af-card" style="display: flex; flex-direction: column; min-height: 0; padding: 20px 18px; gap: 14px" aria-labelledby="horo">
      <div class="card-row">
        <h2 id="horo" class="af-caps" style="margin: 0; font-size: 14px">Tu energía cósmica</h2>
        <div class="seg" role="group" aria-label="Periodo del horóscopo" style="padding: 3px">
          ${['Día', 'Semana', 'Mes'].map((p) => `<button type="button" data-period="${p}" aria-pressed="${p === period}" style="height: 32px; padding: 0 10px; font-size: 12px">${p}</button>`).join('')}
        </div>
      </div>
      <div id="horoscope" style="display: flex; flex-direction: column; gap: 14px">${horoscopeHTML()}</div>
    </section>

    <a class="af-card" href="#/carta" style="display: flex; min-height: 0; align-items: center; gap: 14px; padding: 16px 18px">
      <span class="art">${lineArt('sol', 40)}</span>
      <span style="flex: 1; display: flex; flex-direction: column; gap: 2px">
        <span class="af-caps" style="font-size: 12px; color: var(--muted)">Carta ${card.code}</span>
        <strong class="af-title" style="font-size: 22px">Tu carta del día</strong>
      </span>
      ${icon.chevron()}
    </a>`;

  const upcomingHTML = () => {
    const days = upcomingTransits(birthDate, 7);
    return `
    <section class="af-card" style="display: block; min-height: 0; padding: 4px 18px" aria-label="Próximos días">
      ${days.map((d) => {
        const key = dayKey(d.date);
        const r = dailyReadings(birthDate, d.date, 1)[0];
        return `
        <a class="af-day" href="#/lectura/${r.area.id}?fecha=${key}">
          <span style="text-align: center">
            <span class="af-title" style="display: block; font-size: 28px">${d.date.getDate()}</span>
            <span class="af-caps" style="font-size: 11px; color: var(--muted)">${DAYS[d.date.getDay()]}</span>
          </span>
          <span style="display: flex; flex-direction: column; gap: 3px">
            <span class="af-caps" style="font-size: 12px; color: ${r.type === 'Reto' ? '#A65A44' : r.type === 'Oportunidad' ? '#647659' : 'var(--muted)'}">${esc(r.type)} · ${esc(r.area.name)}</span>
            <span style="font-size: 15px">${esc(r.reading.title)}</span>
            <span class="af-italic" style="font-size: 14px; color: var(--muted)">${esc(d.main ? d.main.label : `Luna en ${d.moonSign}`)}</span>
          </span>
          <span style="font-size: 13px; letter-spacing: 0.05em" aria-label="Intensidad ${r.intensity} de 5">${'+'.repeat(r.intensity)}</span>
        </a>`;
      }).join('')}
    </section>`;
  };

  root.innerHTML = `
  <main class="screen">
    <header style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding-top: 4px">
      <h1 class="af-wordmark">mi universo</h1>
      <span class="eyebrow sm">${longDate(now)}</span>
    </header>
    ${enabled ? `
    <div class="af-toggle" role="group" aria-label="Ver">
      <button type="button" data-view="hoy" aria-pressed="${view === 'hoy'}">Hoy</button>
      <button type="button" data-view="proximos" aria-pressed="${view === 'proximos'}">Próximos días</button>
    </div>
    <div id="view" style="display: flex; flex-direction: column; gap: 14px">${view === 'hoy' ? todayHTML() : upcomingHTML()}</div>` : `
    <section class="af-card" style="display: flex; flex-direction: column; min-height: 0; padding: 20px">
      <h2 class="af-title" style="font-size: 24px">La astrología está oculta</h2>
      <p class="small">Puedes activarla cuando quieras en Mi perfil.</p>
      <a class="btn sm" href="#/perfil" style="align-self: flex-start">Ir a Mi perfil</a>
    </section>`}
    <p class="small" style="padding: 0 6px; font-size: 12px; text-align: center">La astrología es aquí una herramienta de reflexión y entretenimiento. Los tránsitos se calculan de forma aproximada con la posición del Sol y la Luna.</p>
  </main>
  ${nav('universo')}`;

  const onClick = (event) => {
    const viewBtn = event.target.closest('[data-view]');
    if (viewBtn) {
      view = viewBtn.dataset.view;
      root.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
      root.querySelector('#view').innerHTML = view === 'hoy' ? todayHTML() : upcomingHTML();
      return;
    }
    const btn = event.target.closest('[data-period]');
    if (!btn) return;
    period = btn.dataset.period;
    root.querySelectorAll('[data-period]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.period === period)));
    root.querySelector('#horoscope').innerHTML = horoscopeHTML();
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
