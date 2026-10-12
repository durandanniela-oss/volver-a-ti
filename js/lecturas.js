import { transitsFor, moonLongitude, signOf } from './astro.js';

// Lecturas por área de vida, en tono reflexivo (inspiradas en el formato de Astroflow).
// Son una herramienta de reflexión y entretenimiento, no predicciones.

export const AREAS = [
  { id: 'amor', name: 'Amor', art: 'amor' },
  { id: 'trabajo', name: 'Trabajo', art: 'trabajo' },
  { id: 'hogar', name: 'Familia y hogar', art: 'hogar' },
  { id: 'social', name: 'Vida social', art: 'social' },
  { id: 'identidad', name: 'Identidad', art: 'identidad' },
  { id: 'creatividad', name: 'Creatividad y sentido', art: 'creatividad' },
  { id: 'autocuidado', name: 'Autocuidado', art: 'autocuidado' },
];

export const TYPES = {
  Oportunidad: 'Energía que fluye a tu favor',
  Reto: 'Una tensión que te invita a crecer',
  Equilibrio: 'Un buen momento para observar',
  Inicio: 'Una semilla nueva',
};

const R = (title, body, question, action) => ({ title, body, question, action });

export const READINGS = {
  amor: {
    Oportunidad: R('Abrir el corazón sin prisa', 'Hoy puede ser más fácil decir lo que sientes con ternura. No hace falta un gran gesto: una frase honesta, una mirada atenta o un mensaje sincero pueden acercarte.', '¿Qué me gustaría que la otra persona supiera de mí?', 'Envía un mensaje cariñoso sin esperar respuesta.'),
    Reto: R('Lo que esperas y lo que pides', 'Puede aparecer una pequeña fricción entre lo que esperas y lo que realmente pides. Antes de reaccionar, pregúntate si lo has dicho con claridad.', '¿Qué necesito y aún no he pedido?', 'Escribe tu necesidad en una sola frase, sin reproches.'),
    Equilibrio: R('Quererte también cuenta', 'Un día para notar cómo te tratas en tus vínculos. El amor que das florece mejor cuando no te olvidas de ti.', '¿Me doy a mí lo que doy a los demás?', 'Haz hoy algo amable por ti, como lo harías por alguien que quieres.'),
    Inicio: R('Una nueva forma de amar', 'Algo empieza a moverse en tu manera de vincularte. Observa sin forzar: lo nuevo necesita tiempo para mostrarse.', '¿Qué tipo de amor quiero cultivar?', 'Escribe tres cualidades del vínculo que deseas.'),
  },
  trabajo: {
    Oportunidad: R('Un paso más allá', 'Puede ser un buen momento para avanzar en algo que venías posponiendo. Tu claridad está de tu lado: aprovéchala sin exigirte de más.', '¿Qué paso concreto me acercaría a lo que quiero?', 'Elige una tarea importante y dale 30 minutos sin distracciones.'),
    Reto: R('Menos urgencia, más dirección', 'Tal vez sientas presión o demasiadas cosas a la vez. No todo es urgente: ordenar prioridades puede devolverte la calma.', '¿Qué de mi lista realmente importa hoy?', 'Tacha una tarea que puede esperar.'),
    Equilibrio: R('Tu ritmo es válido', 'Un día para revisar cómo trabajas, más que cuánto. Las pausas también son parte de un buen trabajo.', '¿En qué momento del día rindo mejor?', 'Agenda una pausa real de 10 minutos.'),
    Inicio: R('Sembrar una idea', 'Una idea nueva puede aparecer. No necesitas tenerla resuelta: solo anotarla y dejarla crecer.', '¿Qué proyecto me ilusiona de verdad?', 'Anota la idea con todo detalle, sin juzgarla.'),
  },
  hogar: {
    Oportunidad: R('Un hogar que te abraza', 'Hoy puede ser bonito cuidar tu espacio o compartir con tu familia. Los pequeños rituales en casa te devuelven a ti.', '¿Qué hace que mi casa se sienta como hogar?', 'Ordena un rincón y pon algo que te guste a la vista.'),
    Reto: R('Viejas dinámicas', 'Algún patrón familiar puede despertar emociones conocidas. Puedes elegir responder distinto esta vez.', '¿Qué patrón no quiero repetir?', 'Respira tres veces antes de responder en una conversación difícil.'),
    Equilibrio: R('Raíces y espacio propio', 'Un buen día para equilibrar el tiempo con los tuyos y el tiempo a solas. Ambos te nutren.', '¿Qué necesito de mi familia y qué de mí misma?', 'Regálate un rato a solas en tu lugar favorito de la casa.'),
    Inicio: R('Algo se acomoda', 'Puede comenzar un cambio en tu hogar o en tu forma de habitarlo. Escucha lo que tu espacio te pide.', '¿Qué cambio haría mi casa más mía?', 'Mueve un objeto de lugar y nota cómo te sientes.'),
  },
  social: {
    Oportunidad: R('Conversaciones que suman', 'Las conversaciones pueden fluir con facilidad. Un buen momento para reconectar con alguien o conocer gente nueva.', '¿Con quién me gustaría hablar de verdad?', 'Llama o escribe a alguien que extrañas.'),
    Reto: R('Elegir tu energía', 'Puede que algunas interacciones te cansen más de lo normal. Está bien poner límites amables.', '¿Qué compañías me dejan con más energía y cuáles con menos?', 'Di que no a un plan que no te apetece.'),
    Equilibrio: R('Escuchar y ser escuchada', 'Un día para notar el equilibrio entre lo que das y lo que recibes en tus amistades.', '¿Me siento escuchada en mis relaciones?', 'Pregunta a alguien cómo está, y escucha sin prisa.'),
    Inicio: R('Nuevos círculos', 'Puede abrirse una puerta hacia gente o grupos nuevos. Deja que la curiosidad te guíe.', '¿Qué tipo de comunidad me gustaría tener?', 'Busca un grupo, clase o evento que te llame.'),
  },
  identidad: {
    Oportunidad: R('Brillar a tu manera', 'Hoy puede resultarte más fácil mostrarte tal como eres. Tu autenticidad es tu mejor carta.', '¿Qué parte de mí quiero mostrar más?', 'Usa algo que te haga sentir tú misma.'),
    Reto: R('Lo que crees que deberías ser', 'Puede aparecer la comparación o la duda. No tienes que encajar en ninguna expectativa para ser valiosa.', '¿Con quién me estoy comparando, y para qué?', 'Escribe tres cosas que valoras de ti.'),
    Equilibrio: R('Mirarte con calma', 'Un buen momento para observarte sin juicio, como observarías a alguien querido.', '¿Cómo me hablo cuando me equivoco?', 'Cambia una frase dura que te dices por una más amable.'),
    Inicio: R('Una nueva versión de ti', 'Algo en tu forma de verte empieza a renovarse. Date permiso de explorar.', '¿Qué quiero dejar atrás de mi antigua versión?', 'Escribe una intención para la persona que estás siendo.'),
  },
  creatividad: {
    Oportunidad: R('Crear por gusto', 'Tu creatividad está despierta. No tiene que ser útil ni perfecta: solo tuya.', '¿Qué haría si nadie fuera a verlo?', 'Dedica 20 minutos a crear algo, lo que sea.'),
    Reto: R('Cuando no sale', 'Quizá sientas bloqueo o falta de inspiración. A veces la inspiración llega después de empezar, no antes.', '¿Qué me impide empezar?', 'Haz la versión más pequeña posible de eso que quieres crear.'),
    Equilibrio: R('Lo que le da sentido a tus días', 'Un día para preguntarte qué te hace sentir viva, más allá de las obligaciones.', '¿Cuándo fue la última vez que perdí la noción del tiempo haciendo algo?', 'Escribe tres cosas que le dan sentido a tu vida.'),
    Inicio: R('Una chispa', 'Puede encenderse una nueva pasión o curiosidad. Síguela un poco y mira a dónde te lleva.', '¿Qué me da curiosidad últimamente?', 'Aprende algo pequeño sobre eso hoy.'),
  },
  autocuidado: {
    Oportunidad: R('Escuchar al cuerpo', 'Tu cuerpo está más dispuesto a recibir cuidado. Un buen día para moverte con gusto o descansar sin culpa.', '¿Qué me pide mi cuerpo hoy?', 'Haz una pausa de respiración de 3 minutos.'),
    Reto: R('Bajar el volumen', 'Puede que te sientas más sensible o cansada. No es debilidad: es una señal para bajar el ritmo.', '¿Qué puedo soltar hoy para cuidarme?', 'Cancela o pospón algo que no es necesario.'),
    Equilibrio: R('Pequeños rituales', 'Un día para volver a tus rituales: el té, la rutina de noche, unos minutos sin pantalla.', '¿Qué ritual me hace bien y he dejado de lado?', 'Retoma un ritual hoy, aunque sea por 5 minutos.'),
    Inicio: R('Un hábito nuevo', 'Puede ser un buen momento para empezar un hábito amable contigo.', '¿Qué hábito pequeño me gustaría sostener?', 'Hazlo hoy por primera vez, sin presión.'),
  },
};

