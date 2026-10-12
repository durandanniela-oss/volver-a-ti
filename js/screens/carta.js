import { get, put, remove, getAllKeys, getSetting, setSetting } from '../db.js';
import { icon, nav, esc, dayOfYear, dayKey, toast, dotRing } from '../ui.js';
import { cardOfDay, cardByNumber } from '../data.js';
import { lineArt } from '../lineart.js';

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
          <span style="color: var(--on-dark)">${dotRing(120)}</span>
          <span class="dot-title" style="font-size: 24px; color: rgba(245, 240, 230, 0.85)">${isToday ? 'Tu carta<br>de hoy' : `Carta ${card.code}`}</span>
          <span style="font-size: 14px; color: var(--on-dark-muted)">Toca para revelarla</span>
        </button>
        <article class="flip-face flip-front" ${revealed ? '' : 'aria-hidden="true"'}>
          <div class="card-row">
            <span class="eyebrow">Carta ${card.code}</span>
            <span class="tag lilac" style="background: rgba(255,255,255,0.5)">${esc(card.cat)}</span>
          </div>
          <span class="reading-icon">${lineArt(ART_BY_CATEGORY[card.cat] || 'sol', 80)}</span>
          <h1 class="h1 xl" style="letter-spacing: -0.03em">${esc(card.title)}</h1>
          <p style="margin: 0; font-size: 21px; font-weight: 300; line-height: 1.4">${esc(card.text)}</p>
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
        ${favorites.map((c, i) => `
        <a href="#/carta/${c.n}" class="tile ${i % 3 === 0 ? 'tile-sig' : 'tile-glass'}" style="min-height: 160px; justify-content: space-between">
          <span class="eyebrow sm">Carta ${c.code}</span>
          <span class="reading-icon">${lineArt(ART_BY_CATEGORY[c.cat] || 'sol', 40)}</span>
          <strong style="font-size: 17px; font-weight: 500; line-height: 1.2">${esc(c.title)}</strong>
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
