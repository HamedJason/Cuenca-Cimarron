// Para todas las familias (/migrantes): lo esencial en español y en creole haitiano
// (kreyòl ayisyen). Cada texto lleva su versión "es" y "ht".
//
// Derechos: Ley de Migración, artículo 8 (educación y atención médica urgente sin
// importar la situación migratoria). Escuelas: Protocolo de acceso a la educación
// básica para niñas, niños y adolescentes migrantes en BC (Zeta, julio de 2022).
// Alumnos haitianos en Tijuana: Zeta, enero de 2024 (164 en educación básica).
//
// El creole lo escribió el equipo con frases cortas. Antes de imprimirlo para las
// escuelas conviene que lo revise una persona haitiana.

export const languages = [
  { id: "es", label: "Español" },
  { id: "ht", label: "Kreyòl ayisyen" },
];

export const ui = {
  kicker: { es: "Para todas las familias", ht: "Pou tout fanmi" },
  title: {
    es: "Esta información es para ti, vengas de donde vengas",
    ht: "Enfòmasyon sa a se pou ou, kèlkeswa kote ou soti",
  },
  lead: {
    es: "Con El Niño llueve fuerte en Tijuana. Aquí está lo más importante para cuidar a tu familia",
    ht: "Ak El Niño, lapli tonbe fò nan Tijuana. Men sa ki pi enpòtan pou pwoteje fanmi ou",
  },
  chooseLanguage: { es: "Idioma", ht: "Lang" },
  rightsTitle: { es: "Tus derechos en México", ht: "Dwa ou nan Meksik" },
  rightsLead: {
    es: "Valen para todas las personas, tengan papeles o no",
    ht: "Yo valab pou tout moun, kit ou gen papye kit ou pa genyen",
  },
  callTitle: { es: "Cómo pedir ayuda al 911", ht: "Kijan pou mande èd nan 911" },
  phrasesTitle: { es: "Frases para pedir ayuda", ht: "Fraz pou mande èd" },
  phrasesLead: {
    es: "Dilas en español. Toca «Escuchar» para oír cómo se pronuncian",
    ht: "Di yo an panyòl. Peze «Koute» pou tande kijan pou di yo",
  },
  listen: { es: "Escuchar", ht: "Koute" },
  rainTitle: { es: "Antes, durante y después de la lluvia", ht: "Anvan, pandan ak apre lapli a" },
  kitTitle: { es: "Tu botiquín", ht: "Twous premye swen ou" },
  kitLead: {
    es: "Guárdalo en una caja o bolsa que cierre, donde todos lo encuentren",
    ht: "Mete l nan yon bwat oswa yon sachè ki fèmen, kote tout moun ka jwenn li",
  },
  numbersTitle: { es: "Números importantes", ht: "Nimewo enpòtan" },
  cardTitle: { es: "Tarjeta para llenar y llevar", ht: "Kat pou ranpli epi kenbe" },
  cardLead: {
    es: "Imprímela, llénala con tu familia y guárdala en la mochila de la escuela",
    ht: "Enprime l, ranpli l ak fanmi ou epi mete l nan sakado lekòl la",
  },
  print: { es: "Imprimir tarjeta", ht: "Enprime kat la" },
  cardHint: {
    es: "Escribe aquí y sale impresa ya llena, o imprímela en blanco",
    ht: "Ekri la a epi l ap soti ranpli, oswa enprime l vid",
  },
  cardProgress: { es: "listos", ht: "ranpli" },
  cardDone: {
    es: "¡Tarjeta lista! Ya puedes imprimirla",
    ht: "Kat la pare! Ou ka enprime l kounye a",
  },
  cardPrivacy: {
    es: "Lo que escribes no se guarda ni se envía: solo sirve para imprimir",
    ht: "Sa ou ekri a pa sove, li pa voye: se sèlman pou enprime",
  },
  clear: { es: "Borrar", ht: "Efase" },
  shelters: { es: "Ver refugios temporales", ht: "Wè abri yo" },
  more: { es: "Más información en español", ht: "Plis enfòmasyon an panyòl" },
};

