import { setSetting, getSetting, requestPersistence } from '../db.js';
import { icon, esc } from '../ui.js';

export default async function bienvenida(root) {
  const name = await getSetting('name', '');

  root.innerHTML = `
  <main class="screen no-nav" style="position: relative; overflow: hidden">
    <div aria-hidden="true" style="position: absolute; right: -90px; top: -70px; width: 300px; height: 300px; border-radius: 50%; background: var(--sig)"></div>
    <span class="eyebrow" style="position: relative; font-size: 16px">Volver a ti</span>
    <section style="position: relative; margin-top: 150px; display: flex; flex-direction: column; gap: 14px">
      <h1 class="h1 xl" style="line-height: 1.02; letter-spacing: -0.03em">Una aplicación para volver a ti.</h1>
      <p class="lead">Que la app se adapte a ti, en lugar de que tú tengas que adaptarte a ella.</p>
    </section>
    <ul style="position: relative; list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px">
      <li style="display: flex; gap: 14px; align-items: flex-start">
        <span style="width: 40px; height: 40px; flex-shrink: 0; border-radius: 20px; background: var(--sky); display: flex; align-items: center; justify-content: center">${icon.lock({ size: 18 })}</span>
        <span><strong style="display: block; font-size: 15px">Tus registros son tuyos</strong><span class="small">Se guardan solo en este dispositivo.</span></span>
      </li>
      <li style="display: flex; gap: 14px; align-items: flex-start">
        <span style="width: 40px; height: 40px; flex-shrink: 0; border-radius: 20px; background: var(--peach); display: flex; align-items: center; justify-content: center">${icon.heart({ size: 18, sw: 1.8 })}</span>
        <span><strong style="display: block; font-size: 15px">Sugerencias, no diagnósticos</strong><span class="small">La app orienta; no sustituye atención profesional.</span></span>
      </li>
    </ul>
    <form id="start" style="position: relative; margin-top: auto; display: flex; flex-direction: column; gap: 12px">
      <div class="card" style="padding: 14px 18px">
        <div class="field">
          <label for="name">¿Cómo te llamamos? (opcional)</label>
          <input id="name" class="input" type="text" autocomplete="given-name" value="${esc(name)}" placeholder="Tu nombre">
        </div>
      </div>
      <button class="cta" type="submit"><span>Comenzar</span><span class="cta-dot">${icon.arrow()}</span></button>
    </form>
  </main>`;

  root.querySelector('#start').addEventListener('submit', async (event) => {
    event.preventDefault();
    await setSetting('name', root.querySelector('#name').value.trim());
    await setSetting('onboarded', true);
    requestPersistence();
    location.hash = '#/checkin';
  });
}
