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

// ---------- Contenido ampliado ----------

const X = (favor, care, affirmation) => ({ favor, care, affirmation });

// Qué favorece, qué cuidar y una afirmación para cada lectura.
export const EXTRAS = {
  amor: {
    Oportunidad: X(['Conversaciones sinceras', 'Gestos pequeños de cariño', 'Pedir lo que necesitas'], ['Esperar que adivinen lo que sientes', 'Guardar silencio por miedo'], 'Merezco un amor que me escuche y me cuide.'),
    Reto: X(['Hablar desde el "yo siento"', 'Tomarte un tiempo antes de responder', 'Escuchar sin defenderte'], ['Reproches acumulados', 'Decidir en caliente'], 'Puedo expresar lo que necesito con calma y claridad.'),
    Equilibrio: X(['Tiempo a solas para recargarte', 'Notar cómo te sientes en tus vínculos', 'Agradecer a quien te quiere'], ['Darlo todo sin recibir', 'Olvidarte de ti por complacer'], 'El amor que doy empieza por mí.'),
    Inicio: X(['Abrirte a conocer', 'Imaginar el vínculo que deseas', 'Soltar viejas expectativas'], ['Repetir patrones conocidos', 'Apresurar lo que está naciendo'], 'Me abro a amar de una forma nueva.'),
  },
  trabajo: {
    Oportunidad: X(['Empezar lo que venías posponiendo', 'Proponer ideas', 'Pedir apoyo o colaboración'], ['Querer hacerlo todo hoy', 'Compararte con otros'], 'Confío en mi capacidad y avanzo a mi ritmo.'),
    Reto: X(['Ordenar prioridades', 'Delegar o pedir más tiempo', 'Pausas cortas entre tareas'], ['Decir que sí a todo', 'Trabajar sin descanso'], 'No todo es urgente; elijo lo importante.'),
    Equilibrio: X(['Revisar cómo te organizas', 'Cerrar pendientes pequeños', 'Celebrar lo logrado'], ['Medirte solo por lo que produces', 'Saltarte comidas o descansos'], 'Mi valor no depende de cuánto hago.'),
    Inicio: X(['Anotar ideas nuevas', 'Aprender algo', 'Imaginar sin límites'], ['Descartar ideas antes de explorarlas', 'Esperar a tenerlo todo claro'], 'Las ideas nuevas merecen espacio para crecer.'),
  },
  hogar: {
    Oportunidad: X(['Cuidar tu espacio', 'Compartir una comida en casa', 'Rituales sencillos en familia'], ['Llenar la casa de pendientes', 'Postergar el descanso en casa'], 'Mi hogar es un lugar donde puedo descansar.'),
    Reto: X(['Poner límites con cariño', 'Responder distinto a lo de siempre', 'Buscar un rato a solas'], ['Repetir viejas discusiones', 'Cargar con lo que no te toca'], 'Puedo amar a mi familia y cuidar mis límites.'),
    Equilibrio: X(['Equilibrar tiempo con otros y contigo', 'Ordenar un rincón', 'Llamar a alguien de tu familia'], ['Aislarte por completo', 'Olvidar tus propias necesidades'], 'Mis raíces me sostienen y mi espacio me pertenece.'),
    Inicio: X(['Cambiar algo de lugar', 'Crear un ritual nuevo en casa', 'Imaginar tu hogar ideal'], ['Aferrarte a lo que ya no te sirve', 'Hacer cambios grandes de golpe'], 'Hago de mi casa un reflejo de quien soy.'),
  },
  social: {
    Oportunidad: X(['Reconectar con amistades', 'Conocer gente nueva', 'Compartir lo que sabes'], ['Fingir que todo está bien', 'Llenar la agenda de más'], 'Me rodeo de personas que me hacen bien.'),
    Reto: X(['Elegir con quién pasas tu tiempo', 'Decir que no con amabilidad', 'Descansar de las redes'], ['Compromisos por obligación', 'Compararte en redes sociales'], 'Mi energía es valiosa y elijo dónde ponerla.'),
    Equilibrio: X(['Escuchar con atención', 'Pedir ayuda si la necesitas', 'Agradecer a una amistad'], ['Ser siempre quien sostiene', 'Callar lo que te molesta'], 'Doy y recibo en la misma medida.'),
    Inicio: X(['Unirte a un grupo o clase', 'Escribir a alguien nuevo', 'Explorar comunidades afines'], ['Quedarte solo en lo conocido', 'Juzgarte por ser nueva'], 'Hay espacio para mí en nuevos círculos.'),
  },
  identidad: {
    Oportunidad: X(['Mostrarte tal como eres', 'Tomar decisiones propias', 'Vestirte como te gusta'], ['Pedir permiso para ser tú', 'Minimizar tus logros'], 'Ser yo es suficiente.'),
    Reto: X(['Hablarte con amabilidad', 'Recordar lo que valoras de ti', 'Alejarte de comparaciones'], ['Autocrítica dura', 'Buscar aprobación externa'], 'No necesito ser perfecta para ser valiosa.'),
    Equilibrio: X(['Observarte sin juicio', 'Escribir sobre ti', 'Notar tus avances'], ['Exigirte cambiar todo', 'Ignorar lo que sientes'], 'Me miro con la ternura con la que miro a quien quiero.'),
    Inicio: X(['Probar algo diferente', 'Definir una intención personal', 'Soltar etiquetas viejas'], ['Aferrarte a quien fuiste', 'Cambiar solo por complacer'], 'Me permito convertirme en quien estoy siendo.'),
  },
  creatividad: {
    Oportunidad: X(['Crear sin propósito', 'Seguir tu curiosidad', 'Jugar'], ['Buscar perfección', 'Esperar el momento ideal'], 'Mi creatividad merece espacio en mis días.'),
    Reto: X(['Empezar en pequeño', 'Cambiar de lugar para inspirarte', 'Copiar algo que admiras para aprender'], ['Forzar la inspiración', 'Juzgar lo que haces mientras lo haces'], 'Crear también es intentar.'),
    Equilibrio: X(['Preguntarte qué te da sentido', 'Recordar lo que amabas de niña', 'Contemplar algo bello'], ['Llenar cada minuto de tareas', 'Olvidar lo que te hace sentir viva'], 'Lo que amo hacer le da sentido a mi vida.'),
    Inicio: X(['Explorar un tema nuevo', 'Guardar ideas e inspiración', 'Probar un material o técnica'], ['Abandonar antes de intentar', 'Pensar que es tarde para aprender'], 'Sigo la chispa y veo a dónde me lleva.'),
  },
  autocuidado: {
    Oportunidad: X(['Moverte con gusto', 'Dormir un poco más', 'Comer algo nutritivo y rico'], ['Exigirle a tu cuerpo más de la cuenta', 'Saltarte el descanso'], 'Mi cuerpo es mi casa y lo cuido con cariño.'),
    Reto: X(['Bajar el ritmo', 'Descansar sin culpa', 'Pedir ayuda'], ['Ignorar el cansancio', 'Llenarte de compromisos'], 'Descansar también es avanzar.'),
    Equilibrio: X(['Volver a tus rituales', 'Unos minutos sin pantalla', 'Respirar profundo varias veces'], ['Postergar tu bienestar', 'Cuidar a todos menos a ti'], 'Me doy a mí lo que necesito.'),
    Inicio: X(['Empezar un hábito pequeño', 'Probar una práctica nueva', 'Registrar cómo te sientes'], ['Querer cambiarlo todo de golpe', 'Rendirte si un día no sale'], 'Cada pequeño cuidado cuenta.'),
  },
};