export const rights = [
  {
    icon: "phone",
    es: { title: "El 911 es para todos", text: "Es gratis y no te piden papeles para mandarte ayuda" },
    ht: { title: "911 se pou tout moun", text: "Li gratis epi yo pa mande w papye pou voye èd ba ou" },
  },
  {
    icon: "medical",
    es: {
      title: "Atención médica urgente",
      text: "Si alguien está herido o muy enfermo, el hospital debe atenderlo gratis, aunque no tenga papeles",
    },
    ht: {
      title: "Swen ijan",
      text: "Si yon moun blese oswa malad grav, lopital la dwe ba li swen gratis, menm si li pa gen papye",
    },
  },
  {
    icon: "book",
    es: {
      title: "Escuela para tus hijos",
      text: "Pueden inscribirse en cualquier momento del año, aunque no tengan papeles ni boletas",
    },
    ht: {
      title: "Lekòl pou pitit ou yo",
      text: "Yo ka enskri nenpòt ki lè nan ane a, menm si yo pa gen papye ni kanè",
    },
  },
  {
    icon: "home",
    es: {
      title: "Refugios abiertos a todos",
      text: "Si tu casa está en peligro, los refugios temporales reciben a cualquier familia",
    },
    ht: {
      title: "Abri yo louvri pou tout moun",
      text: "Si kay ou an danje, abri tanporè yo resevwa nenpòt fanmi",
    },
  },
];

export const callSteps = [
  {
    es: "Marca 911. Es gratis, aunque tu teléfono no tenga saldo",
    ht: "Rele 911. Li gratis, menm si telefòn ou pa gen kòb ladan l",
  },
  {
    es: "Di qué pasa: «Hay una persona herida», «El agua está subiendo»",
    ht: "Di sa k ap pase: «Gen yon moun ki blese», «Dlo a ap monte»",
  },
  {
    es: "Di dónde estás: colonia, calle y algo que se vea, como una tienda o una escuela",
    ht: "Di kote ou ye: katye a, lari a ak yon bagay moun ka wè, tankou yon boutik oswa yon lekòl",
  },
  {
    es: "Si no entiendes, di «No hablo bien español» y no cuelgues",
    ht: "Si ou pa konprann, di «No hablo bien español» epi pa rakwoche",
  },
];

// La frase en español es la que se dice; "ht" es lo que significa
export const phrases = [
  { es: "¡Ayuda! Es una emergencia", ht: "Èd! Se yon ijans" },
  { es: "Hay una persona herida", ht: "Gen yon moun ki blese" },
  { es: "El agua está subiendo", ht: "Dlo a ap monte" },
  { es: "Hay fuego", ht: "Gen dife" },
  { es: "Mi dirección es…", ht: "Adrès mwen se…" },
  { es: "Estoy en la colonia…, en la calle…", ht: "Mwen nan katye…, nan lari…" },
  { es: "No hablo bien español", ht: "Mwen pa pale panyòl byen" },
  { es: "Hable despacio, por favor", ht: "Pale dousman, tanpri" },
  { es: "Hablo creole y francés", ht: "Mwen pale kreyòl ak franse" },
  { es: "¿Dónde está el refugio?", ht: "Ki kote abri a ye?" },
];

export const rainSteps = [
  {
    icon: "backpack",
    es: {
      title: "Antes",
      items: [
        "Arma una mochila con agua, comida, linterna, medicinas y tus papeles en una bolsa de plástico",
        "Averigua cuál es el refugio más cercano",
        "Que todos se aprendan la dirección de la casa",
      ],
    },
    ht: {
      title: "Anvan",
      items: [
        "Prepare yon sakado ak dlo, manje, flach, medikaman ak papye ou yo nan yon sachè plastik",
        "Chèche konnen ki abri ki pi pre lakay ou",
        "Tout moun nan fanmi an dwe konnen adrès kay la pa kè",
      ],
    },
  },
  {
    icon: "wave",
    es: {
      title: "Durante",
      items: [
        "No cruces calles ni arroyos con agua corriendo, aunque se vea poca",
        "Aléjate de cables caídos y de los cerros que se desgajan",
        "Si te dicen que salgas de tu casa, sal",
      ],
    },
    ht: {
      title: "Pandan",
      items: [
        "Pa janbe lari ni ravin kote dlo ap kouri, menm si li sanble piti",
        "Rete lwen fil kouran ki tonbe ak mòn k ap glise",
        "Si yo di w soti lakay ou, soti",
      ],
    },
  },
  {
    icon: "drop",
    es: {
      title: "Después",
      items: [
        "Toma agua hervida o con 2 gotas de cloro por litro",
        "No toques ni camines en el agua de la calle",
        "Si te da fiebre en los días siguientes, ve al médico",
      ],
    },
    ht: {
      title: "Apre",
      items: [
        "Bwè dlo bouyi oswa dlo ak 2 gout klowòks pou chak lit",
        "Pa manyen ni mache nan dlo ki nan lari a",
        "Si ou gen lafyèv kèk jou apre, al wè doktè",
      ],
    },
  },
];

