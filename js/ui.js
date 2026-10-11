// Piezas compartidas de la interfaz: íconos, navegación, fechas y avisos.

const svg = (body, { size = 22, sw = 1.6, fill = 'none' } = {}) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icon = {
  sun: (o) => svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', o),
  heart: (o) => svg('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', o),
  body: (o) => svg('<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16"/>', o),
  star: (o) => svg('<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/><path d="M19 17v4M17 19h4"/>', o),
  flower: (o) => svg('<circle cx="12" cy="7.5" r="3.5"/><circle cx="16.5" cy="12" r="3.5"/><circle cx="12" cy="16.5" r="3.5"/><circle cx="7.5" cy="12" r="3.5"/>', o),
  user: (o) => svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', o),
  pen: (o) => svg('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>', o),
  arrow: (o) => svg('<path d="M5 12h14M13 6l6 6-6 6"/>', { sw: 2, size: 18, ...o }),
  back: (o) => svg('<path d="M19 12H5M11 6l-6 6 6 6"/>', { sw: 1.8, size: 20, ...o }),
  close: (o) => svg('<path d="M6 6l12 12M18 6L6 18"/>', { sw: 2, size: 18, ...o }),
  plus: (o) => svg('<path d="M12 5v14M5 12h14"/>', { sw: 2, ...o }),
  image: (o) => svg('<rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/>', o),
  lock: (o) => svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', { sw: 1.8, size: 14, ...o }),
  play: (o) => svg('<path d="M7 4l13 8-13 8z"/>', { fill: 'currentColor', sw: 0, size: 18, ...o }),
  pause: (o) => svg('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>', { fill: 'currentColor', sw: 0, size: 18, ...o }),
  share: (o) => svg('<path d="M12 15V3M7 8l5-5 5 5M5 14v6h14v-6"/>', { size: 18, ...o }),
  bookmark: (o) => svg('<path d="M6 3h12v18l-6-4-6 4z"/>', { size: 18, ...o }),
  trash: (o) => svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', { size: 18, ...o }),
  chevron: (o) => svg('<path d="M9 6l6 6-6 6"/>', { sw: 2, size: 16, ...o }),
  check: (o) => svg('<path d="M5 12l5 5L20 7"/>', { sw: 2.6, size: 14, ...o }),
  minus: (o) => svg('<path d="M5 12h14"/>', { sw: 2, ...o }),
  doc: (o) => svg('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>', { size: 18, ...o }),
  up: (o) => svg('<path d="M6 15l6-6 6 6"/>', { sw: 2, size: 16, ...o }),
  mic: (o) => svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', o),
};

