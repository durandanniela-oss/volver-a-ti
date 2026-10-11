import { getSetting } from '../db.js';
import { icon, nav, esc, longDate, dayOfYear, parseKey } from '../ui.js';
import { moonPhase, moonSVG, sunSign, horoscope, SIGN_NAMES } from '../astro.js';
import { cardOfDay } from '../data.js';

export default async function universo(root) {
  const [enabled, birthDate] = await Promise.all([getSetting('astrologyEnabled', true), getSetting('birthDate', '')]);
  const now = new Date();
  const moon = moonPhase(now);
  const sign = birthDate ? sunSign(parseKey(birthDate)) : null;
  const signIndex = sign ? SIGN_NAMES.indexOf(sign) : 0;
  const card = cardOfDay(dayOfYear());
  const isIntentionMoon = moon.name === 'Luna nueva' || moon.name === 'Luna llena';
  let period = 'Día';

  document.body.classList.add('dark');

  const horoscopeHTML = () => {
    const h = horoscope(period, now, signIndex);
    return `
      <p style="margin: 0; font-size: 19px; line-height: 1.35">${esc(h.text)}</p>
      <div style="border-radius: 20px; background: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.9)">
        ${[['Intención', h.intention], ['Pregunta', h.question], ['Acción', h.action]].map(([k, v], i) => `
        <div style="display: flex; gap: 12px; padding: 12px 14px; ${i ? 'border-top: 1px solid var(--line)' : ''}">
          <span style="font-size: 12px; font-weight: 700; width: 70px; flex-shrink: 0; padding-top: 2px">${k}</span>
          <span style="font-size: 14px; line-height: 1.4">${esc(v)}</span>
        </div>`).join('')}
      </div>
      <a class="btn sm" href="#/entrada/nueva?q=${encodeURIComponent(h.question)}" style="align-self: flex-start">${icon.pen({ size: 16, sw: 1.8 })} Escribir sobre esto</a>`;
  };

  const lightCard = 'background: #3E3B33; border-color: rgba(245,240,230,0.12); color: var(--on-dark)';

  root.innerHTML = `
  <main class="screen" style="color: var(--on-dark)">
    <header class="header"><div class="stack">
      <span class="eyebrow" style="color: #EADFCB">Mi universo · ${longDate(now)}</span>
      <h1 class="h1">Mi cielo personal</h1>
    </div></header>

    ${enabled ? `
    <section class="card" style="${lightCard}; align-items: center; text-align: center; padding: 24px 20px" aria-label="${esc(moon.name)}, ${Math.round(moon.illumination * 100)}% iluminada">
      ${moonSVG(moon.fraction, 150)}
      <span class="eyebrow sm" style="color: #EADFCB">${esc(moon.name)} · ${Math.round(moon.illumination * 100)}%</span>
      <p style="margin: 0; font-size: 20px; line-height: 1.3">${esc(moon.text)}</p>
      <p class="small" style="color: var(--on-dark-muted)">Luna llena en ${Math.round(moon.daysToFull)} ${Math.round(moon.daysToFull) === 1 ? 'día' : 'días'} · Luna nueva en ${Math.round(moon.daysToNew)} ${Math.round(moon.daysToNew) === 1 ? 'día' : 'días'}</p>
      ${isIntentionMoon ? `<a class="btn sm btn-sig" href="#/entrada/nueva?q=${encodeURIComponent(moon.name === 'Luna nueva' ? '¿Qué deseo comenzar en este ciclo?' : '¿Qué quiero soltar y qué agradezco de este ciclo?')}">${icon.pen({ size: 16, sw: 1.8 })} Ritual de ${moon.name === 'Luna nueva' ? 'intención' : 'gratitud'}</a>` : ''}
    </section>

    <div class="grid-2" style="grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
      ${[['Sol', sign], ['Luna', null], ['Ascendente', null]].map(([label, value]) => `
      <div class="card" style="${lightCard}; padding: 14px 12px; gap: 4px">
        <span class="small" style="color: var(--on-dark-muted); font-weight: 600; font-size: 12px">${label}</span>
        <strong style="font-size: ${value ? 17 : 13}px; font-weight: 500">${value ? esc(value) : label === 'Sol' ? 'Añade tu fecha' : 'Próximamente'}</strong>
      </div>`).join('')}
    </div>
    ${sign ? '' : '<p class="small" style="color: var(--on-dark-muted); padding: 0 6px">Añade tu fecha de nacimiento en <a href="#/perfil" style="color: var(--on-dark)">Mi perfil</a> para ver tu signo solar. Luna y ascendente necesitan hora y lugar de nacimiento, y llegarán más adelante.</p>'}

    <section class="card card-sig" style="color: var(--ink)" aria-labelledby="horo">
      <div class="card-row">
        <h2 id="horo" class="eyebrow sm" style="margin: 0">Mi energía cósmica</h2>
        <div class="seg" role="group" aria-label="Periodo del horóscopo" style="background: rgba(255,255,255,0.5); padding: 3px">
          ${['Día', 'Semana', 'Mes'].map((p) => `<button type="button" data-period="${p}" aria-pressed="${p === period}" style="height: 32px; padding: 0 10px; font-size: 12px">${p}</button>`).join('')}
        </div>
      </div>
      <div id="horoscope" style="display: flex; flex-direction: column; gap: 14px">${horoscopeHTML()}</div>
    </section>` : `
    <section class="card" style="${lightCard}">
      <h2 class="h2">La astrología está oculta</h2>
      <p class="small" style="color: var(--on-dark-muted)">Puedes activarla cuando quieras en Mi perfil.</p>
      <a class="btn sm btn-sig" href="#/perfil" style="align-self: flex-start">Ir a Mi perfil</a>
    </section>`}

    <a class="card" href="#/carta" style="${lightCard}; text-decoration: none; flex-direction: row; align-items: center">
      <span style="flex: 1; display: flex; flex-direction: column; gap: 4px">
        <span class="eyebrow sm" style="color: #EADFCB">Carta ${card.code}</span>
        <strong style="font-size: 18px; font-weight: 500">${esc(card.title)}</strong>
        <span class="small" style="color: var(--on-dark-muted)">Tu carta del día y tus cartas guardadas</span>
      </span>
      ${icon.chevron()}
    </a>

    <p class="small" style="color: var(--on-dark-muted); padding: 0 6px; font-size: 12px">La astrología es aquí una herramienta de reflexión y entretenimiento, no una explicación científica de tu salud o tus emociones.</p>
  </main>
  ${nav('universo')}`;

  const onClick = (event) => {
    const btn = event.target.closest('[data-period]');
    if (!btn) return;
    period = btn.dataset.period;
    root.querySelectorAll('[data-period]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.period === period)));
    root.querySelector('#horoscope').innerHTML = horoscopeHTML();
  };
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('click', onClick);
    document.body.classList.remove('dark');
  };
}
