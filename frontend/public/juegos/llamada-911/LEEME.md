# ¿Llamo al 911?

Juego para primaria: cuándo llamar al 911, qué decir y aprenderse su dirección. Hecho con el estilo de Cuenca Cimarrona, pero en su propia carpeta: funciona solo, sin el sitio.

**Para jugar:** doble clic en `index.html`. No necesita instalar nada. Con internet se ven las letras Barlow Condensed y DM Sans; sin internet usa letras del sistema.

## Misiones

| # | Misión | Qué aprende | Medalla |
| --- | --- | --- | --- |
| 1 | Mi historieta del 911 | Hay humo en la cocina: **primero salir, luego llamar**. 1) Ordenar 4 cuadros revueltos. 2) Elegir qué dice el niño en cada globo. 3) Colorear: se elige un color y se **pasa el dedo**; se pinta cada zona que toca, sin tener que tocarlas una por una (las líneas nunca se tapan; hay deshacer y borrador). Se puede **acercar y alejar** con ➕ ➖, con dos dedos o con la rueda del mouse; ✋ sirve para mover el dibujo cuando está acercado. Al final se imprime o se guarda como imagen, con una línea "Hecha por" para escribir a mano. Luego "¡Cuéntala!": se la cuenta a un adulto | Artista héroe |
| 2 | ¿Es emergencia? | Distinguir cuándo sí llamar (8 situaciones al azar, 4 sí y 4 no) | Ojo de águila |
| 3 | Arma la dirección | Las partes de una dirección (calle, número, colonia, algo cerca) y dónde se ven en la calle: letreros, número de la casa. Primero mira la casa, luego la arma de memoria | Detective de calles |
| 4 | La llamada al 911 | Cada vez sale **una de tres historias al azar**: el agua del arroyo entra a la casa, un cable de luz caído saca chispas, o sale humo de la casa del vecino. En ninguna sale herido alguien de la familia: el niño está a salvo con un adulto y su trabajo es avisar. 1) El celular está bloqueado: encontrar el botón **Emergencia**. 2) Marcar el 911. 3) Pausa de calma mientras contestan (inhala… exhala…). 4) Contestar a la operadora: qué pasa, la dirección pieza por pieza, con la casa siempre a la vista para buscar las pistas (en la del vecino es la casa de al lado, y el número de su propia casa es trampa), si hay un adulto, nombre y edad, y qué hacer mientras llega la ayuda (quedarse arriba, no acercarse al cable, no entrar al humo). 5) **Regla de oro**: el botón rojo de colgar parpadea, pero solo se gana la estrella extra si espera a que la operadora diga que ya puede colgar | Voz de héroe |

- Al ganar las 4 aparece **Héroe del 911** y la **tarjeta de héroe** para imprimir.
- Cada medalla trae un **¿Sabías que…?** con un dato real (911 gratis sin saldo, botón Emergencia del celular bloqueado, etc.).
- Las medallas se recuerdan en ese aparato. Se pueden jugar en cualquier orden.

## Datos del niño: el juego no los pide

- Se practica con **personajes inventados** (Ana, Beto y Sofi), con calles y colonias que no son de nadie.
- Al terminar las misiones 1, 3 y 4 sale **"¡Ahora tú!"**: el niño dice **sus** datos **en voz alta** a un adulto, y el adulto toca "¡La dijo bien!" o "Hay que practicar". No se escribe ni se guarda nada.
- La **tarjeta de héroe** se imprime **en blanco** y se llena **a mano, en casa, con la familia**.
- El juego enseña la regla: los datos solo se le dicen al 911, a la maestra o a un adulto de confianza. Nunca en internet.

## Archivos

| Archivo | Qué tiene |
| --- | --- |
| `index.html` | Las pantallas: inicio, mapa de misiones, las 4 misiones, medalla, "Ahora tú", Héroe del 911 y tarjeta |
| `js/escenas.js` | Situaciones, personajes, las tres historias de la llamada (`HISTORIAS`), misiones y datos curiosos. **Para cambiar el contenido solo se edita este archivo** |
| `js/historieta-imagenes.js` | Los cuadros de la historieta dentro del código (así se pueden colorear aunque se abra con doble clic). **No se edita a mano**: lo hace `herramientas/empaquetar-historieta.py` |
| `herramientas/empaquetar-historieta.py` | Después de cambiar o agregar un cuadro en `img/historieta-N.webp`, correr `python herramientas/empaquetar-historieta.py` |
| `js/juego.js` | La lógica, la voz (lectura del navegador en es-MX) y los sonidos (se generan sin archivos) |
| `css/juego.css` | Colores y letras de Cuenca Cimarrona. Solo modo claro, como los otros juegos propios |
| `img/` | Ilustraciones de las situaciones (ver abajo) |
| `assets/` | Copias del sitio: la mascota, la letra Baloo 2, el ícono, la portada provisional y una referencia de estilo |

- El cimarrón aparece en el inicio, el mapa, las respuestas de la misión 1, las medallas y "Ahora tú". **No aparece** al marcar el 911 ni en la llamada, porque el manual pide que cerca del 911 mande la emergencia.
- El botón "Juegos" de arriba lleva a la página de Juegos de Cuenca Cimarrona.

## Para ponerlo después en la página

