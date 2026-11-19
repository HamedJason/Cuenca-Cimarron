# Avatar cimarrón: cómo funciona, guía de diseño y prompts

Documento del avatar personalizable de Cuenca Cimarrona ("Mi cimarrón", en `/mi-cimarron`).
La sección 0 explica cómo está hecho y cómo se junta con las cuentas de alumnos
(ver también [cuentas.md](cuentas.md)). Las secciones 1 a 6 son la guía para dibujar
los cosméticos, de forma que todas las piezas encajen en capas
sobre el mismo personaje.

## 0. Cómo funciona

### Qué hay

- **Editor y tienda** en `/mi-cimarron` con tres pestañas: Mi colección, Tienda y Ganar monedas.
  Se puede descargar el avatar en PNG o SVG. `/cimarron` redirige ahí.
- **Cimacoins**: la moneda de la tienda. Se ve en el encabezado de todo el sitio
  (y en el menú del celular) y lleva a Mi cimarrón.
- **324 piezas en 21 grupos** (pelaje, cuernos, ojos, cabeza, torso, fondo, marco, efecto...)
  y **24 kits** completos con 20 % de descuento en las piezas que falten.
- **Rarezas y precios**: Común, Poco común, Raro, Épico y Legendario. El precio depende de la
  rareza y del tipo de pieza (ojos, boca y marcas son más baratos, y cabeza, torso, espalda, fondo,
  marco y efecto más caros). Las piezas iniciales y "ninguno" cuestan 0. Las de premio y las
  secretas no se venden.
- **Formas de ganar Cimacoins**:

| Cómo | Cuánto | Dónde está |
| --- | --- | --- |
| Monedas iniciales | 80 | `STARTER_COINS` en `src/avatar/rewards.js` |
| Visita del día | 20 al día | `App.vue` (a los 3.5 s, después de la bienvenida) |
| Abrir cada juego la primera vez | 40 c/u | `useGamePlays.js` (`juego-<id>`) |
| Completar la mochila, el plan familiar o el botiquín | 100, 100 y 60 (la mochila y el plan dan además un cosmético) | `LessonModal.vue` |
| Visitar todas las secciones | 60 y el marco Explorador | `visitPage()` en `App.vue` |
| Monedas escondidas en los temas y páginas | 30 c/u | `<SecretCoin id="moneda-...">` |
| Retos de memoria de señales | 85 a 220, y 150 el reto diario | `activities` en `src/avatar/economy.js` |
| Secreto: Cimarrón Angelical | Todas sus piezas | Los 3 primeros retos dan fragmentos y con ellos se abre el destello del avatar |
| **Solo alumnos**: puntos de actividades | 5 Cimacoins por punto | `COINS_PER_POINT` en `src/avatar/rewards.js` |

### Dos carteras: visitante y alumno

| | Visitante (sin cuenta) | Alumno con sesión |
| --- | --- | --- |
| Dónde se guarda | Este navegador (`localStorage`: `cuenca-cimarrona.economia.v1` y `cuenca-cimarrona.avatar.v1`) | Su cuenta, en la base (`students.wallet` y `students.avatar`) |
| Quién valida premios y compras | La página | El servidor (`CimarronController`) |
| Saldo | Lo que guarda el navegador | `80 + puntos × 5 + premios − gastado`, calculado por el servidor |
| Si cambia de equipo o borra el navegador | Lo pierde | Lo conserva al entrar con su código personal |

Las páginas no tienen que saber cuál de las dos es: usan las funciones de
`src/composables/useCimacoins.js` (`earn`, `buy`, `completeChallenge`, `revealSecret`,
`saveAvatar`, `savedAvatar`), que deciden según haya o no un alumno con sesión
(`student.wallet` viene en `/api/yo`).

**Puntos y Cimacoins no son lo mismo.** Los puntos son el avance que ve el docente y nunca
bajan. Las Cimacoins se gastan en la tienda. Cada punto que gana el alumno le da también
5 Cimacoins, así que comprar no le quita puntos. El servidor manda `wallet.extra`
(saldo sin contar los puntos) y la página calcula `extra + puntos × 5`, para que el saldo
suba en cuanto el alumno contesta bien, sin volver a pedir nada.

**Al entrar a un grupo** la cartera del navegador no se pasa a la cuenta: el alumno empieza con
80 Cimacoins más las de sus puntos. Lo que tenía como visitante se queda en ese navegador y
vuelve a verse si sale de su cuenta. Así nadie puede inflar una cuenta con una cartera local.

**Lo que se cuenta por navegador aun con sesión**: las secciones visitadas (premio de
explorador) y las listas de mochila, plan y botiquín, porque esas listas ya se guardaban así.
Cuando se completan, el premio sí se manda a la cuenta del alumno.

