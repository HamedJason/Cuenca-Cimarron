// Contenido del juego ¿Llamo al 911?
// Para cambiar situaciones, personajes, preguntas o datos curiosos solo se edita este archivo.
//
// El juego NUNCA pide datos reales del niño. Se practica con personajes inventados
// y en los momentos "Ahora tú" el niño dice SUS datos en voz alta a un adulto.
//
// Imágenes: cada situación busca img/<id>.webp. Si todavía no existe, se ve el emoji.
// Los prompts para generarlas están en LEEME.md.

// ---------- Misión 1: ¿Es emergencia? ----------
window.ESCENAS = [
  // Sí son emergencias
  { id: "mama-piso", emergencia: true, emoji: "👩🛋️💤", frase: "Tu mamá está en el piso y no despierta", porque: "Llama al 911 y quédate con ella" },
  { id: "humo-cocina", emergencia: true, emoji: "🏠💨🔥", frase: "Sale mucho humo de la cocina", porque: "Sal de la casa y llama al 911" },
  { id: "agua-casa", emergencia: true, emoji: "🌧️🌊🏠", frase: "El agua del arroyo entra a tu casa", porque: "Sube a un lugar alto y llama al 911" },
  { id: "amigo-herido", emergencia: true, emoji: "🧒🩹😢", frase: "Tu amigo se cayó y está muy herido", porque: "Llama al 911 y no lo dejes solo" },
  { id: "cable-chispas", emergencia: true, emoji: "⚡🔌⚠️", frase: "Un cable de luz cayó a la calle con chispas", porque: "No te acerques y llama al 911" },
  { id: "no-respira", emergencia: true, emoji: "👴😮‍💨", frase: "Un señor no puede respirar", porque: "Llama al 911 rápido" },
  { id: "choque", emergencia: true, emoji: "🚗💥🚙", frase: "Dos carros chocaron y hay heridos", porque: "Aléjate de la calle y llama al 911" },

  // No son emergencias
  { id: "gato-arbol", emergencia: false, emoji: "🌳🐱", frase: "Tu gato se subió a un árbol", porque: "El gato puede bajar solo. Avisa a un adulto" },
  { id: "pizza", emergencia: false, emoji: "🍕😋", frase: "Quieres pedir una pizza", porque: "Para la pizza se llama a la pizzería" },
  { id: "juguete", emergencia: false, emoji: "🧸❓", frase: "No encuentras tu juguete", porque: "Búscalo con tu familia" },
  { id: "tarea", emergencia: false, emoji: "📚🤯", frase: "No entiendes la tarea", porque: "Pregunta a tu maestra o a tu familia" },
  { id: "broma", emergencia: false, emoji: "😜📞", frase: "Quieres llamar de broma", porque: "Las bromas quitan ayuda a quien la necesita" },
  { id: "aburrido", emergencia: false, emoji: "🥱🛋️", frase: "Estás muy aburrido", porque: "Mejor juega o lee un cuento" },
  { id: "internet", emergencia: false, emoji: "📶❌", frase: "Se fue el internet", porque: "Espera o pregunta a un adulto" },
];

// Cuántas situaciones salen por partida (la mitad son emergencias)
window.SITUACIONES_POR_PARTIDA = 8;

// ---------- Personajes inventados ----------
// Sus datos son de práctica: calles, colonias y teléfonos no son de nadie.
// "telefono" lleva solo los 10 dígitos.
window.PERSONAJES = [
  {
    id: "ana",
    nombre: "Ana",
    edad: 8,
    cara: "👧",
    calle: "Calle Olivos",
    numero: "15",
    colonia: "Colonia El Florido",
    cerca: "Junto a la tiendita Don Chuy",
    cercaEmoji: "🏪",
    adulto: "Mamá Rosa",
    adultoCara: "👩",
    telefono: "6641234567",
  },
  {
    id: "beto",
    nombre: "Beto",
    edad: 7,
    cara: "👦",
    calle: "Avenida Las Palmas",
    numero: "230",
    colonia: "Colonia Playas",
    cerca: "Enfrente del parque",
    cercaEmoji: "🌳",
    adulto: "Papá Luis",
    adultoCara: "👨",
    telefono: "6645550192",
  },
  {
    id: "sofi",
    nombre: "Sofi",
    edad: 9,
    cara: "👧🏽",
    calle: "Calle Cedros",
    numero: "8",
    colonia: "Colonia La Mesa",
    cerca: "A un lado de la iglesia",
    cercaEmoji: "⛪",
    adulto: "Abuela Carmen",
    adultoCara: "👵",
    telefono: "6649876543",
  },
];