// ---------- Lecturas del día ----------

const TYPE_BY_KIND = { Oportunidad: 'Oportunidad', Reto: 'Reto', Inicio: 'Inicio' };

function dayNumber(date) {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000);
}

// Tres lecturas por día. La primera se basa en el tránsito principal (si hay
// fecha de nacimiento); las demás alternan tipos para que el día sea variado.
export function dailyReadings(birthDate, date = new Date(), count = 3) {
  const transits = transitsFor(birthDate, date);
  const day = dayNumber(date);
  const seed = birthDate ? Number(birthDate.replace(/-/g, '')) % 7 : 0;
  const moonSign = signOf(moonLongitude(date));
  const out = [];
  for (let i = 0; i < count; i++) {
    const area = AREAS[(day + seed + i * 3) % AREAS.length];
    const transit = transits[i] || null;
    let type;
    if (transit) type = TYPE_BY_KIND[transit.kind] || 'Equilibrio';
    else type = ['Equilibrio', 'Oportunidad', 'Reto'][(day + i) % 3];
    out.push({
      area,
      type,
      reading: READINGS[area.id][type],
      transit,
      moonSign,
      intensity: transit ? transit.intensity : 2 + ((day + i) % 2),
    });
  }
  return out;
}

export function readingFor(areaId, birthDate, date = new Date()) {
  return dailyReadings(birthDate, date, AREAS.length).find((r) => r.area.id === areaId)
    || dailyReadings(birthDate, date, 1)[0];
}
