/**
 * Base de datos de insumos del Reto Mochila de Emergencia 60s.
 * Clasificación: essential | distractor | conditional
 */
const MAX_BACKPACK_KG = 12;
const ROUND_SECONDS = 60;

const ITEMS_DATABASE = [
  // --- OBJETOS ESENCIALES UNIVERSALES (Kit 72 Horas) ---
  {
    id: "agua",
    name: "Agua embotellada (3L/persona/día)",
    category: "essential",
    weight: 3.0,
    icon: "water-bottle.svg",
    explanation:
      "El agua potable es la prioridad #1. Se requieren al menos 3 litros por persona al día para mantenerse hidratado."
  },
  {
    id: "comida_latas",
    name: "Alimentos no perecederos y abrelatas",
    category: "essential",
    weight: 2.0,
    icon: "canned-food.svg",
    explanation:
      "Comida en lata y abrelatas manual garantizan alimento sin necesidad de cocinar o refrigerar."
  },
  {
    id: "botiquin",
    name: "Botiquín de primeros auxilios",
    category: "essential",
    weight: 1.0,
    icon: "first-aid.svg",
    explanation:
      "Indispensable para curar heridas menores, cortes o raspones durante una evacuación."
  },
  {
    id: "documentos_ziploc",
    name: "Documentos importantes en bolsa hermética",
    category: "essential",
    weight: 0.5,
    icon: "documents.svg",
    explanation:
      "Identificaciones, escrituras y actas guardadas en bolsa ziploc para evitar que se destruyan con el agua."
  },
  {
    id: "linterna_radio",
    name: "Linterna y Radio de baterías/manivela",
    category: "essential",
    weight: 1.0,
    icon: "flashlight.svg",
    explanation:
      "Permite iluminar la evacuación nocturna y escuchar avisos oficiales de Protección Civil sin red celular."
  },
  {
    id: "powerbank",
    name: "Banco de carga (Powerbank) cargado",
    category: "essential",
    weight: 0.5,
    icon: "powerbank.svg",
    explanation:
      "Mantiene el teléfono móvil con batería para llamadas de emergencia o rescate."
  },

  {
    id: "llaves_casa",
    name: "Llaves de casa y del auto",
    category: "essential",
    weight: 0.2,
    icon: "documents.svg",
    explanation: "Permiten cerrar la casa y salir sin perder tiempo buscándolas durante la evacuación."
  },
  {
    id: "mascarillas",
    name: "Mascarillas y gel antibacterial",
    category: "essential",
    weight: 0.2,
    icon: "first-aid.svg",
    explanation: "Ayudan a protegerse del polvo, humo y contaminación del agua durante el traslado."
  },
  {
    id: "silbato_emergencia",
    name: "Silbato de emergencia",
    category: "essential",
    weight: 0.1,
    icon: "flashlight.svg",
    explanation: "Puede ayudar a pedir auxilio si la visibilidad es baja o el teléfono no tiene señal."
  },

  // --- OBJETOS DISTRACTORES (Innecesarios / Sobrepeso) ---
  {
    id: "consola_videojuegos",
    name: "Consola de Videojuegos",
    category: "distractor",
    weight: 3.5,
    icon: "console.svg",
    explanation:
      "Ocupa espacio vital y requiere energía eléctrica que estará suspendida."
  },
  {
    id: "adorno_pesado",
    name: "Florero / Adorno de cerámica",
    category: "distractor",
    weight: 2.5,
    icon: "vase.svg",
    explanation:
      "No aporta valor de supervivencia y añade peso frágil innecesario."
  },
  {
    id: "cobija_gigante",
    name: "Edredón / Cobija de plumas pesada",
    category: "distractor",
    weight: 4.0,
    icon: "heavy-blanket.svg",
    explanation:
      "Al mojarse absorbe agua y se vuelve imposible de cargar. Es mejor llevar mantas térmicas ligeras."
  },

  {
    id: "calzones_miados",
    name: "Calzones miados (sucios)",
    category: "distractor",
    weight: 0.4,
    icon: "dirty-underwear.svg",
    explanation: "No son un artículo de emergencia y solo ocupan espacio. Déjalos para después de evacuar."
  },
  {
    id: "shampoo_gigante",
    name: "Botella gigante de shampoo",
    category: "distractor",
    weight: 1.2,
    icon: "water-bottle.svg",
    explanation: "La higiene importa, pero una botella grande no es prioridad durante una evacuación de 60 segundos."
  },
  {
    id: "herramienta_pesada",
    name: "Taladro eléctrico pesado",
    category: "distractor",
    weight: 3.0,
    icon: "console.svg",
    explanation: "Es útil en otro momento, pero pesa demasiado y necesita electricidad."
  },
  {
    id: "decoracion_atletica",
    name: "Trofeo de la sala",
    category: "distractor",
    weight: 1.8,
    icon: "vase.svg",
    explanation: "Tiene valor sentimental, pero no ayuda a sobrevivir ni a evacuar más rápido."
  },
  {
    id: "vestido_novia",
    name: "Vestido",
    category: "distractor",
    weight: 4.5,
    icon: "wedding.svg",
    explanation: "Es importante sentimentalmente, pero ocupa mucho espacio y no es prioridad durante una evacuación."
  },

  // --- OBJETOS CONDICIONALES / NECESIDADES ESPECÍFICAS (Inclusivos) ---
  {
    id: "audifonos_cancelacion",
    name: "Audífonos de cancelación de ruido",
    category: "conditional",
    weight: 0.3,
    icon: "headphones.svg",
    explanation:
      "Para personas dentro del espectro autista (TEA) o con hipersensibilidad auditiva, el estruendo del viento y la lluvia sobre techos de lámina genera desregulaciones severas. Mantener la calma es vital para evacuar con seguridad."
  },
  {
    id: "inhalador_meds",
    name: "Inhalador / Medicamentos recetados",
    category: "conditional",
    weight: 0.2,
    icon: "inhaler.svg",
    explanation:
      "Para familiares con asma, diabetes o hipertensión, interrumpir el tratamiento en un albergue puede ser mortal."
  },
  {
    id: "lentes_graduacion",
    name: "Lentes de graduación de repuesto",
    category: "conditional",
    weight: 0.1,
    icon: "glasses.svg",
    explanation:
      "Sufrir una evacuación a oscuras o en medio del barro sin visión clara incrementa drásticamente el riesgo de accidentes."
  },
  {
    id: "formula_bebe",
    name: "Fórmula infantil y biberón",
    category: "conditional",
    weight: 1.0,
    icon: "baby-bottle.svg",
    explanation:
      "Vital si en el hogar hay lactantes o niños pequeños que dependen de alimentación específica."
  },
  {
    id: "comida_mascota",
    name: "Alimento y correa de mascota",
    category: "conditional",
    weight: 1.5,
    icon: "pet-food.svg",
    explanation:
      "Las mascotas son parte de la familia. Evacuar con correa y alimento previene pérdidas o atropellamientos."
  }
];

