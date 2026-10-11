// Contenido de la app y reglas de sugerencias.
// Las sugerencias son orientativas: no son diagnósticos ni sustituyen atención profesional.

export const MOODS = ['Tranquilidad', 'Alegría', 'Ansiedad', 'Tristeza', 'Frustración', 'Motivación', 'Sensibilidad', 'Agotamiento'];
export const BODY = ['Descansada', 'Cansada', 'Con molestias', 'Con tensión', 'Bien'];
export const NEEDS = ['Descansar', 'Moverme', 'Crear', 'Hablar', 'Desconectarme', 'Organizarme', 'Estar conmigo'];

// Forma corta de cada emoción para frases como "Hoy te sientes tranquila".
export const MOOD_ADJ = {
  Tranquilidad: 'tranquila',
  Alegría: 'alegre',
  Ansiedad: 'ansiosa',
  Tristeza: 'triste',
  Frustración: 'frustrada',
  Motivación: 'motivada',
  Sensibilidad: 'sensible',
  Agotamiento: 'agotada',
};

export const CARDS = [
  { title: 'Empezar despacio', text: 'No hace falta que todo cambie hoy. Un paso pequeño también es un comienzo.', cat: 'Intenciones' },
  { title: 'Lo que sí está en tus manos', text: 'Suelta lo que no depende de ti y cuida, con ternura, lo que sí.', cat: 'Del universo' },
  { title: 'Gracias, cuerpo', text: 'Hoy agradece algo que tu cuerpo hizo por ti sin que se lo pidieras.', cat: 'Gratitud' },
  { title: 'Tu ritmo', text: 'No vas tarde. Vas a tu propio ritmo, y ese ritmo también es válido.', cat: 'Afirmaciones' },
  { title: 'Permiso para descansar', text: 'Descansar no es rendirse. Es prepararte para volver con más claridad.', cat: 'Días difíciles' },
  { title: 'Una cosa a la vez', text: 'Elige una sola cosa importante para hoy. Lo demás puede esperar.', cat: 'Intenciones' },
  { title: 'Respira antes de responder', text: 'Entre lo que sientes y lo que haces existe un espacio. Hoy, habítalo.', cat: 'Autoconocimiento' },
  { title: 'Lo que florece despacio', text: 'Algunas cosas necesitan tiempo para crecer. Tú también.', cat: 'Del universo' },
  { title: 'Escucharte', text: 'Antes de buscar respuestas afuera, pregúntate qué necesitas tú.', cat: 'Autoconocimiento' },
  { title: 'Para los días grises', text: 'Un día difícil no define tu camino. Solo es un día, y va a pasar.', cat: 'Días difíciles' },
  { title: 'Pequeñas alegrías', text: 'Busca hoy tres momentos pequeños que te hagan sonreír.', cat: 'Gratitud' },
  { title: 'Ya eres suficiente', text: 'No tienes que ganarte el descanso ni el cariño. Ya eres suficiente.', cat: 'Afirmaciones' },
  { title: 'Límites amables', text: 'Decir que no a algo puede ser decirte que sí a ti.', cat: 'Autoconocimiento' },
  { title: 'Volver al presente', text: 'Nombra cinco cosas que puedes ver ahora mismo. Estás aquí.', cat: 'Días difíciles' },
  { title: 'Suavidad', text: 'Háblate hoy como le hablarías a alguien que quieres.', cat: 'Afirmaciones' },
  { title: 'Lo que aprendiste', text: 'Mira hacia atrás un momento: ya superaste cosas que creías imposibles.', cat: 'Autoconocimiento' },
  { title: 'Soltar el control', text: 'No todo se puede planear. A veces lo mejor llega cuando aflojas.', cat: 'Del universo' },
  { title: 'El arte de confiar', text: 'No necesitas tener todas las respuestas para continuar. A veces, avanzar también significa permitirte descubrir.', cat: 'Del universo' },
  { title: 'Tu energía es valiosa', text: 'Observa a dónde va tu energía hoy y elige con cariño dónde ponerla.', cat: 'Autoconocimiento' },
  { title: 'Movimiento amable', text: 'Muévete como te sientas, no como creas que deberías sentirte.', cat: 'Afirmaciones' },
  { title: 'Raíces', text: '¿Qué te hace sentir en casa dentro de ti? Vuelve ahí un momento.', cat: 'Autoconocimiento' },
  { title: 'Nueva intención', text: 'Escribe una intención breve para hoy y deja que te acompañe.', cat: 'Intenciones' },
  { title: 'Lo imperfecto', text: 'Hecho con amor es mejor que perfecto y nunca empezado.', cat: 'Afirmaciones' },
  { title: 'Compañía', text: 'Pedir ayuda también es una forma de cuidarte.', cat: 'Días difíciles' },
  { title: 'Celebrar', text: 'Celebra algo que hiciste esta semana, aunque parezca pequeño.', cat: 'Gratitud' },
  { title: 'Pausa', text: 'Si hoy todo va rápido, tú puedes ir un poco más lento.', cat: 'Días difíciles' },
  { title: 'Curiosidad', text: 'En lugar de juzgar lo que sientes, pregúntate qué te quiere decir.', cat: 'Autoconocimiento' },
  { title: 'Cerrar ciclos', text: 'Agradece lo que fue, suelta lo que pesa y deja espacio para lo nuevo.', cat: 'Del universo' },
  { title: 'Luz propia', text: 'No necesitas brillar todo el tiempo. También se descansa en la sombra.', cat: 'Afirmaciones' },
  { title: 'Volver a ti', text: 'Siempre puedes volver a ti. Aquí estás.', cat: 'Del universo' },
].map((card, i) => ({ ...card, n: i + 1, code: String(i + 1).padStart(3, '0') }));

