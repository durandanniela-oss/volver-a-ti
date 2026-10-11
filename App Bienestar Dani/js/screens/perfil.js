import { getSetting, setSetting, exportAll, importAll, wipeAll, isPersisted, requestPersistence, getAll } from '../db.js';
import { icon, esc, dayKey, toast } from '../ui.js';

async function shareOrDownload(file) {
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Copia de Volver a ti' });
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
  const [name, persisted, entries, lastBackup] = await Promise.all([
    getSetting('name', ''),
    isPersisted(),
    getAll('entries'),
    getSetting('lastBackup', null),
  ]);
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

  const onSubmit = async (event) => {
    if (event.target.id !== 'name-form') return;
    event.preventDefault();
    await setSetting('name', root.querySelector('#name').value.trim());
    toast('Nombre guardado');
  };

  const onClick = async (event) => {
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
    if (event.target.id !== 'import-file') return;
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
