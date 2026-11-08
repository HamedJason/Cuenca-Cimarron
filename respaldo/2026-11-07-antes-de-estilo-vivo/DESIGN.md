# Dirección de diseño: Cuenca Cimarrón

Fuente de verdad visual del sitio. Los valores viven en `frontend/public/brand/tokens.css` y se aplican en `frontend/src/style.css`.

Dial: ENERGY 1 / RHYTHM 2 / MOTION 1

## Lectura

Página de ayuda en emergencias para familias de Tijuana durante El Niño, pensada primero para celular. Estudiantes UABC la hacen y la firman. El inicio funciona como la hoja de números pegada en el refrigerador: lo primero es poder llamar; luego vienen los avisos oficiales con fecha, los refugios y el mapa de riesgo; lo educativo va después. El lenguaje visual sale de dos objetos reales: la **señalética de protección civil** (placas planas, color sólido, bordes firmes, nada flota) y el **cuadernillo impreso** (listas para marcar a mano y reglas de tinta). El sitio también se imprime, así que todo debe funcionar en papel.

Referencias de contenido: guías de crisis de Canada.ca y de California (ver `docs/investigacion-tijuana.md`). Celular primero, una sola página central, fecha visible en lo que cambia, oraciones de menos de 20 palabras.

## Inicio de emergencia

- **Una sola acción principal:** llamar al 911, en un botón que ocupa el ancho en celular.
- **Los demás números** son filas que se tocan para llamar (`tel:`), con el número escrito completo para quien lo copie a mano.
- **Avisos y refugios:** enlaces a las páginas oficiales, cada uno con la fecha en que se verificó.
- **Nada de frases de campaña** ni de titulares de impacto: los títulos dicen qué hay ("Números de emergencia", "Refugios temporales").
- Todo dato viene de una fuente oficial o de prensa citada; si no hay fuente, no se muestra.

## Identidad

- **Personalidad:** directa, práctica y tranquila. Explica qué hacer, sin vender ni dramatizar.
- **Motivo propio:** la placa ocre con número en verde profundo, como la de una señal. Marca los pasos del plan y no se usa para nada más.
- **Lo que evitamos:** sombras flotantes, desenfoques, cápsulas redondeadas, degradados decorativos, etiquetas en mayúsculas espaciadas, iconos de adorno, flechas en cada botón y eslóganes.

## Color

Verde y ocre medidos del escudo UABC. Los demás colores son neutros.

| Token | Hex | Uso |
|---|---|---|
| `--uabc-green` | #00723F | Acciones, navegación activa, un bloque de énfasis por pantalla |
| `--uabc-gold` | #DD971A | Único acento: placas de número, relleno de barras de avance |
| `--green-deep` | #003D24 | Títulos, bordes de controles, texto sobre ocre |
| `--gold-text` | #8A5A00 | Texto pequeño en ocre sobre fondo claro |
| `--ink` | #1C2621 | Texto de lectura |
| `--muted` | #4A5650 | Texto secundario |
| `--paper` | #F6F8F5 | Fondo |
| `--line` | #C9D3CC | Bordes de tarjetas y separadores |

Contraste comprobado: blanco sobre verde 6.0:1, verde profundo sobre ocre 5.0:1, muted sobre papel 7.2:1. El ocre sobre blanco (2.4:1) nunca lleva texto.

## Tipografía

- **Barlow Condensed 700** para títulos: es condensada como la rotulación de señales y cabe en celular sin partir palabras. Siempre en minúsculas normales.
- **DM Sans** para leer: cuerpo de 16 px, nada por debajo de 13 px.

## Forma

- **Radio de 4 px** en todo: botones, tarjetas, campos y ventanas. Lo único redondo es el punto de estado del contador.
- **Sin sombras.** La jerarquía sale del borde y del color. Los botones son la única excepción: llevan un canto inferior sólido de 3 px, como una placa con grosor, que desaparece al presionar.
- **Bordes:** 1.5 px `--line` en tarjetas y 2 px `--green-deep` en controles.

## Controles

- **Botón principal:** fondo verde, texto blanco, borde y canto verde profundo. Al pasar el puntero se oscurece; al presionar baja 2 px y pierde el canto.
- **Botón secundario:** fondo blanco, texto y borde verde profundo, con el mismo canto.
- **Enlace de texto:** verde, siempre subrayado, porque un enlace sin subrayado no se distingue al imprimir. Al pasar el puntero, el subrayado engrosa.
- **Casilla:** cuadro de 22 px con borde de 2 px, como en un formulario impreso. Al marcarla se rellena de verde con una palomita blanca.
- **Barra de avance:** contorno verde profundo de 1.5 px, esquinas de 2 px y relleno ocre.
- **Foco:** contorno de 3 px verde profundo con 2 px de separación. Sobre fondo verde, el contorno es blanco.
- **Ventana:** borde de 2 px verde profundo; el fondo detrás se oscurece sin desenfoque.

## Movimiento

Solo los cambios de color de hover y el hundimiento del botón al presionar (MOTION 1). Con `prefers-reduced-motion` no hay transiciones.

## Texto

- Los títulos dicen qué hay en la pantalla ("Plan familiar", "Mochila de emergencia"), no frases de campaña.
- Los botones y enlaces dicen la acción concreta ("Ver 3 acciones", "Imprimir mi lista").
- Sin cifras ni testimonios inventados; toda información preventiva cita su fuente.
