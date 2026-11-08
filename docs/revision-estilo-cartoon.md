# Revisión de estilo: integrar el trabajo de la rama hambu

Encargo para revisar lo que entró en el commit `2dcaec3` ("Merge con trabajo de Peraltita") y adaptarlo al estilo del sitio sin perder las buenas ideas.

El estilo del sitio es cartoon, simple, colorido y apto para todas las edades: niños, papás y abuelos tienen que entenderlo a la primera. La referencia completa está en `docs/estilos.md` y en la página `#/estilos`.

## Cómo trabajar

1. Leer `docs/estilos.md` y abrir el sitio para ver el estilo actual antes de tocar nada
2. Revisar cada punto de la lista de abajo y decidir si se integra, se adapta o se quita
3. Todo lo nuevo se construye dentro de la app de Vue (`frontend/src`), con los estilos en `frontend/src/style.css`
4. Probar con `npm test` y `npm run build`, y revisar en celular y en computadora
5. No cambiar textos de emergencia (números, refugios, avisos) sin revisar la fuente en `docs/investigacion-tijuana.md`

## Ideas que se quedan

Estas ideas son buenas y hay que conservarlas, pero rehechas con nuestro estilo:

- **Juegos:** las tres dinámicas ("Escape de la tormenta", "Cada decisión cuenta" y "Arme su mochila") con su panel de "Cómo participar". Pasarlas a una vista de Vue en `/juegos`, que ya existe como página vacía
- **Consejos antes, durante y después de la lluvia:** las tres tarjetas con sus iconos animados (paraguas, tormenta, casa con sol). Funcionan muy bien con las animaciones que ya tenemos
- **Información:** las páginas de "Aprende" con lecciones. Integrarlas a la vista de El Niño o como vista nueva
- **Ilustraciones:** las imágenes de `assets/images` se ven bien y van con la idea cartoon. Hay que comprimirlas (cada una pesa entre 2.5 y 2.8 MB, en celular tardan mucho) a WebP de menos de 200 KB
- **Menú para celular:** el botón de menú que se despliega en pantallas chicas
- **Respaldo del logo:** si no carga el escudo chico, se usa el grande (`recoverLogo` en `App.vue`)
- **Redes sociales en el pie de página**

## Lo que rompe el estilo

### Estructura

- **Hay dos sitios en uno.** Las páginas de `frontend/public/pages/*.html` son HTML suelto con su propio CSS y JS, fuera de Vue. Además hay una copia completa en la raíz del repo (`index.html`, `assets/`, `css/`, `js/`, `pages/`). Todo eso se tiene que pasar a vistas de Vue y la copia de la raíz se borra
- **`hambu-bridge.js` reescribe la página después de cargar.** Cambia el encabezado de Vue por uno hecho a mano, mete secciones nuevas con `innerHTML` y borra el contador de visitas. Esto choca con Vue y puede romperse en cualquier cambio. Su contenido se pasa a componentes y el archivo se elimina
- **Dos menús distintos.** El menú de Vue tiene Emergencias, El Niño, Plan familiar y Mochila. El inyectado tiene Inicio, Juegos, Información y Consejos. Hay que acordar uno solo

### Tono

- **El sitio habla de tú.** `hambu-bridge.js` cambia todo a usted ("Llame al 911", "Prepárese", "su") con reemplazos de texto automáticos. Hay que regresar a tú en todo el sitio, incluidas las páginas nuevas
- **Títulos en mayúsculas** como "PARA LLEVAR CONSIGO", "APRENDA JUGANDO" o "RUTA SEGURA". En el sitio no usamos etiquetas en mayúsculas
- **Flechas ↗ en cada tarjeta y botón.** Quitar: la tarjeta completa ya es el enlace
- **Frases que no dicen nada,** como "Juegos para tomar mejores decisiones." o "Actividades para aprender participando". Cambiar por textos cortos y concretos, sin punto final
- **Números inventados:** las tarjetas de juegos dicen "8 personas jugando", "11 jugando". No hay datos reales detrás, así que se quitan

### Visual

- **Letra de los títulos.** `interface-refresh.css` cambia los títulos a DM Sans. Los títulos van en Barlow Condensed
- **Sombras difusas y desenfoques** (`box-shadow` grandes, `backdrop-filter: blur`) y degradados de fondo. El estilo cartoon usa colores sólidos y el canto sólido abajo de los botones principales
- **Tarjetas que suben o crecen al pasar el puntero** (`translateY`, `scale`). En botones chicos nada cambia de lugar ni de tamaño
- **Animaciones apagadas a la fuerza.** Hay muchos `animation: none !important` que matan las animaciones del sitio. Se quitan, y las pausas se manejan solo con el botón "Pausar animaciones" y con reducir movimiento
- **Fondo crema** (`--cream: #f7f8f3`). El fondo del sitio es blanco

### Contenido del inicio

- En `Home.vue` se quitó la nota que explica cómo entrar a un refugio (llamar a la delegación, o al 911 si hay peligro). Es información importante y tiene que volver
- También se quitó "Tijuana, Baja California" del bloque del 911. Revisar si fue a propósito

## Antes de empezar, confirmar con el equipo

- **El nombre.** El merge cambió "Cuenca Cimarrón" por "Cuenca Cimarrona" en todo el sitio, el README y la API. Confirmar cuál es el bueno antes de tocar nada más
- **El menú final:** qué apartados van arriba y en qué orden
- **El README:** el merge lo reemplazó por otro más formal. Decidir cuál se queda

## Listo cuando

- Todo vive en Vue y no queda ningún HTML suelto ni copia en la raíz
- El sitio habla de tú en todas partes
- Juegos, Consejos e Información se ven como el resto del sitio: colores sólidos, esquinas redondas, títulos en Barlow Condensed y animaciones que cuentan algo
- Las imágenes pesan menos de 200 KB cada una
- Pasan las pruebas, compila sin errores y se ve bien en celular
