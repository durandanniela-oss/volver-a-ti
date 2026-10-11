import { get, put, remove } from '../db.js';
import { icon, esc, shortDate, dayKey, dayOfYear, toast, uid, shrinkPhoto as shrink } from '../ui.js';
import { MOOD_ADJ, PROMPTS, cardByNumber } from '../data.js';

const MAX_PHOTOS = 6;

export default async function entrada(root, { params, query }) {
  const id = params[0] || 'nueva';
  const isNew = id === 'nueva';
  const existing = isNew ? null : await get('entries', decodeURIComponent(id));

  if (!isNew && !existing) {
    location.replace('#/diario');
    return;
  }

  const checkin = isNew ? await get('checkins', dayKey()) : null;
  const entry = existing
    ? { ...existing, photos: [...(existing.photos || [])] }
    : {
        id: uid(),
        createdAt: new Date().toISOString(),
        title: '',
        text: '',
        prompt: query.get('q') || (query.get('prompt') ? PROMPTS[dayOfYear() % PROMPTS.length] : ''),
        moods: checkin?.moods || [],
        carta: query.get('carta') ? Number(query.get('carta')) : null,
        photos: [],
      };
  const card = entry.carta ? cardByNumber(entry.carta) : null;
  const urls = new Map();
  let dirty = false;

  const urlFor = (photo) => {
    if (!urls.has(photo.id)) urls.set(photo.id, URL.createObjectURL(photo.blob));
    return urls.get(photo.id);
  };

  function photosHTML() {
    const tiles = entry.photos
      .map(
        (photo, i) => `
        <div class="photo">
          <img src="${urlFor(photo)}" alt="Foto ${i + 1} de la entrada">
          <button type="button" class="remove" data-remove="${photo.id}" aria-label="Quitar foto ${i + 1}">${icon.close({ size: 12, sw: 2.4 })}</button>
        </div>`
      )
      .join('');
    const add = entry.photos.length < MAX_PHOTOS
      ? `<label class="photo-add" for="file">${icon.plus()}<span>Añadir foto</span></label>`
      : '';
    return tiles + add;
  }

  root.innerHTML = `
  <main class="screen no-nav" style="gap: 18px">
    <header class="topbar">
      <a class="icon-btn" href="#/diario" id="back" aria-label="Volver a Mi diario">${icon.back()}</a>
      <span class="eyebrow sm">${shortDate(entry.createdAt)}</span>
      <button class="btn sm" id="save" type="button">Guardar</button>
    </header>

    ${entry.moods.length || card ? `<div class="chips" style="gap: 6px">
      ${entry.moods.map((m, i) => `<span class="tag ${i % 2 ? 'peach' : ''}">${esc(MOOD_ADJ[m] || m)}</span>`).join('')}
      ${card ? `<span class="tag lilac">${icon.star({ size: 12, sw: 2 })}&nbsp;Carta ${card.code} · ${esc(card.title)}</span>` : ''}
    </div>` : ''}

    ${card ? `<blockquote class="card" style="margin: 0; padding: 14px 18px"><p class="small" style="font-size: 15px; color: var(--ink)">${esc(card.text)}</p></blockquote>` : ''}
    ${entry.prompt ? `<p class="lead" style="font-size: 15px">${esc(entry.prompt)}</p>` : ''}

    <div style="display: flex; flex-direction: column; gap: 10px">
      <label for="title" class="sr-only">Título</label>
      <input id="title" class="input title-input" type="text" placeholder="Título" value="${esc(entry.title)}">
      <label for="text" class="sr-only">Tu entrada</label>
      <textarea id="text" class="textarea" rows="8" placeholder="Escribe lo que quieras…">${esc(entry.text)}</textarea>
    </div>

    <section aria-labelledby="fotos" style="display: flex; flex-direction: column; gap: 10px">
      <div class="card-row">
        <h2 id="fotos" class="h2">Fotos</h2>
        <span class="eyebrow sm" id="count">${entry.photos.length}/${MAX_PHOTOS}</span>
      </div>
      <div class="photo-grid" id="photos">${photosHTML()}</div>
      <input id="file" class="sr-only" type="file" accept="image/*" multiple>
    </section>

    <p class="small" style="display: flex; align-items: center; gap: 6px">${icon.lock()} Solo para ti. Se guarda en este dispositivo.</p>

    ${isNew ? '' : `<button class="btn btn-danger block" id="delete" type="button">${icon.trash()} Eliminar entrada</button>`}
  </main>`;

  const fileInput = root.querySelector('#file');
  const refreshPhotos = () => {
    root.querySelector('#photos').innerHTML = photosHTML();
    root.querySelector('#count').textContent = `${entry.photos.length}/${MAX_PHOTOS}`;
  };

  const onInput = () => { dirty = true; };

  const onChange = async (event) => {
    if (event.target !== fileInput) return;
    const files = [...fileInput.files].slice(0, MAX_PHOTOS - entry.photos.length);
    fileInput.value = '';
    if (!files.length) return;
    toast(files.length === 1 ? 'Añadiendo foto…' : `Añadiendo ${files.length} fotos…`);
    for (const file of files) entry.photos.push({ id: uid(), blob: await shrink(file) });
    dirty = true;
    refreshPhotos();
  };

  const onClick = async (event) => {
    const removeBtn = event.target.closest('[data-remove]');
    if (removeBtn) {
      const photoId = removeBtn.dataset.remove;
      entry.photos = entry.photos.filter((p) => p.id !== photoId);
      if (urls.has(photoId)) {
        URL.revokeObjectURL(urls.get(photoId));
        urls.delete(photoId);
      }
      dirty = true;
      refreshPhotos();
      return;
    }
    if (event.target.closest('#back') && dirty && !confirm('¿Salir sin guardar los cambios?')) {
      event.preventDefault();
      return;
    }
    if (event.target.closest('#save')) {
      entry.title = root.querySelector('#title').value.trim();
      entry.text = root.querySelector('#text').value.trim();
      if (!entry.title && !entry.text && !entry.photos.length) {
        toast('Escribe algo o añade una foto');
        return;
      }
      entry.updatedAt = new Date().toISOString();
      await put('entries', entry);
      dirty = false;
      toast('Entrada guardada');
      location.hash = '#/diario';
      return;
    }
    if (event.target.closest('#delete')) {
      if (!confirm('¿Eliminar esta entrada y sus fotos? No se puede deshacer.')) return;
      await remove('entries', entry.id);
      dirty = false;
      toast('Entrada eliminada');
      location.hash = '#/diario';
    }
  };

  root.addEventListener('click', onClick);
  root.addEventListener('input', onInput);
  root.addEventListener('change', onChange);

  return () => {
    root.removeEventListener('click', onClick);
    root.removeEventListener('input', onInput);
    root.removeEventListener('change', onChange);
    urls.forEach((url) => URL.revokeObjectURL(url));
  };
}
