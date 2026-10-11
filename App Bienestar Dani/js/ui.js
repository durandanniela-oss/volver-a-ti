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
};

const NAV = [
  { id: 'hoy', href: '#/hoy', label: 'Mi día', icon: icon.sun },
  { id: 'bienestar', href: '#/diario', label: 'Mi bienestar', icon: icon.heart },
  { id: 'cuerpo', href: '#/pronto/cuerpo', label: 'Mi cuerpo', icon: icon.body },
  { id: 'universo', href: '#/carta', label: 'Mi universo', icon: icon.star },
  { id: 'rituales', href: '#/pronto/rituales', label: 'Mis rituales', icon: icon.flower },
];

export function nav(active) {
  return `<nav class="nav" aria-label="Navegación principal">${NAV.map(
    (item) => `<a href="${item.href}" aria-label="${item.label}"${item.id === active ? ' aria-current="page"' : ''}>${item.icon()}</a>`
  ).join('')}</nav>`;
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

// --- Avisos ---

let toastTimer;
export function toast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

export function uid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