// Las partes de una dirección, en el orden en que se dicen
window.PARTES_DIRECCION = [
  { clave: "calle", etiqueta: "Calle", emoji: "🛣️" },
  { clave: "numero", etiqueta: "Número", emoji: "🔢" },
  { clave: "colonia", etiqueta: "Colonia", emoji: "🏘️" },
  { clave: "cerca", etiqueta: "Qué hay cerca", emoji: "📍" },
];

// Piezas que NO sirven para decir dónde estás (salen revueltas con las buenas)
window.PIEZAS_TRAMPA = ["Por allá", "En mi casa", "Cerca de algo", "No sé"];

// ---------- Misión 1: Mi historieta del 911 ----------
// Las viñetas son img/historieta-1.webp ... -4.webp (dibujos de línea para colorear).
// Después de cambiarlas se corre: python herramientas/empaquetar-historieta.py
// Si al colorear la pintura se sale por un hueco del dibujo, se le pone al cuadro
// cierres: [[x1, y1, x2, y2], ...] (líneas invisibles sobre la imagen de 1024 que solo frenan la pintura).
// Si falta una, el juego pone un cuadro con emojis (y en la hoja impresa, un cuadro para dibujar a mano).
window.HISTORIETA = [
  {
    emoji: "🍲💨",
    que: "Sale mucho humo de la olla en la cocina",
    alt: "Un niño ve desde la puerta mucho humo saliendo de una olla en la estufa",
    pistaOrden: "Primero: ¿dónde empezó el humo?",
    opciones: [
      { emoji: "😮", texto: "¡Oh no, sale mucho humo de la estufa! No debo acercarme ni intentar apagarlo yo solo.", bien: true },
      { emoji: "💧", texto: "¡Oh, sale humo de la olla! Le echo agua para apagarlo yo solo.", pista: "No lo apagues tú solo. Aléjate del humo" },
      { emoji: "🛏️", texto: "¡Qué miedo, mucho humo! Me escondo debajo de la cama hasta que se quite.", pista: "Nunca te escondas: hay que salir de la casa" },
    ],
  },
  {
    emoji: "🏃🚪",
    que: "Sale rápido de la casa",
    alt: "El niño sale caminando rápido al patio; por la puerta sale humo",
    pistaOrden: "Antes de llamar, ¿qué hace para estar a salvo?",
    opciones: [
      { emoji: "🏃", texto: "Primero me pongo a salvo. ¡Salgo rápido de la casa y me alejo del humo!", bien: true },
      { emoji: "📱", texto: "Primero salvo mis cosas. ¡Regreso rápido por mi tableta!", pista: "Las cosas se reponen. Tú no: no regreses" },
      { emoji: "🧯", texto: "Primero agarro la manguera y regreso a apagar el humo.", pista: "El fuego lo apagan los bomberos. Tú sal y aléjate" },
    ],
  },
  {
    emoji: "📞911",
    que: "Ya afuera, llama al 911",
    alt: "Ya en la banqueta, lejos de la casa con humo, el niño llama por celular",
    pistaOrden: "Ya está afuera y a salvo. ¿Qué hace ahora?",
    antes: "9-1-1, ¿cuál es su emergencia?",
    opciones: [
      { emoji: "📞", texto: "¡Hola! Hay humo en la cocina de mi casa. Vivo en la calle Juárez número 15.", bien: true },
      { emoji: "🤷", texto: "¡Hola! Hay humo en la cocina de mi casa... pero no sé dónde vivo.", pista: "Di tu dirección: calle y número. Así saben a dónde ir" },
      { emoji: "📵", texto: "¡Hola! Hay humo en mi casa. ¡Adiós! (y cuelga)", pista: "No cuelgues: di dónde estás y espera a que te digan" },
    ],
  },
  {
    emoji: "🚒👋",
    que: "Llegaron los bomberos y todos están bien",
    quien: "el bombero",
    alt: "Frente a la casa, junto al camión de bomberos, un bombero sonriente le pone la mano en el hombro al niño; su mamá está con él",
    pistaOrden: "¿Cómo termina la historia?",
    opciones: [
      { emoji: "🙌", texto: "¡Buen trabajo, campeón! Saliste a tiempo y diste tu dirección muy claro.", bien: true },
      { emoji: "😠", texto: "¡Ay, campeón! Debiste quedarte adentro a apagarlo tú solo.", pista: "No: lo correcto es salir y pedir ayuda, como hizo él" },
      { emoji: "🏠", texto: "¡Listo, campeón! Ya puedes entrar a jugar a la cocina.", pista: "Primero los bomberos revisan que todo esté seguro" },
    ],
  },
];

