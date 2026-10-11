# Volver a ti

Una app de bienestar y journaling para volver a ti. Es una web app instalable (PWA): se abre desde la pantalla de inicio del iPhone como cualquier app y guarda todo **solo en el dispositivo**.

## Qué incluye

- **Bienvenida** y **check-in diario**: emociones, energía, cuerpo, sueño, qué necesitas y una nota.
- **☼ Mi día**: energía disponible, fase del ciclo, carta del día, movimiento sugerido (considera cansancio, molestias y cólicos), respiración si registraste ansiedad, medicamentos pendientes, rutina facial y un espacio rápido para escribir.
- **♡ Mi bienestar**
  - **Diario**: entradas con texto y hasta 6 fotos, filtros y preguntas guiadas.
  - **Pausa**: siete prácticas (ansiedad, dormir, concentrarte, soltar tensión, empezar el día, procesar emociones, descansar), cada una con su ritmo de respiración y un sonido suave opcional generado en el teléfono.
  - **Mapa emocional**: energía y ánimo por semana o mes, y patrones de tus registros (emoción frecuente, días con más energía, movimiento, sueño, ciclo y palabras frecuentes del diario).
- **◯ Mi cuerpo**
  - **Ciclo**: inicio y fin del periodo, fase estimada, próximo periodo con rango de incertidumbre, registro diario de flujo, dolor, síntomas y emociones, historial y tendencias de energía.
  - **Movimiento**: sugerencias según tu energía, registro de actividad con sensación antes y después, semana e historial.
  - **Nutrición**: hidratación, diario visual de comidas con foto, cómo te hizo sentir y hambre/saciedad. El peso es opcional y está oculto por defecto.
  - **Cuidado**: medicamentos con dosis y horarios, tomas registradas u omitidas, tomas "si lo necesito", citas con notas y resultados, seguimiento y **resumen para tu médico** (compartir o guardar como PDF).
- **✧ Mi universo**: fase real de la Luna, signo solar (con tu fecha de nacimiento), horóscopo reflexivo diario, semanal y mensual, carta del día y cartas guardadas.
- **❋ Mis rituales**: rutina facial de mañana y noche editable, pequeños rituales del día y registro de piel con foto de progreso opcional.
- **Mi perfil**: objetivos, preferencias (astrología, peso, fecha de nacimiento), copia de seguridad, restaurar y borrar datos.

Las sugerencias son orientativas: no son diagnósticos ni sustituyen atención profesional. Las fechas del ciclo son estimaciones y no sirven como método anticonceptivo.

### Lo que una web app todavía no puede hacer

- **Recordatorios con notificación** (medicamentos, check-in): en iPhone necesitan un servidor o una app nativa. Por ahora los pendientes aparecen en Mi día y Mi cuidado.
- **Bloqueo con Face ID**: requiere la app nativa.
- **Luna y ascendente de la carta natal**: necesitan hora y lugar de nacimiento y un cálculo astronómico completo.

## Probarla en tu Mac

```bash
cd "/Users/daniduran/Documents/App Bienestar Dani"
python3 -m http.server 5173
```

Abre <http://localhost:5173> en Chrome o Safari.

## Instalarla en tu iPhone

El iPhone necesita abrirla desde una dirección `https://`. La forma gratuita es GitHub Pages:

1. Sube esta carpeta a un repositorio de GitHub.
2. En el repositorio: **Settings › Pages › Build and deployment**, elige la rama `main` y la carpeta `/ (root)`.
3. Espera uno o dos minutos y abre la dirección que te da GitHub (algo como `https://tu-usuario.github.io/volver-a-ti/`) en **Safari** del iPhone.
4. Toca **Compartir › Agregar a pantalla de inicio**.

Tus datos se guardan en el teléfono, no en GitHub: el repositorio solo tiene el código.

## Tus datos

- Todo vive en IndexedDB dentro de Safari, en tu teléfono. No hay servidor ni cuentas.
- Si borras los datos de Safari o cambias de teléfono, se pierden. Usa **Mi perfil › Hacer copia de seguridad** de vez en cuando y guarda el archivo en Archivos o iCloud Drive.
- Para pasar tus datos a otro teléfono: haz una copia en el anterior y usa **Restaurar una copia** en el nuevo.
- Las copias (`volver-a-ti-AAAA-MM-DD.json`) contienen tu diario y fotos: no las subas al repositorio (ya están en `.gitignore`).

## Estructura

```
index.html            Punto de entrada
manifest.webmanifest  Nombre, colores e íconos para instalarla
sw.js                 Permite abrirla sin conexión
css/app.css           Estilos y colores (paleta inspirada en Notis+)
js/app.js             Navegación entre pantallas
js/db.js              Almacenamiento local y copias de seguridad
js/ui.js              Íconos, barra de navegación, chips, fechas y avisos
js/data.js            Cartas, preguntas, opciones y reglas de sugerencias
js/cycle.js           Cálculos del ciclo
js/meds.js            Dosis programadas y tomas
js/astro.js           Fase lunar, signo solar y horóscopo reflexivo
js/screens/           Un archivo por pantalla
icons/                Ícono de la app
```

No usa librerías ni pasos de compilación: basta con editar los archivos y recargar.