/** Kit prearmado de la Ronda 2: arrastrar una sola bandeja suma los 6 esenciales. */
const KIT_72H = {
  id: "kit_72h",
  name: "Kit 72 horas (completo)",
  itemIds: ITEMS_DATABASE.filter((item) => item.category === "essential").map(
    (item) => item.id
  ),
  weight: ITEMS_DATABASE.filter((item) => item.category === "essential").reduce(
    (sum, item) => sum + item.weight,
    0
  )
};

const ROOMS = [
  { id: "cocina", name: "Cocina", hint: "Alacena, refrigerador y cajones" },
  { id: "sala", name: "Sala", hint: "Repisas, sofá y mueble de TV" },
  { id: "recamara", name: "Recámara", hint: "Buró, closet y escritorio" }
];

ROOMS.push(
  { id: "bano", name: "Baño", hint: "Gabinete, lavabo y canasta de ropa" },
  { id: "garage", name: "Garaje", hint: "Estantes, caja de herramientas y auto" },
  { id: "atico", name: "Ático", hint: "Cajas, baúl y rincones olvidados" }
);

const FURNITURE = [
  {
    id: "refrigerador",
    room: "cocina",
    name: "Refrigerador",
    label: "Abrir refrigerador",
    itemIds: ["agua", "comida_mascota"]
  },
  {
    id: "alacena",
    room: "cocina",
    name: "Alacena",
    label: "Abrir alacena",
    itemIds: ["comida_latas", "formula_bebe"]
  },
  {
    id: "cajon_cocina",
    room: "cocina",
    name: "Cajón de cocina",
    label: "Abrir cajón",
    itemIds: ["botiquin"]
  },
  {
    id: "mueble_tv",
    room: "sala",
    name: "Mueble de TV",
    label: "Revisar mueble",
    itemIds: ["consola_videojuegos"]
  },
  {
    id: "repisa",
    room: "sala",
    name: "Repisa",
    label: "Revisar repisa",
    itemIds: ["adorno_pesado", "documentos_ziploc"]
  },
  {
    id: "sofa",
    room: "sala",
    name: "Sofá",
    label: "Revisar sofá",
    itemIds: ["cobija_gigante"]
  },
  {
    id: "buro",
    room: "recamara",
    name: "Buró",
    label: "Abrir buró",
    itemIds: ["linterna_radio", "inhalador_meds"]
  },
  {
    id: "closet",
    room: "recamara",
    name: "Closet",
    label: "Abrir closet",
    itemIds: ["audifonos_cancelacion", "powerbank"]
  },
  {
    id: "escritorio",
    room: "recamara",
    name: "Escritorio",
    label: "Revisar escritorio",
    itemIds: ["lentes_graduacion"]
  },
  {
    id: "gabinete_bano",
    room: "bano",
    name: "Gabinete del baño",
    label: "Abrir gabinete",
    itemIds: ["mascarillas", "shampoo_gigante"]
  },
  {
    id: "canasta_ropa",
    room: "bano",
    name: "Canasta de ropa",
    label: "Revisar canasta",
    itemIds: ["calzones_miados"]
  },
  {
    id: "estante_garage",
    room: "garage",
    name: "Estante del garaje",
    label: "Revisar estante",
    itemIds: ["silbato_emergencia", "decoracion_atletica"]
  },
  {
    id: "caja_herramientas",
    room: "garage",
    name: "Caja de herramientas",
    label: "Abrir caja",
    itemIds: ["herramienta_pesada", "llaves_casa"]
  },
  {
    id: "cajas_atico",
    room: "atico",
    name: "Cajas del ático",
    label: "Abrir cajas",
    itemIds: ["decoracion_atletica", "shampoo_gigante"]
  },
  {
    id: "baul_atico",
    room: "atico",
    name: "Baúl viejo",
    label: "Abrir baúl",
    itemIds: ["vestido_novia", "herramienta_pesada"]
  }
];

function getItemById(id) {
  return ITEMS_DATABASE.find((item) => item.id === id) || null;
}

function getEssentials() {
  return ITEMS_DATABASE.filter((item) => item.category === "essential");
}

function getConditionals() {
  return ITEMS_DATABASE.filter((item) => item.category === "conditional");
}

function getDistractors() {
  return ITEMS_DATABASE.filter((item) => item.category === "distractor");
}

function assetPath(fileName) {
  return `assets/${fileName}`;
}