// ---------- Misión 4: la llamada ----------
// Cada vez sale una historia al azar. En ninguna sale herido alguien de la familia:
// el niño está a salvo con un adulto y su trabajo es avisar.
//
// Cada historia tiene:
//   caso(p)      lo que pasa (p es el personaje)
//   lugar(p)     la dirección que hay que dar (si no se pone, es la casa del personaje)
//   preguntas(p) lo que pregunta la operadora. "direccion: true" = armar la dirección pieza por pieza;
//                "colgar: true" = reto Regla de oro (el botón de colgar está ahí, pero hay que esperar)
//   espera       lo que dice la operadora mientras el niño espera en la línea (la última da permiso de colgar)
//   ayuda, llega lo que llega al final

function preguntaNombre(p) {
  return {
    pregunta: "¿Cómo te llamas y cuántos años tienes?",
    opciones: [
      { emoji: p.cara, texto: "Me llamo " + p.nombre + " y tengo " + p.edad + " años", bien: true },
      { emoji: "😱", texto: "¡Aaaah!", pista: "Respira hondo y habla despacio" },
      { emoji: "🤐", texto: "No te digo", pista: "A la operadora del 911 sí le dices tu nombre" },
    ],
  };
}
var PREGUNTA_COLGAR = { pregunta: "Muy bien. No cuelgues hasta que yo te diga, ¿sale?", colgar: true };

