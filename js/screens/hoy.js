import { get, put, getAll, getEntries, getSetting } from '../db.js';
import { icon, nav, esc, dayKey, dayOfYear, toast, uid, refresh } from '../ui.js';
import { MOOD_ADJ, cardOfDay, energyMessage, movementSuggestion, PROMPTS } from '../data.js';
import { cycleToday, PHASE_COLORS } from '../cycle.js';
import { scheduledFor } from '../meds.js';

function feelingLine(checkin) {
  const words = (checkin.moods || []).map((m) => MOOD_ADJ[m]).filter(Boolean);
  if ((checkin.body || []).includes('Cansada')) words.push('algo cansada');
  if (!words.length) return 'Gracias por darte este momento.';
  const list = words.length > 1 ? `${words.slice(0, -1).join(', ')} y ${words[words.length - 1]}` : words[0];
  return `Hoy te sientes <strong>${esc(list)}</strong>.`;
}

export default async function hoy(root) {
  const today = dayKey();
  const [checkin, name, periods, cycleLog, meds, doseList, ritualDay, skincare] = await Promise.all([
    get('checkins', today), getSetting('name', ''), getAll('periods'), get('cycleLogs', today),
    getAll('meds'), getEntries('doses'), get('rituals', today), getSetting('skincare', null),
  ]);
  const doses = Object.fromEntries(doseList);
  const card = cardOfDay(dayOfYear());
  const prompt = PROMPTS[dayOfYear() % PROMPTS.length];
  const cycle = cycleToday(periods, today);

  // Los cólicos o el dolor del registro del ciclo también cuentan como molestias.
  const cramps = cycleLog && ((cycleLog.pain && !['Sin dolor', 'Leve'].includes(cycleLog.pain)) || cycleLog.symptoms?.includes('Cólicos'));
  const move = movementSuggestion(checkin && (cramps ? { ...checkin, body: [...(checkin.body || []), 'Con molestias'] } : checkin));
  const energy = checkin?.energy || 0;
  const anxious = checkin?.moods?.includes('Ansiedad');

  const pending = scheduledFor(meds, today).filter((d) => !doses[d.key]);
  const mode = new Date().getHours() < 15 ? 'morning' : 'night';
  const steps = skincare?.[mode] || [];
  const doneSteps = (ritualDay?.[mode] || []).filter((id) => steps.some((s) => s.id === id)).length;

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

    <div class="grid-2">
      <a class="card" href="#/ciclo" style="text-decoration: none; color: inherit; min-height: 180px; justify-content: space-between; padding: 16px">
        <span class="small" style="font-weight: 600">Mi ciclo</span>
        ${cycle ? `
        <span aria-hidden="true" style="width: 64px; height: 64px; border-radius: 50%; background: conic-gradient(${PHASE_COLORS[cycle.phase]} 0deg ${Math.min(360, (cycle.day / Math.max(cycle.cycleLength, cycle.day)) * 360)}deg, rgba(47,42,49,0.08) 0deg); display: flex; align-items: center; justify-content: center">
          <span class="num" style="width: 50px; height: 50px; border-radius: 50%; background: #FAF2FE; display: flex; align-items: center; justify-content: center; font-size: 18px">${cycle.day}</span>
        </span>
        <span><strong style="display: block; font-size: 16px; font-weight: 600">Fase ${cycle.phase.toLowerCase()}</strong>
        <span class="small" style="font-size: 12px">${cycle.daysToNext >= 0 ? `Periodo en ~${cycle.daysToNext} días (estimado)` : 'Fuera de tu promedio'}</span></span>` : `
        <strong style="font-size: 16px; font-weight: 500">Registra tu ciclo para conocer tu fase</strong>`}
      </a>
      <a class="card card-sig" href="#/carta" style="text-decoration: none; color: inherit; min-height: 180px; justify-content: space-between; padding: 16px">
        <span class="eyebrow sm">Carta ${card.code}</span>
        <span><strong style="display: block; font-size: 20px; font-weight: 400; line-height: 1.15">${esc(card.title)}</strong>
        <span style="font-size: 12px; font-weight: 600">Leer tu carta</span></span>
      </a>
    </div>

    ${anxious ? `
    <a class="card" href="#/pausa/ansiedad" style="text-decoration: none; color: inherit; flex-direction: row; align-items: center">
      <span style="flex: 1; display: flex; flex-direction: column; gap: 2px">
        <strong style="font-size: 16px; font-weight: 600">Respiración guiada · 3 min</strong>
        <span class="small">Registraste ansiedad. Una pausa corta puede ayudarte.</span>
      </span>
      <span class="icon-btn" aria-hidden="true">${icon.play()}</span>
    </a>` : ''}

    ${move ? `
    <a class="card card-dark" href="#/movimiento" style="text-decoration: none" aria-label="Movimiento sugerido: ${esc(move.name)}">
      <div class="card-row">
        <span class="eyebrow sm" style="color: #E6DDF6">Movimiento consciente</span>
        <span class="small">${move.time}</span>
      </div>
      <h2 style="margin: 0; font-size: 24px; font-weight: 400">${move.name}</h2>
      <p class="small" style="font-size: 14px">${esc(move.why)} Otra opción: ${move.alt}.</p>
      <p class="small" style="font-size: 12px">Es una sugerencia; escucha siempre a tu cuerpo.</p>
    </a>` : ''}

    <section class="card" aria-labelledby="pendientes" style="gap: 4px">
      <h2 id="pendientes" class="h2" style="padding-bottom: 6px">Medicamentos y rutinas</h2>
      ${pending.map((d) => `
      <div class="list-row">
        <span class="num" style="font-size: 13px; width: 46px">${esc(d.time)}</span>
        <span style="flex: 1; font-size: 15px">${esc(d.med.name)}</span>
        <button type="button" class="btn sm" data-take="${esc(d.key)}" style="height: 38px; padding: 0 14px">Tomada</button>
      </div>`).join('')}
      ${steps.length ? `
      <a class="row-link" href="#/rituales">
        <span class="num" style="font-size: 13px; width: 46px">${doneSteps}/${steps.length}</span>
        <span style="flex: 1; font-size: 15px">Rutina facial de ${mode === 'morning' ? 'mañana' : 'noche'}</span>
        ${icon.chevron()}
      </a>` : `
      <a class="row-link" href="#/rituales"><span style="flex: 1; font-size: 15px">Configura tus rituales</span>${icon.chevron()}</a>`}
      ${!meds.length ? '<a class="row-link" href="#/medicamento/nuevo"><span style="flex: 1; font-size: 15px; color: var(--muted)">Añadir un medicamento</span>' + icon.chevron() + '</a>' : ''}
    </section>

    <section class="card" aria-labelledby="escribir">
      <div class="card-row">
        <h2 id="escribir" class="h2">Un espacio para escribir</h2>
        <a class="link-pill" href="#/diario">${icon.image({ size: 14, sw: 1.8 })} Mi diario</a>
      </div>
      <label for="quick" class="small">${esc(prompt)}</label>
      <textarea id="quick" class="textarea" rows="3" style="font-size: 20px" placeholder="Escribe algo…"></textarea>
      <button class="btn sm" id="quick-save" type="button" style="align-self: flex-start">Guardar en mi diario</button>
    </section>

    <a href="#/pausa/ansiedad" class="btn btn-ghost block" style="background: rgba(255,255,255,0.7); border-color: var(--glass-border)">
      <span aria-hidden="true" style="width: 14px; height: 14px; border-radius: 50%; background: var(--sig)"></span>
      Necesito un momento
    </a>
  </main>
  ${nav('hoy')}`;

  const onClick = async (event) => {
    const take = event.target.closest('[data-take]');
    if (take) {
      const d = new Date();
      await put('doses', { status: 'taken', at: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` }, take.dataset.take);
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
