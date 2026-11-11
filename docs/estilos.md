# Estilos de Cuenca Cimarrona

La versión visual está en el sitio, en `#/estilos` (enlace "Estilos" en el pie de página). Este archivo es la referencia rápida para quien edite el código.

## Marca

La marca del proyecto es el cimarrón brigadista. Las reglas completas están en el **Manual de identidad de Cuenca Cimarrona v1.2** (`docs/identidad/`). Aquí va lo que se necesita para el sitio.

- Escudo UABC: `frontend/public/brand/uabc-escudo.png`. Se usa tal como está, sin recortar ni cambiar colores. Va en el pie de página, junto a la firma del proyecto
- Archivos web de la marca: `frontend/public/brand/cuenca/` (versiones optimizadas del kit; el kit completo y los originales están en `docs/identidad/`)

| Archivo | Dónde se usa |
| --- | --- |
| `favicon.ico`, `icono-32.png`, `icono-192.png` | Pestaña del navegador |
| `icono-180.png` | Ícono al guardar el sitio en iPhone |
| `icono-96.webp` | Encabezado, junto al nombre (se ve a 44 px) |
| `firma-horizontal-claro.webp`, `firma-horizontal-oscuro.webp` | Descargas de la página de estilos (firma con el nombre en Lilita One) |
| `assets/images/logo_uabc-80.webp` | Escudo UABC del pie (6 KB en lugar de 83 KB) |
| `mascota-240.webp`, `mascota-480.webp` | Cimarrón guía (`MascotGuide.vue`) |
| `silueta.png` | Máscara de la silueta en marcas de agua |
| `sello-480.webp` | Página de estilos |
| `social-card.png` | Vista previa al compartir el enlace (WhatsApp, redes) |

### Cimarrón guía

El componente `MascotGuide.vue` pone al cimarrón presentando algo.

- El globo flota junto con el personaje (la animación está en todo el componente, no solo en la imagen)
- Siempre a la **izquierda** de lo que presenta: su mano derecha abierta señala hacia la derecha. **Nunca se voltea**: el manual pide conservar la mano izquierda en el chaleco y la derecha abierta
- **No se gira, estira ni deforma** (manual, pág. 10). Su animación es solo entrar deslizándose y flotar 5 px
- Mínimo **88 px** de ancho; más chico se usa el icono o el sello (manual, pág. 8)
- Globo opcional (`bubble`) con una frase de 2 a 4 palabras, en Baloo 2, arriba del personaje para no invadir su área de respeto
- **Uno por pantalla** y en momentos clave. Nunca cerca del 911 ni de avisos oficiales: ahí manda la emergencia

| Dónde | Qué presenta |
| --- | --- |
| Inicio, "Juegos y dinámicas" | Los juegos, con "¡Practica conmigo!" |
| Inicio, "Síguenos en redes" | Las redes, con "¡Síguenos!" |
| Ventana del mapa de riesgo | El mapa |
| Juegos, escena del encabezado | La ruta segura |
| Juegos, panel "Cómo participar" | Los pasos, con "¡Así se juega!" |
| Página de estilos | Ejemplo de uso |

### Silueta

Máscara plana del personaje (`.cc-silhouette` o la clase `.cc-watermark` en una tarjeta).

- Solo de fondo: 8 % de opacidad en tarjetas claras y blanco al 10 % sobre verde
- Solo en tarjetas de **160 px o más** de alto. En botones chicos no se lee y ensucia
- En la esquina inferior derecha, puede recortarse por el borde; nunca se gira ni se voltea
- Al pasar el puntero sube 6 px y se marca un poco más

| Dónde | Clase |
| --- | --- |
| Tarjetas de "Prepárate antes de que llueva" | `.cc-watermark` |
| Tarjetas de juegos (Inicio y Juegos) | `.cc-watermark` |
| Encabezados verdes de El Niño, Plan, Mochila y Estilos | `.page-heading::after` |
| Fondo de la sección "Elige una dinámica" | `.cc-silhouette` |
| Bloque de presentación de Información y Consejos | `.page-intro::after` |

No lleva silueta: la banda del 911, el aviso de El Niño, los números de emergencia, los refugios y el mapa de riesgo.

## Colores

