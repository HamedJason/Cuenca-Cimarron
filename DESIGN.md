# Dirección de diseño: Cuenca Cimarrón

Fuente de verdad visual del sitio. Los valores viven en `frontend/public/brand/tokens.css` y se aplican en `frontend/src/style.css`. La propuesta aprobada por el equipo está en el lienzo de Claude Design "Cuenca Cimarrón: emergencias, versión viva" (7 de noviembre de 2026).

Dial: ENERGY 3 / RHYTHM 2 / MOTION 3

## Lectura

Página de ayuda en emergencias para familias de Tijuana durante El Niño, pensada primero para celular. Estudiantes UABC la hacen y la firman. El inicio funciona como la hoja de números pegada en el refrigerador: lo primero es poder llamar; luego vienen la alerta vigente, los números, los refugios y el mapa de riesgo; lo educativo va después.

El equipo pidió que **llame la atención**: colores vivos en bloques grandes, información corta, lo importante en letra grande y esquinas suaves. Nada de fondos beige ni grises que apaguen la página.

Referencias:
- Guías de crisis de Canada.ca y de California (ver `docs/investigacion-tijuana.md`): celular primero, una sola página central, fecha visible en lo que cambia, oraciones de menos de 20 palabras.
- Uizard, "Bad UI design: 5 things you definitely shouldn't do": sin ventanas emergentes, sin enlaces rotos, sin amontonar contenido, un color principal con sus tonos oscuros, controles grandes y alineados.

## Inicio de emergencia

- **Bloque verde a todo el ancho** con "¿Es una emergencia?" en letra enorme y un botón blanco grande con el **911**. Es la única acción principal.
- **Franja ocre de alerta** con la situación vigente (con fecha y fuente) y un botón a los avisos oficiales.
- **Números en tarjetas grandes** que se tocan para llamar (`tel:`), con el número escrito completo.
- **Refugios** con botón "Cómo llegar"; **zona de riesgo** en una tarjeta ocre clara con botón al mapa.
- **Accesos de preparación** en tarjetas verde profundo al final.
- Todo dato viene de una fuente oficial o de prensa citada; si no hay fuente, no se muestra.

## Identidad

- **Personalidad:** directa, práctica y cercana. Explica qué hacer, sin vender ni dramatizar.
- **Motivo propio:** el número grande en Barlow Condensed (911, teléfonos, pasos 01 a 04). Los números son lo que la persona necesita leer de lejos.
- **Lo que evitamos:** fondos beige o grises, sombras difusas, desenfoques, degradados decorativos, etiquetas en mayúsculas espaciadas, iconos de adorno, flechas en cada botón y eslóganes.

## Color

Verde y ocre medidos del escudo UABC, usados en bloques grandes y sólidos. El fondo es blanco.

| Token | Hex | Uso |
|---|---|---|
| `--uabc-green` | #00723F | Bloque principal de cada pantalla, botones, navegación activa, números |
| `--uabc-gold` | #DD971A | Franja de alerta, placas de número de paso, barras de avance |
| `--green-deep` | #003D24 | Títulos, tarjetas de acceso, texto sobre ocre |
| `--gold-text` | #8A5A00 | Texto pequeño en ocre sobre fondo claro |
| `--ink` | #1C2621 | Texto de lectura |
| `--muted` | #4A5650 | Texto secundario |
| `--paper` | #FFFFFF | Fondo |
| `--green-tint` | #E6F4EC | Tarjetas de números y superficies verdes claras |
| `--gold-tint` | #FFF1D6 | Tarjetas de riesgo y notas cálidas |
| `--line` | #DCE3DE | Separadores |
| `--control-line` | #7C8A82 | Borde de controles (3.6:1 sobre blanco) |

Contraste comprobado: blanco sobre verde 6.0:1, verde profundo sobre ocre 5.0:1, verde sobre verde claro 5.3:1, muted sobre blanco 7.4:1. El ocre sobre blanco (2.4:1) nunca lleva texto ni marca el foco.

## Tipografía

- **Barlow Condensed 800** para títulos y números: condensada como la rotulación de señales; cabe en celular sin partir palabras. Títulos de pantalla de 56 a 88 px; números de teléfono de 40 px.
- **DM Sans** para leer: cuerpo de 17 px, nada por debajo de 14 px.

## Forma

- **Esquinas suaves:** 20 px en tarjetas, 24 px en bloques grandes, 14 px en botones, cápsula solo en "Cómo llegar" y botones pequeños de fila.
- **Sin sombras difusas.** Las acciones principales (911, botón verde) llevan un canto sólido inferior de 4 a 6 px, como un botón físico, que desaparece al presionar.
- **Bordes:** solo donde separan (1 px `--line`) o donde marcan un control (`--control-line`).

## Controles

- **Botón principal:** verde, texto blanco, esquinas de 14 px y canto verde profundo de 4 px. Al pasar el puntero se oscurece; al presionar baja y pierde el canto.
- **Botón secundario:** blanco con borde verde de 2 px y texto verde profundo.
- **Botón de fila ("Cómo llegar"):** cápsula con borde verde; al pasar el puntero se rellena de verde.
- **Enlace de texto:** verde y subrayado.
- **Casilla:** cuadro de 22 px con borde de 2 px; al marcarla se rellena de verde con palomita blanca.
- **Barra de avance:** fondo ocre claro, relleno ocre, esquinas redondeadas.
- **Foco:** contorno de 3 px verde profundo con 3 px de separación. Sobre fondo verde, el contorno es blanco.
- **Ventana:** esquinas de 20 px; el fondo detrás se oscurece sin desenfoque.

