export const steps = [
  {
    id: "riesgos",
    number: "01",
    icon: "risk",
    title: "Reconoce los riesgos",
    short: "Observa tu entorno",
    description:
      "Busca qué puede ser peligroso dentro y fuera de casa. Encuentra los lugares seguros",
    color: "green",
    tasks: [
      "Recorrimos la casa y vimos qué cosas se pueden caer",
      "Vimos qué partes se pueden inundar y revisamos la luz, el gas y el agua",
      "Encontramos lugares seguros dentro y fuera de casa",
    ],
    tip: "Revisen juntos cada cuarto. Si algo está roto, pidan ayuda a alguien que sepa arreglarlo",
  },
  {
    id: "rutas",
    number: "02",
    icon: "map",
    title: "Traza un plan",
    short: "Encuentra el camino",
    description:
      "Dibuja por dónde salir de casa y elige con tu familia un lugar para verse",
    color: "gold",
    tasks: [
      "Dibujamos un mapa de la casa con las salidas y los peligros",
      "Elegimos caminos fáciles y un lugar para vernos",
      "Compartimos el mapa y los teléfonos de emergencia",
    ],
    tip: "Piensen en los niños, los abuelos, quien tenga alguna discapacidad y las mascotas",
  },
  {
    id: "decisiones",
    number: "03",
    icon: "people",
    title: "Decide cómo actuar",
    short: "Hagan equipo",
    description:
      "Repartan las tareas. Si cada quien sabe qué hacer, todo sale mejor",
    color: "clay",
    tasks: [
      "Decidimos quién ayuda a cada persona y a las mascotas",
      "Sabemos dónde ver los avisos y cómo hablarnos",
      "Sabemos qué hacer si nos piden salir de casa",
    ],
    tip: "Cada emergencia es diferente. Hagan caso a las autoridades",
  },
  {
    id: "simulacros",
    number: "04",
    icon: "exit",
    title: "Practica tu plan",
    short: "Prepárense juntos",
    description:
      "Practica tu plan tres veces al año o más. Cada vez lo harás mejor",
    color: "sage",
    tasks: [
      "Apartamos tres días del año para practicar",
      "Practicamos los caminos y el lugar para vernos, con cuidado",
      "Platicamos lo que aprendimos y mejoramos el plan",
    ],
    tip: "Practiquen con calma. Un simulacro es una práctica para aprender, no una carrera",
  },
];
export const supplies = [
  {
    id: "agua",
    name: "Agua potable",
    detail: "En botellas cerradas y que no estén vencidas",
    icon: "drop",
    group: "Lo esencial",
  },
  {
    id: "alimentos",
    name: "Comida que no se echa a perder",
    detail: "Lista para comer y que le guste a tu familia",
    icon: "food",
    group: "Lo esencial",
  },
  {
    id: "botiquin",
    name: "Botiquín y medicamentos",
    detail: "Lo básico y las medicinas que toman en casa",
    icon: "medical",
    group: "Lo esencial",
  },
  {
    id: "linterna",
    name: "Linterna y pilas",
    detail: "Que funcionen, con pilas de repuesto",
    icon: "flashlight",
    group: "Lo esencial",
  },
  {
    id: "radio",
    name: "Radio portátil",
    detail: "De pilas, para oír los avisos oficiales",
    icon: "radio",
    group: "Comunicación y documentos",
  },
  {
    id: "documentos",
    name: "Documentos importantes",
    detail: "Copias en una bolsa contra agua y una lista de teléfonos",
    icon: "document",
    group: "Comunicación y documentos",
  },
  {
    id: "dinero",
    name: "Dinero en efectivo",
    detail: "Monedas y billetes chicos",
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
    detail: "Según el clima, con un cambio de ropa",
    icon: "blanket",
    group: "Cuidado de tu familia",
  },
  {
    id: "higiene",
    name: "Artículos de higiene",
    detail: "Lo que necesite cada quien",
    icon: "heart",
    group: "Cuidado de tu familia",
  },
  {
    id: "mascotas",
    name: "Kit para tus mascotas",
    detail: "Si tienes: comida, agua, correa y su cartilla",
    icon: "paw",
    group: "Cuidado de tu familia",
  },
  {
    id: "carga",
    name: "Batería para el celular",
    detail: "Cargada y con su cable",
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
  firstAid: "https://www.gob.mx/cms/uploads/attachment/file/732470/Botiquin_compressed.pdf",
  safeWater: "https://cevece.edomex.gob.mx/sites/cevece.edomex.gob.mx/files/files/docs/tripticos/2023/Semana22.pdf",
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
  // Estaciones: ubicaciones del mapa .kmz de Bomberos Tijuana, domicilios y
  // teléfonos de bomberos.tijuana.gob.mx/central.aspx (revisado el 10 de noviembre de 2026).
  // Las estaciones sin teléfono publicado se atienden por la Central.
  fireStationsUrl: "https://bomberos.tijuana.gob.mx/central.aspx",
  fireStations: [
    { id: "central", name: "Central de Bomberos", area: "Zona Norte", address: "Ave. Aldrete y Madero 8298", phone: "664 685 5555", lat: 32.539306, lng: -117.035378 },
    { id: "estacion-1", name: "Estación 1", area: "Zona Centro", address: "Calle Emiliano Zapata y Ave. 5 de Mayo 7560", phone: "664 685 5556" },
    { id: "estacion-2", name: "Estación 2", area: "La Mesa", address: "Calle Baburias 500, Fracc. Anáhuac", phone: "664 622 0391", lat: 32.506928, lng: -116.976146 },
    { id: "estacion-3", name: "Estación 3", area: "El Florido", address: "Olivos y Camino Vecinal", phone: "664 629 3130", lat: 32.447903, lng: -116.885211 },
    { id: "estacion-4", name: "Estación 4", area: "Ciudad Industrial Mesa de Otay", address: "Blvd. Industrial s/n", phone: "664 623 4164", lat: 32.537408, lng: -116.921998 },
    { id: "estacion-5", name: "Estación 5", area: "Col. Sánchez Taboada", address: "Blvd. Sánchez Taboada s/n", phone: "664 626 6052", lat: 32.467604, lng: -116.971304 },
    { id: "estacion-6", name: "Estación 6", area: "Col. La Obrera 2da. Sección", address: "Ave. Centenario y Francisco Hernández s/n", phone: "664 684 5944", lat: 32.488193, lng: -117.040864 },
    { id: "estacion-7", name: "Estación 7", area: "Fracc. El Cortez", address: "Calle Veracruz y Mexiquito s/n", phone: "664 636 7622", lat: 32.509096, lng: -117.066572 },
    { id: "estacion-8", name: "Estación 8", area: "Fracc. El Águila", address: "Ave. Águila Real s/n", phone: "664 627 4552", lat: 32.498642, lng: -116.905508 },
    { id: "estacion-9", name: "Estación 9", area: "Col. La Presa", address: "Carretera libre a Tecate s/n", phone: "664 646 4682", lat: 32.44725, lng: -116.909382 },
    { id: "estacion-10", name: "Estación 10", area: "Playas de Tijuana", address: "Paseo Pedregal y Parque Azteca s/n, Fracc. Jardines", phone: "664 631 8996", lat: 32.52138, lng: -117.112713 },
    { id: "estacion-11", name: "Estación 11", area: "Col. Tierra y Libertad", address: "Calle Baylón Chacón y Ave. Santa Rosalía s/n", phone: "664 970 1100", lat: 32.494327, lng: -116.868554 },
    { id: "estacion-12", name: "Estación 12", area: "Fracc. Pórticos de San Antonio, Santa Fe", address: "Ave. Sur y Suroeste s/n", phone: "664 975 1490", lat: 32.43863, lng: -117.042552 },
    { id: "estacion-13", name: "Estación 13", area: "Fracc. El Refugio", address: "Ave. de los Cedros s/n", phone: "664 971 6565", lat: 32.458152, lng: -116.821333 },
    { id: "estacion-14", name: "Estación 14 Salvavidas", area: "Playas de Tijuana", address: "Ave. del Agua y Paseo Costero s/n", phone: "664 630 9161", lat: 32.523135, lng: -117.123908 },
    { id: "estacion-15", name: "Estación 15", area: "Fracc. Natura", address: "Blvd. Natura y Calle Bosques Azules s/n", lat: 32.375849, lng: -116.932512 },
    { id: "estacion-16", name: "Estación 16", area: "Fracc. Parajes del Valle", address: "Calle Valle de los Encinos s/n", phone: "664 207 1460", lat: 32.514689, lng: -116.745709 },
    { id: "estacion-17", name: "Estación 17", area: "Fracc. Altabrisa", address: "Calle Tomás Aquino y Damián Carmona s/n", phone: "664 210 0288", lat: 32.530263, lng: -116.978845 },
    { id: "estacion-18", name: "Estación 18", area: "Fracc. Hacienda las Delicias", address: "Calle Arroyo del Campo s/n", lat: 32.407212, lng: -116.937039 },
    { id: "forestal", name: "Estación Forestal", lat: 32.461893, lng: -116.880513 },
    { id: "campo-de-entrenamiento", name: "Campo de Entrenamiento", lat: 32.458231, lng: -116.820471 },
    // Rosarito: ubicación de OpenStreetMap (revisada el 16 de noviembre de 2026).
    // Bomberos de Rosarito no publica teléfonos por estación: se pide por el 911.
    // También tiene una estación en la colonia Morelos, sin ubicación publicada.
    { id: "rosarito-bomberos-centro", city: "Rosarito", name: "Bomberos Rosarito, Estación Centro", area: "Zona Centro, Rosarito", address: "Calle Mar del Norte, junto a la Cruz Roja", lat: 32.342011, lng: -117.056078 },
  ],
  // Policía municipal: domicilios, teléfonos y ubicaciones de la página
  // "Ubica tu Delegación" de la SSPCM (revisada el 15 de noviembre de 2026).
  // Las casetas y módulos de vigilancia no vienen ahí: muchas no tienen personal fijo.
  policeStationsUrl: "https://policia.tijuana.gob.mx/UbicaDelegacion.aspx",
  policeStations: [
    { id: "policia-direccion", name: "Dirección General de Policía y Tránsito", area: "Ciudad Industrial Nueva Tijuana", address: "Calle Uno Norte y Uno Poniente s/n", phones: ["664 979 1885"], lat: 32.5416372, lng: -116.912698 },
    { id: "policia-sur", name: "Comandancia Regional Sur", area: "Col. Cañada Verde", address: "Libramiento Salvador Rosas Magallón s/n", phones: ["664 622 8705"], lat: 32.4808397, lng: -116.9897379 },
    { id: "policia-centro", name: "Delegación Zona Centro", area: "Zona Centro", address: "Av. G e Internacional s/n", phones: ["664 688 3848", "664 973 7000"], lat: 32.5404839, lng: -117.0477849 },
    { id: "policia-los-pinos", name: "Delegación Los Pinos", area: "Poblado La Presa", address: "Carretera vieja Tijuana–Tecate km 14.5", phones: ["664 902 3743"], lat: 32.447662, lng: -116.9096345 },
    { id: "policia-playas", name: "Delegación Playas", area: "Playas de Tijuana", address: "Paseo del Pedregal y Av. del Agua s/n, Secc. Jardines", phones: ["664 631 6845"], lat: 32.5228538, lng: -117.1123489 },
    { id: "policia-cerro-colorado", name: "Delegación Cerro Colorado", area: "Col. Azteca", address: "Calle Dinamarca s/n", phones: ["664 625 9378"], lat: 32.4668043, lng: -116.9101423 },
    { id: "policia-la-presa", name: "Delegación La Presa", area: "Fracc. Villa Fontana", address: "Calle Aranjuez s/n", phones: ["664 627 8745"], lat: 32.5044639, lng: -116.8663463 },
    { id: "policia-sab", name: "Delegación San Antonio de los Buenos", area: "Col. Terrazas del Rubí", address: "Calle Arco, entre Santa Esther y San Quintín", phones: ["664 635 6125"], lat: 32.4802863, lng: -117.0320621 },
    { id: "policia-mesa-de-otay", name: "Delegación Mesa de Otay", area: "Col. Mesa de Otay", address: "Calzada Tecnológico s/n y Av. Circunvalación", phones: ["664 647 4204"], lat: 32.5296061, lng: -116.9786248 },
    { id: "policia-centenario", name: "Delegación Centenario", area: "Col. Ciudad Industrial", address: "Blvd. Alberto Limón Padilla s/n", phones: ["664 647 2647"], lat: 32.5376724, lng: -116.9225556 },
    { id: "policia-presa-rural", name: "Delegación Presa Rural", area: "Fracc. El Refugio", address: "Av. de los Cerezos s/n", phones: ["664 971 6642"], lat: 32.4581611, lng: -116.8210652 },
    { id: "policia-natura", name: "Delegación Natura", area: "Natura, Sección Bosques", address: "Natura Sección Bosques", phones: ["664 524 7060", "664 526 3825"], lat: 32.3750323, lng: -116.9341834 },
    // Rosarito: ubicaciones de OpenStreetMap (revisadas el 16 de noviembre de 2026).
    // Desde 2025 la policía de Rosarito la coordina el Estado; no hay teléfonos
    // por delegación publicados, así que se pide por el 911.
    { id: "rosarito-seguridad", city: "Rosarito", name: "Seguridad Pública de Rosarito", area: "Rosarito", address: "Calle Distrito Federal", lat: 32.362762, lng: -117.051791 },
    { id: "rosarito-policia-centro", city: "Rosarito", name: "Delegación Centro Rosarito", area: "Zona Centro, Rosarito", address: "Blvd. Benito Juárez", lat: 32.341399, lng: -117.056338 },
  ],
  // Cruz Roja: sede y bases con ubicación en OpenStreetMap (revisadas el 16 de noviembre de 2026).
  // La ambulancia se pide al 911 (es gratis). La Cruz Roja Tijuana también tiene bases en
  // Fundadores, entrada a Playas, Santa Fe, Pacífico, Baja Maq-El Águila, El Dorado,
  // Ojo de Agua y Natura (Zeta, abril de 2026), sin ubicación publicada.
  redCrossUrl: "https://zetatijuana.com/2026/04/cruz-roja-tijuana-inaugura-base-de-ambulancias-en-baja-maq/",
  redCrossBases: "Fundadores, la entrada a Playas, Santa Fe, Pacífico, Baja Maq-El Águila, El Dorado, Ojo de Agua y Natura",
  redCrossStations: [
    // Línea adicional de emergencias publicada por la Cruz Roja Tijuana (N+, enero de 2024)
    { id: "cruz-roja-tijuana", name: "Cruz Roja Tijuana, hospital y urgencias", area: "La Mesa, 2a. Etapa del Río", address: "Calle Laguna Salada y Blvd. Insurgentes", phones: ["911", "664 607 6728"], lat: 32.506721, lng: -116.96399 },
    { id: "cruz-roja-centro", name: "Cruz Roja, Base Centro", area: "Col. Marrón, Zona Centro", address: "Calle Plutarco Elías Calles" , lat: 32.525078, lng: -117.028253 },
    { id: "cruz-roja-otay", name: "Cruz Roja, Base Otay", area: "Otay Constituyentes", address: "Calle Las Fuentes y Privada Florencia", lat: 32.529267, lng: -116.953084 },
    { id: "cruz-roja-florido", name: "Cruz Roja, Base El Florido", area: "Hacienda Casa Grande, El Florido", address: "Junto a la Estación 3 de Bomberos", lat: 32.448104, lng: -116.884895 },
    // Rosarito: urgencias 24 horas desde marzo de 2026 (El Imparcial)
    { id: "cruz-roja-rosarito", city: "Rosarito", name: "Cruz Roja Rosarito, urgencias 24 horas", area: "Zona Centro, Rosarito", address: "Calle René Ortiz Campoy 100", lat: 32.341813, lng: -117.056189 },
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

// Quién te ayuda y en qué (/informacion): qué hace cada dependencia, cuándo
// llamarle en temporada de lluvias y a quién le toca lo que ella no atiende.
// Teléfonos: los mismos de emergency.phones; CFE y CESPT, de sus líneas de reporte.
// Funciones: sitios oficiales de cada dependencia (revisados el 15 de noviembre de 2026)
// y notas de El Imparcial y Zeta sobre su trabajo en deslizamientos y fugas.
export const agencies = [
  {
    id: "911",
    kid: "Cuando alguien está en peligro, herido o hay fuego",
    name: "Emergencias 911",
    icon: "phone",
    theme: "911",
    phones: ["911"],
    what: "Una sola llamada para policía, ambulancia y bomberos. Quien contesta te pregunta qué pasa y manda a la unidad que se necesita",
    callWhen: [
      "Alguien está herido, atrapado o en peligro",
      "El agua se lleva un carro o a una persona",
      "Hay fuego, olor fuerte a gas o un cable con chispas",
      "Ves un delito en este momento",
    ],
    notFor: "No es para preguntar por el clima ni para reportar baches o fugas que no ponen a nadie en peligro",
  },
  {
    id: "proteccion-civil",
    kid: "Cuando ves grietas en tu casa o en el cerro",
    name: "Protección Civil Tijuana",
    icon: "shield",
    theme: "civil",
    phones: ["664 683 9112", "664 683 9131"],
    what: "Revisa zonas y casas en riesgo, vigila los deslizamientos de tierra, abre los refugios temporales y avisa cuando viene una tormenta",
    callWhen: [
      "Aparecen grietas en paredes, piso o en el cerro junto a tu casa",
      "La tierra de un cerro o un bordo se mueve o se cae poco a poco",
      "Quieres saber si tu casa está en zona de riesgo",
      "Necesitas saber qué refugio está abierto",
    ],
    notFor: "Si el cerro ya se vino abajo o hay personas atrapadas, llama al 911",
    detail: "Después de revisar, marca las casas con un engomado rojo (riesgo alto, hay que salir) o amarillo (riesgo moderado)",
    source: "https://proteccioncivil.tijuana.gob.mx/",
  },
  {
    id: "bomberos",
    kid: "Para dudas. Si hay fuego, marca al 911",
    name: "Bomberos Tijuana",
    icon: "flame",
    theme: "fire",
    phones: ["664 688 5705"],
    what: "Apagan incendios y rescatan personas: de un arroyo, de un carro atrapado en el agua, de una casa derrumbada. También atienden fugas de gas y materiales peligrosos",
    callWhen: [
      "Hay fuego o humo, aunque sea poco",
      "Huele a gas en tu casa o en la calle",
      "Alguien quedó atrapado por el agua o por un derrumbe",
      "Se cayó un árbol sobre una casa o un carro",
    ],
    notFor: "En una emergencia marca al 911: llega igual a bomberos y te atienden más rápido. Su número directo es para dudas y trámites",
    detail: "Tienen 18 estaciones en la ciudad. También hacen inspecciones de seguridad y la investigación de incendios es gratuita",
    source: "https://bomberos.tijuana.gob.mx/",
  },
  {
    id: "policia",
    kid: "Cuando un choque o el agua tapan la calle",
    name: "Policía municipal",
    icon: "shield",
    theme: "police",
    phones: ["664 688 5541"],
    what: "Cuida la seguridad en las colonias, atiende choques y accidentes de tránsito, y cierra calles cuando un paso se vuelve peligroso",
    callWhen: [
      "Un choque o un carro varado bloquea la calle",
      "Una calle o un vado se inundó y hay que cerrarlo",
      "Hay saqueos o robos durante una emergencia",
    ],
    notFor: "El número es de la oficina central. Si pasa algo ahora mismo, llama al 911. Las casetas pueden estar sin personal",
    detail: "Tiene 12 sedes en la ciudad. Puedes ver la más cercana en «Ayuda cerca de ti», en el inicio",
    source: "https://policia.tijuana.gob.mx/contacto.aspx",
  },
  {
    id: "cruz-roja",
    kid: "Para pedir una ambulancia, marca al 911",
    name: "Cruz Roja Tijuana",
    icon: "medical",
    theme: "redcross",
    phones: ["911"],
    what: "Lleva ambulancias y da los primeros auxilios camino al hospital. También da cursos de primeros auxilios para la comunidad",
    callWhen: [
      "Alguien se desmayó, no respira bien o sangra mucho",
      "Hay heridos por un choque, una caída o un derrumbe",
      "Alguien estuvo mucho tiempo en agua fría y tiembla sin parar",
    ],
    notFor: "Para pedir una ambulancia marca al 911. Ahí mandan a Cruz Roja o a la unidad más cercana",
  },
  {
    id: "denuncia",
    kid: "Para avisar de un delito sin decir tu nombre",
    name: "Denuncia anónima 089",
    icon: "eyeOff",
    theme: "secret",
    phones: ["089"],
    what: "Recibe denuncias de delitos sin pedirte tu nombre. Lo que reportas se pasa a la autoridad que corresponde",
    callWhen: [
      "Sabes de un delito pero no quieres dar tu nombre",
      "Ves que roban cables, tapas de alcantarilla o rejillas",
    ],
    notFor: "Si el delito está pasando ahora y alguien corre peligro, llama al 911",
  },
  {
    id: "cfe",
    kid: "Cuando se va la luz o se cae un cable",
    name: "CFE, luz",
    icon: "flashlight",
    theme: "cfe",
    phones: ["071"],
    what: "Repara fallas de electricidad: postes caídos, cables sueltos y colonias sin luz",
    callWhen: [
      "Se cayó un poste o un cable a la calle",
      "Se fue la luz en tu calle o colonia",
      "Un transformador echa chispas o humo",
    ],
    notFor: "Nunca toques un cable caído ni el agua que lo rodea. Si echa chispas cerca de personas, llama también al 911",
  },
  {
    id: "cespt",
    kid: "Cuando hay una fuga o se desborda el drenaje",
    name: "CESPT, agua y drenaje",
    icon: "drop",
    theme: "water",
    phones: ["073"],
    what: "Repara fugas de agua y destapa el drenaje. Al reportar te dan un número de folio para dar seguimiento",
    callWhen: [
      "Hay una fuga de agua en la calle o en tu toma",
      "El drenaje se desborda o sale agua negra por la coladera",
      "Una alcantarilla de drenaje quedó sin tapa",
    ],
    notFor: "Guarda el folio que te den. También reciben reportes por WhatsApp al 664 370 1531",
  },
];

// Buen uso del 911 (/informacion). Cifras del C5 de Baja California en Tijuana
// (Zeta, 12 de abril de 2025) y del C5 estatal (El Imparcial, 21 de noviembre de 2024).
// Gratuidad sin saldo: Carta de derechos de usuarios de telecomunicaciones (IFT/gob.mx).
// No hay un artículo del Código Penal de BC sobre llamadas falsas; por eso no se cita
// una pena exacta, solo que se investigan.
export const call911 = {
  stats: [
    { value: "5,700", label: "llamadas al día recibe el 911 en Tijuana" },
    { value: "3 de 10", label: "son emergencias de verdad" },
    { value: "57 %", label: "son llamadas mudas: marcan y no dicen nada" },
  ],
  statsSource: "https://zetatijuana.com/2025/04/911-recibe-mas-de-5-mil-llamadas-al-dia-solo-el-30-corresponde-a-una-emergencia-real/",
  facts: [
    { icon: "wallet", title: "Es gratis", text: "Funciona sin saldo, desde cualquier celular, teléfono de casa o teléfono público" },
    { icon: "clock", title: "Las 24 horas", text: "Contestan todos los días del año, también en días festivos y de noche" },
    { icon: "people", title: "Una sola llamada", text: "Desde ahí mandan policía, ambulancia, bomberos o Protección Civil, según lo que pase" },
    { icon: "pin", title: "Queda registrada", text: "Se guarda tu número y la ubicación aproximada de tu teléfono" },
  ],
  steps: [
    { title: "Ponte a salvo primero", text: "Si hay agua, fuego o un cable caído, aléjate antes de marcar. Llama desde un lugar seguro" },
    { title: "Di qué pasa", text: "En una frase: «Un carro quedó atrapado en el arroyo y hay dos personas adentro»" },
    { title: "Di dónde estás", text: "Colonia, calle y número, entre qué calles y algo que se vea: una tienda, una escuela, una iglesia" },
    { title: "Contesta lo que te pregunten", text: "Cuántas personas son, si hay heridos, si respiran, si hay fuego o armas. Habla despacio" },
    { title: "No cuelgues", text: "Espera a que la operadora termine. Te puede decir qué hacer mientras llega la ayuda" },
    { title: "Deja el teléfono libre", text: "Después de colgar no lo uses para otras cosas: te pueden regresar la llamada" },
  ],
  dont: [
    "Hacer bromas o reportes falsos: se investigan y le quitan la línea a alguien que sí la necesita",
    "Marcar y quedarte callado. Si marcaste por error, no cuelgues: di que fue un error",
    "Preguntar por el clima, si hay clases o cuánto va a llover",
    "Reportar baches, fugas o basura que no ponen a nadie en peligro: tienen su propio número",
    "Grabar para subir a redes antes de pedir ayuda: primero llama",
  ],
  kids: [
    "Que se aprendan su dirección y la digan completa: colonia, calle y número",
    "Que sepan que el 911 es gratis y se puede marcar aunque el teléfono no tenga saldo",
    "Practiquen en casa con un teléfono apagado lo que dirían",
    "Escribe la dirección y los teléfonos de la familia en un papel junto al teléfono y en la mochila",
  ],
  silent: {
    title: "Si no puedes hablar",
    text: "La app 911 Móvil BC tiene un chat con la operadora y le dice dónde estás. Sirve si no puedes hablar o no oyes bien. Descárgala antes de necesitarla",
    url: "https://apps.apple.com/mx/app/911movilbc/id742612886",
  },
};

// Tu llamada al 911, paso a paso (/informacion). Pasos revisados con personal del 911.
// Cada paso tiene su animación en public/assets/animaciones/llamada-paso-N.
export const callGuide = [
  { title: "Ponte a salvo", text: "Primero aléjate del peligro", alt: "Una niña cimarrón se aleja de un cable con chispas y se cubre de la lluvia" },
  { title: "Llama al 911", text: "Marca 9, 1, 1. Es gratis", alt: "La niña marca 9, 1, 1 y se pone el teléfono en la oreja" },
  { title: "Di dónde estás", text: "Calle, número, colonia y algo que se vea cerca", alt: "En un globo aparecen su casa con número, el letrero de la calle y la tiendita de la esquina" },
  { title: "Di qué pasa", text: "Cuenta lo que ves con pocas palabras", alt: "En un globo aparece una casa con fuego y humo" },
  { title: "Contesta lo que te pregunten", text: "Escucha y contesta con calma", alt: "La operadora pregunta y la niña contesta cuántas personas son" },
];

// ¿Es una emergencia? Mini juego de Sí o No.
export const emergencyQuiz = [
  { text: "Hay fuego en una casa", icon: "flame", yes: true },
  { text: "Quiero saber qué hora es", icon: "clock", yes: false },
  { text: "Alguien no respira", icon: "heart", yes: true },
  { text: "Un gato se subió a un árbol", icon: "paw", yes: false },
  { text: "El agua entra a la casa", icon: "drop", yes: true },
  { text: "Quiero hacer una broma", icon: "face", yes: false },
  { text: "Se cayó un cerro sobre la calle", icon: "hill", yes: true },
  { text: "El vecino pone la música muy fuerte", icon: "radio", yes: false },
  { text: "Alguien está muy herido", icon: "medical", yes: true },
  { text: "Alguien está en peligro", icon: "bell", yes: true },
];

// Si la familia se separa (/informacion). Recomendaciones de personal del 911.
// Restablecimiento del Contacto entre Familiares: servicio de la Cruz Roja y el CICR.
export const familySeparation = [
  { icon: "route", text: "Acuerden rutas y un punto de encuentro por si no hay señal" },
  { icon: "phone", text: "Apréndete de memoria el teléfono de mamá, papá o quien te cuida" },
  { icon: "eyeOff", text: "No te vayas con desconocidos. Solo con alguien de uniforme", uniforms: true },
  { icon: "medical", text: "La Cruz Roja ayuda a las familias separadas a volver a encontrarse", url: "https://www.icrc.org/es/nuestras-actividades/restablecimiento-del-contacto-entre-familiares", link: "Restablecimiento del Contacto entre Familiares" },
];

// Escuadrón Violeta de Tijuana (SSPCM): atiende violencia contra mujeres, niñas y niños.
// Número tomado de Diario Tijuana (16 de abril de 2025), que cita a la SSPCM.
// No se encontró en un sitio oficial del Ayuntamiento: confirmar con la SSPCM y cambiarlo aquí si hace falta.
// La Línea Violeta estatal (SSCBC) es 686 837 3700 ext. 11017, de 7:00 a 23:00 (seguridadbc.gob.mx).
export const VIOLET_SQUAD_PHONE = "664 680 3187";

// Otros números de ayuda, además del 911 y de las dependencias de arriba.
// 088 y 089: Uno TV con datos del SESNSP. Línea de la Vida: CONASAMA, Secretaría de Salud.
// Línea de las Mujeres 079 opción 1: opera desde el 1 de mayo de 2025.
export const helpLines = [
  {
    id: "089",
    name: "Denuncia anónima",
    number: "089",
    icon: "eyeOff",
    theme: "secret",
    what: "Para denunciar sin dar tu nombre, aunque no esté pasando en ese momento. También es la línea nacional contra la extorsión",
  },
  {
    id: "088",
    name: "Guardia Nacional",
    kid: "Si te quedas varado en la carretera",
    number: "088",
    icon: "car",
    theme: "police",
    what: "Reportes y denuncias de delitos, y emergencias en carreteras y casetas de cobro. Útil si te quedas varado en la carretera a Tecate o a Ensenada",
  },
  {
    id: "vida",
    name: "Línea de la Vida",
    number: "800 911 2000",
    icon: "heart",
    theme: "redcross",
    what: "Apoyo emocional gratis, las 24 horas: crisis, ansiedad, tristeza que no se va, ideas de hacerte daño o problemas con alcohol y drogas",
  },
  // 075: línea de intervención en crisis del municipio, las 24 horas. Puede mandar a la UMAS
  // (Unidad Municipal de Apoyo Social) (Zeta, enero de 2025;
  // El Imparcial, noviembre de 2025). En algunos celulares no entra: entonces se marca al 911.
  {
    id: "075",
    name: "Línea de intervención en crisis",
    number: "075",
    note: "Solo en Tijuana",
    icon: "heart",
    theme: "redcross",
    what: "Psicólogos del municipio te escuchan las 24 horas. Si hace falta, mandan a la UMAS a ayudarte. Si no entra la llamada, marca al 911",
  },
  {
    id: "mujeres",
    name: "Línea de las Mujeres",
    number: "079",
    note: "y luego la opción 1",
    icon: "people",
    theme: "911",
    what: "Orientación legal y apoyo para mujeres que viven violencia. Si estás en peligro ahora, te pasan al 911",
  },
  {
    id: "cfe",
    name: "CFE, luz",
    number: "071",
    icon: "flashlight",
    theme: "cfe",
    what: "Postes o cables caídos, transformadores con chispas y colonias sin luz",
  },
  {
    id: "cespt",
    name: "CESPT, agua y drenaje",
    number: "073",
    icon: "drop",
    theme: "water",
    what: "Fugas de agua, drenaje desbordado y alcantarillas sin tapa. Te dan un folio",
  },
];

// ¿A quién le llamo? Situaciones de temporada de lluvias y el número que toca.
export const whoToCall = [
  { situation: "El agua se lleva un carro o a una persona", number: "911", who: "Emergencias" },
  { situation: "Alguien está herido, no respira o se desmayó", number: "911", who: "Emergencias" },
  { situation: "Huele a gas o hay fuego", number: "911", who: "Emergencias" },
  { situation: "Se cayó un cable y echa chispas cerca de gente", number: "911", who: "Emergencias" },
  { situation: "Se fue la luz o hay un poste caído sin chispas", number: "071", who: "CFE" },
  { situation: "Aparecen grietas en tu casa o en el cerro", number: "664 683 9112", who: "Protección Civil" },
  { situation: "La coladera se desborda o hay una fuga", number: "073", who: "CESPT" },
  { situation: "Te quieren extorsionar por teléfono", number: "089", who: "Denuncia anónima" },
  { situation: "Te quedaste varado en la carretera", number: "088", who: "Guardia Nacional" },
  { situation: "Sientes que ya no puedes más", number: "800 911 2000", who: "Línea de la Vida" },
];

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
  {
    // Un solo HTML en public/juegos/memorama; avisa al terminar (cuenca-puntos.js)
    id: "memorama",
    icon: "kit",
    meta: [
      { icon: "people", text: "2 jugadores" },
      { icon: "kit", text: "16 pares" },
    ],
    title: "Memorama de emergencia",
    tag: "Juego de memoria",
    tone: "blue",
    image: "/assets/images/game-memorama.webp",
    alt: "Tablero de memorama con cartas volteadas de objetos del botiquín y de la mochila de emergencia",
    short: "Juega en pareja y encuentra los pares del botiquín y la mochila",
    text: "Juega con alguien más: uno busca los pares del botiquín y el otro los de la mochila de emergencia. Gana quien complete primero sus 8 pares",
    href: "/juegos/memorama/index.html",
  },
  {
    // Repo Alto-al-Fuego copiado tal cual a public/juegos/alto-al-fuego; avisa al apagar el fuego
    id: "alto-al-fuego",
    icon: "flame",
    meta: [
      { icon: "flame", text: "Fuegos A, B, C y K" },
      { icon: "check", text: "Método T.A.P.E." },
    ],
    title: "Alto al Fuego",
    tag: "Simulador de extintor",
    tone: "gold",
    image: "/assets/images/game-alto-al-fuego.webp",
    alt: "Pantalla de inicio de Alto al Fuego con Cimarroncito y las cuatro clases de fuego: A, B, C y K",
    short: "Identifica el fuego, elige el extintor y apunta a la base",
    text: "Reconoce qué tipo de fuego es, escoge el extintor correcto y apágalo con el método T.A.P.E.: tira, apunta, presiona y esparce",
    href: "/juegos/alto-al-fuego/index.html",
  },
  {
    // App de RCP solo con las manos y uso del DEA, de un estudiante de Medicina UABC, publicada en Vercel
    id: "codigo-120",
    icon: "heart",
    meta: [
      { icon: "signpost", text: "6 misiones" },
      { icon: "heart", text: "RCP con las manos" },
    ],
    title: "Código 120: Guardianes de la Vida",
    tag: "Primeros auxilios",
    tone: "green",
    image: "/assets/images/game-codigo-120.webp",
    alt: "Portada de Código 120 con el título Conviértete en Guardián de la Vida",
    short: "Aprende RCP solo con las manos y a usar un desfibrilador (DEA)",
    text: "Alguien se desploma en el patio de tu escuela. En seis misiones aprendes a reconocer la emergencia, llamar al 911, dar RCP solo con las manos y usar un DEA",
    href: "https://codigo-120.vercel.app/",
  },
  {
    // Rama juego-llamada-911, copiado a public/juegos/llamada-911; avisa al ganar las 4 medallas
    id: "llamada-911",
    icon: "phone",
    meta: [
      { icon: "signpost", text: "4 misiones" },
      { icon: "phone", text: "Qué decir al 911" },
    ],
    title: "¿Llamo al 911?",
    tag: "Misiones del 911",
    tone: "gold",
    image: "/assets/images/game-llamada-911.webp",
    alt: "Una mano sostiene un celular con el botón verde de llamar frente a una casa con humo en la cocina, una historieta y una medalla en el escalón",
    short: "Aprende cuándo llamar al 911, qué decir y cómo dar tu dirección",
    text: "Arma tu historieta del 911, distingue qué sí es una emergencia, aprende las partes de una dirección y practica una llamada con la operadora",
    href: "/juegos/llamada-911/index.html",
  },
  {
    // Simulador de otro equipo publicado en Netlify
    id: "triage-nocturno",
    icon: "medical",
    meta: [
      { icon: "signpost", text: "10 niveles" },
      { icon: "medical", text: "Triage START" },
    ],
    title: "Triage Nocturno",
    tag: "Simulador de brigada",
    tone: "blue",
    image: "/assets/images/game-triage-nocturno.webp",
    alt: "Botiquín abierto, linterna y etiquetas roja, amarilla y verde sobre una lona azul en una calle de noche con lluvia, ambulancia y patrulla al fondo",
    short: "Eres brigadista: decide a quién atender primero en un choque de madrugada",
    text: "Revisa a cada herido, da los primeros auxilios que salvan vidas y ponle la etiqueta de color correcta. Son 10 niveles y cada uno es más difícil",
    href: "https://stunning-unicorn-d394b4.netlify.app/",
  },
];

// Equipo (/equipo): quién hizo la página y cada juego.
// El equipo de desarrollo hace toda la página y Misión Tijuana.
export const developers = [
  "Jason Alejandro Hamed Valdez",
  "Fernando Onit Sibaja Gomez",
  "Kevin Osmar Valdez Meza",
];
export const designSupport = [
  "Brandon Jahir Hernandez Vazquez",
  "Ulises Joel Machado Meraz",
  "Diego Sebastian Peralta Martinez",
  "Luz Angelica Perez Olvera",
];
// Creadores de cada juego, con el mismo id que en games
export const gameCredits = {
  "mision-tijuana": developers,
  "alerta-911": [
    "Carlos Daniel Quiñonez Méndez",
    "Rafael Borraz Contreras",
    "Yessica Elena Guerrero Ramirez",
    "Lizzette Ramírez Fernández",
    "Rebeca Rios Zuñiga",
    "Melissa Díaz López",
    "Eduardo Isaías Mérida Rodríguez",
    "Mozart Reyes Manzano",
  ],
  "novela-visual": [
    "Jennyfer Adanelli Bello Martínez",
    "Antonella Hazz Vargas",
  ],
  "cinco-segundos": [
    "Sarai Salazar Zarate",
    "Yuliana Medina Roman",
    "Michel Rosas Gomez",
    "Jose Sebastian Galvan Perez",
    "Victor Manuel Flores Ordaz",
  ],
  "cien-estudiantes": [
    "Adolfo Manuel Ordóñez Sosa",
    "Derek Isamu Guillén Bacho",
    "Bryan René Rodríguez Mendiola",
    "Jonathan Daniel Cerón Cornejo",
    "José Gustavo Cristerna Gomez",
  ],
  mochila: [
    "Gael Alejandro González Martin del Campo",
    "Christian David Delapena Jim",
    "Erick André Castillo Pastén",
    "Hugo Giovanni Chaparro Herrera",
  ],
  // El mismo equipo de Arma tu mochila
  "alto-al-fuego": [
    "Gael Alejandro González Martin del Campo",
    "Christian David Delapena Jim",
    "Erick André Castillo Pastén",
    "Hugo Giovanni Chaparro Herrera",
  ],
  // Estudiante de Medicina de la UABC
  "codigo-120": ["Isaac Rubio"],
  "llamada-911": ["Fernando Onit Sibaja Gomez"],
  memorama: [
    "Cinthya Patricia Cervantes Quintero",
    "Marco Alberto Espinoza Vasquez",
    "Kimberly Azbelin Huizar Garin",
    "Luz Ileana Macias Garcia",
    "Luz Paola Pozos Santiago",
  ],
};

// Consejos para antes, durante y después de la lluvia
export const advice = [
  {
    id: "antes",
    icon: "umbrella",
    tone: "gold",
    title: "Antes de la lluvia",
    text: "Revisa coladeras, techos y cosas importantes antes de que empiece",
    href: "/consejos?momento=antes",
  },
  {
    id: "durante",
    icon: "storm",
    tone: "blue",
    title: "Durante una tormenta",
    text: "No cruces arroyos y sigue la información oficial",
    href: "/consejos?momento=durante",
  },
  {
    id: "despues",
    icon: "home",
    tone: "green",
    title: "Después de la lluvia",
    text: "Revisa tu alrededor y avisa de los peligros",
    href: "/consejos?momento=despues",
  },
];

// Información: los temas se abren en una ventana (LessonModal.vue),
// desde Información y desde "Prepárate antes de que llueva" en el inicio.
export const lessons = [
  {
    id: "conozca",
    icon: "cloud",
    tone: "blue",
    title: "Qué es El Niño",
    short: "Por qué puede llover más en Tijuana",
    intro:
      "El Niño es un calentamiento del océano Pacífico. Eso cambia la lluvia y el clima",
    body: "En Tijuana puede traer mucha lluvia, inundaciones y deslaves. Un deslave es cuando la tierra de un cerro se cae",
    points: [
      "Haz un plan con tu familia",
      "Ten lista tu mochila",
      "No cruces calles ni arroyos con agua",
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
  {
    id: "salud",
    icon: "medical",
    tone: "blue",
    title: "Botiquín y salud",
    short: "Qué lleva un botiquín y cómo cuidarte en la lluvia",
    intro: "Con un botiquín puedes curar una herida mientras llega la ayuda",
    body: "Ten un botiquín en casa. Lleva cosas para curar y limpiar. Las medicinas van aparte, con su receta. Después de una inundación, toma agua limpia y no te metas al agua de la calle",
    points: [
      "Cosas para curar, limpiar y protegerte",
      "Medicinas aparte, con su receta",
      "Agua limpia y cuidado con la fiebre",
    ],
    image: "/assets/images/botiquin.webp",
    alt: "Ilustración de un botiquín rojo abierto con venda, gasas, medicina y termómetro, junto a curitas, tijeras y guantes",
  },
];

// Botiquín para casa: material básico del Botiquín de Primera Respuesta del
// STCONAPRA (Secretaría de Salud), adaptado al hogar. Fuente en sources.firstAid.
export const firstAidGroups = [
  {
    title: "Para curar",
    items: [
      { id: "fa-gasas", name: "Gasas chicas y grandes", detail: "Para tapar heridas" },
      { id: "fa-vendas", name: "Vendas", detail: "Una angosta, una ancha y una de triángulo para el brazo" },
      { id: "fa-tela", name: "Tela adhesiva y curitas", detail: "Para pegar gasas y tapar cortadas chicas" },
      { id: "fa-algodon", name: "Bolitas de algodón", detail: "Se usan junto a la herida, no adentro" },
    ],
  },
  {
    title: "Para limpiar",
    items: [
      { id: "fa-jabon", name: "Jabón líquido suave", detail: "Primero lava la herida con jabón" },
      { id: "fa-agua", name: "Agua hervida", detail: "En botella cerrada y con nombre" },
      { id: "fa-antiseptico", name: "Líquido para limpiar heridas (benzal o yodo)", detail: "En frasco de plástico con nombre" },
      { id: "fa-vaselina", name: "Vaselina", detail: "Para la piel raspada o irritada" },
    ],
  },
  {
    title: "Herramientas y protección",
    items: [
      { id: "fa-tijeras", name: "Tijeras de punta redonda y pinzas", detail: "Limpias y sin óxido" },
      { id: "fa-termometro", name: "Termómetro", detail: "Para medir la fiebre. Revisa su pila" },
      { id: "fa-guantes", name: "Guantes desechables y cubrebocas", detail: "Para cuidarte a ti y a quien ayudas" },
      { id: "fa-extra", name: "Linterna, lápiz y papel", detail: "Para ver de noche y anotar lo que pasó" },
    ],
  },
];

// Cómo guardar el botiquín y las medicinas (STCONAPRA)
export const firstAidRules = [
  { icon: "medical", title: "Las medicinas van aparte", text: "Con su receta y el nombre de quien la toma. Si alguien usa inhalador o insulina, ten uno en casa y otro en la mochila" },
  { icon: "drop", title: "Fresco, seco y cerrado", text: "Lejos del sol y del agua, en una bolsa que cierre" },
  { icon: "eye", title: "A la mano, lejos de los más chicos", text: "Sin candado y con una lista de lo que tiene" },
  { icon: "clock", title: "Revísalo cada seis meses", text: "Cambia lo que ya usaste. Lo viejo se lleva a una farmacia, no a la basura" },
];

// Salud durante y después de la lluvia. Agua: material del Estado de México
// (CEVECE); otras dependencias recomiendan hervir hasta 5 minutos.
export const rainHealth = [
  {
    icon: "drop",
    clip: "agua",
    title: "Agua segura para tomar",
    text: "Si sale sucia, un adulto la hierve 3 minutos. O le pone 2 gotas de cloro por litro y espera media hora",
  },
  {
    icon: "wave",
    clip: "calle",
    title: "No te metas al agua de la calle",
    text: "Está sucia y te puede enfermar. Si te mojaste, lávate con jabón",
  },
  {
    icon: "medical",
    clip: "fiebre",
    title: "Fiebre días después",
    text: "Si tocaste agua de inundación y te da fiebre, ve al médico y cuéntale",
  },
  {
    icon: "heart",
    clip: "diarrea",
    title: "Diarrea",
    text: "Toma suero. Un sobre de Vida Suero Oral va en un litro de agua hervida",
  },
  {
    icon: "blanket",
    clip: "frio",
    title: "Mojado y con frío",
    text: "Quítate la ropa mojada, tápate con una cobija y toma algo tibio",
  },
  {
    icon: "hygiene",
    clip: "herida",
    title: "Una cortada o un raspón",
    text: "Lávala con jabón y tápala con gasa. Si sangra, aprieta sin soltar",
  },
];
// Cuándo no esperar: llamar al 911
export const healthAlarms = [
  "Le cuesta respirar o tiene labios morados",
  "Sangra y no para aunque presiones",
  "Se desmayó, tiembla sin control o no sabe dónde está",
  "Un bebé con diarrea que casi no orina",
  "Casi se ahoga o tragó agua de arroyo",
];

// Qué significa El Niño para Tijuana (comunicado municipal del 2 nov 2026)
export const ninoOutlook = {
  cards: [
    {
      title: "Prepárate desde ahora",
      text: "Las lluvias pueden llegar pronto",
    },
    {
      title: "Inundaciones y deslaves",
      text: "Aléjate de arroyos, calles bajas y cerros",
    },
    {
      title: "No toda lluvia es El Niño",
      text: "Una tormenta sola no es El Niño. Sigue los avisos oficiales",
    },
  ],
  note: "Las lluvias podrían empezar entre finales de noviembre y diciembre de 2026",
  noteHref:
    "https://apps.tijuana.gob.mx/webpanel/comunicado/comunicadoCompleto.aspx?iIdComunicado=+37235",
  links: [
    { label: "Qué es El Niño (NOAA)", href: "https://www.noaa.gov/understanding-el-nino" },
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
      "Vean qué partes se inundan y revisen la luz, el gas y el agua",
      "Elijan zonas seguras y pidan ayuda para lo que haya que arreglar",
    ],
    tip: "Revisen cada cuarto juntos. No toquen cables ni tubos rotos",
  },
  {
    title: "Rutas y punto de encuentro",
    text: "Decidan por dónde salir y dónde verse si no pueden quedarse en casa",
    tasks: [
      "Dibujen un mapa de la casa con las salidas y los peligros",
      "Elijan rutas fáciles y un punto de encuentro",
      "Compartan el mapa de la casa y los teléfonos de emergencia",
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
    tip: "Cada emergencia es diferente. Hagan caso a las autoridades",
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
      { id: "item-1", icon: "food", name: "Comida que no se echa a perder", detail: "Lista para comer y que le guste a tu familia" },
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
      { id: "item-9", icon: "blanket", name: "Manta y ropa de abrigo", detail: "Según el clima, con un cambio de ropa" },
      { id: "item-10", icon: "hygiene", name: "Artículos de higiene", detail: "Lo que necesite cada quien" },
      { id: "item-11", icon: "paw", name: "Kit para tus mascotas", detail: "Comida, agua, correa y su cartilla" },
    ],
  },
];

// Qué puede pasar en Tijuana
export const risks = [
  { icon: "cloud", clip: "lluvia", tone: "blue", title: "Lluvias fuertes", text: "La tierra se llena de agua (se satura) y cuesta ver y caminar" },
  { icon: "risk", clip: "deslave", tone: "gold", title: "Deslaves", text: "La tierra de los cerros (laderas y cañadas) se puede caer" },
  { icon: "wave", clip: "inundacion", tone: "green", title: "Inundaciones", text: "Los arroyos y los pasos bajo puentes se llenan rápido. Nunca los cruces" },
];

// Consejos: qué hacer en cada momento
export const tips = [
  { id: "antes", icon: "home", tone: "gold", moment: "Antes de la lluvia", title: "Prepara tu casa", text: "Revisa coladeras, techos y cables sueltos. Guarda tus papeles en una bolsa contra agua y decide con tu familia cómo hablarse" },
  { id: "durante", icon: "wave", tone: "blue", moment: "Durante la tormenta", title: "Aléjate de las corrientes", text: "Quédate en un lugar seguro. No cruces arroyos ni calles inundadas, aunque el agua se vea baja" },
  { id: "manejo", icon: "car", tone: "blue", moment: "Si vas manejando", title: "No cruces una calle inundada", text: "Ve más despacio y busca otro camino. Si el agua tapa la calle, para en un lugar seguro" },
  { id: "despues", icon: "shield", tone: "green", moment: "Después de la lluvia", title: "Revisa tu alrededor", text: "No te acerques a lo que se dañó ni toques cables caídos. Avisa de los peligros y sigue los avisos" },
];

// Redes sociales. Las que no tienen enlace todavía se muestran como "próximamente"
// en el pie y no aparecen en el encabezado ni en el inicio.
export const socials = [
  { label: "Instagram", handle: "@cuenca_cimarron", href: "https://www.instagram.com/cuenca_cimarron/", icon: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>' },
  { label: "YouTube", handle: "@CuencaCimarron", href: "https://www.youtube.com/@CuencaCimarron", icon: '<path d="M21 8.2a2.6 2.6 0 0 0-1.8-1.8C17.6 6 12 6 12 6s-5.6 0-7.2.4A2.6 2.6 0 0 0 3 8.2 27 27 0 0 0 2.6 12 27 27 0 0 0 3 15.8a2.6 2.6 0 0 0 1.8 1.8C6.4 18 12 18 12 18s5.6 0 7.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.8 27 27 0 0 0-.4-3.8Z"/><path d="m10 15 5-3-5-3v6Z"/>' },
  { label: "TikTok", handle: "@cuenca.cimarron", href: "https://www.tiktok.com/@cuenca.cimarron", icon: '<path d="M15 4c.3 2.2 1.6 3.5 4 3.7v3.1c-1.4 0-2.7-.4-4-1.1v5.7a5.6 5.6 0 1 1-4.8-5.5v3.1a2.5 2.5 0 1 0 1.7 2.4V4H15Z"/>' },
  { label: "Facebook", href: "https://www.facebook.com/share/1HC9hsv2gi/", icon: '<path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.4v8h3.1Z"/>' },
];

// Videos del proyecto para la sección "Síguenos" del inicio.
// Para agregar uno: { platform: "youtube", id: "ID_DEL_VIDEO", title: "Título" }
// o { platform: "tiktok", id: "NUMERO_DEL_VIDEO", title: "Título" }.
// Mientras la lista esté vacía, la sección solo invita a seguir las redes.
export const videos = [];
