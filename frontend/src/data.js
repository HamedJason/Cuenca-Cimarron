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

// Juegos: cada tarjeta abre el juego, hecho por el equipo o por otros equipos
export const games = [
  {
    // Se compila en el repo Mision-Tijuana y su dist/ se copia a public/juegos/mision-tijuana
    id: "mision-tijuana",
    icon: "map",
    meta: [
      { icon: "map", text: "6 misiones" },
      { icon: "signpost", text: "Tú decides" },
    ],
    title: "Misión Tijuana",
    tag: "Recorrido en 3D",
    tone: "green",
    image: "/assets/images/game-mision-tijuana.webp",
    alt: "Colonia ilustrada de Tijuana bajo la lluvia, con un marcador amarillo sobre una alcantarilla tapada y un arroyo crecido",
    short: "Recorre tu colonia en 3D y decide qué hacer cuando llega la tormenta",
    text: "Recorre en 3D colonias reales de Tijuana, mira cómo llega la tormenta y decide qué hacer. Cada decisión cambia lo que pasa",
    href: "/juegos/mision-tijuana/index.html",
  },
  {
    // Simulador de otro equipo publicado en Netlify
    id: "alerta-911",
    icon: "phone",
    meta: [
      { icon: "signpost", text: "3 situaciones" },
      { icon: "check", text: "Quiz de 10 preguntas" },
    ],
    title: "Alerta 911: Misión El Niño",
    tag: "Simulador",
    tone: "gold",
    image: "/assets/images/game-alerta-911.webp",
    alt: "Una mano sostiene un celular para pedir ayuda desde una banqueta elevada, frente a un carro detenido en una corriente de agua y luces de emergencia bajo la lluvia nocturna en Tijuana",
    short: "Practica qué hacer y cómo reportar una emergencia bajo la tormenta",
    text: "Observa, decide y aprende a reportar en tres situaciones de lluvia, y luego pon a prueba lo que aprendiste con un quiz",
    href: "https://lambent-trifle-f0f59f.netlify.app/",
  },
  {
    // Versión web de Ren'Py (NOVELAVISUAL_FINAL), copiada a public/juegos/novela-visual
    id: "novela-visual",
    icon: "book",
    meta: [
      { icon: "book", text: "Novela visual" },
      { icon: "signpost", text: "Tú decides" },
    ],
    title: "Un paso en falso: El Niño",
    tag: "Historia interactiva",
    tone: "blue",
    image: "/assets/images/game-novela-visual.webp",
    alt: "Vista desde un carro al atardecer lluvioso, con una calle anegada, un aviso meteorológico en el celular y una mochila",
    short: "Sales de clases con lluvia y cada decisión cambia cómo termina tu noche",
    text: "Sales de clases en plena lluvia y tienes que llegar a casa. Elige qué hacer en la calle, con un cable caído y al llamar al 911",
    href: "/juegos/novela-visual/index.html",
  },
  {
    // Genially de otro equipo
    id: "cinco-segundos",
    icon: "clock",
    meta: [
      { icon: "clock", text: "5 segundos" },
      { icon: "cloud", text: "Lluvia y sequía" },
    ],
    title: "5 segundos: Alerta El Niño",
    tag: "Preguntas rápidas",
    tone: "gold",
    image: "/assets/images/game-cinco-segundos.webp",
    alt: "Cronómetro sobre los cerros con lluvia de un lado y tierra seca del otro, y tres tarjetas con signos de pregunta",
    short: "Demuestra cuánto sabes de los riesgos de El Niño",
    text: "Contesta rápido y demuestra cuánto sabes de lluvias, inundaciones y sequía con El Niño",
    href: "https://view.genially.com/6af0fd5be9a36c837522b2ad",
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
    image: "/assets/images/game-cien-estudiantes.webp",
    alt: "Tablero verde y dorado con micrófono y botones de concurso, frente a un paisaje de casas y cerros bajo la lluvia",
    short: "Adivina qué colonias de Tijuana sufren más con las lluvias",
    text: "Adivina qué colonias de Tijuana tienen más problemas con las lluvias, según reportes reales, y entra al Top 10",
    href: "https://cien-estudiantes-dijeron-production.up.railway.app/embed",
  },
  {
    // El juego vive en public/juegos/reto-60-segundos y se abre aparte
    id: "mochila",
    icon: "backpack",
    meta: [
      { icon: "clock", text: "60 segundos" },
      { icon: "backpack", text: "Hasta 12 kg" },
    ],
    title: "Arma tu mochila",
    tag: "Reto de 60 segundos",
    tone: "green",
    image: "/assets/images/game-backpack.webp",
    alt: "Mochila ilustrada con artículos de emergencia",
    short: "¿Qué cosas sí van en la mochila? Tienes 60 segundos",
    text: "Busca por la casa lo que necesitas para evacuar antes de que se acabe el tiempo, y luego compara con una mochila ya lista",
    href: "/juegos/reto-60-segundos/index.html",
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
    href: "/#/consejos?momento=antes",
  },
  {
    id: "durante",
    icon: "storm",
    tone: "blue",
    title: "Durante una tormenta",
    text: "No cruces arroyos y sigue la información oficial",
    href: "/#/consejos?momento=durante",
  },
  {
    id: "despues",
    icon: "home",
    tone: "green",
    title: "Después de la lluvia",
    text: "Revisa tu entorno y reporta riesgos",
    href: "/#/consejos?momento=despues",
  },
];