// Qué significa cada tránsito.
export const ASPECT_MEANING = {
  'conjunción con': 'La Luna o el Sol se encuentran con tu Sol natal: un momento de comienzo, en el que tus emociones y tu identidad se mezclan. Buen día para sembrar intenciones.',
  'sextil con': 'Un aspecto amable que abre pequeñas oportunidades. Las cosas fluyen si das el primer paso.',
  'cuadratura con': 'Una tensión que invita a crecer. Puede aparecer fricción entre lo que sientes y lo que quieres; es una señal para ajustar, no para forzar.',
  'trígono con': 'Uno de los aspectos más armoniosos: la energía fluye con facilidad y es más sencillo sentirte en sintonía contigo.',
  'oposición a': 'Dos fuerzas se miran de frente. Puede tocarte equilibrar lo que necesitas tú con lo que necesitan los demás.',
};
export const BODY_MEANING = {
  Luna: 'La Luna se mueve rápido, así que su influencia dura alrededor de un día y se siente sobre todo en las emociones y el ánimo.',
  Sol: 'El Sol avanza despacio, así que su influencia dura varios días y toca tu energía vital y tu sentido de identidad.',
};

// La Luna en cada signo: el tono emocional del día.
export const MOON_SIGNS = {
  Aries: { mood: 'Energía rápida e impulso de empezar cosas. Puede haber poca paciencia.', favors: 'Actividad física, decisiones rápidas, iniciar algo.', tip: 'Respira antes de reaccionar.' },
  Tauro: { mood: 'Necesidad de calma, comodidad y placeres sencillos.', favors: 'Comer rico, descansar, la naturaleza, el contacto físico.', tip: 'No te resistas al cambio por miedo a perder estabilidad.' },
  Géminis: { mood: 'Mente curiosa y ganas de conversar, aprender y moverse.', favors: 'Conversaciones, lecturas, escribir, salidas cortas.', tip: 'Elige pocas cosas para no dispersarte.' },
  Cáncer: { mood: 'Sensibilidad a flor de piel y deseo de refugio.', favors: 'Estar en casa, la familia, cocinar, cuidar y dejarte cuidar.', tip: 'Valida lo que sientes sin encerrarte.' },
  Leo: { mood: 'Ganas de brillar, expresarte y sentirte vista.', favors: 'Crear, celebrar, jugar, mostrar tu trabajo.', tip: 'Tu valor no depende del aplauso.' },
  Virgo: { mood: 'Deseo de orden, detalle y ser útil.', favors: 'Organizar, rutinas de salud, terminar pendientes.', tip: 'Cuidado con la autoexigencia.' },
  Libra: { mood: 'Búsqueda de armonía, belleza y compañía.', favors: 'Vínculos, arte, conversaciones amables, embellecer tu espacio.', tip: 'No te pierdas por complacer.' },
  Escorpio: { mood: 'Emociones intensas y profundas; ganas de ir al fondo.', favors: 'Introspección, conversaciones honestas, soltar lo que ya no sirve.', tip: 'No todo necesita resolverse hoy.' },
  Sagitario: { mood: 'Optimismo, ganas de aventura y de aprender.', favors: 'Planes, viajes, estudios, conversaciones sobre el sentido de la vida.', tip: 'Cuida no prometer de más.' },
  Capricornio: { mood: 'Sentido práctico y ganas de avanzar en metas.', favors: 'Trabajo enfocado, planear, estructurar.', tip: 'Recuerda descansar; no todo es productividad.' },
  Acuario: { mood: 'Necesidad de libertad, ideas nuevas y espacio propio.', favors: 'Amistades, comunidad, proyectos diferentes.', tip: 'Conecta también con lo que sientes, no solo con lo que piensas.' },
  Piscis: { mood: 'Sensibilidad, intuición y ganas de soñar.', favors: 'Arte, música, meditación, descanso, ayudar a otros.', tip: 'Pon límites para no absorber lo de los demás.' },
};

