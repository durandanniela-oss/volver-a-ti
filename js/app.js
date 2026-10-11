import { getSetting } from './db.js';
import bienvenida from './screens/bienvenida.js';
import checkin from './screens/checkin.js';
import hoy from './screens/hoy.js';
import diario from './screens/diario.js';
import entrada from './screens/entrada.js';
import biblioteca from './screens/biblioteca.js';
import pausa from './screens/pausa.js';
import mapa from './screens/mapa.js';
import ciclo from './screens/ciclo.js';
import registro from './screens/registro.js';
import movimiento from './screens/movimiento.js';
import nutricion from './screens/nutricion.js';
import cuidado from './screens/cuidado.js';
import medicamento from './screens/medicamento.js';
import cita from './screens/cita.js';
import resumen from './screens/resumen.js';
import universo from './screens/universo.js';
import carta from './screens/carta.js';
import rituales from './screens/rituales.js';
import perfil from './screens/perfil.js';

const routes = {
  bienvenida, checkin, hoy,
  diario, entrada, biblioteca, pausa, mapa,
  ciclo, registro, movimiento, nutricion, cuidado, medicamento, cita, resumen,
  universo, carta, rituales, perfil,
};

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
