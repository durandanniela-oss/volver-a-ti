// Bloqueo con código. Se guarda solo un resumen (hash) del código, nunca el código.
// Protege la app de miradas ajenas; no cifra los datos guardados en el teléfono.
import { getSetting, setSetting, wipeAll } from './db.js';
import { icon } from './ui.js';

const LOCK_AFTER_MS = 60 * 1000;
let unlocked = false;
let hiddenAt = 0;

async function hash(pin, salt) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hasPin() {
  return !!(await getSetting('pinHash', null));
}

export async function checkPin(pin) {
  const [stored, salt] = await Promise.all([getSetting('pinHash', null), getSetting('pinSalt', '')]);
  return !!stored && stored === (await hash(pin, salt));
}

export async function setPin(pin) {
  const salt = crypto.getRandomValues(new Uint32Array(4)).join('-');
  await setSetting('pinSalt', salt);
  await setSetting('pinHash', await hash(pin, salt));
  unlocked = true;
}

export async function removePin() {
  await setSetting('pinHash', null);
  await setSetting('pinSalt', null);
}

export async function needsUnlock() {
  return !unlocked && (await hasPin());
}

// Vuelve a pedir el código si la app estuvo en segundo plano más de un minuto.
export function watchVisibility(onLock) {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now();
    } else if (unlocked && hiddenAt && Date.now() - hiddenAt > LOCK_AFTER_MS) {
      unlocked = false;
      onLock();
    }
  });
}

export function lockScreen(root, onUnlock) {
  let pin = '';
  root.innerHTML = `
  <main class="screen no-nav lock" style="align-items: center; justify-content: center; gap: 24px">
    <span class="eyebrow">Volver a ti</span>
    <h1 class="h1" style="text-align: center">Escribe tu código</h1>
    <div class="pin-dots" aria-hidden="true">${'<i></i>'.repeat(4)}</div>
    <p class="small" id="pin-msg" role="status" style="min-height: 18px"></p>
    <div class="pin-pad">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" data-digit="${n}">${n}</button>`).join('')}
      <button type="button" id="forgot" class="pin-text">Olvidé</button>
      <button type="button" data-digit="0">0</button>
      <button type="button" id="del" aria-label="Borrar un número">${icon.back({ size: 22 })}</button>
    </div>
  </main>`;

  const dots = root.querySelectorAll('.pin-dots i');
  const msg = root.querySelector('#pin-msg');
  const paint = () => dots.forEach((d, i) => d.classList.toggle('on', i < pin.length));

  const onClick = async (event) => {
    const digit = event.target.closest('[data-digit]');
    if (digit && pin.length < 4) {
      pin += digit.dataset.digit;
      paint();
      if (pin.length === 4) {
        if (await checkPin(pin)) {
          unlocked = true;
          root.removeEventListener('click', onClick);
          onUnlock();
        } else {
          msg.textContent = 'Ese no es tu código. Intenta de nuevo.';
          root.querySelector('.pin-dots').classList.add('shake');
          setTimeout(() => {
            pin = '';
            paint();
            root.querySelector('.pin-dots')?.classList.remove('shake');
          }, 450);
        }
      }
      return;
    }
    if (event.target.closest('#del')) {
      pin = pin.slice(0, -1);
      paint();
      return;
    }
    if (event.target.closest('#forgot')) {
      const ok = confirm('Si olvidaste tu código, la única forma de entrar es borrar los datos de la app y restaurar una copia de seguridad. ¿Borrar los datos de este dispositivo?');
      if (ok && confirm('Se borrarán tu diario, fotos y registros de este dispositivo. ¿Seguro?')) {
        await wipeAll();
        unlocked = true;
        root.removeEventListener('click', onClick);
        location.hash = '#/bienvenida';
        onUnlock();
      }
    }
  };
  root.addEventListener('click', onClick);
}