window.HISTORIAS = [
  {
    id: "agua",
    emoji: "🌧️🌊🏠",
    caso: function (p) { return "Llueve muy fuerte y el agua del arroyo empieza a entrar a tu casa. Tu mamá y tu hermanito subieron contigo a la azotea"; },
    preguntas: function (p) {
      return [
        {
          pregunta: "911, ¿cuál es tu emergencia?",
          opciones: [
            { emoji: "🌊🏠", texto: "El agua del arroyo está entrando a mi casa", bien: true },
            { emoji: "🌦️", texto: "Está lloviendo bonito", pista: "Di lo que pasa: el agua está entrando a tu casa" },
            { emoji: "🍕", texto: "Quiero una pizza", pista: "Al 911 solo se llama si alguien está en peligro" },
          ],
        },
        { pregunta: "¿Cuál es la dirección de tu casa?", direccion: true },
        {
          pregunta: "¿Ya están en un lugar alto?",
          opciones: [
            { emoji: "⬆️🏠", texto: "Sí, subimos a la azotea", bien: true },
            { emoji: "💦", texto: "No, estoy jugando en el agua", pista: "El agua de la lluvia es peligrosa: sube a un lugar alto" },
            { emoji: "🚶", texto: "Vamos a cruzar la calle", pista: "Nunca cruces el agua: te puede arrastrar" },
          ],
        },
        {
          pregunta: "¿Hay un adulto contigo?",
          opciones: [
            { emoji: "👩👶", texto: "Sí, mi mamá y mi hermanito están conmigo", bien: true },
            { emoji: "🤷", texto: "No sé", pista: "Fíjate quién está contigo y dilo" },
            { emoji: "🦸", texto: "Sí, un superhéroe", pista: "Di la verdad: la operadora necesita saber quién está" },
          ],
        },
        preguntaNombre(p),
        {
          pregunta: "Quédense arriba y no bajen hasta que llegue la ayuda. ¿Qué haces?",
          opciones: [
            { emoji: "⬆️", texto: "Nos quedamos arriba, juntos", bien: true },
            { emoji: "🧸", texto: "Bajo por mis juguetes", pista: "Las cosas se pueden reponer. Tú no: quédate arriba" },
            { emoji: "👀", texto: "Salgo a ver el arroyo", pista: "No te acerques al arroyo: quédate arriba" },
          ],
        },
        PREGUNTA_COLGAR,
      ];
    },
    espera: [
      "Quédate conmigo en la línea",
      "Los bomberos ya van en camino",
      "¿Ya escuchas la sirena?",
      "¡Ya llegaron los bomberos! Ya puedes colgar",
    ],
    ayuda: "🚒",
    llega: function (p) { return "Los bomberos ayudaron a " + p.nombre + " y a su familia a salir del agua"; },
  },

  {
    id: "cable",
    emoji: "⚡🔌⚠️",
    caso: function (p) { return "Con el viento, un cable de luz cayó enfrente de tu casa y saca chispas. Tu papá y tú lo ven desde la ventana. Nadie lo ha tocado"; },
    preguntas: function (p) {
      return [
        {
          pregunta: "911, ¿cuál es tu emergencia?",
          opciones: [
            { emoji: "⚡🔌", texto: "Un cable de luz se cayó y saca chispas", bien: true },
            { emoji: "📶", texto: "Se fue el internet", pista: "Eso no es emergencia. Di lo del cable" },
            { emoji: "😜", texto: "Es una broma", pista: "Las bromas quitan ayuda a quien la necesita" },
          ],
        },
        { pregunta: "¿Dónde está el cable? Dime la dirección", direccion: true, ayuda: "El cable está enfrente de tu casa. Arma tu dirección:" },
        {
          pregunta: "¿Alguien tocó el cable?",
          opciones: [
            { emoji: "🙅", texto: "No, nadie lo ha tocado", bien: true },
            { emoji: "🪵", texto: "Lo voy a mover con un palo", pista: "¡Nunca toques un cable, ni con un palo!" },
            { emoji: "🧒", texto: "Mi amigo lo quiere agarrar", pista: "Dile que se aleje: nadie debe acercarse" },
          ],
        },
        {
          pregunta: "¿Hay un adulto contigo?",
          opciones: [
            { emoji: "👨", texto: "Sí, mi papá está conmigo en la casa", bien: true },
            { emoji: "🤷", texto: "No sé", pista: "Fíjate quién está contigo y dilo" },
            { emoji: "🦸", texto: "Sí, un superhéroe", pista: "Di la verdad: la operadora necesita saber quién está" },
          ],
        },
        preguntaNombre(p),
        {
          pregunta: "Quédense lejos del cable y que nadie se acerque. ¿Qué haces?",
          opciones: [
            { emoji: "🏠", texto: "Me quedo adentro, lejos del cable", bien: true },
            { emoji: "👀", texto: "Salgo a verlo de cerca", pista: "Las chispas son peligrosas: quédate lejos" },
            { emoji: "💧", texto: "Le echo agua", pista: "¡No! El agua y la luz juntas son muy peligrosas" },
          ],
        },
        PREGUNTA_COLGAR,
      ];
    },
    espera: [
      "Quédate conmigo en la línea",
      "Los bomberos y la CFE ya van en camino",
      "¿Ya escuchas la sirena?",
      "¡Ya llegaron! Ya puedes colgar",
    ],
    ayuda: "🚒",
    llega: function (p) { return "Los bomberos y la CFE están arreglando el cable. Nadie salió lastimado"; },
  },

  {
    id: "humo-vecino",
    emoji: "🏡💨",
    // Aquí el niño da una dirección que NO es la suya: la casa de al lado
    lugar: function (p) {
      return {
        id: p.id,
        nombre: "tu vecino",
        cara: "👴",
        calle: p.calle,
        numero: String(Number(p.numero) + 2),
        colonia: p.colonia,
        cerca: "Al lado de mi casa",
        cercaEmoji: "🏡",
        trampas: [{ texto: p.numero, msg: "Ese es el número de tu casa. El humo sale de la de al lado" }],
      };
    },
    caso: function (p) {
      return "Ves mucho humo saliendo por la ventana de la casa de tu vecino, la del número " + (Number(p.numero) + 2) + ". Tú estás en tu casa con tu mamá, a salvo";
    },
    preguntas: function (p) {
      return [
        {
          pregunta: "911, ¿cuál es tu emergencia?",
          opciones: [
            { emoji: "🏡💨", texto: "Sale mucho humo de la casa de mi vecino", bien: true },
            { emoji: "🍖", texto: "Mi vecino hace carne asada", pista: "Fíjate: el humo sale de adentro de la casa, por la ventana" },
            { emoji: "🍕", texto: "Quiero una pizza", pista: "Al 911 solo se llama si alguien está en peligro" },
          ],
        },
        {
          pregunta: "¿Cuál es la dirección de la casa con humo?",
          direccion: true,
          ayuda: "No es tu casa: es la de al lado, la del número " + (Number(p.numero) + 2) + ". Arma su dirección:",
          casaTitulo: "🏡 La casa del vecino",
        },
        {
          pregunta: "¿Sabes si hay alguien adentro?",
          opciones: [
            { emoji: "🤷", texto: "No sé, no he visto a nadie", bien: true },
            { emoji: "🚪", texto: "Voy a tocar la puerta para ver", pista: "No te acerques al humo. Los bomberos revisan" },
            { emoji: "🏃", texto: "Voy a entrar a buscar", pista: "¡Nunca entres a una casa con humo!" },
          ],
        },
        {
          pregunta: "¿Hay un adulto contigo?",
          opciones: [
            { emoji: "👩", texto: "Sí, mi mamá está conmigo en mi casa", bien: true },
            { emoji: "🤷", texto: "No sé", pista: "Fíjate quién está contigo y dilo" },
            { emoji: "🦸", texto: "Sí, un superhéroe", pista: "Di la verdad: la operadora necesita saber quién está" },
          ],
        },
        preguntaNombre(p),
        PREGUNTA_COLGAR,
      ];
    },
    espera: [
      "Quédate conmigo en la línea",
      "Los bomberos ya van en camino",
      "¿Ya escuchas la sirena?",
      "¡Ya llegaron los bomberos! Ya puedes colgar",
    ],
    ayuda: "🚒",
    llega: function (p) { return "Los bomberos apagaron el fuego en la casa del vecino. ¡Avisaste a tiempo!"; },
  },
];