| Nombre | Código | Variable | Para qué |
| --- | --- | --- | --- |
| Verde UABC | `#00723F` | `--uabc-green` | Botones, menú, bloques de énfasis |
| Ocre UABC | `#DD971A` | `--uabc-gold` | Avisos, números de paso, detalles |
| Verde profundo | `#003D24` | `--green-deep` | Títulos y texto sobre ocre |
| Ocre texto | `#8A5A00` | `--gold-text` | Texto chico en tono ocre |
| Verde claro | `#E6F4EC` | `--green-tint` | Fondos de tarjetas |
| Ocre claro | `#FFF1D6` | `--gold-tint` | Fondos de avisos |

El ocre UABC no sirve para texto sobre blanco: no tiene contraste suficiente. Para eso está el ocre texto.

Tarjetas de servicios (fondo / texto): Protección Civil `#EAF2FF` / `#0B4FA8`, Bomberos `#FFF1E6` / `#A83200`, Denuncia anónima `#F2EDFF` / `#5B2CA8`, Ambulancia `#FFEBEE` / `#B3121F`.

## Letras

- Títulos: Barlow Condensed 700 u 800
- Texto: DM Sans 400 a 700
- Marca: **Lilita One**, solo para el nombre "Cuenca Cimarrona" (encabezado, pie, página de estilos y firma). Clase `.wordmark`, variable `--font-brand`. Tamaños: 26 px en computadora, 22 px en tableta, 19 px en celular y 16 px en 320 px
- Juego: Baloo 2 700 u 800, solo en lo que invita a jugar (el botón "Aprende jugando" y las etiquetas de la sección Juegos). Nunca en títulos ni en texto corrido. Los archivos están en `frontend/public/assets/fonts/` (licencia OFL)

## Cómo escribimos

- Primero lo que sirve en una emergencia, después la explicación
- Frases cortas
- Sin punto final en títulos, botones y textos de una sola oración
- Sin eslóganes

## Pantalla de bienvenida

`SplashScreen.vue`, montada en `App.vue`. Presenta a Cuenca Cimarrona como colaboración entre UABC, FCQI, Ayuntamiento de Tijuana, Protección Civil Tijuana, Bomberos Tijuana y Cruz Roja Mexicana (Delegación Tijuana).

- Es una entrada corta, como la de Netflix o Disney: dura **5 s** (4.2 s en pantalla y 0.8 s desvaneciéndose) y **no se puede saltar**. Los logos quedan a la vista unos 3 s antes de desvanecerse
- Sale **una vez por visita** (se guarda en `sessionStorage`)
- Orden de la animación: sello, nombre, línea ocre, "es una colaboración entre" y los seis logos uno tras otro. Al irse, los colaboradores se quedan a la vista mientras todo baja de opacidad
- Pantalla completa en blanco, sin tarjetas ni recuadros: sello, nombre y logos sueltos y grandes. En computadora los seis logos van en una fila; en celular, en dos filas de tres
- Siempre lleva "¿Emergencia? Llama al 911" debajo de los logos, como única pastilla con borde: la bienvenida nunca estorba en una emergencia
- Los logos van tal cual, sin recolorear y sin marco. Están en `frontend/public/assets/images/aliados/` (WebP, 78 KB en total). Protección Civil es la municipal de Tijuana, no la estatal
- Con menos movimiento o con animaciones apagadas, aparece completa sin brincos y solo se desvanece al irse

## Inicio

Orden de arriba hacia abajo: propósito, 911, aviso de El Niño, números, refugios y mapa, juegos, preparación, consejos y quiénes somos.

- **Propósito** (`.purpose-hero`): va antes del 911 a pedido del equipo, como única excepción a "primero lo que sirve en una emergencia". Por eso en celular es compacto: el 911 empieza justo después del contador
- **Contador** (`.purpose-counter`): la misma cifra del pie (visitas únicas por navegador, `composables/useVisits.js`). Dice "personas ya se están preparando": habla de un proceso en marcha, no promete que ya estén preparadas. Si la API falla no muestra número, solo "Súmate a la gente que ya se está preparando". Nunca se muestran cifras estimadas
- **Invita a alguien**: abre el menú de compartir del teléfono; en computadora copia el enlace
- En celular (600 px o menos) el contador es una sola fila chica: número, texto y botón de compartir solo con icono, para no competir con el 911
- **Quiénes somos** (`.team`): foto del equipo y el enfoque DUA (Diseño Universal para el Aprendizaje: leer, jugar y hacer). La foto se pone en `teamPhoto`, dentro de `Home.vue`; mientras no exista se ve un marco punteado

