// Almacenamiento local en IndexedDB. Nada sale del dispositivo.
const DB_NAME = 'volver-a-ti';
const DB_VERSION = 2;

// Almacenes cuya clave va fuera del objeto (por ejemplo, la fecha del día).
const KEYED_STORES = ['settings', 'checkins', 'favorites', 'cycleLogs', 'water', 'weights', 'doses', 'rituals'];
// Almacenes cuyos objetos llevan su propio `id`.
const ID_STORES = ['entries', 'periods', 'workouts', 'meals', 'meds', 'appointments'];
export const STORES = [...KEYED_STORES, ...ID_STORES];

let dbPromise;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const name of KEYED_STORES) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
        }
        for (const name of ID_STORES) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

async function run(store, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(req ? req.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const get = (store, key) => run(store, 'readonly', (s) => s.get(key));
export const put = (store, value, key) => run(store, 'readwrite', (s) => (key === undefined ? s.put(value) : s.put(value, key)));
export const remove = (store, key) => run(store, 'readwrite', (s) => s.delete(key));
export const getAll = (store) => run(store, 'readonly', (s) => s.getAll());
export const getAllKeys = (store) => run(store, 'readonly', (s) => s.getAllKeys());
export const clear = (store) => run(store, 'readwrite', (s) => s.clear());

export async function getEntries(store) {
  const [keys, values] = await Promise.all([getAllKeys(store), getAll(store)]);
  return keys.map((key, i) => [key, values[i]]);
}

export async function getSetting(key, fallback) {
  const value = await get('settings', key);
  return value === undefined ? fallback : value;
}

export const setSetting = (key, value) => put('settings', value, key);

// Pide al navegador que no borre estos datos cuando falte espacio.
export async function requestPersistence() {
  if (!navigator.storage || !navigator.storage.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}

export async function isPersisted() {
  if (!navigator.storage || !navigator.storage.persisted) return false;
  return navigator.storage.persisted();
}

// --- Copia de seguridad ---

function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataURLToBlob(dataURL) {
  const res = await fetch(dataURL);
  return res.blob();
}

// Convierte las fotos (Blob) en texto para poder guardarlas en un archivo JSON.
async function pack(value) {
  if (value instanceof Blob) return { __blob: await blobToDataURL(value) };
  if (Array.isArray(value)) return Promise.all(value.map(pack));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = await pack(v);
    return out;
  }
  return value;
}

async function unpack(value) {
  if (value && typeof value === 'object' && typeof value.__blob === 'string') return dataURLToBlob(value.__blob);
  if (Array.isArray(value)) return Promise.all(value.map(unpack));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = await unpack(v);
    return out;
  }
  return value;
}

export async function exportAll() {
  const stores = {};
  for (const store of STORES) stores[store] = await pack(await getEntries(store));
  return { app: 'volver-a-ti', version: 2, exportedAt: new Date().toISOString(), stores };
}

// Copias hechas con la primera versión de la app.
async function importVersion1(data) {
  for (const [key, value] of data.settings || []) await put('settings', value, key);
  for (const [key, value] of data.checkins || []) await put('checkins', value, key);
  for (const [key, value] of data.favorites || []) await put('favorites', value, key);
  for (const entry of data.entries || []) {
    const photos = [];
    for (const photo of entry.photos || []) photos.push({ id: photo.id, blob: await dataURLToBlob(photo.data) });
    await put('entries', { ...entry, photos });
  }
}

export async function importAll(data) {
  if (!data || data.app !== 'volver-a-ti') throw new Error('Este archivo no es una copia de Volver a ti.');
  for (const store of STORES) await clear(store);
  if (data.version === 1) return importVersion1(data);
  for (const store of STORES) {
    for (const [key, packed] of data.stores?.[store] || []) {
      const value = await unpack(packed);
      if (KEYED_STORES.includes(store)) await put(store, value, key);
      else await put(store, value);
    }
  }
}

export async function wipeAll() {
  for (const store of STORES) await clear(store);
}
