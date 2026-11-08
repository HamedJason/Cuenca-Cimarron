# Estilos de Cuenca Cimarrón

La versión visual está en el sitio, en `#/estilos` (enlace "Estilos" en el pie de página). Este archivo es la referencia rápida para quien edite el código.

## Marca

- Escudo UABC: `frontend/public/brand/uabc-escudo.png`. Se usa tal como está, sin recortar ni cambiar colores
- Logo del proyecto: `frontend/public/brand/cuenca-logo.svg`

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

## Cómo escribimos

- Primero lo que sirve en una emergencia, después la explicación
- Frases cortas
- Sin punto final en títulos, botones y textos de una sola oración
- Sin eslóganes

## Componentes

| Clase | Uso |
| --- | --- |
| `.button.primary` | La acción principal de un bloque (solo una) |
| `.button.secondary` | Acciones de apoyo |
| `.pill` | Acciones chicas dentro de una lista, como "Cómo llegar" |
| `.text-link` | Enlaces a fuentes y documentos |

Esquinas: 14 px en botones, 20 px en tarjetas y 24 px en bloques grandes.

## Movimiento

- Cada animación tiene que contar algo: la lluvia cae, la mochila se llena
- Nada se sale de su tarjeta ni crece más de 8 %
- Al pasar el puntero, los botones cambian de color o de sombra, no de tamaño ni de lugar
- Todo se detiene con "Pausar animaciones" (clase `motion-off` en `<html>`) o cuando el sistema pide menos movimiento
- Las escenas en `<canvas>` usan `useCanvasScene`, que además las pausa cuando no se ven en pantalla

Todas las variables están en `frontend/public/brand/tokens.css`.