## Pie de página

Tres columnas en computadora; en celular, una debajo de otra.

- **Marca y redes:** icono, nombre, escudo UABC y "Síguenos". Instagram, Facebook, TikTok y YouTube. Una red nueva sin enlace todavía se vería con borde punteado y "próximamente"; las redes están en `socials`, dentro de `frontend/src/data.js`
- **Equipo de diseño:** Jason Alejandro Hamed Valdez, Fernando Onit Sibaja Gomez y Kevin Osmar Valdez Meza
- **Contacto:** los correos del equipo, como enlaces que abren el correo

## Redes sociales

Las redes están en `socials`, dentro de `frontend/src/data.js`. Una red sin enlace se ve como "próximamente" en el pie y no aparece en ningún otro lugar.

- **Encabezado:** iconos de Instagram, Facebook, TikTok y YouTube a la derecha del menú, separados por una línea. En celular están dentro del menú, en una fila que dice "Síguenos"
- Para que el encabezado quepa en una sola fila con las cuatro redes: de 761 a 1100 px el menú va sin iconos, y de 761 a 910 px el encabezado muestra solo el icono del cimarrón, sin el nombre
- **Inicio, "Síguenos en redes":** antes de "Quiénes somos". El cimarrón presenta botones grandes para cada red
- **Videos:** se agregan en `videos`, dentro de `data.js` (YouTube o TikTok, con su número de video y título). Mientras la lista esté vacía se ve "Muy pronto, videos aquí". Cada video muestra primero una portada con botón de play y solo carga el reproductor al tocarlo: así la página no se hace lenta y YouTube (en modo sin cookies) o TikTok no rastrean a quien no lo reproduce
- No hay botón flotante de redes: ya está "Aprende jugando" y competirían entre sí y con el 911


| Clase | Uso |
| --- | --- |
| `.button.primary` | La acción principal de un bloque (solo una) |
| `.button.secondary` | Acciones de apoyo |
| `.pill` | Acciones chicas dentro de una lista, como "Cómo llegar" |
| `.text-link` | Enlaces a fuentes y documentos |

Esquinas: 14 px en botones, 20 px en tarjetas y 24 px en bloques grandes.

## Movimiento

- Cada animación tiene que contar algo: la lluvia cae, la mochila se llena. Única excepción: lo que invita a jugar (el brinco de "Aprende jugando" y las fichas hexagonales de la escena de Juegos) puede moverse solo para llamar la atención
- Nada se sale de su tarjeta ni crece más de 8 %, tampoco al brincar o aplastarse
- Al pasar el puntero, los botones cambian de color o de sombra, no de tamaño ni de lugar. Excepción: los llamados a la acción (ver abajo)

### Llamados a la acción

Son las acciones principales de emergencia y de juego. Llevan la clase `.cta` y son los únicos botones que crecen al señalarlos: 4 %, con un rebote corto.

| Llamado | Dónde |
| --- | --- |
| Llamar al 911 | Inicio |
| Números de dependencias | Inicio |
| Ver avisos oficiales | Inicio, franja de El Niño |
| Abrir el mapa de riesgo | Inicio |
| Aprende jugando | Botón flotante, en todo el sitio |
| Cómo se juega | Juegos |

- "Aprende jugando" no crece al señalarlo: ya brinca cada 5 s, y al señalarlo el brinco se detiene
- Un llamado nuevo se agrega a esta tabla antes de darle la clase `.cta`. Si todo crece, nada destaca
- Todo se detiene cuando el sistema pide menos movimiento
- Las escenas en `<canvas>` usan `useCanvasScene`, que además las pausa cuando no se ven en pantalla

## Formas con significado

Cada forma dice qué tipo de cosa es, en todo el sitio:

| Forma | Significa | Dónde |
| --- | --- | --- |
| Hexágono | Juego o reto | Número de cada juego, fichas de la escena de Juegos, icono del panel "Cómo participar" |
| Círculo | Información | Iconos de datos y avisos informativos |
| Rectángulo redondo | Acción | Botones y tarjetas que llevan a hacer algo |