### API del alumno

Todas usan la cookie `cc_alumno` (middleware `equipo:student`). Cada una responde con
`{ wallet, avatar }` actualizados. Las que dan algo agregan `new: true|false`.

| Ruta | Cuerpo | Qué hace |
| --- | --- | --- |
| `GET /api/yo` | | Incluye `student.avatar` (una pieza por grupo) y `student.wallet` |
| `PUT /api/yo/cimarron` | `{ avatar: { cabeza: "corona", ... } }` | Guarda el avatar. Rechaza piezas que no son suyas (422) |
| `POST /api/yo/cimacoins/premio` | `{ id: "moneda-conozca" }` | Premio del sitio, una vez (o una vez al día) |
| `POST /api/yo/cimacoins/reto` | `{ id: "senal-lluvia" }` | Reto de memoria, una vez (el diario, una vez al día) |
| `POST /api/yo/cimacoins/secreto` | `{ answer: ["drop", "cloud", "star"] }` | Cimarrón Angelical, solo con los 3 fragmentos |
| `POST /api/yo/cimacoins/compra` | `{ group, id }` o `{ kit }` | Compra con el precio del servidor. Responde 422 si falta saldo o no se vende |

Los cambios a la cartera se hacen con el registro del alumno bloqueado (`lockForUpdate`), para que
dos pestañas no cobren ni gasten lo mismo dos veces. El día de los premios diarios es el de Tijuana
(`config/avatar.php`).

Los premios del sitio y los retos se aceptan con la palabra de la página (la secuencia de señales
está en el código del navegador). Solo dan Cimacoins, que son cosméticas, nunca puntos.
Lo que sí revisa siempre el servidor: que cada premio se dé una sola vez, los precios, el saldo,
que el avatar solo lleve piezas propias y los fragmentos del secreto.

### Catálogo para la API

El servidor no lee el arte. Usa `backend/config/avatar-catalogo.json`, que se genera desde el
frontend con los mismos archivos que usa la tienda:

```
cd frontend
node scripts/catalogo-avatar.mjs
```

Hay que correrlo **cada vez que se cambie** `src/avatar/art.js`, `economy.js` o `rewards.js`
(piezas nuevas, precios, kits, premios o retos) y subir el JSON junto con el cambio. La prueba
`frontend/tests/cimacoins.test.js` falla si el JSON quedó viejo.

### Avatares guardados

`students.avatar` guarda una pieza por grupo, por ejemplo
`{"pelaje": "caramelo", "cabeza": "casco-verde", "fondo": "cerro", ...}`. Al leerlo, lo que no
exista o ya no sea del alumno vuelve a la pieza inicial (`Cimacoins::avatar`). Los avatares de la
primera versión de esta rama (`{"background": ..., "pieces": [...]}`) quedan con las piezas iniciales.

El avatar pequeño del botón de tareas (`components/CimarronAvatar.vue`) usa el mismo arte y lo
descarga solo cuando hay un alumno con sesión, para no hacer más pesada la primera carga.

### Dónde está el código

| Qué | Archivo |
| --- | --- |
| Arte de todas las piezas y kits, y armado en capas | `frontend/src/avatar/art.js` |
| Precios, compras, retos y secreto (reglas puras) | `frontend/src/avatar/economy.js` |
| Premios del sitio, monedas iniciales y Cimacoins por punto | `frontend/src/avatar/rewards.js` |
| Cartera del visitante o del alumno | `frontend/src/composables/useCimacoins.js` |
| Pantalla Mi cimarrón | `frontend/src/views/Avatar.vue` |
| Avatar pequeño del alumno | `frontend/src/components/CimarronAvatar.vue` |
| Moneda escondida y aviso de monedas | `frontend/src/components/SecretCoin.vue` y `CoinToast.vue` |
| Exportar el catálogo para la API | `frontend/scripts/catalogo-avatar.mjs` y `src/avatar/catalog-export.js` |
| Catálogo que usa la API | `backend/config/avatar-catalogo.json` (generado) y `backend/config/avatar.php` |
| Reglas de la cartera en el servidor | `backend/app/Support/Cimacoins.php` |
| Rutas del alumno | `backend/app/Http/Controllers/CimarronController.php` |
| Columna de la cartera | `backend/database/migrations/2026_11_18_000001_add_wallet_to_students_table.php` |
| Pruebas | `backend/tests/Feature/ActivitiesTest.php` y `frontend/tests/cimacoins.test.js` |

### Agregar una pieza, un kit o un premio

