import { get, put, getAll, remove, getSetting, getEntries } from '../db.js';
import { icon, nav, tabs, esc, chips, handleChip, dayKey, dayMonth, toast, uid, shrinkPhoto, refresh } from '../ui.js';
import { FOOD_FEELINGS, HUNGER } from '../data.js';

const GOAL = 8;
const TILES = ['var(--peach)', 'var(--sky)', 'var(--teal)', 'var(--lilac)', 'var(--blush)'];

export default async function nutricion(root) {
  const today = dayKey();
  const [water, meals, weightOn, weights] = await Promise.all([
    get('water', today),
    getAll('meals'),
    getSetting('weightEnabled', false),
    getEntries('weights'),
  ]);
  let glasses = water || 0;
  const todayMeals = meals.filter((m) => m.date === today).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const urls = [];
  const state = { feelings: [], hunger: 'Cómoda' };
  let photo = null;

  const glassesHTML = () => Array.from({ length: GOAL }, (_, i) => `<span class="${i < glasses ? 'on' : ''}"></span>`).join('');

  function mealTile(m, i) {
    let bg = `background: ${TILES[i % TILES.length]}`;
    let img = '';
    if (m.photo) {
      const url = URL.createObjectURL(m.photo);
      urls.push(url);
      img = `<img src="${url}" alt="" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover">`;
      bg = '';
    }
    return `<div style="position: relative; overflow: hidden; height: 140px; border-radius: 22px; ${bg}; padding: 10px; display: flex; flex-direction: column; justify-content: space-between">
      ${img}
      <div style="position: relative; display: flex; justify-content: space-between; align-items: flex-start">
        <span class="num" style="font-size: 12px; background: rgba(255,255,255,0.75); padding: 3px 7px; border-radius: 10px">${esc(m.time)}</span>
        <button type="button" data-delete="${m.id}" aria-label="Eliminar comida" style="width: 28px; height: 28px; border-radius: 14px; border: none; background: var(--ink); color: var(--on-dark); display: flex; align-items: center; justify-content: center">${icon.close({ size: 12, sw: 2.4 })}</button>
      </div>
      <div style="position: relative; background: rgba(255,255,255,0.8); border-radius: 12px; padding: 6px 8px">
        <strong style="font-size: 13px; font-weight: 600; line-height: 1.2; display: block">${esc(m.label || 'Comida')}</strong>
        ${m.feelings?.length ? `<span style="font-size: 11px; color: var(--muted)">${esc(m.feelings.join(', '))}</span>` : ''}
      </div>
    </div>`;
  }

  const sortedWeights = weights.sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  function weightChart() {
    if (sortedWeights.length < 2) return '';
    const values = sortedWeights.map(([, v]) => v);
    const min = Math.min(...values) - 0.5;
    const max = Math.max(...values) + 0.5;
    const points = values.map((v, i) => `${(i / (values.length - 1)) * 300},${70 - ((v - min) / (max - min)) * 60}`).join(' ');
    return `<svg viewBox="-6 0 312 80" width="100%" height="80" role="img" aria-label="Evolución del peso">
      <polyline points="${points}" fill="none" stroke="#A385C9" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
  }

  root.innerHTML = `
  <main class="screen">
    <header class="header"><div class="stack">
      <span class="eyebrow">Mi cuerpo</span>
      <h1 class="h1">Para conocerte, no para contar</h1>
    </div></header>
    ${tabs('cuerpo', 'nutricion')}

    <section class="card" aria-labelledby="agua">
      <div class="card-row">
        <h2 id="agua" class="h2">Hidratación</h2>
        <span class="num" style="font-size: 18px" id="water-count">${glasses}/${GOAL}</span>
      </div>
      <div class="stepper">
        <button type="button" id="water-minus" aria-label="Quitar un vaso">${icon.minus({ size: 18 })}</button>
        <div class="glasses" id="glasses" aria-hidden="true">${glassesHTML()}</div>
        <button type="button" class="dark" id="water-plus" aria-label="Añadir un vaso">${icon.plus({ size: 18 })}</button>
      </div>
    </section>

    <section aria-labelledby="diario-visual" style="display: flex; flex-direction: column; gap: 10px">
      <div class="card-row" style="padding: 0 4px">
        <h2 id="diario-visual" class="h2">Hoy comí</h2>
        <span class="small">Sin calorías</span>
      </div>
      ${todayMeals.length ? `<div class="grid-2" style="grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">${todayMeals.map(mealTile).join('')}</div>` : '<p class="small" style="padding: 0 4px">Aún no registras comidas hoy. Una foto basta.</p>'}
    </section>

    <form class="card" id="meal-form" aria-labelledby="nueva-comida">
      <h2 id="nueva-comida" class="h2">Añadir comida</h2>
      <div style="display: flex; gap: 10px; align-items: center">
        <label for="meal-photo" id="photo-slot" class="photo-add" style="width: 84px; flex-shrink: 0; position: relative; overflow: hidden">${icon.image({ size: 20 })}<span style="font-size: 12px">Foto</span></label>
        <input id="meal-photo" class="sr-only" type="file" accept="image/*">
        <div class="field" style="flex: 1">
          <label for="meal-label">¿Qué comiste? (opcional)</label>
          <input id="meal-label" class="mini-input" type="text" placeholder="Ej. bowl de verduras">
        </div>
      </div>
      <span class="small" style="font-weight: 700">¿Cómo te hizo sentir?</span>
      <div class="chips">${chips('feelings', FOOD_FEELINGS, state.feelings, { size: 'sm' })}</div>
      <span class="small" style="font-weight: 700">Hambre y saciedad al terminar</span>
      <div class="chips">${chips('hunger', HUNGER, state.hunger, { single: true, size: 'sm' })}</div>
      <button class="btn" type="submit">Guardar comida</button>
    </form>

    ${weightOn ? `
    <form class="card" id="weight-form" aria-labelledby="peso">
      <h2 id="peso" class="h2">Peso</h2>
      ${weightChart()}
      ${sortedWeights.length ? `<p class="small">Último registro: ${esc(String(sortedWeights[sortedWeights.length - 1][1]))} kg · ${dayMonth(sortedWeights[sortedWeights.length - 1][0])}</p>` : ''}
      <div class="form-grid">
        <label class="sr-only" for="weight">Peso en kilos</label>
        <input class="mini-input" id="weight" type="number" inputmode="decimal" step="0.1" min="20" max="300" placeholder="kg">
        <button class="btn sm" type="submit">Guardar</button>
      </div>
      <p class="small" style="font-size: 12px">Sin metas ni alertas. Puedes ocultarlo en Mi perfil.</p>
    </form>` : `
    <section class="card" style="background: rgba(255,255,255,0.4); border: 1px dashed rgba(47,42,49,0.18)">
      <h2 class="h2">Registro de peso</h2>
      <p class="small">Es opcional y está oculto. Si quieres usarlo, actívalo en <a href="#/perfil">Mi perfil</a>. Sin alertas ni metas de restricción.</p>
    </section>`}
  </main>
  ${nav('cuerpo')}`;

  const saveWater = async (n) => {
    glasses = Math.max(0, Math.min(20, n));
    await put('water', glasses, today);
    root.querySelector('#glasses').innerHTML = glassesHTML();
    root.querySelector('#water-count').textContent = `${glasses}/${GOAL}`;
  };

  const onClick = async (event) => {
    if (handleChip(event, root, state)) return;
    if (event.target.closest('#water-plus')) return saveWater(glasses + 1);
    if (event.target.closest('#water-minus')) return saveWater(glasses - 1);
    const del = event.target.closest('[data-delete]');
    if (del && confirm('¿Eliminar esta comida?')) {
      await remove('meals', del.dataset.delete);
      refresh();
    }
  };

  const onChange = async (event) => {
    if (event.target.id !== 'meal-photo') return;
    const file = event.target.files[0];
    if (!file) return;
    photo = await shrinkPhoto(file);
    const url = URL.createObjectURL(photo);
    urls.push(url);
    root.querySelector('#photo-slot').innerHTML = `<img src="${url}" alt="Foto de la comida" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover">`;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (event.target.id === 'meal-form') {
      const label = root.querySelector('#meal-label').value.trim();
      if (!label && !photo) {
        toast('Añade una foto o escribe qué comiste');
        return;
      }
      const now = new Date();
      await put('meals', {
        id: uid(),
        createdAt: now.toISOString(),
        date: today,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        label,
        photo,
        feelings: state.feelings,
        hunger: state.hunger,
      });
      toast('Comida guardada');
      refresh();
    }
    if (event.target.id === 'weight-form') {
      const value = Number(root.querySelector('#weight').value);
      if (!value) return;
      await put('weights', Math.round(value * 10) / 10, today);
      toast('Peso guardado');
      refresh();
    }
  };

  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  root.addEventListener('submit', onSubmit);
  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('change', onChange);
    root.removeEventListener('submit', onSubmit);
    urls.forEach((u) => URL.revokeObjectURL(u));
  };
}
