# Comunidad Cimarrona

Sección para que cualquier persona califique el sitio con estrellas y deje un comentario corto. Está en `/comunidad` (menú principal y pie de página). Todo es anónimo.

## Qué ve la gente

- Botón grande "Dar mi opinión" que abre el formulario: de 1 a 5 estrellas (obligatorio) y "Platícanos qué te gustó o qué cambiarías" (opcional, hasta 500 letras)
- Resumen: promedio, número de opiniones y barras por estrellas
- Comentarios de otras personas con sus estrellas y la fecha relativa ("hace 3 horas", "ayer"), sin nombres. Salen de 10 en 10 con el botón "Ver más"
- Solo se listan las opiniones con comentario visible. Las que solo traen estrellas cuentan en el promedio

## Aviso de los 5 minutos

`OpinionToast.vue`, montado en `App.vue`. Arriba a la derecha, debajo del encabezado, con el cimarrón y "¡Danos tu opinión!". Al tocarlo lleva a Comunidad Cimarrona y tiene botón para cerrar.

- Cuenta el tiempo de uso con la pestaña a la vista, de 5 en 5 segundos, en `localStorage` (`cuenca.opinion.tiempo`). Sobrevive a cambios de página y a cerrar el navegador
- No sale si ya se mandó una opinión desde ese dispositivo, si estás en Comunidad Cimarrona o si hay una ventana de opinión abierta
- Al cerrarlo o tocarlo no vuelve a salir en 7 días (`cuenca.opinion.aviso-cerrado`)
- Queda debajo del menú del celular (z-index 34) y no tapa el botón de menú, el 911 ni "Aprende jugando"

## Opinión obligatoria al terminar una actividad

Al terminar, primero sale una ventana con el mismo formulario y después el resultado. No tiene botón de cerrar y Esc no la cierra.

| Actividad | Dónde se pide |
| --- | --- |
| Lecturas cortas, temas de Información y consejos (pregunta final) | `ActivityQuestion.vue`: el "¡Correcto!" sale después de opinar |
| Juegos de otros sitios (pregunta al regresar) | Igual, por `ExternalReturn.vue` |
| Listas de mochila, plan familiar y botiquín completas | `LessonModal.vue`, al marcar la última casilla (no al abrir una lista ya completa) |
| Misión Tijuana, Arma tu mochila, Memorama, Alto al Fuego y la novela visual | `public/juegos/cuenca-puntos.js`, en `CuencaPuntos.terminar()`. Tapa la pantalla final hasta mandar. Alto al Fuego también la pide si no se apagó el fuego (`CuencaPuntos.opinar()`) |

Reglas para no molestar:

- Si el dispositivo mandó una opinión en la última hora, no se vuelve a pedir. Así un grupo que hace varias actividades seguidas opina una vez por hora y no en cada una
- Si el servidor responde que ya opinó hace poco (429), se deja seguir
- Sin internet la opinión se guarda (`cuenca.opinion.pendiente`) y se deja seguir. El sitio la manda la próxima vez que se abre

La ventana de Vue es `OpinionGate.vue` y se controla con `requireOpinion()` de `composables/useOpinion.js`. Los juegos propios no son de Vue, así que `cuenca-puntos.js` tiene su propia versión con los mismos textos, colores, llaves de `localStorage` y la misma API.

## Anonimato

La tabla `opinions` solo tiene estrellas, comentario, origen (`comunidad` o `actividad`, sin decir cuál), si está oculto y la fecha.

- No se guarda IP, usuario, alumno, docente ni escuela. La ruta no usa sesión ni cookie
- La hora se guarda redondeada a 10 minutos, para que no se pueda cruzar con el avance de un alumno
- Se pide no poner el nombre en el comentario

## Freno de spam

- El navegador manda un número al azar (`cuenca.opinion.dispositivo`, distinto del de visitas). El servidor lo convierte en una huella con la llave de la app y nunca lo guarda en la base
- Una opinión por dispositivo cada 10 minutos
- Máximo 40 opiniones cada 10 minutos por red. Es alto a propósito: una escuela entera sale a internet con la misma IP. La IP también se usa como huella con sal y no se guarda
- Las dos huellas viven solo en la caché y se borran solas a los 10 minutos
- Campo trampa oculto (`sitio`): si llega lleno, se responde que sí se guardó pero no se guarda nada
- Comentarios de 500 letras como máximo
- Filtro simple de groserías en español (`App\Support\Groserias`): quita acentos, cambia números por letras (p3nd3jo), junta letras repetidas (puuuto) y compara palabras completas. También detecta enlaces. El comentario se guarda oculto y las estrellas sí cuentan. La lista evita palabras con doble sentido común (pito, cono, perra) para no ocultar comentarios normales

## Moderación

En `/admin`, pestaña **Opiniones**, solo para la cuenta de administración (no para la de solo lectura ni la de demostración).

- Muestra todas las opiniones con comentario o solo las ocultas, con el motivo: filtro o administración
- "Ocultar" quita el comentario de la página. "Volver a mostrar" lo regresa, también los que ocultó el filtro
- Ocultar no borra la opinión ni sus estrellas
- Cada cambio queda en la Bitácora

## API

| Ruta | Para qué |
| --- | --- |
| `GET /api/opiniones?antes_de=ID` | Resumen y 10 comentarios visibles |
| `POST /api/opiniones` | `rating`, `comment`, `device`, `origin`, `sitio` |
| `GET /api/admin/opiniones?filtro=ocultas` | Lista para moderar |
| `POST /api/admin/opiniones/{id}/ocultar` y `/mostrar` | Moderación |

Pruebas: `backend/tests/Feature/OpinionsTest.php` y `frontend/tests/opinion.test.js`.