El hexágono se reserva para juegos: no se usa como decoración en otras secciones.

## Iconos

- Siempre SVG, con trazo redondo. Nunca emojis ni símbolos de texto (☑ ✳ ☰ ↗): en celular algunos se vuelven emoji del sistema
- Los iconos nuevos van en `frontend/src/icons.js` y se usan con `<Icon name="..." />`
- Un icono acompaña al texto, no lo reemplaza; si va solo, lleva `aria-label`

## Estados de selección

Además de cambiar de color, todo lo que se puede tocar muestra un detalle al señalarlo con el puntero o el teclado:

| Elemento | Detalle |
| --- | --- |
| Botón principal | Anillo blanco por dentro y el icono avanza un poco |
| Botón secundario y controles del pie | Aparece el canto sólido abajo |
| Enlaces del menú | Línea ocre abajo |
| Tarjetas | Anillo ocre alrededor |
| Enlaces de texto | El subrayado se vuelve ocre |

- Con mouse se ve al pasar encima (`@media (hover: hover)`), con teclado al enfocar y en celular al tocar (`:active`), para que no se quede pegado en pantallas táctiles
- El detalle es un anillo, un canto o una línea: no cambia el tamaño de los botones chicos

## Juegos

- Cada juego tiene un tono propio (ocre, azul o verde) en su tarjeta
- La tarjeta lleva: número en hexágono, etiqueta con icono, datos con icono (solo datos que estén en `data.js`, nunca cifras inventadas) y el botón "Jugar ahora", que abre el juego en otra pestaña
- Misión Tijuana va primero en todas partes. Los juegos propios viven en `frontend/public/juegos/<id>`
- Las tarjetas entran en orden al cargar; si las animaciones están pausadas, aparecen ya en su lugar

## Información y Consejos

- Son vistas de Vue (`/informacion` y `/consejos`) con la misma banda verde y las mismas tarjetas que Juegos
- Los tres temas (Qué es El Niño, Plan familiar y Mochila) se abren en una ventana (`LessonModal.vue`), desde Información y desde "Prepárate antes de que llueva" en el inicio. Se abren con `openLesson("mochila")` o con `/informacion?tema=mochila`
- El botón "Ver información" ocupa todo el ancho de la tarjeta
- Las marcas del plan y de la mochila se guardan en el navegador con las mismas llaves que las páginas anteriores
- Las direcciones viejas (`/pages/aprende.html`, `/pages/recursos.html`, `/#/plan`, `/#/mochila`, `/#/el-nino`) llevan a las nuevas

## Recursos de otros sitios

- Si un recurso oficial permite mostrarse dentro de otra página (como el mapa de riesgo del IMPLAN), se abre en una ventana del sitio con un enlace "Abrir en otra pestaña"
- Los archivos muy pesados (como el Atlas en PDF de 120 MB) se quedan como enlace

Todas las variables están en `frontend/public/brand/tokens.css`.

## Rendimiento

Lo que mantiene el sitio ligero; revisarlo antes de agregar imágenes o páginas.

- El inicio se carga de inmediato; El Niño, Plan, Mochila, Juegos y Estilos se descargan al visitarlos (`main.js`)
- Imágenes en WebP con `width`, `height` y `loading="lazy"`. Nada en `public/` que no se use: las PNG originales viven en el historial de git y en `docs/identidad/`
- La letra del nombre (Lilita One, 10 KB) se precarga en `index.html` porque está en el encabezado
- Los iconos de la pestaña llevan `?v=cc2`: al cambiarlos, sube el número para que los navegadores no muestren el anterior
- Peso del inicio en producción: unos 520 KB en total (la guía pide menos de 1.5 MB)

## Tamaños de pantalla

Se prueba en 320, 375, 414, 768, 1024 y 1440 px, sin scroll horizontal ni texto cortado.

- **Celular (hasta 760 px):** menú con botón y mosaicos; tarjetas en una columna; botones de al menos 44 px de alto
- **Tableta (761 a 1040 px):** el menú va en una fila sin iconos; las tarjetas de tres van en una sola fila desde 700 px
- **Computadora:** menú con iconos
