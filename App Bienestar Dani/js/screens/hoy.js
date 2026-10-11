import { get, put, getSetting } from '../db.js';
import { icon, nav, esc, dayKey, dayOfYear, toast, uid } from '../ui.js';
import { MOOD_ADJ, cardOfDay, energyMessage, movementSuggestion, PROMPTS } from '../data.js';

function feelingLine(checkin) {
  const words = (checkin.moods || []).map((m) => MOOD_ADJ[m]).filter(Boolean);
  if ((checkin.body || []).includes('Cansada')) words.push('algo cansada');
  if (!words.length) return 'Gracias por darte este momento.';
  const list = words.length > 1 ? `${words.slice(0, -1).join(', ')} y ${words[words.length - 1]}` : words[0];
  return `Hoy te sientes <strong>${esc(list)}</strong>.`;
}

export default async function hoy(root) {
  const today = dayKey();
  const [checkin, name] = await Promise.all([get('checkins', today), getSetting('name', '')]);
  const card = cardOfDay(dayOfYear());
  const prompt = PROMPTS[dayOfYear() % PROMPTS.length];
  const move = movementSuggestion(checkin);
  const energy = checkin?.energy || 0;
  const anxious = checkin?.moods?.includes('Ansiedad');

  root.innerHTML = `
  <main class="screen">
    <header class="header">
      <div class="stack">
        <span class="eyebrow">Mi día</span>
        <h1 class="h1">Hola${name ? `, ${esc(name)}` : ''}</h1>
        <p class="lead" style="font-size: 15px">${checkin ? feelingLine(checkin) : 'Aún no haces tu check-in de hoy.'}</p>
      </div>
      <a class="icon-btn" href="#/checkin" aria-label="${checkin ? 'Editar check-in' : 'Hacer check-in'}">${icon.pen({ size: 20 })}</a>
    </header>

    ${checkin ? '' : `
    <a class="card card-sig" href="#/checkin" style="text-decoration: none; color: inherit">
      <span class="eyebrow sm">Check-in</span>
      <strong style="font-size: 22px; font-weight: 400">¿Cómo te sientes hoy?</strong>
      <span class="small">Menos de un minuto. Sin respuestas correctas.</span>
    </a>`}

    <section class="card" aria-label="Energía disponible">
      <div class="card-row">
        <h2 class="h2">Energía disponible</h2>
        <span class="num" style="font-size: 22px">${energy || '–'}/5</span>
      </div>
      <div class="bar" aria-hidden="true">${[1, 2, 3, 4, 5].map((n) => `<span class="${n <= energy ? 'on' : ''}"></span>`).join('')}</div>
      <p class="small">${energyMessage(energy)}</p>
    </section>

    <a class="card card-sig" href="#/carta" style="text-decoration: none; color: inherit; min-height: 170px; justify-content: space-between">
      <span class="eyebrow sm">Carta ${card.code}</span>
      <div style="display: flex; flex-direction: column; gap: 6px">
        <strong style="font-size: 24px; font-weight: 400; line-height: 1.15">${esc(card.title)}</strong>
        <span style="font-size: 13px; font-weight: 600">Leer tu carta del día</span>
      </div>
    </a>

    ${anxious ? `
    <a class="card" href="#/pausa" style="text-decoration: none; color: inherit; flex-direction: row; align-items: center">
      <span style="flex: 1; display: flex; flex-direction: column; gap: 2px">
        <strong style="font-size: 16px; font-weight: 600">Respiración guiada · 3 min</strong>
        <span class="small">Registraste ansiedad. Una pausa corta puede ayudarte.</span>
      </span>
      <span class="icon-btn" aria-hidden="true">${icon.play()}</span>
    </a>` : ''}

    ${move ? `
    <section class="card card-dark" aria-label="Movimiento sugerido">
      <div class="card-row">
        <span class="eyebrow sm" style="color: #E6DDF6">Movimiento consciente</span>
        <span class="small">${move.time}</span>
      </div>
      <h2 style="margin: 0; font-size: 24px; font-weight: 400">${move.name}</h2>
      <p class="small" style="font-size: 14px">${esc(move.why)} Otra opción: ${move.alt}.</p>
      <p class="small" style="font-size: 12px">Es una sugerencia; escucha siempre a tu cuerpo.</p>
    </section>` : ''}

    <section class="card" aria-labelledby="escribir">
      <div class="card-row">
        <h2 id="escribir" class="h2">Un espacio para escribir</h2>
        <a class="link-pill" href="#/diario">${icon.image({ size: 14, sw: 1.8 })} Mi diario</a>
      </div>
      <label for="quick" class="small">${esc(prompt)}</label>
      <textarea id="quick" class="textarea" rows="3" style="font-size: 20px" placeholder="Escribe algo…"></textarea>
      <button class="btn sm" id="quick-save" type="button" style="align-self: flex-start">Guardar en mi diario</button>
    </section>

    <a href="#/pausa" class="btn btn-ghost block" style="background: rgba(255,255,255,0.7); border-color: var(--glass-border)">
      <span aria-hidden="true" style="width: 14px; height: 14px; border-radius: 50%; background: var(--sig)"></span>
      Necesito un momento
    </a>
  </main>
  ${nav('hoy')}`;

  const onClick = async (event) => {
    if (!event.target.closest('#quick-save')) return;
    const textarea = root.querySelector('#quick');
    const text = textarea.value.trim();
    if (!text) {
      toast('Escribe algo primero');
      textarea.focus();
      return;
    }
    const now = new Date().toISOString();
    await put('entries', {
      id: uid(),
      createdAt: now,
      updatedAt: now,
      title: '',
      text,
      prompt,
      moods: checkin?.moods || [],
      carta: null,
      photos: [],
    });
    textarea.value = '';
    toast('Guardado en tu diario');
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
