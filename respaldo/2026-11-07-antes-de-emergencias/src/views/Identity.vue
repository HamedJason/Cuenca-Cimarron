<script setup>
import { ref } from "vue";
import Icon from "../components/Icon.vue";
import { icons, iconSvg } from "../icons";
const toast = ref("");
const palette = [
  {
    name: "Verde UABC",
    hex: "#00723F",
    usage: "Acciones principales, navegación activa y bloques de énfasis",
    light: false,
  },
  {
    name: "Ocre UABC",
    hex: "#DD971A",
    usage: "Números de paso, barras de avance y el punto final",
    light: true,
  },
  {
    name: "Verde profundo",
    hex: "#003D24",
    usage: "Títulos y texto sobre ocre",
    light: false,
  },
  {
    name: "Ocre texto",
    hex: "#8A5A00",
    usage: "Texto pequeño en tono ocre sobre fondo claro",
    light: false,
  },
  {
    name: "Papel",
    hex: "#F6F8F5",
    usage: "Fondo general",
    light: true,
  },
  { name: "Tinta", hex: "#1C2621", usage: "Texto de lectura", light: false },
];
let timer;
async function copy(value) {
  try {
    await navigator.clipboard.writeText(value);
    toast.value = `${value} copiado`;
  } catch {
    toast.value = `Código: ${value}`;
  }
  clearTimeout(timer);
  timer = setTimeout(() => (toast.value = ""), 2500);
}
function download(content, name, type = "image/svg+xml") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function downloadTokens() {
  download(
    JSON.stringify(
      {
        name: "Cuenca Cimarrón",
        version: "0.2.0",
        colors: Object.fromEntries(palette.map((c) => [c.name, c.hex])),
        typography: { heading: "Barlow Condensed", body: "DM Sans" },
        spacing: [4, 8, 12, 16, 24, 32, 48, 64],
        radius: { card: 4, button: 4 },
      },
      null,
      2,
    ),
    "cuenca-tokens.json",
    "application/json",
  );
}
</script>
<template>
  <div class="page identity-page">
    <div class="page-heading identity-heading">
      <div>
        <h1>Identidad del proyecto</h1>
        <p>
          Nuestra caja de herramientas para crear en equipo. Usa, adapta y
          construye con coherencia.
        </p>
      </div>
      <span class="version-tag">Identidad v0.2</span>
    </div>
    <div class="identity-intro">
      <Icon name="leaf" :size="29" />
      <p>
        <strong>Verde y ocre, tomados del escudo UABC.</strong> El resto de la
        paleta es neutra para que esos dos colores sean los que se recuerdan.
      </p>
    </div>
    <section class="identity-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">01 · Marca</span>
          <h2>Logo, símbolo y escudo.</h2>
        </div>
      </div>
      <div class="brand-grid">
        <div class="logo-showcase">
          <div class="large-brand">
            <img
              src="/brand/cimarron.svg"
              alt="Cimarrón original del proyecto"
              width="200"
              height="200"
            /><span
              >CUENCA<strong>CIMARRÓN<span class="gold-dot">.</span></strong
              ><small>Conocer. Prevenir. Cuidarnos.</small></span
            >
          </div>
          <div class="asset-caption">
            <span>Logo del proyecto · SVG escalable</span
            ><a href="/brand/cuenca-logo.svg" download class="text-link"
              >Descargar <Icon name="download" :size="17"
            /></a>
          </div>
        </div>
        <div class="mascot-showcase">
          <img
            src="/brand/cimarron.svg"
            alt="Símbolo del cimarrón"
            width="200"
            height="200"
            loading="lazy"
          /><a href="/brand/cimarron.svg" download class="text-link"
            >Símbolo SVG <Icon name="download" :size="16"
          /></a>
        </div>
        <div class="uabc-showcase">
          <img
            src="/brand/uabc-escudo.png"
            alt="Escudo de la Universidad Autónoma de Baja California"
            width="2300"
            height="3138"
            loading="lazy"
          /><a href="/brand/uabc-escudo.png" download class="text-link"
            >Escudo UABC <Icon name="download" :size="16"
          /></a>
        </div>
      </div>
      <p class="asset-note">
        Mantén las proporciones y un espacio libre alrededor de la marca. El
        cimarrón es una propuesta original del proyecto; el escudo UABC se
        conserva como fue proporcionado y no se sustituye ni se modifica.
      </p>
    </section>
    <section class="identity-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">02 · Color</span>
          <h2>Los colores del escudo.</h2>
        </div>
        <button class="text-link" @click="downloadTokens">
          Descargar tokens <Icon name="download" :size="17" />
        </button>
      </div>
      <div class="palette-grid">
        <button
          v-for="color in palette"
          :key="color.hex"
          class="color-card"
          :aria-label="`Copiar color ${color.name}, ${color.hex}`"
          @click="copy(color.hex)"
        >
          <div
            :style="{
              background: color.hex,
              color: color.light ? '#003D24' : '#fff',
            }"
          >
            <span>{{ color.hex }}</span
            ><Icon name="copy" :size="17" />
          </div>
          <strong>{{ color.name }}</strong>
          <p>{{ color.usage }}</p>
        </button>
      </div>
      <p class="asset-note">
        Haz clic para copiar un color. Sobre ocre, escribe en verde profundo. El
        ocre sobre blanco no tiene contraste suficiente para texto: úsalo en
        superficies y detalles; para texto pequeño usa Ocre texto.
      </p>
    </section>
    <section class="identity-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">03 · Tipografía</span>
          <h2>Barlow Condensed para títulos, DM Sans para leer.</h2>
        </div>
      </div>
      <div class="two-column">
        <article class="type-specimen">
          <span class="label">Títulos · Barlow Condensed · 600 / 700</span>
          <div class="type-heading">
            Prepararnos<br />nos une<span class="gold-dot">.</span>
          </div>
          <p>
            Frases breves, jerarquía clara y mucho espacio. Disponible
            localmente en el proyecto.
          </p>
        </article>
        <article class="type-specimen">
          <span class="label">Texto · DM Sans · 400 / 500 / 600 / 700</span>
          <div class="type-body">
            Una comunidad informada<br />es una comunidad preparada.
          </div>
          <p>
            Texto base de 16 px, interlineado de 1.6. Escribe de forma cercana,
            directa e inclusiva.
          </p>
          <span class="alphabet">Aa Bb Cc Dd Ee · 0123456789</span>
        </article>
      </div>
    </section>
    <section class="identity-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">04 · Iconos</span>
          <h2>Pictogramas de trazo.</h2>
        </div>
        <span class="section-aside">Haz clic para descargar SVG</span>
      </div>
      <div class="icon-grid">
        <button
          v-for="(_, name) in icons"
          :key="name"
          @click="download(iconSvg(name), `cuenca-${name}.svg`)"
          :aria-label="`Descargar icono ${name}`"
        >
          <Icon :name="name" :size="29" /><span>{{ name }}</span>
        </button>
      </div>
      <p class="asset-note">
        Cuadrícula de 24 × 24, trazo de 1.7, extremos redondeados, sin relleno.
        Heredan el color del texto. Acompaña los iconos de acción con etiquetas
        claras.
      </p>
    </section>
    <section class="identity-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">05 · Ilustración y recursos</span>
          <h2>Paisaje y plantillas.</h2>
        </div>
      </div>
      <div class="two-column">
        <div class="landscape-showcase">
          <img
            src="/brand/cuenca-paisaje.svg"
            alt="Ilustración original de una cuenca"
            width="680"
            height="450"
            loading="lazy"
          /><a href="/brand/cuenca-paisaje.svg" download class="text-link"
            >Descargar ilustración SVG <Icon name="download" :size="17"
          /></a>
        </div>
        <article class="paper-panel">
          <h3>Reglas para una pantalla nueva</h3>
          <ul class="guidelines">
            <li>
              Fondo Papel, superficies blancas y un solo bloque en verde UABC
              por pantalla.
            </li>
            <li>
              Construye con una escala de espacio de 4, 8, 16, 24, 32 y 48 px.
            </li>
            <li>
              Radio de 4 px en todo; sin sombras salvo el canto de los botones.
            </li>
            <li>
              Una acción principal por bloque; texto claro y estados visibles.
            </li>
            <li>Verifica contraste, teclado y diseño en celular.</li>
            <li>Cita la fuente de toda información preventiva.</li>
          </ul>
          <a href="/brand/plantilla-vista.vue" download class="button secondary"
            ><Icon name="download" :size="17" /> Plantilla de pantalla Vue</a
          ><a href="/brand/tokens.css" download class="text-link asset-download"
            >Descargar variables CSS <Icon name="download" :size="16"
          /></a>
        </article>
      </div>
    </section>
    <section class="identity-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">06 · Componentes</span>
          <h2>Botones y mensajes.</h2>
        </div>
      </div>
      <div class="component-samples">
        <div>
          <span class="label">Acciones</span
          ><RouterLink to="/plan" class="button primary"
            >Acción principal</RouterLink
          ><RouterLink to="/mochila" class="button secondary"
            >Acción secundaria</RouterLink
          >
        </div>
        <div>
          <span class="label">Mensaje de ayuda</span>
          <div class="note">
            <Icon name="info" />
            <p>
              Explica qué puede hacer la persona a continuación, con un mensaje
              breve y amable.
            </p>
          </div>
        </div>
      </div>
    </section>
    <div v-if="toast" class="toast" role="status">{{ toast }}</div>
  </div>
</template>
