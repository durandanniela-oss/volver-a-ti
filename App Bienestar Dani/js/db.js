// Almacenamiento local en IndexedDB. Nada sale del dispositivo.
const DB_NAME = 'volver-a-ti';
const DB_VERSION = 1;
export const STORES = ['settings', 'checkins', 'entries', 'favorites'];

let dbPromise;

function open() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        db.createObjectStore('settings');
        db.createObjectStore('checkins');
        db.createObjectStore('entries', { keyPath: 'id' });
        db.createObjectStore('favorites');
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

async function dumpKeyed(store) {
  const keys = await getAllKeys(store);
  const values = await getAll(store);
  return keys.map((key, i) => [key, values[i]]);
}

export async function exportAll() {
  const entries = await getAll('entries');
  const serializedEntries = [];
  for (const entry of entries) {
    const photos = [];
    for (const photo of entry.photos || []) {
      photos.push({ id: photo.id, data: await blobToDataURL(photo.blob) });
    }
    serializedEntries.push({ ...entry, photos });
  }
  return {
    app: 'volver-a-ti',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: await dumpKeyed('settings'),
    checkins: await dumpKeyed('checkins'),
    favorites: await dumpKeyed('favorites'),
    entries: serializedEntries,
  };
}

export async function importAll(data) {
  if (!data || data.app !== 'volver-a-ti') throw new Error('Este archivo no es una copia de Volver a ti.');
  for (const store of STORES) await clear(store);
  for (const [key, value] of data.settings || []) await put('settings', value, key);
  for (const [key, value] of data.checkins || []) await put('checkins', value, key);
  for (const [key, value] of data.favorites || []) await put('favorites', value, key);
  for (const entry of data.entries || []) {
    const photos = [];
    for (const photo of entry.photos || []) {
      photos.push({ id: photo.id, blob: await dataURLToBlob(photo.data) });
    }
    await put('entries', { ...entry, photos });
  }
}

export async function wipeAll() {
  for (const store of STORES) await clear(store);
}
