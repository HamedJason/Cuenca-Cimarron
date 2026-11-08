<script setup>
import { ref } from "vue";
import Icon from "../components/Icon.vue";
import MascotGuide from "../components/MascotGuide.vue";
import { icons, iconSvg } from "../icons";

const brandColors = [
  { name: "Verde UABC", hex: "#00723F", use: "Botones, menú y bloques de énfasis", dark: true },
  { name: "Ocre UABC", hex: "#DD971A", use: "Avisos, números de paso y detalles", dark: false },
];
const supportColors = [
  { name: "Verde profundo", hex: "#003D24", use: "Títulos y texto sobre ocre", dark: true },
  { name: "Ocre texto", hex: "#8A5A00", use: "Texto chico en tono ocre", dark: true },
  { name: "Verde claro", hex: "#E6F4EC", use: "Fondos de tarjetas", dark: false },
  { name: "Ocre claro", hex: "#FFF1D6", use: "Fondos de avisos", dark: false },
];
const cardColors = [
  { name: "Protección Civil", bg: "#EAF2FF", ink: "#0B4FA8" },
  { name: "Bomberos", bg: "#FFF1E6", ink: "#A83200" },
  { name: "Denuncia anónima", bg: "#F2EDFF", ink: "#5B2CA8" },
  { name: "Ambulancia", bg: "#FFEBEE", ink: "#B3121F" },
];
const writing = [
  ["Primero lo que sirve", "Teléfonos, refugios y mapas antes que la explicación"],
  ["Frases cortas", "Si cabe en una línea, va en una línea"],
  ["Sin punto final", "En títulos, botones y textos de una oración"],
  ["Sin eslóganes", "Nada de frases que suenan bonito y no dicen nada"],
];
const tokens = `--uabc-green: #00723f;
--uabc-gold: #dd971a;
--green-deep: #003d24;
--gold-text: #8a5a00;
--green-tint: #e6f4ec;
--gold-tint: #fff1d6;
--radius-card: 20px;
--radius-block: 24px;
--radius-button: 14px;`;

