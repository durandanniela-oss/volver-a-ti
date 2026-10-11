import { get, put, remove, getAllKeys } from '../db.js';
import { icon, nav, esc, dayOfYear, toast } from '../ui.js';
import { cardOfDay, cardByNumber } from '../data.js';

const TINTS = ['var(--sky)', 'var(--peach)', 'var(--lilac)', 'var(--teal)', 'var(--blush)'];

export default async function carta(root, { params }) {
  const card = params[0] ? cardByNumber(params[0]) || cardOfDay(dayOfYear()) : cardOfDay(dayOfYear());
  const isToday = card.n === cardOfDay(dayOfYear()).n;
  let saved = !!(await get('favorites', card.n));
  const favorites = (await getAllKeys('favorites')).map(cardByNumber).filter(Boolean);

  const saveLabel = () => `${icon.bookmark()} ${saved ? 'Guardada' : 'Guardar'}`;

  root.innerHTML = `
  <main class="screen">
    <section class="card card-sig" style="min-height: 440px; padding: 24px 22px; gap: 20px">
      <div class="card-row">
        <span class="eyebrow">${isToday ? 'Carta de hoy' : 'Carta'} ${card.code}</span>
        <span class="tag lilac" style="background: rgba(255,255,255,0.5)">${esc(card.cat)}</span>
      </div>
      <h1 class="h1 xl" style="margin-top: 24px; letter-spacing: -0.03em">${esc(card.title)}</h1>
      <p style="margin: 0; font-size: 22px; font-weight: 300; line-height: 1.4">${esc(card.text)}</p>
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
        <a href="#/carta/${c.n}" style="height: 150px; border-radius: 24px; padding: 14px; text-decoration: none; color: var(--ink); background: ${TINTS[i % TINTS.length]}; display: flex; flex-direction: column; justify-content: space-between">
          <span class="eyebrow sm">Carta ${c.code}</span>
          <strong style="font-size: 18px; font-weight: 500; line-height: 1.15">${esc(c.title)}</strong>
        </a>`).join('')}
      </div>` : '<p class="small" style="padding: 0 4px">Aún no guardas cartas. Las que guardes aparecerán aquí.</p>'}
    </section>
  </main>
  ${nav('universo')}`;

  const onClick = async (event) => {
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