// Información: los tres temas se abren en una ventana (LessonModal.vue),
// desde Información y desde "Prepárate antes de que llueva" en el inicio.
export const lessons = [
  {
    id: "conozca",
    icon: "cloud",
    tone: "blue",
    title: "Qué es El Niño",
    short: "Cómo cambia la lluvia y el clima en Tijuana",
    intro:
      "Un calentamiento del océano Pacífico que cambia la lluvia, el viento y la temperatura",
    body: "Saber cómo funciona te ayuda a entender los avisos y a prepararte antes. No pega igual en todos lados, por eso hay que seguir la información oficial y fijarse en lo que pasa en tu colonia",
    points: [
      "Cambia cuándo y cuánto llueve",
      "No afecta igual a todas las zonas",
      "Prepararse empieza con información confiable",
    ],
    image: "/assets/images/hero-el-nino.webp",
    alt: "Ilustración de Tijuana durante la lluvia",
  },
  {
    id: "planfamiliar",
    icon: "map",
    tone: "gold",
    title: "Haz tu plan familiar",
    short: "Rutas, tareas y un punto de encuentro",
    intro:
      "Decidan en familia qué hacer, cómo avisarse y dónde verse si pasa algo",
    body: "El plan convierte los consejos en acuerdos que todos en casa conocen. Piensen en cómo es su casa, por dónde pueden salir y qué necesitan los niños, los abuelos, quien tenga alguna discapacidad y las mascotas",
    points: [
      "Ubiquen los riesgos y las zonas seguras",
      "Elijan rutas y un punto de encuentro",
      "Repartan tareas y practiquen",
    ],
    image: "/assets/images/game-decisions.webp",
    alt: "Ilustración de caminos que llevan a un punto de encuentro",
  },
  {
    id: "mochila",
    icon: "backpack",
    tone: "green",
    title: "Prepara tu mochila",
    short: "Lo indispensable para salir rápido",
    intro: "Junta lo indispensable con tiempo y adáptalo a tu familia",
    body: "Una mochila lista te permite salir rápido o resguardarte con lo básico. Revísala cada cierto tiempo, protege los documentos y agrega medicinas, cosas de higiene y comida para tus mascotas si hace falta",
    points: [
      "Agua, comida, lámpara y botiquín",
      "Documentos y contactos protegidos del agua",
      "Revísala y ajústala a tu familia",
    ],
    image: "/assets/images/game-backpack.webp",
    alt: "Mochila ilustrada con artículos para una emergencia",
  },
];

// Qué significa El Niño para Tijuana (comunicado municipal del 2 nov 2026)
export const ninoOutlook = {
  cards: [
    {
      title: "El pronóstico cambia",
      text: "El municipio pidió prepararse desde ahora. Revisa los avisos antes de decidir",
    },
    {
      title: "Inundaciones y deslaves",
      text: "Con lluvia fuerte, las calles bajas, los arroyos y las laderas son más peligrosos. Ubica rutas y zonas seguras cerca de tu casa",
    },
    {
      title: "No toda lluvia es El Niño",
      text: "Una tormenta sola no quiere decir que ya llegó El Niño. Sigue los avisos del clima y de Protección Civil",
    },
  ],
  note: "El 2 de noviembre de 2026 el municipio informó que las lluvias podrían empezar entre finales de noviembre y principios de diciembre. El pronóstico puede cambiar",
  noteHref:
    "https://apps.tijuana.gob.mx/webpanel/comunicado/comunicadoCompleto.aspx?iIdComunicado=+37235",
  links: [
    { label: "NOAA, qué es El Niño", href: "https://www.noaa.gov/understanding-el-nino" },
    { label: "SMN, avisos del clima", href: "https://smn.conagua.gob.mx/" },
    { label: "Protección Civil Tijuana", href: "https://proteccioncivil.tijuana.gob.mx/" },
  ],
};