const toast = ref("");
let toastTimer;
async function copy(value) {
  try {
    await navigator.clipboard.writeText(value);
    toast.value = `${value} copiado`;
  } catch {
    toast.value = value;
  }
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 2200);
}
function downloadIcon(name) {
  const url = URL.createObjectURL(
    new Blob([iconSvg(name)], { type: "image/svg+xml" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `cuenca-${name}.svg`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
</script>
<template>
  <div class="page styles-page">
    <div class="page-heading">
      <h1>Estilos</h1>
      <p>Colores, letras e iconos del proyecto para usarlos en carteles, presentaciones y redes</p>
    </div>

    <section class="brand-hero" aria-label="Marca">
      <img
        class="brand-hero-seal"
        src="/brand/cuenca/sello-480.webp"
        alt="Sello circular de Cuenca Cimarrona"
        width="140"
        height="140"
      />
      <strong class="wordmark">Cuenca Cimarrona</strong>
      <div class="brand-downloads">
        <a class="button secondary" href="/brand/cuenca/icono-512.png" download>
          <Icon name="download" :size="18" /> Sello PNG
        </a>
        <a class="button secondary" href="/brand/cuenca/firma-horizontal-claro.webp" download>
          <Icon name="download" :size="18" /> Firma horizontal
        </a>
        <a class="button secondary" href="/brand/cuenca/mascota-480.webp" download>
          <Icon name="download" :size="18" /> Mascota
        </a>
        <a class="button secondary" href="/brand/uabc-escudo.png" download>
          <Icon name="download" :size="18" /> Escudo UABC
        </a>
      </div>
    </section>
    <p class="styles-note">
      Las reglas completas están en el Manual de identidad de Cuenca Cimarrona
      (docs/identidad). El escudo UABC se usa tal como está: sin recortarlo,
      cambiarle colores ni deformarlo
    </p>

    <section aria-labelledby="titulo-mascota">
      <h2 id="titulo-mascota" class="section-title">Cimarrón guía</h2>
      <div class="mascot-rules">
        <div class="mascot-demo">
          <MascotGuide :size="180" bubble="¡Aquí te explico!" eager />
          <span class="mascot-demo-target">Lo que presenta</span>
        </div>
        <ul class="mascot-list">
          <li><strong>Siempre a la izquierda</strong> de lo que presenta: su mano abierta señala a la derecha. Nunca se voltea</li>
          <li><strong>No se gira, estira ni deforma.</strong> Solo entra deslizándose y flota 5 px</li>
          <li><strong>Mínimo 88 px de ancho.</strong> Más chico se usa el sello o el icono</li>
          <li><strong>Globo opcional</strong> con una frase de 2 a 4 palabras, arriba del personaje, fuera de su área de respeto</li>
          <li><strong>Uno por pantalla.</strong> Aparece en momentos clave: juegos, instrucciones y el mapa de riesgo. Nunca junto al 911</li>
        </ul>
      </div>
      <h3 class="styles-sub">Silueta</h3>
      <div class="silhouette-demo">
        <div class="silhouette-swatch on-light">
          <span class="cc-silhouette" aria-hidden="true"></span>
          <small>Marca de agua en tarjetas · 8 %</small>
        </div>
        <div class="silhouette-swatch on-green">
          <span class="cc-silhouette" aria-hidden="true"></span>
          <small>Encabezados verdes · blanco 10 %</small>
        </div>
      </div>
      <p class="styles-note">
        La silueta solo va de fondo, en tarjetas de 160 px o más, en la esquina
        inferior derecha. Puede recortarse por el borde, nunca girarse ni
        voltearse
      </p>
    </section>

    <section aria-labelledby="titulo-colores">
      <h2 id="titulo-colores" class="section-title">Colores</h2>
      <p class="styles-note">Toca un color para copiar su código</p>
      <div class="swatch-main">
        <button
          v-for="c in brandColors"
          :key="c.hex"
          class="swatch big"
          :class="{ 'on-dark': c.dark }"
          :style="{ background: c.hex }"
          @click="copy(c.hex)"
        >
          <strong>{{ c.name }}</strong><span>{{ c.hex }}</span><small>{{ c.use }}</small>
        </button>
      </div>
      <div class="swatch-row">
        <button
          v-for="c in supportColors"
          :key="c.hex"
          class="swatch"
          :class="{ 'on-dark': c.dark }"
          :style="{ background: c.hex }"
          @click="copy(c.hex)"
        >
          <strong>{{ c.name }}</strong><span>{{ c.hex }}</span><small>{{ c.use }}</small>
        </button>
      </div>
      <h3 class="styles-sub">Tarjetas de servicios</h3>
      <div class="swatch-row">
        <button
          v-for="c in cardColors"
          :key="c.name"
          class="swatch card-swatch"
          :style="{ background: c.bg, color: c.ink }"
          @click="copy(`${c.bg} ${c.ink}`)"
        >
          <strong>{{ c.name }}</strong><span>{{ c.bg }} · {{ c.ink }}</span>
        </button>
      </div>
    </section>

    <section aria-labelledby="titulo-letras">
      <h2 id="titulo-letras" class="section-title">Letras</h2>
      <div class="type-pair">
        <div>
          <span class="type-name">Lilita One · nombre de la marca</span>
          <p class="type-big wordmark brand-sample">Cuenca Cimarrona</p>
        </div>
        <div>
          <span class="type-name">Barlow Condensed · títulos</span>
          <p class="type-big">Prepárate antes de que llueva</p>
        </div>
        <div>
          <span class="type-name">DM Sans · texto</span>
          <p class="type-text">
            Llama al 911: contestan policía, ambulancia y bomberos
          </p>
        </div>
      </div>
    </section>

    <section aria-labelledby="titulo-voz">
      <h2 id="titulo-voz" class="section-title">Cómo escribimos</h2>
      <ul class="voice-list">
        <li v-for="[rule, detail] in writing" :key="rule">
          <strong>{{ rule }}</strong><span>{{ detail }}</span>
        </li>
      </ul>
    </section>

    <section aria-labelledby="titulo-iconos">
      <h2 id="titulo-iconos" class="section-title">Iconos</h2>
      <p class="styles-note">Toca uno para descargarlo en SVG</p>
      <div class="icon-shelf">
        <button
          v-for="(_, name) in icons"
          :key="name"
          :aria-label="`Descargar icono ${name}`"
          @click="downloadIcon(name)"
        >
          <Icon :name="name" :size="28" /><span>{{ name }}</span>
        </button>
      </div>
    </section>

    <details class="web-styles">
      <summary>Estilo web: botones, tarjetas y movimiento</summary>
      <div class="web-styles-body">
        <h3 class="styles-sub">Botones</h3>
        <div class="sample-row">
          <span><a class="button primary" href="#/estilos">Abrir el mapa</a><code>.button.primary</code></span>
          <span><a class="button secondary" href="#/estilos">Imprimir guía</a><code>.button.secondary</code></span>
          <span><a class="pill" href="#/estilos">Cómo llegar</a><code>.pill</code></span>
          <span><a class="text-link" href="#/estilos">Atlas en PDF</a><code>.text-link</code></span>
        </div>
        <p class="styles-note">
          Una acción principal por bloque. Al pasar el puntero, los botones
          cambian de color o sombra, nunca de tamaño ni de lugar
        </p>

        <h3 class="styles-sub">Esquinas</h3>
        <div class="sample-row">
          <span><i class="corner" style="border-radius: 14px"></i><code>14 px botones</code></span>
          <span><i class="corner" style="border-radius: 20px"></i><code>20 px tarjetas</code></span>
          <span><i class="corner" style="border-radius: 24px"></i><code>24 px bloques</code></span>
        </div>

        <h3 class="styles-sub">Movimiento</h3>
        <ul class="motion-rules">
          <li>Cada animación cuenta algo: la lluvia cae, la mochila se llena</li>
          <li>Nada se sale de su tarjeta ni crece más de 8 %</li>
          <li>Todo se detiene si el sistema pide menos movimiento</li>
        </ul>

        <h3 class="styles-sub">Variables CSS</h3>
        <pre class="token-block"><code>{{ tokens }}</code></pre>
        <a class="text-link" href="/brand/tokens.css" download>Descargar tokens.css</a>
      </div>
    </details>

    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </div>
</template>