// ---------- Misiones ----------
// "ahoraTu": lo que el niño practica en voz alta con un adulto al terminar la misión (nada se escribe).
// "dato": algo real que vale la pena saber.
window.MISIONES = [
  {
    id: "historieta",
    titulo: "Mi historieta del 911",
    emoji: "🎨",
    medalla: "Artista héroe",
    dato: "Si hay humo en tu casa, primero sal y aléjate. Después llama al 911 desde afuera",
    ahoraTu: {
      titulo: "¡Cuéntala!",
      pide: "Cuéntale tu historieta a un adulto, cuadro por cuadro",
      lista: ["1️⃣ ¿Qué vio?", "2️⃣ ¿Qué hizo primero?", "3️⃣ ¿A quién llamó?", "4️⃣ ¿Cómo terminó?"],
      ayuda: "Imprime tu historieta y cuéntasela a tu familia en casa",
    },
  },
  {
    id: "emergencia",
    titulo: "¿Es emergencia?",
    emoji: "🤔",
    medalla: "Ojo de águila",
    dato: "Llamar al 911 es gratis. Funciona aunque el celular no tenga saldo",
  },
  {
    id: "direccion",
    titulo: "Arma la dirección",
    emoji: "🏠",
    medalla: "Detective de calles",
    dato: "Tu dirección solo se la dices al 911, a tu maestra o a un adulto de confianza. Nunca en internet",
    ahoraTu: {
      titulo: "¡Ahora tú!",
      pide: "Di tu dirección en voz alta a un adulto",
      lista: ["🛣️ Tu calle", "🔢 Tu número", "🏘️ Tu colonia", "📍 Algo que se ve cerca"],
      ayuda: "Si no te la sabes, pídele a tu familia que te ayude a llenar tu tarjeta de héroe",
    },
  },
  {
    id: "llamada",
    titulo: "La llamada al 911",
    emoji: "📞",
    medalla: "Voz de héroe",
    dato: "Si el celular tiene contraseña, busca el botón \"Emergencia\" en la pantalla de bloqueo. Así puedes llamar al 911",
    ahoraTu: {
      titulo: "¡Ahora tú!",
      pide: "Practica la llamada completa: un adulto es la operadora y tú contestas con tus datos",
      lista: ["🗣️ Qué pasa", "🏠 Tu dirección", "🧒 Tu nombre y tu edad", "📞 No cuelgas"],
      ayuda: "Practíquenla otra vez otro día. Entre más la repitas, más fácil te sale",
    },
  },
];
