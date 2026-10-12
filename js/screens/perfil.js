import { getSetting, setSetting, exportAll, importAll, wipeAll, isPersisted, requestPersistence, getAll } from '../db.js';
import { icon, esc, dayKey, toast, chips, handleChip, toggle, refresh } from '../ui.js';
import { buildCalendar } from '../calendar.js';
import { hasPin, setPin, checkPin, removePin } from '../lock.js';

const GOALS = ['Dormir mejor', 'Menos ansiedad', 'Entender mi ciclo', 'Moverme con gusto', 'Escribir más', 'Comer con calma', 'Cuidarme más'];

async function shareOrDownload(file, title = 'Copia de Volver a ti') {
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default async function perfil(root) {
  const [name, persisted, entries, lastBackup, goals, astrology, weight, birthDate, reminders, meds, pinOn, birthTime] = await Promise.all([
    getSetting('name', ''),
    isPersisted(),
    getAll('entries'),
    getSetting('lastBackup', null),
    getSetting('goals', []),
    getSetting('astrologyEnabled', true),
    getSetting('weightEnabled', false),
    getSetting('birthDate', ''),
    getSetting('reminders', { checkinTime: '08:30', eveningTime: '21:30', includeMeds: true, showNames: false }),
    getAll('meds'),
    hasPin(),
    getSetting('birthTime', ''),
  ]);
  const state = { goals: [...goals] };
  const photoCount = entries.reduce((n, e) => n + (e.photos?.length || 0), 0);

  root.innerHTML = `
  <main class="screen no-nav">
    <header class="topbar">
      <a class="icon-btn" href="#/hoy" aria-label="Volver a Mi día">${icon.back()}</a>
      <span class="eyebrow">Mi perfil</span>
      <span style="width: 44px"></span>
    </header>

    <form class="card" id="name-form">
      <div class="field">
        <label for="name">Tu nombre</label>
        <input id="name" class="input" type="text" autocomplete="given-name" value="${esc(name)}" placeholder="¿Cómo te llamamos?">
      </div>
      <button class="btn sm" type="submit" style="align-self: flex-start">Guardar</button>
    </form>

    <section class="card" aria-labelledby="objetivos">
      <h2 id="objetivos" class="h2">Mis objetivos</h2>
      <div class="chips">${chips('goals', GOALS, state.goals, { size: 'sm' })}</div>
    </section>

    <section class="card" aria-labelledby="personal" style="gap: 0">
      <h2 id="personal" class="h2" style="padding-bottom: 6px">Personalización</h2>
      ${toggle('astrologyEnabled', astrology, 'Astrología y horóscopo')}
      ${toggle('weightEnabled', weight, 'Registro de peso (opcional)')}
      <label class="switch-row" for="birthDate"><span>Fecha de nacimiento<span class="small" style="display: block; font-size: 12px">Para tu signo solar</span></span>
        <input type="date" class="mini-input" id="birthDate" value="${esc(birthDate)}" style="width: 160px"></label>
      <label class="switch-row" for="birthTime"><span>Hora de nacimiento<span class="small" style="display: block; font-size: 12px">Opcional, para tu Luna natal</span></span>
        <input type="time" class="mini-input" id="birthTime" value="${esc(birthTime)}" style="width: 160px"></label>
    </section>

    <form class="card" id="reminders-form" aria-labelledby="recordatorios">
      <h2 id="recordatorios" class="h2">Recordatorios en tu Calendario</h2>
      <p class="small">La app crea eventos diarios con aviso. Agrégalos una vez al Calendario de Apple y te avisará a la hora, también en tu Apple Watch.</p>
      <div class="form-grid">
        <div class="field"><label for="checkinTime">Check-in</label><input class="mini-input" id="checkinTime" type="time" value="${esc(reminders.checkinTime || '')}"></div>
        <div class="field"><label for="eveningTime">Cierre del día</label><input class="mini-input" id="eveningTime" type="time" value="${esc(reminders.eveningTime || '')}"></div>
      </div>
      ${toggle('includeMeds', reminders.includeMeds, `Mis tomas de medicamentos${meds.filter((m) => m.active && m.frequency === 'Diario').length ? '' : ' (aún no tienes)'}`)}
      ${toggle('showNames', reminders.showNames, 'Mostrar el nombre del medicamento')}
      <button class="btn" type="submit">${icon.share()} Agregar al Calendario</button>
      <p class="small" style="font-size: 12px">Si cambias tus horarios o medicamentos, vuelve a agregarlos y borra los anteriores en el Calendario.</p>
    </form>

    <form class="card" id="pin-form" aria-labelledby="bloqueo">
      <h2 id="bloqueo" class="h2" style="display: flex; align-items: center; gap: 8px">${icon.lock({ size: 16 })} Bloqueo con código</h2>
      <p class="small">${pinOn ? 'Activo. La app pide tu código al abrirla y si estuvo en segundo plano más de un minuto.' : 'Pide un código de 4 números para abrir la app. Si lo olvidas, tendrás que borrar los datos y restaurar una copia.'}</p>
      ${pinOn ? '<div class="field"><label for="pin-current">Código actual</label><input class="mini-input" id="pin-current" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off"></div>' : ''}
      <div class="form-grid">
        <div class="field"><label for="pin-new">${pinOn ? 'Nuevo código' : 'Código'}</label><input class="mini-input" id="pin-new" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off"></div>
        <div class="field"><label for="pin-repeat">Repítelo</label><input class="mini-input" id="pin-repeat" type="password" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off"></div>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap">
        <button class="btn sm" type="submit">${pinOn ? 'Cambiar código' : 'Activar código'}</button>
        ${pinOn ? '<button class="btn sm btn-ghost" type="button" id="pin-remove">Quitar código</button>' : ''}
      </div>
    </form>

    <section class="card card-dark" aria-labelledby="datos">
      <h2 id="datos" class="h2" style="display: flex; align-items: center; gap: 8px">${icon.lock({ size: 16 })} Tus datos</h2>
      <p class="small" style="font-size: 14px">Todo se guarda solo en este dispositivo: ${entries.length} ${entries.length === 1 ? 'entrada' : 'entradas'} y ${photoCount} ${photoCount === 1 ? 'foto' : 'fotos'}. Nadie más puede verlos, pero si borras los datos de Safari o cambias de teléfono, se pierden. Haz una copia de vez en cuando.</p>
      <p class="small">Protección contra borrado automático: <strong style="color: var(--on-dark)">${persisted ? 'activa' : 'no confirmada'}</strong>${lastBackup ? ` · Última copia: ${esc(lastBackup)}` : ' · Aún no haces una copia'}</p>
      <button class="btn btn-sig" id="export" type="button">${icon.share()} Hacer copia de seguridad</button>
      <label class="btn btn-ghost" for="import-file">Restaurar una copia</label>
      <input id="import-file" class="sr-only" type="file" accept="application/json,.json">
    </section>

    <button class="btn btn-danger block" id="wipe" type="button">${icon.trash()} Borrar todos mis datos</button>
    <p class="small" style="padding: 0 6px">Volver a ti ofrece sugerencias orientativas. No es un diagnóstico ni sustituye atención profesional.</p>
  </main>`;

  if (!persisted) requestPersistence();

  const value = (sel) => root.querySelector(sel)?.value.trim() || '';

  const onSubmit = async (event) => {
    const { id } = event.target;
    if (!['name-form', 'reminders-form', 'pin-form'].includes(id)) return;
    event.preventDefault();
    if (id === 'name-form') {
      await setSetting('name', value('#name'));
      toast('Nombre guardado');
      return;
    }
    if (id === 'reminders-form') {
      const options = {
        checkinTime: value('#checkinTime'),
        eveningTime: value('#eveningTime'),
        includeMeds: root.querySelector('#includeMeds').checked,
        showNames: root.querySelector('#showNames').checked,
      };
      await setSetting('reminders', options);
      const ics = buildCalendar({ ...options, meds });
      const file = new File([ics], 'volver-a-ti-recordatorios.ics', { type: 'text/calendar' });
      // En iPhone, abrir el archivo muestra "Agregar todo" al Calendario.
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await shareOrDownload(file, 'Recordatorios de Volver a ti');
      } else {
        location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
      }
      return;
    }
    // Código de bloqueo
    const next = value('#pin-new');
    if (pinOn && !(await checkPin(value('#pin-current')))) {
      toast('El código actual no es correcto');
      return;
    }
    if (!/^[0-9]{4}$/.test(next)) {
      toast('El código debe tener 4 números');
      return;
    }
    if (next !== value('#pin-repeat')) {
      toast('Los códigos no coinciden');
      return;
    }
    await setPin(next);
    toast(pinOn ? 'Código cambiado' : 'Código activado');
    refresh();
  };

  const onClick = async (event) => {
    if (handleChip(event, root, state)) {
      await setSetting('goals', state.goals);
      return;
    }
    if (event.target.closest('#pin-remove')) {
      if (!(await checkPin(value('#pin-current')))) {
        toast('Escribe tu código actual para quitarlo');
        root.querySelector('#pin-current').focus();
        return;
      }
      await removePin();
      toast('Código quitado');
      refresh();
      return;
    }
    if (event.target.closest('#export')) {
      toast('Preparando tu copia…');
      const data = await exportAll();
      const file = new File([JSON.stringify(data)], `volver-a-ti-${dayKey()}.json`, { type: 'application/json' });
      await shareOrDownload(file);
      await setSetting('lastBackup', dayKey());
      return;
    }
    if (event.target.closest('#wipe')) {
      if (!confirm('¿Borrar todo tu diario, fotos, check-ins y cartas guardadas?')) return;
      if (!confirm('Esto no se puede deshacer. ¿Seguro?')) return;
      await wipeAll();
      toast('Datos borrados');
      location.hash = '#/bienvenida';
    }
  };

  const onChange = async (event) => {
    const { id } = event.target;
    if (id === 'includeMeds' || id === 'showNames') return;
    if (id === 'astrologyEnabled' || id === 'weightEnabled') {
      await setSetting(id, event.target.checked);
      toast('Preferencia guardada');
      return;
    }
    if (id === 'birthDate') {
      await setSetting('birthDate', event.target.value);
      toast('Fecha guardada');
      return;
    }
    if (id === 'birthTime') {
      await setSetting('birthTime', event.target.value);
      toast('Hora guardada');
      return;
    }
    if (id !== 'import-file') return;
    const file = event.target.files[0];
    event.target.value = '';
    if (!file) return;
    if (!confirm('Restaurar esta copia reemplazará los datos actuales. ¿Continuar?')) return;
    try {
      await importAll(JSON.parse(await file.text()));
      toast('Copia restaurada');
      location.hash = '#/hoy';
    } catch (err) {
      toast(err.message || 'No se pudo leer la copia');
    }
  };

  root.addEventListener('submit', onSubmit);
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  return () => {
    root.removeEventListener('submit', onSubmit);
    root.removeEventListener('click', onClick);
    root.removeEventListener('change', onChange);
  };
}
