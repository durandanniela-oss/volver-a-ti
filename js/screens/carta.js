import { get, put, remove, getAllKeys, getSetting, setSetting } from '../db.js';
import { icon, nav, esc, dayOfYear, dayKey, toast } from '../ui.js';
import { cardOfDay, cardByNumber } from '../data.js';
import { lineArt, cardBack } from '../lineart.js';

const ART_BY_CATEGORY = {
  'Del universo': 'creatividad', Afirmaciones: 'identidad', Autoconocimiento: 'social',
  Gratitud: 'autocuidado', 'Días difíciles': 'hogar', Intenciones: 'trabajo',
};

export default async function carta(root, { params }) {
  const card = params[0] ? cardByNumber(params[0]) || cardOfDay(dayOfYear()) : cardOfDay(dayOfYear());
  const isToday = card.n === cardOfDay(dayOfYear()).n;
  let saved = !!(await get('favorites', card.n));
  const favorites = (await getAllKeys('favorites')).map(cardByNumber).filter(Boolean);
  // La carta de hoy se revela al tocarla y queda revelada el resto del día.
  const revealKey = `${dayKey()}:${card.n}`;
  const revealed = !isToday || (await getSetting('revealedCard', '')) === revealKey;

  const saveLabel = () => `${icon.bookmark()} ${saved ? 'Guardada' : 'Guardar'}`;

  root.innerHTML = `
  <main class="screen">
    <header class="topbar">
      <a class="icon-btn" href="#/universo" aria-label="Volver a Mi universo">${icon.back()}</a>
      <span class="eyebrow sm">Un mensaje para mí</span>
      <span style="width: 44px"></span>
    </header>
    <section class="flip ${revealed ? 'open' : ''}" id="flip" aria-live="polite">
      <div class="flip-inner">
        <button type="button" class="flip-face flip-back" id="reveal" aria-label="Revelar tu carta del día" ${revealed ? 'tabindex="-1" aria-hidden="true"' : ''}>
          <span style="color: var(--ink); opacity: 0.8">${cardBack(150)}</span>
          <span class="af-caps" style="font-size: 13px">${isToday ? 'Tu carta de hoy' : 'Carta'}</span>
          <span class="af-italic" style="font-size: 18px; color: var(--muted)">Toca para revelarla</span>
        </button>
        <article class="flip-face flip-front" ${revealed ? '' : 'aria-hidden="true"'}>
          <span class="af-caps" style="font-size: 13px; letter-spacing: 0.3em">Carta ${card.code}</span>
          <span style="color: var(--ink); opacity: 0.85">${lineArt(ART_BY_CATEGORY[card.cat] || 'sol', 110)}</span>
          <h1 class="af-title" style="font-size: 36px">${esc(card.title)}</h1>
          <p class="af-italic" style="margin: 0; font-size: 22px; line-height: 1.4">${esc(card.text)}</p>
          <span class="af-caps" style="margin-top: auto; align-self: stretch; border-top: 1px solid var(--af-line); padding-top: 12px; font-size: 13px">${esc(card.cat)}</span>
        </article>
      </div>
    </section>

    <a class="cta" href="#/entrada/nueva?carta=${card.n}"><span>Escribir sobre ella</span><span class="cta-dot" style="background: var(--bg-1)">${icon.pen({ size: 18, sw: 1.8 })}</span></a>
    <div class="grid-2">
      <button class="btn btn-ghost" id="fav" type="button" aria-pressed="${saved}">${saveLabel()}</button>
      <button class="btn btn-ghost" id="share" type="button">${icon.share()} Compartir</button>
    </div>

    <section style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px">
      <h2 class="h2" style="padding: 0 4px">Mis cartas guardadas</h2>
      ${favorites.length ? `<div class="grid-2">
        ${favorites.map((c) => `
        <a href="#/carta/${c.n}" class="af-card" style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; min-height: 190px; padding: 14px 10px 0; text-align: center">
          <span class="af-caps" style="font-size: 11px; color: var(--muted)">Carta ${c.code}</span>
          <span style="opacity: 0.8">${lineArt(ART_BY_CATEGORY[c.cat] || 'sol', 56)}</span>
          <strong class="af-title" style="font-size: 18px">${esc(c.title)}</strong>
          <span class="af-caps" style="align-self: stretch; border-top: 1px solid var(--af-line); padding: 8px 0; font-size: 11px">${esc(c.cat)}</span>
        </a>`).join('')}
      </div>` : '<p class="small" style="padding: 0 4px">Aún no guardas cartas. Las que guardes aparecerán aquí.</p>'}
    </section>
  </main>
  ${nav('universo')}`;

  const onClick = async (event) => {
    if (event.target.closest('#reveal')) {
      const flip = root.querySelector('#flip');
      flip.classList.add('open');
      flip.querySelector('.flip-back').setAttribute('aria-hidden', 'true');
      flip.querySelector('.flip-back').tabIndex = -1;
      flip.querySelector('.flip-front').removeAttribute('aria-hidden');
      await setSetting('revealedCard', revealKey);
      return;
    }
    const favBtn = event.target.closest('#fav');
    if (favBtn) {
      saved = !saved;
      if (saved) await put('favorites', new Date().toISOString(), card.n);
      else await remove('favorites', card.n);
      favBtn.innerHTML = saveLabel();
      favBtn.setAttribute('aria-pressed', String(saved));
      toast(saved ? 'Carta guardada' : 'Carta quitada de guardadas');
      return;
    }
    if (event.target.closest('#share')) {
      const text = `${card.title}\n\n${card.text}`;
      try {
        if (navigator.share) await navigator.share({ title: `Carta ${card.code}`, text });
        else {
          await navigator.clipboard.writeText(text);
          toast('Carta copiada');
        }
      } catch {
        /* El usuario canceló el menú de compartir. */
      }
    }
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
