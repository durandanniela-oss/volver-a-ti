import { icon, nav, tabs } from '../ui.js';
import { PAUSES } from '../data.js';

const DOTS = ['var(--sky)', 'var(--lilac)', 'var(--teal)', 'var(--peach)', '#D7A674', '#C9A0A6', '#929F86'];

export default async function biblioteca(root) {
  root.innerHTML = `
  <main class="screen">
    <header class="header"><div class="stack">
      <span class="eyebrow">Mi bienestar</span>
      <h1 class="h1">Mi pausa</h1>
      <p class="lead" style="font-size: 15px">Una habitación tranquila. Sin rachas ni presión.</p>
    </div></header>
    ${tabs('bienestar', 'biblioteca')}

    <a href="#/pausa/ansiedad" class="card card-sig" style="text-decoration: none; color: inherit; flex-direction: row; align-items: center; min-height: 84px">
      <span style="flex: 1; display: flex; flex-direction: column; gap: 2px">
        <strong style="font-size: 20px; font-weight: 500">Necesito un momento</strong>
        <span style="font-size: 13px; font-weight: 500">Respira, sin distracciones</span>
      </span>
      <span aria-hidden="true" style="width: 56px; height: 56px; border-radius: 28px; background: var(--ink); color: var(--on-dark); display: flex; align-items: center; justify-content: center">${icon.play()}</span>
    </a>

    <section class="card" aria-labelledby="necesito" style="gap: 0">
      <h2 id="necesito" class="h2" style="padding-bottom: 6px">Necesito…</h2>
      ${PAUSES.map((p, i) => `
      <a class="row-link" href="${p.journal ? `#/entrada/nueva?q=${encodeURIComponent(p.journal)}` : `#/pausa/${p.id}`}">
        <span aria-hidden="true" style="width: 12px; height: 12px; border-radius: 6px; flex-shrink: 0; background: ${DOTS[i % DOTS.length]}"></span>
        <span style="flex: 1; display: flex; flex-direction: column; gap: 1px">
          <strong style="font-size: 15px; font-weight: 600">${p.need}</strong>
          <span class="small">${p.practice}</span>
        </span>
        <span class="num" style="font-size: 12px; color: var(--muted)">${p.minutes ? `${p.minutes} MIN` : 'LIBRE'}</span>
        ${icon.chevron({ size: 16 })}
      </a>`).join('')}
    </section>
  </main>
  ${nav('bienestar')}`;
}