// Anillo de puntos decorativo (como el ícono de la tarjeta iridiscente de Notis+).
export function dotRing(size = 64) {
  let dots = '';
  const rings = [[26, 14, 2.6], [15, 9, 2]];
  for (const [r, n, base] of rings) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r;
      const s = base * (0.7 + ((i * 7) % 5) / 8);
      dots += `<circle cx="${(32 + Math.cos(a) * r).toFixed(1)}" cy="${(32 + Math.sin(a) * r).toFixed(1)}" r="${s.toFixed(2)}"/>`;
    }
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="currentColor" aria-hidden="true">${dots}</svg>`;
}

export function timeAgo(iso) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'ayer';
  return `hace ${days} días`;
}

const NAV = [
  { id: 'hoy', href: '#/hoy', label: 'Mi día', short: 'Mi día', icon: icon.sun },
  { id: 'bienestar', href: '#/diario', label: 'Mi bienestar', short: 'Bienestar', icon: icon.heart },
  { id: 'cuerpo', href: '#/ciclo', label: 'Mi cuerpo', short: 'Cuerpo', icon: icon.body },
  { id: 'universo', href: '#/universo', label: 'Mi universo', short: 'Universo', icon: icon.star },
  { id: 'rituales', href: '#/rituales', label: 'Mis rituales', short: 'Rituales', icon: icon.flower },
];

export function nav(active) {
  return `<nav class="nav" aria-label="Navegación principal">${NAV.map(
    (item) => `<a href="${item.href}" aria-label="${item.label}"${item.id === active ? ' aria-current="page"' : ''}>${item.icon()}<span class="nav-label" aria-hidden="true">${item.short}</span></a>`
  ).join('')}</nav>`;
}

const SECTIONS = {
  cuerpo: [
    ['ciclo', '#/ciclo', 'Ciclo'],
    ['movimiento', '#/movimiento', 'Movimiento'],
    ['nutricion', '#/nutricion', 'Nutrición'],
    ['cuidado', '#/cuidado', 'Cuidado'],
  ],
  bienestar: [
    ['diario', '#/diario', 'Diario'],
    ['biblioteca', '#/biblioteca', 'Pausa'],
    ['mapa', '#/mapa', 'Mapa emocional'],
  ],
};

export function tabs(section, active) {
  const label = section === 'cuerpo' ? 'Secciones de Mi cuerpo' : 'Secciones de Mi bienestar';
  return `<nav class="tabs" aria-label="${label}">${SECTIONS[section].map(
    ([id, href, text]) => `<a href="${href}"${id === active ? ' aria-current="page"' : ''}>${text}</a>`
  ).join('')}</nav>`;
}

// --- Chips seleccionables ---
// `single`: solo una opción a la vez. Sin `single`, el valor es una lista.

export function chips(group, options, selected, { single = false, size = '' } = {}) {
  const isOn = (v) => (single ? selected === v : (selected || []).includes(v));
  return options
    .map((label) => `<button type="button" class="chip ${size}" data-chip="${group}" data-value="${esc(label)}"${single ? ' data-single="1"' : ''} aria-pressed="${isOn(label)}">${esc(label)}</button>`)
    .join('');
}

export function handleChip(event, root, state) {
  const chip = event.target.closest('[data-chip]');
  if (!chip) return false;
  const group = chip.dataset.chip;
  const value = chip.dataset.value;
  if (chip.dataset.single) {
    state[group] = state[group] === value ? null : value;
    root.querySelectorAll(`[data-chip="${group}"]`).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.value === state[group])));
  } else {
    const list = state[group] || (state[group] = []);
    const i = list.indexOf(value);
    if (i === -1) list.push(value);
    else list.splice(i, 1);
    chip.setAttribute('aria-pressed', String(i === -1));
  }
  return true;
}

export function toggle(id, checked, label) {
  return `<label class="switch-row" for="${id}">
    <span>${label}</span>
    <input type="checkbox" class="switch" id="${id}"${checked ? ' checked' : ''}>
  </label>`;
}

// --- Fotos ---

const MAX_SIDE = 1600;

// Reduce la foto para que no ocupe demasiado espacio en el teléfono.
export async function shrinkPhoto(file) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
    return blob || file;
  } catch {
    return file;
  }
}

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- Fechas ---

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DAYS_SHORT = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const pad = (n) => String(n).padStart(2, '0');

export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function longDate(date = new Date()) {
  return `${DAYS[date.getDay()]} · ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function shortDate(date) {
  const d = new Date(date);
  return `${DAYS_SHORT[d.getDay()]} ${pad(d.getDate())} ${MONTHS[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

// Fechas como texto "AAAA-MM-DD" (día local), para guardar registros por día.
export function parseKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, n) {
  const d = parseKey(key);
  d.setDate(d.getDate() + n);
  return dayKey(d);
}

export function diffDays(a, b) {
  return Math.round((parseKey(b) - parseKey(a)) / 86400000);
}

export function dayMonth(key) {
  const d = parseKey(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function weekdayInitial(key) {
  return ['D', 'L', 'M', 'X', 'J', 'V', 'S'][parseKey(key).getDay()];
}

export function lastDays(n, end = dayKey()) {
  return Array.from({ length: n }, (_, i) => addDays(end, i - n + 1));
}

// --- Avisos ---

let toastTimer;
export function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

// Vuelve a dibujar la pantalla actual (limpiando la anterior) después de guardar algo.
export function refresh() {
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