// Plan familiar en cuatro pasos. Las marcas se guardan con los mismos ids
// ("paso-tarea") que usaba la página anterior, así no se pierde lo marcado.
export const familyPlan = [
  {
    title: "Ubiquen los riesgos",
    text: "Revisen su casa y encuentren las zonas seguras",
    tasks: [
      "Recorran la casa y busquen cosas que se puedan caer",
      "Ubiquen zonas que se inundan y revisen las instalaciones",
      "Elijan zonas seguras y pidan ayuda para lo que haya que arreglar",
    ],
    tip: "Revisen cada cuarto juntos. No toquen instalaciones dañadas si no saben cómo",
  },
  {
    title: "Rutas y punto de encuentro",
    text: "Decidan por dónde salir y dónde verse si no pueden quedarse en casa",
    tasks: [
      "Dibujen un croquis con salidas y riesgos",
      "Elijan rutas fáciles y un punto de encuentro",
      "Compartan el croquis y los teléfonos de emergencia",
    ],
    tip: "Piensen en los niños, los abuelos, quien tenga alguna discapacidad y las mascotas",
  },
  {
    title: "Repartan tareas",
    text: "Cada quien sabe qué le toca y cómo avisar",
    tasks: [
      "Decidan quién ayuda a cada persona y a las mascotas",
      "Acuerden dónde ver los avisos y cómo comunicarse",
      "Acuerden qué hacer si les piden salir de casa",
    ],
    tip: "No todas las emergencias se atienden igual. Sigan lo que indiquen las autoridades",
  },
  {
    title: "Practiquen el plan",
    text: "Hagan simulacros y actualicen el plan cuando algo cambie",
    tasks: [
      "Agenden simulacros durante el año",
      "Practiquen las rutas sin ponerse en riesgo",
      "Platiquen qué salió bien y ajusten el plan",
    ],
    tip: "Un simulacro es para aprender, no una competencia",
  },
];

// Mochila: doce cosas en tres grupos. Los ids "item-n" son los de la página anterior.
export const kitGroups = [
  {
    title: "Lo esencial",
    items: [
      { id: "item-0", icon: "drop", name: "Agua potable", detail: "En envases cerrados y sin caducar" },
      { id: "item-1", icon: "food", name: "Alimentos no perecederos", detail: "Listos para comer y que le gusten a tu familia" },
      { id: "item-2", icon: "medical", name: "Botiquín y medicamentos", detail: "Lo básico y las medicinas que toman en casa" },
      { id: "item-3", icon: "flashlight", name: "Linterna y pilas", detail: "Que funcionen, con pilas de repuesto" },
    ],
  },
  {
    title: "Comunicación y documentos",
    items: [
      { id: "item-4", icon: "radio", name: "Radio portátil", detail: "De pilas, para oír los avisos oficiales" },
      { id: "item-5", icon: "document", name: "Documentos importantes", detail: "Copias en bolsa contra agua y una lista de teléfonos" },
      { id: "item-6", icon: "wallet", name: "Dinero en efectivo", detail: "Monedas y billetes chicos" },
      { id: "item-7", icon: "battery", name: "Batería para el celular", detail: "Cargada y con su cable" },
    ],
  },
  {
    title: "Cuidado de tu familia",
    items: [
      { id: "item-8", icon: "whistle", name: "Silbato", detail: "A la mano para pedir ayuda" },
      { id: "item-9", icon: "blanket", name: "Manta y ropa de abrigo", detail: "Según el clima, con una muda de ropa" },
      { id: "item-10", icon: "hygiene", name: "Artículos de higiene", detail: "Lo que necesite cada quien" },
      { id: "item-11", icon: "paw", name: "Kit para tus mascotas", detail: "Comida, agua, correa y su cartilla" },
    ],
  },
];

// Qué puede pasar en Tijuana
export const risks = [
  { icon: "cloud", tone: "blue", title: "Lluvias fuertes", text: "En poco tiempo se pierde visibilidad, el suelo se satura y moverse se vuelve difícil" },
  { icon: "risk", tone: "gold", title: "Deslaves", text: "Con la tierra mojada, las laderas y cañadas se pueden venir abajo" },
  { icon: "wave", tone: "green", title: "Inundaciones", text: "Arroyos, calles bajas y pasos a desnivel se llenan rápido. Nunca los cruces" },
];

// Consejos: qué hacer en cada momento
export const tips = [
  { id: "antes", icon: "home", tone: "gold", moment: "Antes de la lluvia", title: "Prepara tu casa", text: "Revisa coladeras, techos y cables sueltos. Guarda tus documentos en una bolsa que no deje pasar el agua y acuerda con tu familia cómo comunicarse" },
  { id: "durante", icon: "wave", tone: "blue", moment: "Durante la tormenta", title: "Aléjate de las corrientes", text: "Quédate en un lugar seguro. No cruces arroyos ni calles inundadas, aunque el agua se vea baja" },
  { id: "manejo", icon: "car", tone: "blue", moment: "Si vas manejando", title: "No cruces una calle inundada", text: "Baja la velocidad y busca otra ruta. Si el agua tapa el camino, detente en un lugar seguro y sigue las indicaciones oficiales" },
  { id: "despues", icon: "shield", tone: "green", moment: "Después de la lluvia", title: "Revisa tu alrededor", text: "No te acerques a zonas dañadas ni toques cables caídos. Reporta los riesgos y sigue pendiente de los avisos oficiales" },
];
