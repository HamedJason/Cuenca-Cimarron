'use strict';

// ============================================================
// fireData.js — Datos del juego "Misión Extintor"
// Contiene extintores, escenarios y clases de fuego.
// ============================================================

// ------------------------------------------------------------
// CLASES DE FUEGO
// ------------------------------------------------------------
const FIRE_CLASSES = {
  A: {
    name: 'Fuego de materiales sólidos (madera, papel, tela, plástico)',
    icon: '🪵',
  },
  B: {
    name: 'Fuego de líquidos inflamables (gasolina, aceite, solventes)',
    icon: '🛢️',
  },
  C: {
    name: 'Fuego en equipos eléctricos energizados',
    icon: '⚡',
  },
  K: {
    name: 'Fuego de aceites y grasas de cocina (frituras)',
    icon: '🍳',
  },
};

// ------------------------------------------------------------
// EXTINTORES
// ------------------------------------------------------------
const EXTINGUISHERS = [
  {
    id: 'agua',
    name: 'Extintor de Agua Presurizada',
    label: 'Clase A',
    color: '#2563eb',
    compatibleClasses: ['A'],
    capacity: 100,
    dangerReactions: {
      B: '¡PELIGRO! El agua es más densa que los líquidos inflamables; esparce el combustible y expande el fuego.',
      C: '¡RIESGO DE ELECTROCUCIÓN! El agua conduce la electricidad; nunca la uses en equipos conectados.',
      K: '¡EXPLOSIÓN POR EBULLICIÓN (BOILOVER)! Al tocar aceite hirviendo, el agua se evapora al instante y proyecta llamas hacia ti.',
    },
    description:
      'Enfría materiales sólidos comunes como madera, papel, cartón y telas.',
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120">
  <!-- Válvula superior -->
  <rect x="22" y="6" width="16" height="6" rx="3" fill="#94a3b8"/>
  <rect x="27" y="2" width="6" height="6" rx="2" fill="#64748b"/>
  <!-- Manguera -->
  <path d="M38 10 Q52 10 52 24 L52 30" stroke="#374151" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="52" cy="32" r="3" fill="#374151"/>
  <!-- Cuerpo del cilindro -->
  <rect x="14" y="12" width="32" height="88" rx="10" fill="#2563eb"/>
  <!-- Banda de etiqueta -->
  <rect x="14" y="50" width="32" height="28" rx="4" fill="#ffffff" opacity="0.9"/>
  <!-- Texto de etiqueta -->
  <text x="30" y="62" text-anchor="middle" font-size="5" font-weight="bold" fill="#1e3a8a">AGUA</text>
  <text x="30" y="72" text-anchor="middle" font-size="4" fill="#1e40af">Clase A</text>
  <!-- Brillo del cilindro -->
  <rect x="18" y="14" width="6" height="82" rx="3" fill="#ffffff" opacity="0.15"/>
  <!-- Base -->
  <rect x="16" y="98" width="28" height="6" rx="3" fill="#1d4ed8"/>
</svg>`,
  },
  {
    id: 'pqs',
    name: 'Extintor de Polvo Químico Seco (PQS)',
    label: 'Clase A, B, C',
    color: '#dc2626',
    compatibleClasses: ['A', 'B', 'C'],
    capacity: 100,
    dangerReactions: {
      K: 'Aunque sofoca momentáneamente, no enfría el aceite a alta temperatura y puede reactivarse; además contamina toda la cocina.',
    },
    description:
      'El más común y versátil. Interrumpe la reacción química del fuego en sólidos, líquidos y equipos eléctricos.',
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120">
  <!-- Válvula superior -->
  <rect x="22" y="6" width="16" height="6" rx="3" fill="#94a3b8"/>
  <rect x="27" y="2" width="6" height="6" rx="2" fill="#64748b"/>
  <!-- Manguera -->
  <path d="M38 10 Q52 10 52 24 L52 30" stroke="#374151" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="52" cy="32" r="3" fill="#374151"/>
  <!-- Cuerpo del cilindro -->
  <rect x="14" y="12" width="32" height="88" rx="10" fill="#dc2626"/>
  <!-- Banda de etiqueta -->
  <rect x="14" y="50" width="32" height="28" rx="4" fill="#ffffff" opacity="0.9"/>
  <!-- Texto de etiqueta -->
  <text x="30" y="61" text-anchor="middle" font-size="5" font-weight="bold" fill="#7f1d1d">PQS</text>
  <text x="30" y="70" text-anchor="middle" font-size="3.5" fill="#991b1b">Clase A,B,C</text>
  <!-- Brillo del cilindro -->
  <rect x="18" y="14" width="6" height="82" rx="3" fill="#ffffff" opacity="0.15"/>
  <!-- Base -->
  <rect x="16" y="98" width="28" height="6" rx="3" fill="#b91c1c"/>
</svg>`,
  },
  {
    id: 'co2',
    name: 'Extintor de Dióxido de Carbono (CO₂)',
    label: 'Clase B, C',
    color: '#1f2937',
    compatibleClasses: ['B', 'C'],
    capacity: 100,
    dangerReactions: {
      A: 'No es efectivo en sólidos como papel o madera: desplaza el oxígeno un segundo, pero las brasas vuelven a encenderse.',
      K: 'La presión del gas puede salpicar el aceite hirviendo fuera del sartén y no enfría el recipiente.',
    },
    description:
      'Desplaza el oxígeno sin dejar residuos. Ideal para computadoras, servidores, tableros eléctricos y líquidos inflamables.',
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120">
  <!-- Válvula superior -->
  <rect x="22" y="6" width="16" height="6" rx="3" fill="#9ca3af"/>
  <rect x="27" y="2" width="6" height="6" rx="2" fill="#6b7280"/>
  <!-- Manguera tipo trompeta (bocina de CO2) -->
  <path d="M38 10 Q54 10 54 24 L54 28" stroke="#4b5563" stroke-width="3" fill="none" stroke-linecap="round"/>
  <ellipse cx="54" cy="32" rx="4" ry="5" fill="#374151"/>
  <!-- Cuerpo del cilindro (más estrecho, CO2 es de alta presión) -->
  <rect x="16" y="12" width="28" height="88" rx="10" fill="#1f2937"/>
  <!-- Banda de etiqueta -->
  <rect x="16" y="50" width="28" height="28" rx="4" fill="#f3f4f6" opacity="0.9"/>
  <!-- Texto de etiqueta -->
  <text x="30" y="61" text-anchor="middle" font-size="5" font-weight="bold" fill="#111827">CO₂</text>
  <text x="30" y="71" text-anchor="middle" font-size="3.5" fill="#374151">Clase B,C</text>
  <!-- Brillo del cilindro -->
  <rect x="20" y="14" width="5" height="82" rx="2.5" fill="#ffffff" opacity="0.12"/>
  <!-- Base -->
  <rect x="18" y="98" width="24" height="6" rx="3" fill="#111827"/>
</svg>`,
  },
  {
    id: 'tipo_k',
    name: 'Extintor Tipo K (Acetato de Potasio)',
    label: 'Clase K',
    color: '#9ca3af',
    compatibleClasses: ['K'],
    capacity: 100,
    dangerReactions: {
      B: 'Diseñado específicamente para grasas vegetales/animales, no para solventes o gasolina.',
      C: 'Contiene solución acuosa: riesgo eléctrico si se descarga sobre cables energizados.',
    },
    description:
      'Crea una capa jabonosa (saponificación) que sella y enfría aceites y grasas de cocina.',
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120">
  <!-- Válvula superior -->
  <rect x="22" y="6" width="16" height="6" rx="3" fill="#d1d5db"/>
  <rect x="27" y="2" width="6" height="6" rx="2" fill="#9ca3af"/>
  <!-- Manguera -->
  <path d="M38 10 Q52 10 52 24 L52 30" stroke="#6b7280" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="52" cy="32" r="3" fill="#6b7280"/>
  <!-- Cuerpo del cilindro -->
  <rect x="14" y="12" width="32" height="88" rx="10" fill="#9ca3af"/>
  <!-- Banda de etiqueta -->
  <rect x="14" y="50" width="32" height="28" rx="4" fill="#ffffff" opacity="0.9"/>
  <!-- Texto de etiqueta -->
  <text x="30" y="61" text-anchor="middle" font-size="5" font-weight="bold" fill="#374151">TIPO K</text>
  <text x="30" y="71" text-anchor="middle" font-size="4" fill="#4b5563">Clase K</text>
  <!-- Brillo del cilindro -->
  <rect x="18" y="14" width="6" height="82" rx="3" fill="#ffffff" opacity="0.18"/>
  <!-- Base -->
  <rect x="16" y="98" width="28" height="6" rx="3" fill="#6b7280"/>
</svg>`,
  },
];

