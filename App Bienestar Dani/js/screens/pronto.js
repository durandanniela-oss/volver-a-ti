import { nav } from '../ui.js';

const UNIVERSES = {
  cuerpo: { title: 'Mi cuerpo', text: 'Ciclo menstrual, movimiento, nutrición y medicamentos llegan en la siguiente fase.', nav: 'cuerpo' },
  rituales: { title: 'Mis rituales', text: 'Skincare, autocuidado y pequeños rituales llegan pronto.', nav: 'rituales' },
};

export default async function pronto(root, { params }) {
  const u = UNIVERSES[params[0]] || UNIVERSES.cuerpo;
  root.innerHTML = `
  <main class="screen">
    <header class="header"><div class="stack">
      <span class="eyebrow">Muy pronto</span>
      <h1 class="h1">${u.title}</h1>
    </div></header>
    <section class="card card-sig" style="min-height: 200px; justify-content: flex-end">
      <p style="margin: 0; font-size: 20px; line-height: 1.35">${u.text}</p>
    </section>
    <a class="btn btn-ghost block" href="#/hoy">Volver a Mi día</a>
  </main>
  ${nav(u.nav)}`;
}