export function cardOfDay(dayNumber) {
  return CARDS[dayNumber % CARDS.length];
}

export function cardByNumber(n) {
  return CARDS.find((c) => c.n === Number(n));
}

export const PROMPTS = [
  '¿Qué te hizo sentir en paz esta semana?',
  '¿Qué necesitas soltar hoy?',
  '¿Qué agradeces de este día?',
  '¿Qué te pidió tu cuerpo hoy?',
  '¿Qué te gustaría decirte con cariño?',
  '¿Qué pequeña cosa te hizo bien?',
  '¿Qué estás intentando controlar?',
];

export function energyMessage(energy) {
  if (!energy) return 'Haz tu check-in para ver cómo está tu energía hoy.';
  if (energy <= 2) return 'Hoy conviene un ritmo suave. Prioriza dos cosas y deja espacio para descansar.';
  if (energy === 3) return 'Energía media: elige lo importante y regálate pausas entre tareas.';
  return 'Tienes buena energía. Aprovéchala sin olvidarte de ti.';
}

export function movementSuggestion(checkin) {
  if (!checkin) return null;
  const { energy = 3, body = [], moods = [] } = checkin;
  const tired = body.includes('Cansada') || body.includes('Con molestias') || moods.includes('Agotamiento');
  const reasons = [];
  if (energy <= 2) reasons.push('tu energía está baja');
  if (body.includes('Cansada')) reasons.push('te sientes cansada');
  if (body.includes('Con molestias')) reasons.push('registraste molestias');
  if (body.includes('Con tensión')) reasons.push('sientes tensión');

  let pick;
  if (energy <= 2 || tired) {
    pick = { name: 'Yoga restaurativo', time: '20 min', alt: 'Movilidad suave · 10 min' };
  } else if (energy === 3) {
    pick = { name: 'Pilates', time: '35 min', alt: 'Caminata a tu ritmo · 30 min' };
  } else {
    pick = { name: 'Entrenamiento de fuerza', time: '45 min', alt: 'Clase dinámica · 50 min' };
  }
  const why = reasons.length
    ? `Como ${reasons.join(' y ')}, una práctica así puede sentirse mejor hoy.`
    : 'Según cómo te sientes hoy, esta práctica puede acompañarte bien.';
  return { ...pick, why };
}