export const kit = [
  { es: "Gasas y vendas", ht: "Gaz ak bandaj" },
  { es: "Curitas y tela adhesiva", ht: "Pansman ak adezif" },
  { es: "Jabón y agua limpia", ht: "Savon ak dlo pwòp" },
  { es: "Antiséptico", ht: "Antiseptik" },
  { es: "Guantes y cubrebocas", ht: "Gan ak mask" },
  { es: "Tijeras y termómetro", ht: "Sizo ak tèmomèt" },
  { es: "Linterna", ht: "Flach" },
  { es: "Tus medicinas y sus recetas", ht: "Medikaman ou yo ak preskripsyon yo" },
];

export const numbers = [
  {
    number: "911",
    icon: "phone",
    es: "Emergencias: policía, ambulancia y bomberos",
    ht: "Ijans: lapolis, anbilans ak ponpye",
  },
  {
    number: "664 683 9112",
    icon: "shield",
    es: "Protección Civil: grietas, derrumbes y refugios",
    ht: "Pwoteksyon Sivil: fant, glisman tè ak abri",
  },
  {
    number: "800 911 2000",
    icon: "heart",
    es: "Línea de la Vida: apoyo emocional gratis, las 24 horas",
    ht: "Liy Lavi: sipò emosyonèl gratis, 24 sou 24",
  },
];

export const cardFields = [
  { id: "name", icon: "people", es: "Nombre", ht: "Non" },
  { id: "address", icon: "home", es: "Dirección", ht: "Adrès" },
  { id: "area", icon: "pin", es: "Colonia", ht: "Katye" },
  { id: "family", icon: "phone", es: "Un familiar y su teléfono", ht: "Yon moun nan fanmi an ak telefòn li" },
  { id: "school", icon: "book", es: "Escuela", ht: "Lekòl" },
  { id: "shelter", icon: "shield", es: "Refugio más cercano", ht: "Abri ki pi pre a", list: true },
];

// Solo en español: para maestras, maestros y directivos
export const teacherTips = [
  "Imprime la tarjeta para cada alumno y llénenla juntos en clase. Muchos niños no saben su dirección en Tijuana",
  "Lean las frases en voz alta con el botón «Escuchar» y practíquenlas como juego de roles: un alumno llama y otro contesta como operadora",
  "Junta a cada alumno nuevo con un compañero que lo acompañe en un simulacro",
  "Manda el enlace a las familias por WhatsApp: la página abre en creole con ?lang=ht al final",
  "No todos hablan igual: algunos niños haitianos llegaron por Chile o Brasil y hablan algo de español o portugués. Muchos padres leen mejor el francés",
  "Si una familia no tiene papeles, recuérdale que el 911, la atención médica urgente y la escuela son sus derechos",
];

export const teacherFacts = [
  { value: "164", label: "alumnos de origen haitiano en educación básica de Tijuana (ciclo 2023-2024)" },
  { value: "Todo el año", label: "las escuelas de BC deben inscribir a niñas y niños migrantes, aunque no traigan papeles ni boletas" },
];

export const migrantSources = [
  { label: "Ley de Migración, artículo 8", href: "https://mley.mx/LMigra/articulo/8/" },
  {
    label: "Protocolo de acceso a la educación básica para niños migrantes en BC",
    href: "https://zetatijuana.com/2022/07/presentan-protocolo-de-acceso-a-educacion-basica-para-ninos-y-adolescentes-migrantes-en-bc/",
  },
  {
    label: "Maestra que aprendió criol para incluir a alumnos haitianos",
    href: "https://zetatijuana.com/2024/01/aprendio-criol-para-incluir-a-alumnos-haitianos-que-llegan-a-tijuana/",
  },
  { label: "ACNUR México, ayuda para personas refugiadas", href: "https://help.unhcr.org/mexico/" },
];
