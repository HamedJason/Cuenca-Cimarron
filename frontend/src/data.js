export const steps = [
  {
    id: "riesgos",
    number: "01",
    icon: "risk",
    title: "Reconoce los riesgos",
    short: "Observa tu entorno",
    description:
      "Identifica los riesgos dentro y fuera de casa. Encuentra tus zonas seguras",
    color: "green",
    tasks: [
      "Recorrimos la casa y detectamos objetos que pueden caer",
      "Identificamos zonas expuestas a inundación y revisamos instalaciones",
      "Ubicamos zonas seguras dentro y fuera de casa",
    ],
    tip: "Observen juntos cada espacio. Si una instalación necesita reparación, soliciten apoyo de una persona capacitada",
  },
  {
    id: "rutas",
    number: "02",
    icon: "map",
    title: "Traza un plan",
    short: "Encuentra el camino",
    description:
      "Dibuja tus rutas de evacuación y acuerda un punto de encuentro con tu familia",
    color: "gold",
    tasks: [
      "Dibujamos un croquis con salidas y riesgos identificados",
      "Elegimos rutas accesibles y un punto de encuentro",
      "Compartimos el croquis y nuestros contactos de emergencia",
    ],
    tip: "Incluyan las necesidades de niñas y niños, personas mayores, personas con discapacidad y mascotas",
  },
  {
    id: "decisiones",
    number: "03",
    icon: "people",
    title: "Decide cómo actuar",
    short: "Hagan equipo",
    description:
      "Asigna responsabilidades. Saber qué hacer ayuda a tomar mejores decisiones",
    color: "clay",
    tasks: [
      "Acordamos quién ayuda a cada integrante y a las mascotas",
      "Sabemos dónde consultar avisos oficiales y cómo comunicarnos",
      "Acordamos cómo seguir una indicación de evacuación",
    ],
    tip: "No todas las emergencias requieren la misma respuesta. Atiendan las indicaciones de las autoridades locales",
  },
  {
    id: "simulacros",
    number: "04",
    icon: "exit",
    title: "Practica tu plan",
    short: "Prepárense juntos",
    description:
      "Realiza al menos tres simulacros al año. Aprende de cada uno y mejora tu plan",
    color: "sage",
    tasks: [
      "Agendamos al menos tres simulacros durante el año",
      "Practicamos las rutas y el encuentro sin exponernos a riesgos",
      "Revisamos lo aprendido y actualizamos nuestro plan",
    ],
    tip: "Ensayen con calma. Un simulacro es una oportunidad para aprender y ajustar, no una competencia",
  },
];
export const supplies = [
  {
    id: "agua",
    name: "Agua potable",
    detail: "En envases cerrados; revisa su caducidad",
    icon: "drop",
    group: "Lo esencial",
  },
  {
    id: "alimentos",
    name: "Alimentos no perecederos",
    detail: "Listos para consumir y adecuados para tu familia",
    icon: "food",
    group: "Lo esencial",
  },
  {
    id: "botiquin",
    name: "Botiquín y medicamentos",
    detail: "Material básico y tratamientos prescritos",
    icon: "medical",
    group: "Lo esencial",
  },
  {
    id: "linterna",
    name: "Linterna y pilas",
    detail: "Verifica que funcionen y agrega repuestos",
    icon: "flashlight",
    group: "Lo esencial",
  },
  {
    id: "radio",
    name: "Radio portátil",
    detail: "De pilas, para escuchar información oficial",
    icon: "radio",
    group: "Comunicación y documentos",
  },
  {
    id: "documentos",
    name: "Documentos importantes",
    detail: "Copias protegidas del agua y directorio familiar",
    icon: "document",
    group: "Comunicación y documentos",
  },
  {
    id: "dinero",
    name: "Dinero en efectivo",
    detail: "Incluye monedas y billetes de baja denominación",
    icon: "wallet",
    group: "Comunicación y documentos",
  },
  {
    id: "silbato",
    name: "Silbato",
    detail: "Tenlo a la mano para pedir ayuda",
    icon: "whistle",
    group: "Cuidado de tu familia",
  },
  {
    id: "abrigo",
    name: "Manta y ropa de abrigo",
    detail: "Considera el clima y una muda de ropa",
    icon: "blanket",
    group: "Cuidado de tu familia",
  },
  {
    id: "higiene",
    name: "Artículos de higiene",
    detail: "Incluye las necesidades de cada integrante",
    icon: "heart",
    group: "Cuidado de tu familia",
  },
  {
    id: "mascotas",
    name: "Kit para tus mascotas",
    detail: "Si tienes: alimento, agua, correa y sus documentos",
    icon: "paw",
    group: "Cuidado de tu familia",
  },
  {
    id: "carga",
    name: "Batería para el celular",
    detail: "Cargada y con el cable compatible",
    icon: "battery",
    group: "Comunicación y documentos",
  },
];
export const sources = {
  plan: "https://www1.cenapred.unam.mx/es/Publicaciones/archivos/288-INFOGRAFAPLANFAMILIARDEPROTECCINCIVIL.PDF",
  backpack:
    "https://www.gob.mx/cenapred/articulos/la-seguridad-empieza-en-casa-prepara-tu-mochila-de-emergencia-228213",
  climate: "https://www.noaa.gov/understanding-el-nino",
  forecast: "https://smn.conagua.gob.mx/",
};

