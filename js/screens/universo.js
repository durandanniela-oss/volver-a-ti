import { getSetting } from '../db.js';
import { icon, nav, esc, longDate, dayOfYear, parseKey, dayKey, dotRing, intDots } from '../ui.js';
import { moonPhase, moonSVG, sunSign, horoscope, SIGN_NAMES, moonLongitude, signOf, upcomingTransits } from '../astro.js';
import { cardOfDay } from '../data.js';
import { dailyReadings, MOON_SIGNS, SIGN_PROFILES } from '../lecturas.js';
import { lineArt } from '../lineart.js';

const DAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

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

  const windowText = (t) => {
    if (!t) return '';
    const hours = Math.round((t.end - t.start) / 3600e3);
    return hours > 48 ? `próximos ${Math.round(hours / 24)} días` : hours > 20 ? 'hoy y mañana' : 'hoy';
  };

  const horoscopeHTML = () => {
    const h = horoscope(period, now, signIndex);
    return `
      <p style="margin: 0; font-size: 18px; line-height: 1.4">${esc(h.text)}</p>
      <div style="display: flex; flex-direction: column; gap: 6px">
        ${[['Intención', h.intention], ['Pregunta', h.question], ['Acción', h.action]].map(([k, v]) => `
        <div class="check-pill light" style="min-height: 0; padding: 10px 14px; align-items: flex-start">
          <span class="type-label" style="font-size: 11px; width: 78px; flex-shrink: 0; padding-top: 2px">${k}</span>
          <span style="font-size: 14px; line-height: 1.4">${esc(v)}</span>
        </div>`).join('')}
      </div>
      <a class="btn sm" href="#/entrada/nueva?q=${encodeURIComponent(h.question)}" style="align-self: flex-start">${icon.pen({ size: 16, sw: 1.8 })} Escribir sobre esto</a>`;
  };

  const readingTile = (r, i) => {
    const href = `#/lectura/${r.area.id}`;
    if (i === 0) {
      return `
      <a class="tile tile-sig span-2" href="${href}" style="min-height: 0">
        <div class="card-row">
          <span class="type-label type-${r.type.toLowerCase()}">${esc(r.type)}</span>
          ${intDots(r.intensity)}
        </div>
        <div style="display: flex; gap: 14px; align-items: center">
          <span class="reading-icon">${lineArt(r.area.art, 64)}</span>
          <span style="display: flex; flex-direction: column; gap: 4px">
            <span class="eyebrow sm">${esc(r.area.name)}</span>
            <strong style="font-size: 22px; font-weight: 500; line-height: 1.2">${esc(r.reading.title)}</strong>
          </span>
        </div>
        <span style="font-size: 13px; font-weight: 600">Leer la lectura completa</span>
      </a>`;
    }
    return `
      <a class="tile tile-glass" href="${href}" style="justify-content: space-between">
        <span class="type-label type-${r.type.toLowerCase()}" style="font-size: 12px">${esc(r.type)}</span>
        <span class="reading-icon">${lineArt(r.area.art, 46)}</span>
        <span style="display: flex; flex-direction: column; gap: 4px">
          <span class="eyebrow sm">${esc(r.area.name)}</span>
          <strong style="font-size: 16px; font-weight: 600; line-height: 1.25">${esc(r.reading.title)}</strong>
        </span>
        ${intDots(r.intensity)}
      </a>`;
  };

  const todayHTML = () => `
    <section class="tile tile-dark span-2" aria-label="${esc(moon.name)} en ${esc(moonSign)}" style="min-height: 0">
      <div style="display: flex; gap: 16px; align-items: center">
        ${moonSVG(moon.fraction, 64)}
        <span style="display: flex; flex-direction: column; gap: 4px">
          <span class="dot-title" style="font-size: 20px">${esc(moon.name)}</span>
          <span style="font-size: 15px; font-weight: 600">en ${esc(moonSign)}</span>
        </span>
      </div>
      <p class="small" style="font-size: 14px; color: var(--on-dark)">${esc(MOON_SIGNS[moonSign].mood)} ${esc(moon.text)}</p>
      <div class="check-pill" style="min-height: 0; padding: 10px 14px; align-items: flex-start">
        <span class="type-label" style="font-size: 11px; color: #EADFCB; width: 64px; flex-shrink: 0; padding-top: 2px">Favorece</span>
        <span style="font-size: 13px; line-height: 1.4">${esc(MOON_SIGNS[moonSign].favors)}</span>
      </div>
    </section>

    ${main ? `
    <section class="tile tile-glass span-2" style="min-height: 0; gap: 6px">
      <span class="eyebrow sm">Tu tránsito principal</span>
      <strong style="font-size: 18px; font-weight: 600">${esc(main.label)}</strong>
      <span class="small">${windowText(main)} · intensidad ${main.intensity} de 5</span>
    </section>` : !birthDate ? `
    <a class="tile tile-glass span-2" href="#/perfil" style="min-height: 0; gap: 4px">
      <span class="eyebrow sm">Lecturas personales</span>
      <strong style="font-size: 16px; font-weight: 600">Añade tu fecha de nacimiento en Mi perfil</strong>
      <span class="small">Así las lecturas se basan en tus tránsitos.</span>
    </a>` : ''}

    <h2 class="h2" style="padding: 4px 4px 0">Tus lecturas de hoy</h2>
    <div class="bento">${readings.map(readingTile).join('')}</div>

    <h2 class="h2" style="padding: 4px 4px 0">Tu carta natal</h2>
    <div class="bento" style="grid-template-columns: repeat(3, minmax(0, 1fr))">
      <a class="tile tile-glass" href="${sign ? '#/signo/sol' : '#/perfil'}" style="min-height: 140px; justify-content: space-between">
        <span class="eyebrow sm">Sol</span>
        <strong style="font-size: 16px; font-weight: 600">${sign ? esc(sign) : 'Añade tu fecha'}</strong>
        <span class="small" style="font-size: 11px">Tu esencia${sign ? ` · ${esc(SIGN_PROFILES[sign].element)}` : ''}</span>
      </a>
      <a class="tile tile-glass" href="${natalMoon ? '#/signo/luna' : '#/perfil'}" style="min-height: 140px; justify-content: space-between">
        <span class="eyebrow sm">Luna</span>
        <strong style="font-size: 16px; font-weight: 600">${natalMoon ? esc(natalMoon) : 'Añade tu fecha'}</strong>
        <span class="small" style="font-size: 11px">Tus emociones${natalMoon && !birthTime ? ' · aprox.' : ''}</span>
      </a>
      <div class="tile tile-glass" style="min-height: 140px; justify-content: space-between">
        <span class="eyebrow sm">Ascendente</span>
        <strong style="font-size: 14px; font-weight: 600">Próximamente</strong>
        <span class="small" style="font-size: 11px">Cómo te ven</span>
      </div>
    </div>

    <section class="tile tile-glass" aria-labelledby="horo" style="min-height: 0; gap: 14px">
      <div class="card-row">
        <h2 id="horo" class="eyebrow sm" style="margin: 0">Tu energía cósmica</h2>
        <div class="seg" role="group" aria-label="Periodo del horóscopo" style="padding: 3px">
          ${['Día', 'Semana', 'Mes'].map((p) => `<button type="button" data-period="${p}" aria-pressed="${p === period}" style="height: 32px; padding: 0 10px; font-size: 12px">${p}</button>`).join('')}
        </div>
      </div>
      <div id="horoscope" style="display: flex; flex-direction: column; gap: 14px">${horoscopeHTML()}</div>
    </section>

    <a class="tile tile-dark" href="#/carta" style="min-height: 0; flex-direction: row; align-items: center; gap: 14px">
      <span style="color: var(--on-dark)">${dotRing(52)}</span>
      <span style="flex: 1; display: flex; flex-direction: column; gap: 4px">
        <span class="dot-title" style="font-size: 18px">Carta ${card.code}</span>
        <span style="font-size: 14px">Revela tu carta del día</span>
      </span>
      ${icon.chevron()}
    </a>`;

  const upcomingHTML = () => {
    const days = upcomingTransits(birthDate, 7);
    return `
    <section class="tile tile-glass" style="min-height: 0; padding: 4px 18px; gap: 0" aria-label="Próximos días">
      ${days.map((d) => {
        const r = dailyReadings(birthDate, d.date, 1)[0];
        return `
        <a class="day-row" href="#/lectura/${r.area.id}?fecha=${dayKey(d.date)}">
          <span style="text-align: center">
            <span class="dot-title" style="display: block; font-size: 26px">${d.date.getDate()}</span>
            <span class="eyebrow sm">${DAYS[d.date.getDay()]}</span>
          </span>
          <span style="display: flex; flex-direction: column; gap: 3px">
            <span class="type-label type-${r.type.toLowerCase()}" style="font-size: 11px">${esc(r.type)} · ${esc(r.area.name)}</span>
            <span style="font-size: 15px; font-weight: 600">${esc(r.reading.title)}</span>
            <span class="small">${esc(d.main ? d.main.label : `Luna en ${d.moonSign}`)}</span>
          </span>
          ${intDots(r.intensity)}
        </a>`;
      }).join('')}
    </section>`;
  };

  root.innerHTML = `
  <main class="screen">
    <header class="header"><div class="stack">
      <span class="eyebrow">Mi universo · ${longDate(now)}</span>
      <h1 class="h1">Mi cielo personal</h1>
    </div></header>
    ${enabled ? `
    <div class="chips" role="group" aria-label="Ver">
      <button type="button" class="chip sm" data-view="hoy" aria-pressed="${view === 'hoy'}">Hoy</button>
      <button type="button" class="chip sm" data-view="proximos" aria-pressed="${view === 'proximos'}">Próximos días</button>
    </div>
    <div id="view" style="display: flex; flex-direction: column; gap: 12px">${view === 'hoy' ? todayHTML() : upcomingHTML()}</div>` : `
    <section class="card">
      <h2 class="h2">La astrología está oculta</h2>
      <p class="small">Puedes activarla cuando quieras en Mi perfil.</p>
      <a class="btn sm" href="#/perfil" style="align-self: flex-start">Ir a Mi perfil</a>
    </section>`}
    <p class="small" style="padding: 0 6px; font-size: 12px">La astrología es aquí una herramienta de reflexión y entretenimiento. Los tránsitos se calculan de forma aproximada con la posición del Sol y la Luna.</p>
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
