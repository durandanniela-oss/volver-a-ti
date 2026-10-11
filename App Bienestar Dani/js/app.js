import { getSetting } from './db.js';
import bienvenida from './screens/bienvenida.js';
import checkin from './screens/checkin.js';
import hoy from './screens/hoy.js';
import diario from './screens/diario.js';
import entrada from './screens/entrada.js';
import pausa from './screens/pausa.js';
import carta from './screens/carta.js';
import perfil from './screens/perfil.js';
import pronto from './screens/pronto.js';

const routes = { bienvenida, checkin, hoy, diario, entrada, pausa, carta, perfil, pronto };

const root = document.getElementById('app');
let cleanup = null;
let renderId = 0;

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, queryString = ''] = raw.split('?');
  const [name = '', ...params] = path.split('/').filter(Boolean);
  return { name, params, query: new URLSearchParams(queryString) };
}

async function render() {
  const id = ++renderId;
  const { name, params, query } = parseHash();

  const onboarded = await getSetting('onboarded', false);
  if (!onboarded && name !== 'bienvenida') {
    location.replace('#/bienvenida');
    return;
  }

  if (cleanup) {
    cleanup();
    cleanup = null;
  }

  const screen = routes[name] || hoy;
  const result = await screen(root, { params, query });
  // Si el usuario navegó mientras esta pantalla cargaba, se descarta.
  if (id !== renderId) {
    if (typeof result === 'function') result();
    return;
  }
  cleanup = typeof result === 'function' ? result : null;
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
render();

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js');
}