// Verificado el 7 de noviembre de 2026 en los sitios oficiales enlazados.
// Fuentes y notas: docs/investigacion-tijuana.md
export const emergency = {
  verifiedOn: "7 de noviembre de 2026",
  phones: [
    {
      name: "Protección Civil Tijuana",
      icon: "shield",
      theme: "civil",
      numbers: ["664 683 9112", "664 683 9131"],
      source: "https://proteccioncivil.tijuana.gob.mx/directorio.aspx",
    },
    {
      name: "Bomberos Tijuana",
      icon: "flame",
      theme: "fire",
      numbers: ["664 688 5705"],
      source: "https://bomberos.tijuana.gob.mx/",
    },
    {
      name: "Denuncia anónima",
      icon: "eyeOff",
      theme: "secret",
      numbers: ["089"],
      source: "https://policia.tijuana.gob.mx/contacto.aspx",
    },
  ],
  notices: [
    {
      title: "Comunicados de Protección Civil Tijuana",
      detail: "Avisos y medidas del municipio",
      url: "https://proteccioncivil.tijuana.gob.mx/noticialistadoDependencia.aspx",
    },
    {
      title: "Declaratoria de emergencia por El Niño",
      detail: "Nota de Punto Norte, 5 de noviembre de 2026",
      url: "https://puntonorte.info/2026/11/05/cabildo-de-tijuana-emite-declaratoria-de-emergencia-ante-inminente-llegada-de-el-nino/",
    },
    {
      title: "Avisos del clima",
      detail: "Servicio Meteorológico Nacional",
      url: "https://smn.conagua.gob.mx/",
    },
  ],
  sheltersUrl: "https://proteccioncivil.tijuana.gob.mx/refugios.aspx",
  shelters: [
    {
      name: "Unidad Deportiva Reforma",
      address: "Segunda Sur 701, Del Río, Otay Centenario",
    },
    {
      name: "Unidad Deportiva Independencia",
      address: "Av. Matamoros 1750, Independencia",
    },
    { name: "Unidad Deportiva CREA", address: "Cañón Aviación s/n, Centro" },
    {
      name: "Unidad Deportiva Salvatierra",
      address: "Padre Salvatierra 1642, Salvatierra",
    },
    {
      name: "Unidad Deportiva Tijuana",
      address:
        "Av. Ermita, Prol. Paseo de los Héroes 13990, Alfonso Corona del Rosal",
    },
    {
      name: "Unidad Deportiva Mariano Matamoros",
      address: "Mariano Matamoros, Centro",
    },
    {
      name: "Albergue de Migrantes Tijuana",
      address: "Blvd. Cuauhtémoc Sur 3170, Chula Vista",
    },
  ],
  riskMapUrl:
    "https://gemelodigital.implantijuana.gob.mx/atlas-de-riesgo-tijuana-2024",
  riskAtlasPdf: "https://proteccioncivil.tijuana.gob.mx/pdf/amrt/AMRT2024.pdf",
};