1. Copiar esta carpeta a `frontend/public/juegos/llamada-911/` (sin `assets/estilo-referencia.webp`).
2. En `index.html` y `css/juego.css`, regresar las rutas de `assets/` a las del sitio: `/brand/cuenca/mascota-480.webp`, `/brand/cuenca/mascota-240.webp`, `/assets/fonts/…` y `/favicon.ico`. El botón "Juegos" puede quedar como `/juegos`.
3. Agregar la tarjeta `llamada-911` en `frontend/src/data.js` (en `games` y en `gameCredits`).
4. Para las Cimacoins: el juego ya llama a `CuencaPuntos.terminar("llamada-911")` al ganar las 4 medallas. Falta registrar la clave en `frontend/public/juegos/cuenca-puntos.js` (`iniciar`), `backend/config/games.php`, `backend/config/activities.php` (modo `aviso`, como el memorama) y `frontend/src/avatar/rewards.js` (`juego-` y `termino-`), y luego correr `node scripts/catalogo-avatar.mjs` en `frontend`.
5. Opcional: un botón en `Llamada911.vue` (Información) que lleve al juego.

## Imágenes

Ya están las 14 ilustraciones de "¿Es emergencia?" (hechas con Gemini). Para cambiar una solo se reemplaza el archivo en `img/` con el mismo nombre: el juego la toma sola. Si falta alguna, el juego muestra emojis. El cuadro de la escena siempre es 16:10, así que la imagen se ve completa, sin recortes.

- Formato: **WebP, 1280 × 800** (horizontal 16:10), menos de 150 KB
- Al generarlas, adjuntar como referencia de estilo `assets/mascota-480.webp` y `assets/estilo-referencia.webp`
- Sin texto ni letreros con palabras dentro de la imagen
- Nada que asuste: sin sangre, sin caras de dolor fuerte y sin fuego enorme. La idea es que el niño reconozca la situación, no que se angustie

Inicio de todos los prompts (siempre igual, para que combinen):

> Ilustración infantil para un juego educativo de primaria en México, estilo cartoon plano con contornos gruesos verde oscuro (#003D24), colores cálidos y suaves, con acentos verde (#00723F) y ocre (#DD971A), fondo sencillo, sin texto, formato horizontal 16:10. Escena:

| Archivo | Escena (va después del inicio) |
| --- | --- |
| `mama-piso.webp` | una mamá recostada en el piso de la sala con los ojos cerrados, como dormida; un niño preocupado a su lado sostiene un celular |
| `humo-cocina.webp` | humo gris saliendo por la puerta de la cocina de una casa; una niña sale de la casa hacia el patio |
| `agua-casa.webp` | lluvia fuerte y agua café de un arroyo entrando por la puerta de una casa sencilla en un cerro de Tijuana; una familia sube por una escalera |
| `amigo-herido.webp` | en el patio de una escuela, un niño sentado en el piso después de caerse de un juego, con la rodilla raspada y vendada a medias; su amiga se agacha a ayudarlo |
| `cable-chispas.webp` | un cable de luz caído en la banqueta soltando chispas amarillas bajo la lluvia; un niño se detiene lejos y extiende el brazo para que otros no se acerquen |
| `no-respira.webp` | un señor mayor sentado en una banca del parque con la mano en el pecho y cara de no poder respirar; una niña lo mira preocupada |
| `choque.webp` | dos carros chocados de frente en una calle, con el cofre arrugado y luces intermitentes; personas en la banqueta a una distancia segura |
| `gato-arbol.webp` | un gato naranja en la rama de un árbol mirando hacia abajo con cara de sorpresa; un niño lo mira tranquilo desde el pasto |
| `pizza.webp` | un niño en la sala con mucha hambre, abrazando una caja de pizza imaginaria en una nube de pensamiento |
| `juguete.webp` | una niña buscando debajo de la cama su peluche de oso, con juguetes regados en el cuarto |
| `tarea.webp` | un niño en su escritorio rascándose la cabeza frente a un cuaderno con números, con signos de interrogación flotando |
| `broma.webp` | un niño riéndose a escondidas con un teléfono en la mano, con cara traviesa; detrás, en una nube, una ambulancia esperando |
| `aburrido.webp` | una niña acostada en el sillón mirando el techo, aburrida, en una tarde de lluvia |
| `internet.webp` | un niño frente a una tableta con un ícono de wifi tachado, haciendo pucheros |

### La historieta (misión 1)

Son 4 cuadros de **línea negra sobre blanco, para colorear**, cuadrados (**1024 × 1024**), en `img/historieta-1.webp` … `historieta-4.webp`. Después de poner o cambiar uno: `python herramientas/empaquetar-historieta.py`.

- Cuadros: 1) humo en la olla, 2) sale al patio, 3) llama desde la banqueta, 4) llegaron los bomberos y su mamá está con él.
- Si falta alguno, el juego muestra emojis y en la hoja impresa queda un cuadro que dice "Dibuja aquí", para dibujarlo a mano.
- Para colorear rápido conviene que el dibujo tenga **pocas zonas grandes**: líneas cerradas y gruesas, sin gris ni sombreado, sin texturas (azulejos, tejas, pasto rayado). Si un cuadro se siente lento de colorear, se puede pedir de nuevo agregando al prompt:

> Dibujo sencillo con pocas áreas grandes para colorear, líneas negras gruesas y cerradas, sin texturas ni patrones (sin azulejos, sin tejas dibujadas una por una, sin pasto rayado), sin sombras ni grises, fondo casi vacío

Portada para la tarjeta en Juegos (cuando se ponga en la página): hay una provisional en `assets/portada.svg`. La ilustración final irá en el sitio como `frontend/public/assets/images/game-llamada-911.webp` (**960 × 540**, como las demás portadas):

> …Escena: un niño de primaria sostiene un celular con el número 911 en la pantalla, decidido; a un lado, dos globos de diálogo vacíos, uno rojo y uno verde; al fondo, una calle de Tijuana con lluvia ligera y una ambulancia a lo lejos
