// Contenido de la app y reglas de sugerencias.
// Las sugerencias son orientativas: no son diagnósticos ni sustituyen atención profesional.

export const MOODS = ['Tranquilidad', 'Alegría', 'Ansiedad', 'Tristeza', 'Frustración', 'Motivación', 'Sensibilidad', 'Agotamiento'];
export const BODY = ['Descansada', 'Cansada', 'Con molestias', 'Con tensión', 'Bien'];
export const NEEDS = ['Descansar', 'Moverme', 'Crear', 'Hablar', 'Desconectarme', 'Organizarme', 'Estar conmigo'];
export const SLEEP = ['Dormí mal', 'Regular', 'Dormí bien'];

// Mi cuerpo
export const FLOW = ['Ninguno', 'Manchado', 'Ligero', 'Medio', 'Abundante'];
export const PAIN = ['Sin dolor', 'Leve', 'Moderado', 'Intenso'];
export const CYCLE_SYMPTOMS = ['Cólicos', 'Inflamación', 'Sensibilidad en senos', 'Dolor de cabeza', 'Dolor de espalda', 'Acné', 'Antojos', 'Cansancio'];
export const CYCLE_MOODS = ['Sensible', 'Irritable', 'Tranquila', 'Triste', 'Ansiosa', 'Con energía'];
export const WORKOUT_TYPES = ['Yoga', 'Pilates', 'Reformer', 'Fuerza', 'Caminata', 'Movilidad', 'Stretching', 'Otra'];
export const INTENSITY = ['Suave', 'Media', 'Alta'];
export const WORKOUT_FEELINGS = ['Cansada', 'Tensa', 'Neutral', 'Con energía', 'Ligera', 'Tranquila', 'Orgullosa'];
export const FOOD_FEELINGS = ['Con energía', 'Satisfecha', 'Ligera', 'Pesada', 'Inflamada', 'Con hambre aún'];
export const HUNGER = ['Mucha hambre', 'Algo de hambre', 'Cómoda', 'Llena', 'Muy llena'];
export const MED_FREQUENCY = ['Diario', 'Si lo necesito'];

// Mis rituales
export const SKIN = ['Hidratada', 'Luminosa', 'Sensible', 'Brotes', 'Opaca', 'Tirante'];
export const SMALL_RITUALS = ['Leer', 'Baño tibio', 'Té', 'Cabello', 'Sin teléfono', 'Crear', 'Caminar sin prisa', 'Música'];
export const DEFAULT_SKINCARE = {
  morning: ['Limpiador suave', 'Tónico', 'Sérum', 'Hidratante', 'Protector solar'],
  night: ['Limpiador en aceite', 'Limpiador suave', 'Tónico', 'Sérum', 'Hidratante'],
};

// Mi pausa: cada práctica define su ritmo de respiración en segundos.
export const PAUSES = [
  { id: 'ansiedad', need: 'Calmar mi ansiedad', practice: 'Respiración guiada', minutes: 3, pattern: [['Inhala', 4], ['Sostén', 2], ['Exhala', 6]] },
  { id: 'dormir', need: 'Dormir mejor', practice: 'Respiración 4-7-8', minutes: 6, pattern: [['Inhala', 4], ['Sostén', 7], ['Exhala', 8]] },
  { id: 'concentrarme', need: 'Concentrarme', practice: 'Respiración cuadrada', minutes: 4, pattern: [['Inhala', 4], ['Sostén', 4], ['Exhala', 4], ['Pausa', 4]] },
  { id: 'tension', need: 'Soltar tensión', practice: 'Respiración lenta', minutes: 5, pattern: [['Inhala', 5], ['Exhala', 5]], hint: 'Con cada exhalación, suelta hombros, mandíbula y manos.' },
  { id: 'empezar', need: 'Empezar el día', practice: 'Intención y respiración', minutes: 3, pattern: [['Inhala', 4], ['Sostén', 2], ['Exhala', 4]], hint: 'Mientras respiras, piensa en una intención para hoy.' },
  { id: 'procesar', need: 'Procesar emociones', practice: 'Journaling guiado', minutes: 0, journal: '¿Qué estoy sintiendo ahora, y qué necesita esa emoción de mí?' },
  { id: 'descansar', need: 'Descansar', practice: 'Sonido suave y silencio', minutes: 10, pattern: [['Descansa', 8]], sound: true, hint: 'No tienes que hacer nada. Solo estar.' },
];

export const STOPWORDS = new Set('a al algo algunos ante antes aquí así aun aunque bien cada como con contra cual cuando de del desde donde dos el ella ellas ellos en entre era eran es esa esas ese eso esos esta estaba estar este esto estos estoy fue fueron ha hace hacer hasta hay hoy la las le les lo los me mi mis mucho muy más nada ni no nos nosotros o otra otro para pero poco por porque que qué quiero se sea ser si sí sin sobre solo son su sus también tan tanto te tengo ti tiene todo todos tu tus un una uno unos ya yo día días vez muy mas'.split(' '));

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

// Cierre del día
export const GOOD_THINGS = ['Una conversación', 'Un momento a solas', 'Moverme', 'Comer rico', 'Descansar', 'Aprender algo', 'Reír', 'Terminar algo'];

// Tu fase hoy: orientación general sobre cada fase del ciclo.
// Cada cuerpo es distinto; son sugerencias, no indicaciones médicas.
export const PHASE_GUIDE = {
  Menstrual: {
    title: 'Fase menstrual',
    feel: 'Es común sentir menos energía y más ganas de recogerte. Date permiso de ir más lento.',
    move: 'Movimiento suave: yoga restaurativo, estiramientos o una caminata corta.',
    eat: 'Algo caliente y reconfortante, y mucha agua.',
    care: 'Calor en el abdomen, descanso y menos compromisos si puedes.',
    prompt: '¿Qué necesito soltar en este ciclo que termina?',
  },
  Folicular: {
    title: 'Fase folicular',
    feel: 'Muchas personas sienten cómo vuelve la energía y la curiosidad.',
    move: 'Buen momento para probar algo nuevo: Pilates, una clase o subir un poco la intensidad.',
    eat: 'Comidas frescas y ligeras que te den energía.',
    care: 'Planea, empieza proyectos y date espacio para crear.',
    prompt: '¿Qué me gustaría empezar este ciclo?',
  },
  Ovulatoria: {
    title: 'Fase ovulatoria',
    feel: 'Suele ser una fase de más energía, ánimo social y confianza.',
    move: 'Si te sientes bien, aprovecha para entrenar con más intensidad.',
    eat: 'Comidas coloridas y suficiente hidratación.',
    care: 'Buen momento para conversaciones importantes y para conectar.',
    prompt: '¿Con quién me gustaría conectar estos días?',
  },
  Lútea: {
    title: 'Fase lútea',
    feel: 'La energía puede bajar poco a poco y la sensibilidad subir, sobre todo los días previos al periodo.',
    move: 'Movimiento moderado: caminatas, Pilates suave o fuerza ligera.',
    eat: 'Comidas que te sacien y te reconforten; escucha tus antojos sin culpa.',
    care: 'Más descanso, menos exigencia y tiempo para ti.',
    prompt: '¿Qué me está pidiendo mi cuerpo estos días?',
  },
};

// Pregunta para la semana que empieza
export const WEEK_QUESTIONS = [
  '¿Qué quiero cuidar más esta semana?',
  '¿Qué me dio energía la semana pasada y quiero repetir?',
  '¿Qué puedo soltar para tener una semana más ligera?',
  '¿Qué pequeño gesto quiero regalarme esta semana?',
];
