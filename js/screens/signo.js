import { getSetting } from '../db.js';
import { icon, esc, parseKey } from '../ui.js';
import { sunSign, moonLongitude, signOf } from '../astro.js';
import { SIGN_PROFILES } from '../lecturas.js';

// Perfil de tu Sol o tu Luna natal.
export default async function signo(root, { params }) {
  const [birthDate, birthTime] = await Promise.all([getSetting('birthDate', ''), getSetting('birthTime', '')]);
  if (!birthDate) {
    location.replace('#/perfil');
    return;
  }
  const isMoon = params[0] === 'luna';
  let sign;
  if (isMoon) {
    const [y, m, d] = birthDate.split('-').map(Number);
    const [hh, mm] = (birthTime || '12:00').split(':').map(Number);
    sign = signOf(moonLongitude(new Date(y, m - 1, d, hh, mm)));
  } else {
    sign = sunSign(parseKey(birthDate));
  }
  const p = SIGN_PROFILES[sign];

  root.innerHTML = `
  <main class="screen no-nav">
    <header class="topbar">
      <a class="icon-btn" href="#/universo" aria-label="Volver a Mi universo">${icon.back()}</a>
      <span class="eyebrow sm">Tu carta natal</span>
      <span style="width: 44px"></span>
    </header>

    <section class="tile tile-sig" style="min-height: 0; gap: 10px">
      <span class="eyebrow sm">${isMoon ? 'Tu Luna · tus emociones' : 'Tu Sol · tu esencia'}</span>
      <h1 class="dot-title" style="font-size: 40px">${esc(sign)}</h1>
      <div class="chips" style="gap: 6px">
        <span class="tag" style="background: rgba(255,255,255,0.55)">${esc(p.element)}</span>
        <span class="tag" style="background: rgba(255,255,255,0.55)">${esc(p.mode)}</span>
      </div>
      <p style="margin: 0; font-size: 18px; line-height: 1.45; font-weight: 500">${esc(isMoon ? p.moon : p.essence)}</p>
      ${isMoon && !birthTime ? '<p class="small" style="color: #3A362E">Calculada al mediodía de tu nacimiento. Añade tu hora en Mi perfil para más precisión.</p>' : ''}
    </section>

    <section class="tile tile-dark" style="min-height: 0">
      <h2 class="dot-title" style="font-size: 18px">Tus fortalezas</h2>
      <div style="display: flex; flex-direction: column; gap: 6px">
        ${p.strengths.map((s) => `<span class="check-pill done" style="min-height: 42px"><span class="ring">${icon.check({ size: 12 })}</span><span class="t" style="text-decoration: none; opacity: 1">${esc(s)}</span></span>`).join('')}
      </div>
    </section>

    <section class="tile tile-glass" style="min-height: 0">
      <h2 class="h2">Para cuidar</h2>
      <p style="margin: 0; font-size: 16px; line-height: 1.5">${esc(p.care)}</p>
    </section>

    ${isMoon ? '' : `
    <section class="tile tile-glass" style="min-height: 0">
      <h2 class="h2">Tu Luna</h2>
      <p class="small" style="font-size: 14px">Tu Sol habla de quién eres; tu Luna, de lo que necesitas para sentirte bien.</p>
      <a class="btn sm" href="#/signo/luna" style="align-self: flex-start">Ver mi Luna</a>
    </section>`}

    <a class="cta" href="#/entrada/nueva?q=${encodeURIComponent(`¿En qué momentos me reconozco como ${sign}?`)}"><span>Escribir sobre mi signo</span><span class="cta-dot">${icon.pen({ size: 18, sw: 1.8 })}</span></a>
    <p class="small" style="font-size: 12px">Una herramienta de reflexión y entretenimiento: cada persona es mucho más que su signo.</p>
  </main>`;
}