// Perfil de cada signo para tu Sol y tu Luna natal.
export const SIGN_PROFILES = {
  Aries: { element: 'Fuego', mode: 'Cardinal', essence: 'Iniciativa, valentía y entusiasmo para empezar.', strengths: ['Valentía', 'Iniciativa', 'Honestidad'], care: 'Aprender a esperar y a terminar lo que empiezas.', moon: 'Sientes rápido e intenso; necesitas expresar tus emociones y moverte para procesarlas.' },
  Tauro: { element: 'Tierra', mode: 'Fijo', essence: 'Calma, constancia y disfrute de lo sencillo.', strengths: ['Constancia', 'Lealtad', 'Sensibilidad a la belleza'], care: 'Abrirte al cambio sin sentir que pierdes tu seguridad.', moon: 'Necesitas estabilidad y contacto con lo concreto: comida, descanso, naturaleza y cariño físico.' },
  Géminis: { element: 'Aire', mode: 'Mutable', essence: 'Curiosidad, comunicación y adaptabilidad.', strengths: ['Curiosidad', 'Ingenio', 'Facilidad para comunicar'], care: 'Enfocar tu energía y conectar con lo que sientes, no solo con lo que piensas.', moon: 'Procesas tus emociones hablándolas o escribiéndolas; necesitas variedad y conversación.' },
  Cáncer: { element: 'Agua', mode: 'Cardinal', essence: 'Sensibilidad, cuidado y memoria emocional.', strengths: ['Empatía', 'Intuición', 'Capacidad de cuidar'], care: 'Cuidarte a ti tanto como cuidas a otros.', moon: 'Sientes profundo y necesitas un refugio seguro; el hogar y los vínculos cercanos te calman.' },
  Leo: { element: 'Fuego', mode: 'Fijo', essence: 'Creatividad, calidez y deseo de expresarte.', strengths: ['Generosidad', 'Creatividad', 'Calidez'], care: 'Brillar sin depender de la aprobación de los demás.', moon: 'Necesitas sentirte vista y querida; expresarte y crear te ayuda a sentirte bien.' },
  Virgo: { element: 'Tierra', mode: 'Mutable', essence: 'Detalle, servicio y búsqueda de mejora.', strengths: ['Atención al detalle', 'Practicidad', 'Ganas de ayudar'], care: 'Soltar la autoexigencia y aceptar lo imperfecto.', moon: 'Te calma el orden y sentirte útil; cuidar tu rutina y tu cuerpo te da paz.' },
  Libra: { element: 'Aire', mode: 'Cardinal', essence: 'Armonía, belleza y conexión con los demás.', strengths: ['Diplomacia', 'Sentido estético', 'Empatía en los vínculos'], care: 'Decir lo que piensas aunque genere desacuerdo.', moon: 'Necesitas armonía y compañía; los conflictos te desequilibran y la belleza te calma.' },
  Escorpio: { element: 'Agua', mode: 'Fijo', essence: 'Intensidad, profundidad y capacidad de transformación.', strengths: ['Profundidad', 'Lealtad', 'Resiliencia'], care: 'Confiar y soltar el control de lo que no depende de ti.', moon: 'Sientes con intensidad y necesitas vínculos de confianza profunda; te renuevas soltando.' },
  Sagitario: { element: 'Fuego', mode: 'Mutable', essence: 'Optimismo, libertad y búsqueda de sentido.', strengths: ['Optimismo', 'Espíritu aventurero', 'Sinceridad'], care: 'Sostener los compromisos y bajar a tierra tus ideas.', moon: 'Necesitas libertad y horizonte; aprender, viajar o planear te levanta el ánimo.' },
  Capricornio: { element: 'Tierra', mode: 'Cardinal', essence: 'Responsabilidad, constancia y ambición tranquila.', strengths: ['Disciplina', 'Madurez', 'Perseverancia'], care: 'Permitirte descansar y mostrar tu vulnerabilidad.', moon: 'Te cuesta mostrar lo que sientes; te da seguridad avanzar en tus metas y tener estructura.' },
  Acuario: { element: 'Aire', mode: 'Fijo', essence: 'Originalidad, libertad y visión de comunidad.', strengths: ['Originalidad', 'Visión de futuro', 'Sentido de comunidad'], care: 'Conectar con tus emociones y dejarte acompañar.', moon: 'Necesitas espacio propio y libertad emocional; las amistades son tu gran sostén.' },
  Piscis: { element: 'Agua', mode: 'Mutable', essence: 'Sensibilidad, intuición e imaginación.', strengths: ['Compasión', 'Intuición', 'Creatividad'], care: 'Poner límites y no cargar con las emociones de otros.', moon: 'Absorbes el ambiente que te rodea; el arte, el descanso y la soledad te ayudan a recargarte.' },
};
