// Luna y astrología como herramientas de reflexión, no como explicación científica.

const SYNODIC = 29.530588853;
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

const PHASES = [
  { until: 1.84566, name: 'Luna nueva', text: 'Un momento simbólico para reflexionar sobre aquello que deseas comenzar.' },
  { until: 5.53699, name: 'Luna creciente', text: 'Lo que sembraste empieza a tomar forma. Cuida tus primeros pasos.' },
  { until: 9.22831, name: 'Cuarto creciente', text: 'Un buen momento para decidir y avanzar, aunque no todo esté claro.' },
  { until: 12.91963, name: 'Gibosa creciente', text: 'Ajusta, revisa y confía en el proceso. Casi está.' },
  { until: 16.61096, name: 'Luna llena', text: 'Todo se ilumina. ¿Qué ves hoy con más claridad?' },
  { until: 20.30228, name: 'Gibosa menguante', text: 'Tiempo de agradecer y compartir lo que aprendiste.' },
  { until: 23.99361, name: 'Cuarto menguante', text: 'Suelta lo que ya no necesitas llevar contigo.' },
  { until: 27.68493, name: 'Luna menguante', text: 'Descansa, baja el ritmo y prepárate para un nuevo comienzo.' },
  { until: SYNODIC + 1, name: 'Luna nueva', text: 'Un momento simbólico para reflexionar sobre aquello que deseas comenzar.' },
];

export function moonPhase(date = new Date()) {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
  const age = ((days % SYNODIC) + SYNODIC) % SYNODIC;
  const fraction = age / SYNODIC;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const phase = PHASES.find((p) => age < p.until);
  const daysToNew = SYNODIC - age;
  const daysToFull = age < SYNODIC / 2 ? SYNODIC / 2 - age : SYNODIC * 1.5 - age;
  return { ...phase, age, fraction, illumination, daysToNew, daysToFull };
}

// Dibujo plano de la luna según su fase (lado iluminado en claro).
export function moonSVG(fraction, size = 150) {
  const k = Math.cos(2 * Math.PI * fraction);
  const rx = Math.abs(k) * 50;
  const waxing = fraction < 0.5;
  const limbSweep = waxing ? 1 : 0;
  const termSweep = waxing ? (k > 0 ? 0 : 1) : (k > 0 ? 1 : 0);
  const lit = `M50,0 A50,50 0 0 ${limbSweep} 50,100 A${rx.toFixed(2)},50 0 0 ${termSweep} 50,0 Z`;
  return `<svg width="${size}" height="${size}" viewBox="-2 -2 104 104" aria-hidden="true">
    <circle cx="50" cy="50" r="50" fill="#3E3B33" stroke="#D7A674" stroke-width="1.5"/>
    <path d="${lit}" fill="#F3EBDD"/>
  </svg>`;
}

const SIGNS = [
  ['Capricornio', 1, 19], ['Acuario', 2, 18], ['Piscis', 3, 20], ['Aries', 4, 19], ['Tauro', 5, 20], ['Géminis', 6, 20],
  ['Cáncer', 7, 22], ['Leo', 8, 22], ['Virgo', 9, 22], ['Libra', 10, 22], ['Escorpio', 11, 21], ['Sagitario', 12, 21], ['Capricornio', 12, 31],
];

// Signo solar aproximado (las fechas de cambio pueden variar un día según el año).
export function sunSign(date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  for (const [name, month, lastDay] of SIGNS) {
    if (m < month || (m === month && d <= lastDay)) return name;
  }
  return 'Capricornio';
}