## Movimiento

MOTION 3, a pedido del equipo (7 de noviembre de 2026): la página debe sentirse viva e interactiva. Reglas:

- Cada animación representa algo real: el teléfono suena, el fuego arde, la sirena alterna, llueve sobre la alerta de El Niño, el mar se mueve en El Niño.
- Las animaciones continuas se detienen con el botón **"Pausar animaciones"** del pie (se recuerda en el navegador) y con `prefers-reduced-motion`.
- Las escenas procedurales usan `useCanvasScene.js`: se dibujan nítidas, solo se animan cuando están en pantalla y quedan quietas con "Pausar animaciones" o "reducir movimiento".
- Nada se sale de su tarjeta ni crece más de 8 %; las animaciones nunca quedan detrás de texto que hay que leer (las llamas tienen su propio espacio; la lluvia va a la derecha de la franja).

Inventario:
- **911:** círculo rojo con teléfono que suena y ondas que salen.
- **Sin puntos finales** en títulos, notas y textos de una sola idea.
- **Tarjetas de números, cada una con color y animación propia** (el equipo permitió salir de la paleta en estas tarjetas):
  - Protección Civil: azul #EAF2FF / #0B4FA8, ondas desde el escudo.
  - Bomberos: naranja #FFF1E6 / #A83200, llamas que arden en la esquina.
  - Denuncia anónima: morado #F2EDFF / #5B2CA8, ojo tachado que parpadea.
  - Ambulancia: rojo #FFEBEE / #B3121F, torreta que alterna rojo y azul.
  - Al pasar el puntero o enfocarlas se levantan, se inclinan y su icono suena; al presionarlas se hunden.
- **Franja de alerta:** lluvia blanca cayendo.
- **"Prepárate antes de que llueva":** lluvia fina cayendo en diagonal sobre el título, con posición, largo y velocidad al azar en cada gota. Los iconos de los accesos cuentan su destino: corren ráfagas de viento (El Niño), el tríptico se abre y muestra una ruta (Plan) y la tapa de la mochila se abre para que entre una botella de agua (Mochila).
- **Refugios:** la fila se desliza y "Cómo llegar" salta.
- **Zona de riesgo:** icono de ubicación (se probó una escena procedural de deslave y se descartó; respaldo en `respaldo/2026-11-07-escenas-procedurales/`)
- **Plan familiar:** familia SVG con animación CSS (saludo, brincos, cola del perro); la versión procedural se descartó
- **Mochila:** `BackpackScene.vue`: objetos dibujados (agua, lata, botiquín, lámpara, radio, documentos, silbato, pilas, cobija) caen girando y entran a la mochila, que se aplasta con cada uno; los iconos se quedan solo en la lista
- **Prepárate:** la lluvia del título solo se ve dentro de las letras (`mix-blend-mode: lighten` sobre fondo blanco)
- **Regla:** al pasar el puntero nada cambia de tamaño ni de posición en botones pequeños; si la caja se mueve, el puntero sale y la animación se repite sin fin
- **Accesos de preparación y pasos del plan:** el icono salta al pasar el puntero; el paso completado gira su número y se vuelve verde.
- **Mochila (lista):** casillas e iconos que crecen al marcarse; al completar, el número celebra y sale confeti.
- **El Niño:** el título tiene cuatro escenas procedurales en `<canvas>` (`WeatherScene.vue`): ráfagas que doblan árbol y pasto y arrastran hojas; lluvia con salpicaduras y ondas en el charco; sol que late con aire caliente que sube y termómetro que sube y baja; copos que bailan, nieve que se acumula y termómetro bajo. El mar del diagrama tiene olas vivas; el diagrama del Pacífico es un corte del océano con agua caliente y fría, vientos alisios, agua fría que sube frente a América y una nube con lluvia, y cambia entre Año normal y Año de El Niño con una lista de 3 pasos que aparece en orden.
- **Plan:** familia de cuatro y un perro en la tarjeta de avance (saludan, saltan y el perro mueve la cola).
- **Mochila:** el título muestra una mochila a la que van entrando artículos; cada artículo de la lista tiene su color e icono que flota.

Contraste comprobado de los colores de tarjeta: 6.1:1, 6.1:1, 6.9:1 y 7.7:1.

## Texto

- Los títulos dicen qué hay en la pantalla ("Plan familiar", "Mochila de emergencia"), no frases de campaña.
- Información corta: una idea por bloque, lo importante en grande.
- Los botones y enlaces dicen la acción concreta ("Llamar al 911", "Cómo llegar", "Imprimir mi lista").
- Sin cifras ni testimonios inventados; toda información preventiva cita su fuente.


- **El Niño (título):** un solo recuadro rota cada 4.5 s entre viento, lluvia, calor y frío (`WeatherScene.vue`), con etiquetas que marcan cuál se ve. Escenas procedurales solo aquí, en el mar del diagrama y en la mochila