// ------------------------------------------------------------
// ESCENARIOS
// ------------------------------------------------------------
const SCENARIOS = [
  {
    id: 'escenario_oficina',
    title: 'Cortocircuito en Centro de Cómputo',
    context:
      'Una regleta sobrecargada junto a una computadora de escritorio comienza a sacar chispas y llamas.',
    fireClass: 'C',
    bestExtinguisher: 'co2',
    acceptableExtinguishers: ['co2', 'pqs'],
    lesson:
      'En incendios eléctricos (Clase C), el CO2 es ideal porque apaga el fuego sin dañar los circuitos con polvo corrosivo. El PQS también es seguro, pero el agua es mortal.',
    visualConfig: {
      bgColor: '#1a1a2e',
      elements: [
        { type: 'rect', x: 200, y: 280, w: 240, h: 160, color: '#374151', label: 'Escritorio' },
        { type: 'rect', x: 260, y: 180, w: 180, h: 120, color: '#6b7280', label: 'Monitor' },
        { type: 'rect', x: 220, y: 390, w: 120, h: 20, color: '#78350f', label: 'Regleta' },
        { type: 'rect', x: 420, y: 390, w: 60, h: 20, color: '#78350f', label: '' },
      ],
      firePoints: [
        { x: 320, y: 380, r: 60 },
      ],
    },
  },
  {
    id: 'escenario_cocina',
    title: 'Sartén con Aceite en Llamas',
    context:
      'Se dejó aceite calentando en la estufa y el vapor se incendió repentinamente.',
    fireClass: 'K',
    bestExtinguisher: 'tipo_k',
    acceptableExtinguishers: ['tipo_k'],
    lesson:
      'Los incendios de grasas y aceites de cocina (Clase K) alcanzan temperaturas extremas. Solo un extintor Tipo K los enfría y sella sin provocar salpicaduras.',
    visualConfig: {
      bgColor: '#2d1b00',
      elements: [
        { type: 'rect', x: 150, y: 300, w: 300, h: 160, color: '#1c1917', label: 'Estufa' },
        { type: 'rect', x: 160, y: 240, w: 280, h: 50, color: '#292524', label: 'Campana' },
        { type: 'ellipse', x: 400, y: 320, w: 100, h: 30, color: '#9ca3af', label: 'Sartén' },
        { type: 'rect', x: 160, y: 290, w: 60, h: 20, color: '#57534e', label: 'Perilla' },
      ],
      firePoints: [
        { x: 400, y: 300, r: 70 },
      ],
    },
  },
  {
    id: 'escenario_bodega',
    title: 'Cajas de Cartón y Papel en Almacén',
    context:
      'Una colilla mal apagada encendió un cesto de basura y cajas de archivo.',
    fireClass: 'A',
    bestExtinguisher: 'agua',
    acceptableExtinguishers: ['agua', 'pqs'],
    lesson:
      'Los materiales sólidos ordinarios (Clase A) requieren enfriamiento profundo para apagar las brasas; tanto el Agua como el PQS funcionan eficazmente.',
    visualConfig: {
      bgColor: '#3a3a3a',
      elements: [
        { type: 'rect', x: 160, y: 300, w: 100, h: 100, color: '#d97706', label: 'Caja 1' },
        { type: 'rect', x: 270, y: 320, w: 90, h: 80, color: '#b45309', label: 'Caja 2' },
        { type: 'rect', x: 370, y: 290, w: 110, h: 110, color: '#d97706', label: 'Caja 3' },
        { type: 'rect', x: 200, y: 390, w: 60, h: 80, color: '#44403c', label: 'Basurero' },
        { type: 'rect', x: 160, y: 400, w: 350, h: 20, color: '#57534e', label: 'Piso' },
      ],
      firePoints: [
        { x: 300, y: 350, r: 55 },
      ],
    },
  },
  {
    id: 'escenario_cochera',
    title: 'Derrame de Solvente en Taller',
    context:
      'Se volcó un envase de thinner cerca de una herramienta caliente, encendiendo el líquido en el piso.',
    fireClass: 'B',
    bestExtinguisher: 'pqs',
    acceptableExtinguishers: ['pqs', 'co2'],
    lesson:
      'Los líquidos inflamables (Clase B) requieren sofocación con PQS o CO2 para cortar el suministro de oxígeno.',
    visualConfig: {
      bgColor: '#2a2a2a',
      elements: [
        { type: 'rect', x: 100, y: 200, w: 400, h: 220, color: '#374151', label: 'Vehículo' },
        { type: 'rect', x: 420, y: 320, w: 40, h: 60, color: '#16a34a', label: 'Bote solvente' },
        { type: 'ellipse', x: 370, y: 410, w: 130, h: 40, color: '#fbbf24', label: 'Charco solvente' },
        { type: 'rect', x: 100, y: 420, w: 450, h: 20, color: '#1f2937', label: 'Piso cochera' },
      ],
      firePoints: [
        { x: 350, y: 380, r: 65 },
      ],
    },
  },
];