// Dinámicas de juego (vienen de la rama hambu, ya en tú y sin cifras inventadas)
export const games = [
  {
    id: "rally",
    icon: "route",
    meta: [
      { icon: "people", text: "Equipos de 2 a 5" },
      { icon: "check", text: "3 pasos" },
    ],
    title: "Escape de la tormenta",
    tag: "Rally en equipos",
    tone: "gold",
    image: "/assets/images/game-rally.webp",
    alt: "Ruta ilustrada durante una tormenta",
    short: "Encuentra la ruta segura antes de que suba el agua",
    text: "Recorre estaciones, resuelve retos breves y elige decisiones que te mantengan a salvo durante una lluvia intensa",
    steps: [
      "Forma un equipo de 2 a 5 personas",
      "Completa las estaciones y reúne las pistas",
      "Compara la ruta que eligieron y explica por qué es segura",
    ],
    stepIcons: ["people", "map", "shield"],
  },
  {
    id: "decisiones",
    icon: "signpost",
    meta: [{ icon: "check", text: "3 pasos" }],
    title: "Cada decisión cuenta",
    tag: "Decisiones",
    tone: "blue",
    image: "/assets/images/game-decisions.webp",
    alt: "Caminos ilustrados que representan decisiones",
    short: "Elige qué hacer y mira cómo cambia el camino",
    text: "Elige qué hacer ante una situación de lluvia y mira cómo cada decisión cambia el recorrido",
    steps: [
      "Lee la situación inicial",
      "Elige una de las opciones",
      "Revisa qué pasó y aprende de tu decisión",
    ],
    stepIcons: ["book", "signpost", "spark"],
  },
  {
    id: "mochila",
    icon: "backpack",
    meta: [
      { icon: "clock", text: "60 segundos" },
      { icon: "check", text: "3 pasos" },
    ],
    title: "Arma tu mochila",
    tag: "Reto de 60 segundos",
    tone: "green",
    image: "/assets/images/game-backpack.webp",
    alt: "Mochila ilustrada con artículos de emergencia",
    short: "¿Qué cosas sí van en la mochila? Tienes 60 segundos",
    text: "Encuentra en 60 segundos las cosas que de verdad necesitas para una emergencia",
    steps: [
      "Toma los objetos disponibles",
      "Separa lo indispensable de lo que no sirve",
      "Revisa tus respuestas y comparte un consejo",
    ],
    stepIcons: ["backpack", "check", "heart"],
  },
  {
    // Juego en línea hecho por otro equipo: la tarjeta lleva directo a jugarlo
    id: "cien-estudiantes",
    icon: "bell",
    meta: [
      { icon: "check", text: "6 preguntas" },
      { icon: "people", text: "Top 10 en vivo" },
    ],
    title: "100 estudiantes dijeron",
    tag: "Concurso en línea",
    tone: "blue",
    image: "/assets/images/game-cien-estudiantes.svg",
    alt: "Tablero de concurso bajo la lluvia con casitas en los cerros",
    short: "Adivina qué colonias de Tijuana sufren más con las lluvias",
    text: "Adivina qué colonias de Tijuana tienen más problemas con las lluvias, según reportes reales, y entra al Top 10",
    href: "https://cien-estudiantes-dijeron-production.up.railway.app/embed",
  },
];

// Consejos para antes, durante y después de la lluvia
export const advice = [
  {
    id: "antes",
    icon: "umbrella",
    tone: "gold",
    title: "Antes de la lluvia",
    text: "Revisa coladeras, techos y cosas importantes antes de que empiece",
    href: "/pages/recursos.html#antes",
  },
  {
    id: "durante",
    icon: "storm",
    tone: "blue",
    title: "Durante una tormenta",
    text: "No cruces arroyos y sigue la información oficial",
    href: "/pages/recursos.html#durante",
  },
  {
    id: "despues",
    icon: "home",
    tone: "green",
    title: "Después de la lluvia",
    text: "Revisa tu entorno y reporta riesgos",
    href: "/pages/recursos.html#despues",
  },
];
