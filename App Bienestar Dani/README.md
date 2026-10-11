# Volver a ti

Una app de bienestar y journaling para volver a ti. Es una web app instalable (PWA): se abre desde la pantalla de inicio del iPhone como cualquier app y guarda todo **solo en el dispositivo**.

## Qué incluye esta primera versión

- **Bienvenida**: nombre opcional y las promesas de privacidad.
- **Check-in diario**: emociones, energía del 1 al 5, cómo está tu cuerpo, qué necesitas y una nota.
- **Mi día**: energía disponible, carta del día, movimiento sugerido según tu check-in, respiración si registraste ansiedad y un espacio rápido para escribir.
- **Mi diario**: entradas con título, texto y hasta 6 fotos (se reducen a 1600 px para ahorrar espacio), filtros y pregunta del día.
- **Carta del día**: 30 cartas, guardar favoritas, escribir sobre ella y compartir.
- **Mi pausa**: respiración guiada de 3 minutos (inhala 4 · sostén 2 · exhala 6).
- **Mi perfil**: nombre, copia de seguridad, restaurar y borrar datos.

Mi cuerpo y Mis rituales muestran "Muy pronto": llegan en la siguiente fase.

Las sugerencias son orientativas: no son diagnósticos ni sustituyen atención profesional.

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
js/ui.js              Íconos, barra de navegación, fechas y avisos
js/data.js            Cartas, preguntas y reglas de sugerencias
js/screens/           Un archivo por pantalla
icons/                Ícono de la app
```

No usa librerías ni pasos de compilación: basta con editar los archivos y recargar.