const DAILY = [
  { text: 'Hoy puede ser una buena oportunidad para preguntarte qué estás intentando controlar y qué podrías permitirte soltar.', intention: 'Hoy elijo soltar lo que no depende de mí.', question: '¿Qué cambiaría si confiara un poco más en el proceso?', action: 'Escribe una intención y déjala junto a tu cama.' },
  { text: 'La energía de hoy invita a escucharte antes de responder a lo que otros esperan de ti.', intention: 'Hoy me escucho primero.', question: '¿Qué necesito yo, ahora mismo?', action: 'Antes de decir que sí a algo, respira tres veces.' },
  { text: 'Un día para lo pequeño: los gestos sencillos también sostienen.', intention: 'Hoy honro lo simple.', question: '¿Qué gesto pequeño me hizo bien esta semana?', action: 'Prepara algo caliente y tómalo sin pantallas.' },
  { text: 'Quizá hoy no se trata de avanzar más rápido, sino de avanzar con más presencia.', intention: 'Hoy voy a mi ritmo.', question: '¿Dónde me estoy exigiendo de más?', action: 'Haz una sola cosa a la vez durante una hora.' },
  { text: 'Hoy puede salir a la luz algo que sentías desde hace tiempo. Dale espacio sin juzgarlo.', intention: 'Hoy me permito sentir.', question: '¿Qué emoción he estado evitando?', action: 'Escribe tres líneas sin corregir nada.' },
  { text: 'Un buen día para cuidar tus límites con amabilidad, contigo y con los demás.', intention: 'Hoy cuido mi energía.', question: '¿A qué necesito decir que no?', action: 'Silencia una notificación que te inquieta.' },
  { text: 'La curiosidad puede ser tu mejor guía hoy. Pregunta más, supón menos.', intention: 'Hoy miro con curiosidad.', question: '¿Qué me gustaría aprender de esta situación?', action: 'Camina diez minutos observando algo nuevo.' },
  { text: 'Hoy podría ser un día para reconocer lo que ya lograste, en lugar de lo que falta.', intention: 'Hoy reconozco mi camino.', question: '¿De qué me siento orgullosa este mes?', action: 'Anota un logro, aunque parezca pequeño.' },
  { text: 'Lo que hoy se siente lento también está creciendo. Dale tiempo.', intention: 'Hoy confío en los tiempos.', question: '¿Qué estoy apurando que necesita paciencia?', action: 'Riega una planta o cuida algo vivo.' },
  { text: 'Un día para conectar: una conversación sincera puede aligerar mucho.', intention: 'Hoy me abro a los demás.', question: '¿Con quién me gustaría hablar de verdad?', action: 'Envía un mensaje cariñoso a alguien.' },
  { text: 'Hoy tu cuerpo tiene algo que decirte. Escúchalo antes de exigirle.', intention: 'Hoy escucho a mi cuerpo.', question: '¿Qué me está pidiendo mi cuerpo?', action: 'Estírate dos minutos al despertar.' },
  { text: 'Un buen momento para ordenar: afuera y adentro.', intention: 'Hoy hago espacio.', question: '¿Qué ya no necesito guardar?', action: 'Ordena un cajón o una carpeta pendiente.' },
];

const WEEKLY = [
  { text: 'Esta semana invita a terminar lo que empezaste antes de abrir algo nuevo.', intention: 'Cierro con calma.', question: '¿Qué pendiente me daría paz terminar?', action: 'Elige un pendiente y dale una hora.' },
  { text: 'Una semana para cuidar tu descanso como algo importante, no como un premio.', intention: 'Mi descanso es prioridad.', question: '¿Qué me impide descansar bien?', action: 'Adelanta tu hora de dormir media hora.' },
  { text: 'Los vínculos están en el centro esta semana. Rodéate de quien te hace bien.', intention: 'Elijo compañías que me nutren.', question: '¿Quién me hace sentir en casa?', action: 'Agenda un encuentro con alguien que quieres.' },
  { text: 'Semana de pequeñas decisiones valientes. No necesitas un gran salto.', intention: 'Doy un paso a la vez.', question: '¿Qué paso pequeño he estado posponiendo?', action: 'Haz hoy ese paso, por pequeño que sea.' },
  { text: 'Esta semana, la creatividad puede ayudarte a procesar lo que sientes.', intention: 'Me expreso sin juzgarme.', question: '¿Qué quiero crear solo por gusto?', action: 'Dedica 20 minutos a algo creativo.' },
  { text: 'Una semana para volver a tus rutinas con cariño, sin rigidez.', intention: 'Mis rutinas me sostienen.', question: '¿Qué hábito me hace bien de verdad?', action: 'Retoma un ritual que hayas dejado.' },
];

const MONTHLY = [
  { text: 'Un mes para sembrar: no esperes resultados inmediatos, cuida el proceso.', intention: 'Siembro con paciencia.', question: '¿Qué quiero que florezca este mes?', action: 'Escribe tres intenciones para el mes.' },
  { text: 'Este mes trae la oportunidad de soltar viejas exigencias.', intention: 'Me libero de lo que pesa.', question: '¿Qué exigencia ya no es mía?', action: 'Escribe una carta a una versión anterior de ti.' },
  { text: 'Un mes para cuidar tu cuerpo como tu hogar más cercano.', intention: 'Habito mi cuerpo con cariño.', question: '¿Cómo quiero cuidarme este mes?', action: 'Elige un movimiento que disfrutes y repítelo.' },
  { text: 'Mes de claridad: lo que estaba confuso puede empezar a ordenarse.', intention: 'Confío en mi intuición.', question: '¿Qué ya sé, aunque me cueste aceptarlo?', action: 'Dedica una tarde a planear sin prisa.' },
];

function pick(list, n) {
  return list[((n % list.length) + list.length) % list.length];
}

export function horoscope(period, date, signIndex = 0) {
  const start = new Date(date.getFullYear(), 0, 1);
  const day = Math.floor((date - start) / 86400000);
  if (period === 'Semana') return pick(WEEKLY, Math.floor(day / 7) + signIndex);
  if (period === 'Mes') return pick(MONTHLY, date.getMonth() + signIndex);
  return pick(DAILY, day + signIndex);
}

export const SIGN_NAMES = SIGNS.slice(0, 12).map(([name]) => name);
