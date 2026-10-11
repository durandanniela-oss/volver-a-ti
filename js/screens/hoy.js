import { get, put, getAll, getEntries, getSetting } from '../db.js';
import { icon, nav, esc, dayKey, dayOfYear, longDate, toast, uid, refresh, dotRing, timeAgo } from '../ui.js';
import { MOOD_ADJ, cardOfDay, energyMessage, movementSuggestion, PROMPTS } from '../data.js';
import { cycleToday, PHASE_COLORS } from '../cycle.js';
import { scheduledFor } from '../meds.js';

const FILTERS = [['todo', 'Todo'], ['cuerpo', 'Cuerpo'], ['mente', 'Mente'], ['universo', 'Universo']];

function feelingLine(checkin) {
  const words = (checkin.moods || []).map((m) => MOOD_ADJ[m]).filter(Boolean);
  if ((checkin.body || []).includes('Cansada')) words.push('algo cansada');
  if (!words.length) return 'Gracias por darte este momento.';
  const list = words.length > 1 ? `${words.slice(0, -1).join(', ')} y ${words[words.length - 1]}` : words[0];
  return `Hoy te sientes <strong>${esc(list)}</strong>.`;
}

const timeNow = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export default async function hoy(root) {
  const today = dayKey();
  const [checkin, name, periods, cycleLog, meds, doseList, ritualDay, skincare, entries] = await Promise.all([
    get('checkins', today), getSetting('name', ''), getAll('periods'), get('cycleLogs', today),
    getAll('meds'), getEntries('doses'), get('rituals', today), getSetting('skincare', null), getAll('entries'),
  ]);
  const doses = Object.fromEntries(doseList);
  const card = cardOfDay(dayOfYear());
  const prompt = PROMPTS[dayOfYear() % PROMPTS.length];
  const cycle = cycleToday(periods, today);

  const cramps = cycleLog && ((cycleLog.pain && !['Sin dolor', 'Leve'].includes(cycleLog.pain)) || cycleLog.symptoms?.includes('Cólicos'));
  const move = movementSuggestion(checkin && (cramps ? { ...checkin, body: [...(checkin.body || []), 'Con molestias'] } : checkin));
  const energy = checkin?.energy || 0;
  const anxious = checkin?.moods?.includes('Ansiedad');

  // Lista "Para hoy": check-in, dosis programadas y rutina facial.
  const mode = new Date().getHours() < 15 ? 'morning' : 'night';
  const steps = skincare?.[mode] || [];
  const doneSteps = (ritualDay?.[mode] || []).filter((id) => steps.some((s) => s.id === id)).length;
  const todo = [
    ...(!checkin ? [{ href: '#/checkin', label: 'Check-in de hoy', done: false }] : []),
    ...scheduledFor(meds, today).map((d) => ({ key: d.key, label: d.med.name, when: d.time, done: doses[d.key]?.status === 'taken' })),
    ...(steps.length ? [{ href: '#/rituales', label: `Rutina de ${mode === 'morning' ? 'mañana' : 'noche'}`, when: `${doneSteps}/${steps.length}`, done: doneSteps === steps.length }] : [{ href: '#/rituales', label: 'Configura tus rituales', done: false }]),
  ].slice(0, 5);

  // La foto más reciente del diario.
  const sortedEntries = [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const withPhoto = sortedEntries.find((e) => e.photos?.length);
  const lastEntry = sortedEntries[0];
  const photoURL = withPhoto ? URL.createObjectURL(withPhoto.photos[0].blob) : null;

  const check = (item) => {
    const inner = `<span class="ring">${item.done ? icon.check({ size: 12 }) : ''}</span><span class="t">${esc(item.label)}${item.when ? `<span class="when" style="display: block">${esc(item.when)}</span>` : ''}</span>`;
    if (item.key) {
      return item.done
        ? `<span class="check-pill done">${inner}</span>`
        : `<button type="button" class="check-pill" data-take="${esc(item.key)}" aria-label="Marcar ${esc(item.label)} de las ${esc(item.when)} como tomada">${inner}</button>`;
    }
    return `<a class="check-pill ${item.done ? 'done' : ''}" href="${item.href}">${inner}</a>`;
  };

  const tiles = [
    !checkin && `
    <a class="tile tile-sig span-2" data-cat="mente" href="#/checkin" style="min-height: 120px">
      <span class="eyebrow sm">Check-in</span>
      <strong style="font-size: 22px; font-weight: 400">¿Cómo te sientes hoy?</strong>
      <span class="small" style="color: #3A362E">Menos de un minuto. Sin respuestas correctas.</span>
    </a>`,

    `<section class="tile tile-dark row-2" data-cat="cuerpo" aria-labelledby="para-hoy">
      <h2 id="para-hoy" class="dot-title" style="font-size: 28px">Para<br>hoy</h2>
      <div style="display: flex; flex-direction: column; gap: 6px; margin-top: auto">
        ${todo.map(check).join('')}
      </div>
    </section>`,

    withPhoto ? `
    <a class="tile photo-tile" data-cat="mente" href="#/entrada/${encodeURIComponent(withPhoto.id)}">
      <img src="${photoURL}" alt="">
      <span class="frost-label"><strong>${esc(withPhoto.title || 'Mi diario')}</strong><span class="when">${esc(timeAgo(withPhoto.createdAt).toUpperCase())}</span></span>
    </a>` : `
    <a class="tile tile-glass" data-cat="mente" href="#/diario" style="justify-content: space-between">
      <span class="eyebrow sm">Mi diario</span>
      <strong style="font-size: 20px; font-weight: 400; line-height: 1.2">${lastEntry ? esc(lastEntry.title || lastEntry.prompt || 'Tu última entrada') : 'Tus fotos y palabras'}</strong>
      <span class="eyebrow sm" style="opacity: 0.7">${lastEntry ? esc(timeAgo(lastEntry.createdAt)) : 'Empieza hoy'}</span>
    </a>`,

    `<a class="tile tile-glass" data-cat="cuerpo" href="#/ciclo" style="justify-content: space-between">
      <span class="eyebrow sm">Mi ciclo</span>
      ${cycle ? `
      <span class="dot-title" style="font-size: 34px; color: ${PHASE_COLORS[cycle.phase]}">${cycle.day}</span>
      <span><strong style="display: block; font-size: 15px; font-weight: 600">Fase ${cycle.phase.toLowerCase()}</strong>
      <span class="small" style="font-size: 12px">${cycle.daysToNext >= 0 ? `Periodo en ~${cycle.daysToNext} días` : 'Fuera de tu promedio'}</span></span>` : `
      <strong style="font-size: 16px; font-weight: 500">Registra tu ciclo</strong>`}
    </a>`,

    `<a class="tile tile-sig span-2" data-cat="universo" href="#/carta" style="min-height: 170px; justify-content: space-between">
      <span class="dot-ring" style="right: 16px; top: 14px">${dotRing(64)}</span>
      <span class="eyebrow sm">Carta ${card.code} · ${esc(card.cat)}</span>
      <span class="dot-title" style="font-size: ${card.title.length > 14 ? 22 : 28}px; max-width: 72%">${esc(card.title)}</span>
      <span style="font-size: 13px; font-weight: 600">Leer tu carta del día</span>
    </a>`,

    `<section class="tile tile-glass" data-cat="cuerpo" aria-label="Energía disponible: ${energy || 'sin registrar'} de 5">
      <span class="eyebrow sm">Energía</span>
      <span class="dot-title" style="font-size: 34px">${energy || '–'}/5</span>
      <div class="bar" aria-hidden="true" style="margin-top: auto">${[1, 2, 3, 4, 5].map((n) => `<span class="${n <= energy ? 'on' : ''}"></span>`).join('')}</div>
    </section>`,

    `<a class="tile tile-glass" data-cat="mente" href="${anxious ? '#/pausa/ansiedad' : '#/biblioteca'}" style="justify-content: space-between">
      <span class="dot-ring" style="right: 12px; top: 12px; opacity: 0.45">${dotRing(44)}</span>
      <span class="eyebrow sm">Mi pausa</span>
      <strong style="font-size: 17px; font-weight: 500; line-height: 1.2">${anxious ? 'Respiración guiada · 3 min' : 'Necesito un momento'}</strong>
      <span class="small" style="font-size: 12px">${anxious ? 'Registraste ansiedad' : 'Respira sin distracciones'}</span>
    </a>`,

    move && `
    <a class="tile tile-dark span-2" data-cat="cuerpo" href="#/movimiento" style="min-height: 0">
      <div class="card-row"><span class="eyebrow sm" style="color: #EADFCB">Movimiento consciente</span><span class="small">${move.time}</span></div>
      <strong style="font-size: 22px; font-weight: 400">${move.name}</strong>
      <span class="small" style="font-size: 13px">${esc(move.why)}</span>
    </a>`,

    `<section class="tile tile-glass span-2" data-cat="mente" aria-labelledby="escribir" style="min-height: 0">
      <div class="card-row">
        <h2 id="escribir" class="h2">Un espacio para escribir</h2>
        <a class="link-pill" href="#/diario">${icon.image({ size: 14, sw: 1.8 })} Mi diario</a>
      </div>
      <label for="quick" class="small">${esc(prompt)}</label>
      <textarea id="quick" class="textarea" rows="3" style="font-size: 20px" placeholder="Escribe algo…"></textarea>
      <button class="btn sm" id="quick-save" type="button" style="align-self: flex-start">Guardar en mi diario</button>
    </section>`,
  ].filter(Boolean);

  const total = tiles.length;

  root.innerHTML = `
  <main class="screen with-pill">
    <header class="header">
      <div class="stack">
        <span class="eyebrow">${longDate()}</span>
        <h1 class="h1">Hola${name ? `, ${esc(name)}` : ''}</h1>
        <p class="lead" style="font-size: 15px">${checkin ? `${feelingLine(checkin)} ${energyMessage(energy).split('.')[0]}.` : 'Aún no haces tu check-in de hoy.'}</p>
      </div>
      <a class="icon-btn" href="#/checkin" aria-label="${checkin ? 'Editar check-in' : 'Hacer check-in'}">${icon.pen({ size: 20 })}</a>
    </header>

    <div class="chips" role="group" aria-label="Mostrar">
      ${FILTERS.map(([id, label], i) => `<button type="button" class="chip sm" data-filter="${id}" aria-pressed="${i === 0}">${i === 0 ? `<span class="badge">${total}</span>` : ''}${label}</button>`).join('')}
    </div>

    <div class="bento" id="bento">${tiles.join('')}</div>
  </main>
  <div class="quick-pill" role="group" aria-label="Acciones rápidas">
    <a class="main" href="#/entrada/nueva" aria-label="Nueva entrada en el diario">${icon.plus()}</a>
    <a href="#/entrada/nueva?voz=1" aria-label="Dictar una entrada">${icon.mic()}</a>
  </div>
  ${nav('hoy')}`;

  const onClick = async (event) => {
    const filter = event.target.closest('[data-filter]');
    if (filter) {
      const cat = filter.dataset.filter;
      root.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === filter)));
      root.querySelectorAll('#bento > [data-cat]').forEach((tile) => { tile.hidden = cat !== 'todo' && tile.dataset.cat !== cat; });
      return;
    }
    const take = event.target.closest('[data-take]');
    if (take) {
      await put('doses', { status: 'taken', at: timeNow() }, take.dataset.take);
      toast('Toma registrada');
      refresh();
      return;
    }
    if (!event.target.closest('#quick-save')) return;
    const textarea = root.querySelector('#quick');
    const text = textarea.value.trim();
    if (!text) {
      toast('Escribe algo primero');
      textarea.focus();
      return;
    }
    const now = new Date().toISOString();
    await put('entries', { id: uid(), createdAt: now, updatedAt: now, title: '', text, prompt, moods: checkin?.moods || [], carta: null, photos: [] });
    textarea.value = '';
    toast('Guardado en tu diario');
  };
  root.addEventListener('click', onClick);
  return () => {
    root.removeEventListener('click', onClick);
    if (photoURL) URL.revokeObjectURL(photoURL);
  };
}
