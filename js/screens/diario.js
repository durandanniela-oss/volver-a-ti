import { getAll } from '../db.js';
import { icon, nav, tabs, esc, shortDate, dayOfYear } from '../ui.js';
import { MOOD_ADJ, PROMPTS, cardByNumber } from '../data.js';

const FILTERS = [
  { id: 'todo', label: 'Todo', test: () => true },
  { id: 'fotos', label: 'Con fotos', test: (e) => e.photos?.length > 0 },
  { id: 'cartas', label: 'Cartas', test: (e) => !!e.carta },
];

export default async function diario(root) {
  const entries = (await getAll('entries')).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const prompt = PROMPTS[dayOfYear() % PROMPTS.length];
  const urls = [];
  let filter = 'todo';

  const photoURL = (blob) => {
    const url = URL.createObjectURL(blob);
    urls.push(url);
    return url;
  };

  function entryCard(entry) {
    const mood = entry.moods?.[0];
    const card = entry.carta ? cardByNumber(entry.carta) : null;
    const title = entry.title || (entry.prompt ? entry.prompt : 'Sin título');
    const excerpt = entry.text.length > 140 ? `${entry.text.slice(0, 140)}…` : entry.text;
    const photos = entry.photos || [];
    const shown = photos.slice(0, photos.length > 3 ? 2 : 3);
    // Con foto: la primera foto ocupa toda la tarjeta y el título va en una etiqueta translúcida.
    if (photos.length) {
      return `
    <a class="tile photo-tile" href="#/entrada/${encodeURIComponent(entry.id)}" style="min-height: 260px">
      <img src="${photoURL(photos[0].blob)}" alt="">
      ${photos.length > 1 ? `<span class="badge" style="position: absolute; top: 12px; right: 12px; margin: 0">+${photos.length - 1}</span>` : ''}
      <span class="frost-label">
        <strong>${esc(title)}</strong>
        ${excerpt ? `<span style="font-size: 13px; line-height: 1.35; opacity: 0.92">${esc(excerpt.length > 90 ? `${excerpt.slice(0, 90)}…` : excerpt)}</span>` : ''}
        <span class="when">${shortDate(entry.createdAt)}</span>
      </span>
    </a>`;
    }
    return `
    <a class="card entry" href="#/entrada/${encodeURIComponent(entry.id)}">
      <div class="card-row">
        <span class="eyebrow sm">${shortDate(entry.createdAt)}</span>
        ${card ? `<span class="tag lilac">Carta ${card.code}</span>` : mood ? `<span class="tag">${esc(MOOD_ADJ[mood] || mood)}</span>` : ''}
      </div>
      <h3>${esc(title)}</h3>
      ${excerpt ? `<p>${esc(excerpt)}</p>` : ''}
      ${photos.length ? `<div class="thumbs">
        ${shown.map((p) => `<div class="photo"><img src="${photoURL(p.blob)}" alt=""></div>`).join('')}
        ${photos.length > 3 ? `<div class="more" aria-label="${photos.length - 2} fotos más">+${photos.length - 2}</div>` : ''}
      </div>` : ''}
    </a>`;
  }

  function listHTML() {
    const active = FILTERS.find((f) => f.id === filter);
    const visible = entries.filter(active.test);
    if (!entries.length) {
      return `<div class="card empty"><strong style="font-size: 18px; font-weight: 500">Tu diario está en blanco</strong><p class="small">Escribe lo que quieras, cuando quieras. Puedes añadir fotos.</p></div>`;
    }
    if (!visible.length) return `<div class="card empty"><p class="small">No hay entradas con este filtro.</p></div>`;
    return visible.map(entryCard).join('');
  }

  root.innerHTML = `
  <main class="screen">
    <header class="header" style="align-items: flex-end">
      <div class="stack">
        <span class="eyebrow">Mi bienestar</span>
        <h1 class="h1">Mi diario</h1>
      </div>
      <span class="eyebrow sm" style="padding-bottom: 6px">${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'}</span>
    </header>

    ${tabs('bienestar', 'diario')}

    <section class="card card-sig" aria-labelledby="pregunta">
      <span class="eyebrow sm">Pregunta de hoy</span>
      <h2 id="pregunta" style="margin: 0; font-size: 22px; font-weight: 400; line-height: 1.25">${esc(prompt)}</h2>
      <a class="btn sm" href="#/entrada/nueva?prompt=1" style="align-self: flex-start">${icon.pen({ size: 16, sw: 1.8 })} Escribir</a>
    </section>

    <div class="chips" role="group" aria-label="Filtrar entradas">
      ${FILTERS.map((f) => `<button type="button" class="chip sm" data-filter="${f.id}" aria-pressed="${f.id === filter}">${f.label}</button>`).join('')}
    </div>

    <div id="list" style="display: flex; flex-direction: column; gap: 12px">${listHTML()}</div>
  </main>
  <a class="fab" href="#/entrada/nueva" aria-label="Nueva entrada">${icon.plus()}</a>
  ${nav('bienestar')}`;

  const onClick = (event) => {
    const btn = event.target.closest('[data-filter]');
    if (!btn) return;
    filter = btn.dataset.filter;
    root.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    root.querySelector('#list').innerHTML = listHTML();
  };
  root.addEventListener('click', onClick);

  return () => {
    root.removeEventListener('click', onClick);
    urls.forEach((url) => URL.revokeObjectURL(url));
  };
}