1. Dibujar la pieza con la guía de abajo y agregarla en `art.js` con `add(grupo, id, nombre, arte, rareza)`.
2. Si es un kit, agregarlo con `kit(...)` en la lista que corresponda.
3. Para un premio nuevo, agregarlo en `siteRewards` (`rewards.js`) y llamar `earn("id")` donde se gane.
4. Correr `node scripts/catalogo-avatar.mjs` y `npm test`.
5. Subir los archivos cambiados y `backend/config/avatar-catalogo.json` juntos.

## 1. El estilo de la mascota

El cimarrón del sitio está en **estilo mascota cartoon vectorial** (en inglés:
*vector cartoon mascot illustration*, el mismo de las mascotas deportivas y los
stickers). Sus rasgos:

- Contorno grueso y continuo en café muy oscuro (#3b2416 aprox.), no negro puro.
- Colores planos con **una sola sombra** dura por color (*cel shading*), sin degradados
  ni texturas.
- Brillos pequeños en blanco en ojos, cuernos y casco.
- Proporciones amables: cabeza grande, ojos expresivos, sonrisa abierta, manos de 4 dedos.
- Paleta cálida: pelaje beige caramelo, cuernos ocre/dorado, verde UABC (#00723f),
  amarillo de chaleco de seguridad y blanco reflejante.
- El personaje es un **borrego cimarrón** (borrego de las montañas de Baja California):
  cuernos gruesos enrollados hacia atrás y abajo, hocico claro, orejas puntiagudas.

## 2. Cómo dibujar la base para que reciba cosméticos

Para que un sombrero o unos lentes sirvan en todos los avatares, **todas las piezas se
dibujan sobre la misma plantilla**, en la misma posición y tamaño.

**Lienzo y pose**

- Lienzo cuadrado de **1024 × 1024 px**, fondo transparente (PNG) o SVG.
- Personaje de **cuerpo completo**, de frente con un giro mínimo (¾ muy suave o frontal),
  centrado, con los pies en la línea y = 960.
- **Pose neutra en "A"**: brazos ligeramente separados del cuerpo, manos abiertas a los
  lados, piernas un poco separadas. Así la ropa no se cruza con los brazos.
- Proporción de 3 cabezas de alto (más infantil que la mascota, para que se vea bien en
  pequeño).
- Expresión neutra-feliz con la boca cerrada en la base (las expresiones van aparte).

**Piezas separadas de la base** (cada una en su propia capa)

1. Cuerpo y pelaje (sin ropa).
2. Cabeza y cara sin ojos ni boca.
3. **Cuernos aparte**: así el sombrero puede ir entre los cuernos o detrás de ellos.
4. Ojos y boca (expresiones intercambiables).
5. Brazo derecho, brazo izquierdo y manos (para objetos en la mano).

**Puntos fijos de anclaje** (marcarlos en la plantilla y no moverlos nunca)

| Punto | Para qué |
|---|---|
| Coronilla, entre los cuernos | Sombreros, gorras, cascos, coronas |
| Línea de los ojos | Lentes, goggles, antifaces |
| Hocico y boca | Cubrebocas, bigotes, máscaras |
| Cuello | Bufandas, collares, medallas |
| Hombros y pecho | Camisetas, chalecos, chamarras |
| Espalda (detrás del cuerpo) | Capas, mochilas, alas |
| Mano derecha | Objeto que sostiene |
| Cintura | Cinturones, riñoneras |
| Pies | Botas, tenis |

**Orden de capas al armar el avatar** (de atrás hacia adelante)

fondo → espalda (capa, mochila, alas) → cuerpo → calzado → pantalón → torso →
chaleco o chamarra → cuello → cabeza → ojos y boca → cara (lentes, máscaras) →
cuernos → sombrero → objeto en la mano → efecto o marco

## 3. Qué se puede personalizar de la base

- **Color de pelaje**: caramelo (original), arena, canela, gris piedra, chocolate,
  blanco nieve, y uno de fantasía desbloqueable (menta, lila).
- **Cuernos**: forma (enrollados, cortos, en espiral grande) y color (ocre, plata,
  dorado brillante, arcoíris de logro).
- **Ojos**: redondos, alegres (cerrados en arco), decididos, sorprendidos.
- **Boca**: sonrisa, risa abierta, lengua de fuera, "o" de sorpresa.
- **Marcas**: pecas, mancha en el ojo, rubor en las mejillas.

## 4. Cosméticos sugeridos

Rarezas: **común** (barato), **raro**, **épico**, **legendario** (de logros o muy caro)
y **secreto** (solo con monedas escondidas o códigos de juegos).

### Cabeza

- Casco verde con gota (el de la mascota, el inicial).
- Gorra cimarrona UABC, gorra al revés, gorro de lana con pompón.
- Impermeable con capucha amarilla (temático de lluvia).
- Casco de bombero (genérico, sin logos oficiales).
- Sombrero de paja de playa, sombrero de vaquero norteño.
- Casco de astronauta con burbuja.
- Gorro de chef, gorro de graduación (birrete) UABC.
- Corona de cartón dorada, corona de hojas.
- Audífonos gamer con luces.
- **Referencias gamer genéricas**: gorro de bloques estilo pixel, "barra de vida" de
  corazones flotando sobre la cabeza, sombrero de hongo saltarín, gorro de mago con
  estrellas, casco de caballero de juguete con plumas (sin armas).

### Cara

- Lentes redondos, lentes de sol, lentes **pixel 8-bit**.
- Goggles de natación o de buceo.
- Antifaz de superhéroe.
- **Máscara de lucha libre** con colores UABC (cultural, no violenta).
- Cubrebocas con estampado.
- Pintura de cara de tormenta (rayito en la mejilla).
- Monóculo y bigote de gala.

### Torso

- Playera verde (inicial) y chaleco reflejante de brigadista.
- Impermeable amarillo, chamarra de mezclilla, sudadera UABC.
- Camiseta de fútbol (Xolos-like genérica, sin escudos reales).
- Bata de científico, traje de astronauta, overol de explorador.
- Camiseta "pixel art" con un corazón 8-bit.
- Suéter navideño (temporada), disfraz de calabaza (temporada).

### Espalda

- Mochila de emergencia (se gana al completar la mochila del sitio).
- Capa de héroe, capa de nube con gotas.
- Alas de mariposa monarca.
- Tanque de buzo, cohete de juguete (jetpack).

### Cuello

- Bufanda tejida, paliacate, medalla de "Brigadista", collar de concha,
  moño de gala.

### Mano

- Paraguas, linterna, silbato, radio de pilas (objetos de la mochila).
- Libro, globo, pelota, control de videojuego retro, banderín UABC, planta en maceta.

### Pies

- Botas de lluvia amarillas, tenis, chanclas de playa, botas de montaña.

### Fondos y marcos

- Colonias de Tijuana, playa de Rosarito, Cerro Colorado, campus UABC, cielo con arcoíris.
- Marcos: madera, dorado, pixel, nubes, "Explorador" (logro).

### Efectos (legendarios)

- Lluvia suave cayendo, brillitos, aura de estrellas, arcoíris al moverse.

**Qué evitar**: armas, sangre, ropa militar o policial con insignias reales, emblemas
protegidos (**la cruz roja no se puede usar libremente**), logotipos y personajes de
marcas o videojuegos reales, y cualquier cosa que se burle de una cultura.

## 5. Prompts para generar las imágenes

Los generadores de imágenes suelen funcionar mejor en inglés.

### Prompt de la base del personaje

```
Character design sheet of a friendly cartoon bighorn sheep kid (borrego cimarrón),
vector cartoon mascot illustration style, bold continuous dark-brown outline,
flat colors with a single hard cel-shade tone per color, small white highlights,
no gradients, no texture. Warm caramel fur, light cream muzzle, pointed ears,
thick golden-ochre horns curled backwards and down, big expressive eyes,
gentle closed smile, four-finger cartoon hands. Full body, 3 heads tall,
front view, neutral A-pose with arms slightly away from the body and open hands,
legs slightly apart, standing on a baseline, centered on a square 1024x1024
transparent background. No clothes, no accessories. Clean, kid-friendly,
consistent with a sports-mascot sticker style.
```

### Prompt para cada cosmético

Cambiar lo que va entre corchetes:

```
Single clothing item for a layered avatar system: [yellow rain boots].
Vector cartoon mascot illustration style matching a cartoon bighorn sheep character:
bold dark-brown outline, flat colors, one hard cel-shade tone, small white highlights,
no gradients. Drawn in the exact position and scale it would have on a full-body,
front-facing, A-pose character centered on a 1024x1024 canvas [at the feet, baseline
y=960]. Item only, no character, transparent background, kid-friendly, non-violent.
```

### Prompt para el ícono de la tienda

```
Shop icon of [a pixel 8-bit sunglasses] item, vector cartoon mascot style,
bold dark-brown outline, flat colors with one cel-shade tone, centered on a
256x256 transparent canvas with soft padding, no text.
```

## 6. Consejos para que todo encaje

- Generar primero la base, aprobarla y usarla como **plantilla** (imagen de referencia)
  para todos los cosméticos.
- Revisar cada cosmético encima de la base antes de aprobarlo, porque es común que queden
  movidos de lugar. Lo más seguro es que una persona los ajuste en Illustrator, Inkscape o Figma.
- Guardar cada pieza en **SVG** si se puede: pesa poco, escala sin perder calidad y
  permite cambiar colores desde el código.
- Nombrar los archivos por capa: `cabeza-casco-verde.svg`, `cara-lentes-pixel.svg`.
