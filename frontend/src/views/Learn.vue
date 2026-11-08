<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import Icon from "../components/Icon.vue";
import WeatherScene from "../components/WeatherScene.vue";
import { motionAllowed } from "../composables/useCanvasScene";
import { sources } from "../data";
const mode = ref("normal");
// Viento, lluvia, calor y frío se turnan en un solo recuadro.
const weather = [
  { kind: "wind", label: "Viento" },
  { kind: "rain", label: "Lluvia" },
  { kind: "heat", label: "Calor" },
  { kind: "cold", label: "Frío" },
];
const wxIndex = ref(0);
let wxTimer = 0;
const isNino = computed(() => mode.value === "nino");
const steps = computed(() =>
  isNino.value
    ? [
        "Los vientos alisios se debilitan",
        "El agua caliente se extiende hacia América",
        "Las nubes y la lluvia se mueven con ella",
      ]
    : [
        "Los vientos alisios soplan hacia Asia",
        "Empujan el agua caliente hacia el oeste",
        "Frente a América sube agua fría del fondo",
      ],
);
const summary = computed(() =>
  isNino.value
    ? "Año de El Niño: los vientos se debilitan, el agua caliente se extiende hacia América y la lluvia se mueve con ella"
    : "Año normal: los vientos empujan el agua caliente hacia Asia y Australia, donde llueve más; frente a América sube agua fría",
);
// Se escribe directo en el atributo d para no rerenderizar la vista.
const surface = ref(null);
let seaFrame = 0;
function seaPath(t) {
  let d = "M0 216";
  for (let x = 0; x <= 1000; x += 20) {
    const y =
      210 +
      Math.sin(x * 0.02 + t * 1.6) * 3 +
      Math.sin(x * 0.045 - t * 2.3) * 1.6;
    d += `L${x} ${y.toFixed(1)}`;
  }
  return d;
}
function animateSea(now) {
  if (surface.value && motionAllowed())
    surface.value.setAttribute("d", seaPath(now / 1000));
  seaFrame = requestAnimationFrame(animateSea);
}
onMounted(() => {
  surface.value?.setAttribute("d", seaPath(0));
  seaFrame = requestAnimationFrame(animateSea);
  wxTimer = setInterval(() => {
    if (motionAllowed()) wxIndex.value = (wxIndex.value + 1) % weather.length;
  }, 4500);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(seaFrame);
  clearInterval(wxTimer);
});
const facts = [
  {
    icon: "clock",
    kind: "fact-time",
    title: "Diciembre y enero",
    text: "Las lluvias más fuertes llegarían desde la segunda semana de diciembre",
  },
  {
    icon: "cloud",
    kind: "fact-rain",
    title: "Hasta marzo de 2027",
    text: "Las lluvias podrían seguir en febrero y marzo",
  },
  {
    icon: "risk",
    kind: "fact-slide",
    title: "Inundaciones y deslaves",
    text: "Los riesgos que señalan las autoridades, sobre todo en laderas",
  },
  {
    icon: "info",
    kind: "fact-change",
    title: "El pronóstico puede cambiar",
    text: "Revisa los avisos oficiales antes de salir",
  },
];
</script>
<template>
  <div class="page learn-page">
    <div class="page-heading learn-hero">
      <div class="learn-hero-text">
        <h1>Qué es El Niño</h1>
        <p>
          Un calentamiento del océano Pacífico que cambia el viento, la lluvia y
          la temperatura
        </p>
      </div>
      <div class="wx-cycle">
        <ul class="wx-stage" aria-label="Lo que puede cambiar con El Niño">
          <Transition name="wx-fade" mode="out-in">
            <WeatherScene
              :key="weather[wxIndex].kind"
              :kind="weather[wxIndex].kind"
              :label="weather[wxIndex].label"
            />
          </Transition>
        </ul>
        <ol class="wx-dots" aria-hidden="true">
          <li
            v-for="(w, i) in weather"
            :key="w.kind"
            :class="{ on: i === wxIndex }"
          >
            {{ w.label }}
          </li>
        </ol>
      </div>
    </div>

    <section class="ocean-lab" aria-labelledby="titulo-pacifico">
      <h2 id="titulo-pacifico">¿Qué cambia en el Pacífico?</h2>
      <div class="lab-toggle" role="group" aria-label="Elegir año">
        <button type="button" :aria-pressed="!isNino" @click="mode = 'normal'">
          Año normal
        </button>
        <button type="button" :aria-pressed="isNino" @click="mode = 'nino'">
          Año de El Niño
        </button>
      </div>
      <div class="lab-body">
        <div class="pac-figure">
          <svg
            class="pacific"
            :class="isNino ? 'is-nino' : 'is-normal'"
            viewBox="0 0 1000 440"
            role="img"
            :aria-label="summary"
          >
            <defs>
              <linearGradient id="pac-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#9fd3ff" />
                <stop offset="1" stop-color="#e3f3ff" />
              </linearGradient>
              <linearGradient id="pac-deep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color="#2a74d8" />
                <stop offset="1" stop-color="#0b2f75" />
              </linearGradient>
              <linearGradient id="pac-warm" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stop-color="#e63946" />
                <stop offset="1" stop-color="#ffa62b" />
              </linearGradient>
              <clipPath id="pac-frame">
                <rect width="1000" height="440" rx="18" />
              </clipPath>
            </defs>
            <g clip-path="url(#pac-frame)">
              <rect width="1000" height="440" fill="url(#pac-sky)" />
              <rect y="210" width="1000" height="230" fill="url(#pac-deep)" />
              <path
                class="pac-warm warm-normal"
                d="M0 210H1000V216C780 222 520 250 300 300C180 326 80 340 0 344Z"
                fill="url(#pac-warm)"
              />
              <path
                class="pac-warm warm-nino"
                d="M0 210H1000V286C760 290 500 288 260 286C150 286 70 288 0 290Z"
                fill="url(#pac-warm)"
              />
              <path ref="surface" class="pac-surface" d="M0 210H1000" />
              <text class="pac-tag" x="150" y="262">Agua caliente</text>
              <text class="pac-tag" x="520" y="404">Agua fría</text>
              <g class="pac-upwell">
                <path d="M880 410C880 340 900 290 930 232" />
                <path d="M840 420C842 360 860 310 890 240" />
                <path d="M918 236l12-6 2 14M878 244l12-6 2 14" />
              </g>
              <g class="pac-winds">
                <g class="pac-wind w1">
                  <path d="M780 172H620" />
                  <path d="M634 160l-14 12 14 12" />
                </g>
                <g class="pac-wind w2">
                  <path d="M560 150H400" />
                  <path d="M414 138l-14 12 14 12" />
                </g>
                <g class="pac-wind w3">
                  <path d="M350 178H200" />
                  <path d="M214 166l-14 12 14 12" />
                </g>
              </g>
              <g class="pac-storm">
                <g class="pac-rain">
                  <line x1="-50" y1="100" x2="-58" y2="122" />
                  <line x1="-25" y1="102" x2="-33" y2="124" />
                  <line x1="0" y1="100" x2="-8" y2="122" />
                  <line x1="25" y1="102" x2="17" y2="124" />
                  <line x1="50" y1="100" x2="42" y2="122" />
                </g>
                <path
                  class="pac-cloud"
                  d="M-78 92a24 24 0 0 1 8-46 34 34 0 0 1 62-14 28 28 0 0 1 48 16 22 22 0 0 1 32 22 20 20 0 0 1-12 22Z"
                />
              </g>
              <path class="pac-land" d="M0 150C40 140 70 160 88 210H0Z" />
              <path
                class="pac-land"
                d="M1000 120C960 128 935 160 915 210H1000Z"
              />
            </g>
          </svg>
          <p class="pac-axis" aria-hidden="true">
            <span>← Asia y Australia</span><span>América →</span>
          </p>
          <ul class="pac-legend" aria-hidden="true">
            <li><span class="lg lg-warm"></span>Agua caliente</li>
            <li><span class="lg lg-cold"></span>Agua fría</li>
            <li><span class="lg lg-wind"></span>Vientos alisios</li>
            <li><span class="lg lg-rain"></span>Nubes y lluvia</li>
          </ul>
        </div>
        <ol class="lab-steps" aria-live="polite">
          <li v-for="(line, i) in steps" :key="mode + i" :style="{ '--i': i }">
            {{ line }}
          </li>
        </ol>
      </div>
      <p class="lab-note">
        Esquema simplificado, sin escala ·
        <a :href="sources.climate" target="_blank" rel="noopener"
          >Explicación completa de NOAA</a
        >
      </p>
    </section>

    <section aria-labelledby="titulo-tijuana" class="section-space">
      <h2 id="titulo-tijuana" class="block-title">Qué se espera en Tijuana</h2>
      <div class="fact-grid">
        <article
          v-for="fact in facts"
          :key="fact.title"
          :class="['fact-card', fact.kind]"
        >
          <span class="fact-icon" aria-hidden="true">
            <svg
              v-if="fact.kind === 'fact-time'"
              class="ai ai-calendar"
              viewBox="0 0 48 48"
            >
              <rect
                class="cal-page"
                x="7"
                y="9"
                width="34"
                height="32"
                rx="5"
              />
              <path
                class="cal-top"
                d="M7 14a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v5H7Z"
              />
              <path class="cal-ring" d="M16 6v6M32 6v6" />
              <text class="cal-month m1" x="24" y="35" text-anchor="middle">
                DIC
              </text>
              <text class="cal-month m2" x="24" y="35" text-anchor="middle">
                ENE
              </text>
            </svg>
            <svg
              v-else-if="fact.kind === 'fact-rain'"
              class="ai ai-rain"
              viewBox="0 0 48 48"
            >
              <g class="rain-lines">
                <path d="M15 32l-3 7" />
                <path d="M24 32l-3 7" />
                <path d="M33 32l-3 7" />
              </g>
              <path
                class="ai-cloud"
                d="M14 29a7 7 0 0 1 1-14 10 10 0 0 1 19 2 6 6 0 0 1 1 12Z"
              />
            </svg>
            <svg
              v-else-if="fact.kind === 'fact-slide'"
              class="ai ai-flood"
              viewBox="0 0 48 48"
            >
              <defs>
                <clipPath id="flood-clip">
                  <rect x="0" y="0" width="48" height="48" />
                </clipPath>
              </defs>
              <path class="flood-house" d="M10 22 24 10l14 12v18H10Z" />
              <rect
                class="flood-door"
                x="20"
                y="29"
                width="8"
                height="11"
                rx="1"
              />
              <g clip-path="url(#flood-clip)">
                <path
                  class="flood-water"
                  d="M-24 36c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0V60H-24Z"
                />
              </g>
            </svg>
            <svg v-else class="ai ai-forecast" viewBox="0 0 48 48">
              <g class="fc fc-sun">
                <circle cx="24" cy="24" r="7" />
                <path
                  d="M24 9v4M24 35v4M9 24h4M35 24h4M13.5 13.5l3 3M31.5 31.5l3 3M13.5 34.5l3-3M31.5 16.5l3-3"
                />
              </g>
              <g class="fc fc-cloud">
                <path
                  d="M14 32a7 7 0 0 1 1-14 10 10 0 0 1 19 2 6 6 0 0 1 1 12Z"
                />
              </g>
              <g class="fc fc-storm">
                <path
                  d="M14 28a7 7 0 0 1 1-14 10 10 0 0 1 19 2 6 6 0 0 1 1 12Z"
                />
                <path class="fc-drop" d="M17 32l-2 5M25 32l-2 5M33 32l-2 5" />
              </g>
            </svg>
          </span>
          <h3>{{ fact.title }}</h3>
          <p>{{ fact.text }}</p>
        </article>
      </div>
      <p class="micro">
        Fuente:
        <a
          href="https://puntonorte.info/2026/11/05/cabildo-de-tijuana-emite-declaratoria-de-emergencia-ante-inminente-llegada-de-el-nino/"
          target="_blank"
          rel="noopener"
          >Punto Norte, 5 de noviembre de 2026</a
        >, con declaraciones del alcalde y del director de Protección Civil
        Municipal ·
        <RouterLink to="/">Ver avisos oficiales</RouterLink>
      </p>
    </section>

    <section aria-labelledby="titulo-familia" class="section-space">
      <h2 id="titulo-familia" class="block-title">
        Qué significa para tu familia
      </h2>
      <div class="family-grid">
        <article class="family-card fc-blue">
          <svg class="ai ai-rain big" viewBox="0 0 48 48" aria-hidden="true">
            <g class="rain-lines">
              <path d="M15 32l-3 7" />
              <path d="M24 32l-3 7" />
              <path d="M33 32l-3 7" />
            </g>
            <path
              class="ai-cloud"
              d="M14 29a7 7 0 0 1 1-14 10 10 0 0 1 19 2 6 6 0 0 1 1 12Z"
            />
            <text class="ai-question" x="25" y="26" text-anchor="middle">
              ?
            </text>
          </svg>
          <h3>No toda lluvia es El Niño</h3>
          <p>
            Este sitio no muestra alertas en tiempo real; revisa los avisos
            oficiales
          </p>
        </article>
        <article class="family-card fc-green">
          <svg class="ai ai-shield big" viewBox="0 0 48 48" aria-hidden="true">
            <path
              class="sh-body"
              d="M24 5 39 11v11c0 10-7 17-15 21C16 39 9 32 9 22V11Z"
            />
            <path class="sh-check" d="M16 24l6 6 11-12" />
          </svg>
          <h3>Prepárate desde ahora</h3>
          <p>Haz el plan familiar y arma la mochila de emergencia</p>
          <RouterLink to="/plan" class="text-link"
            >Hacer el plan familiar</RouterLink
          >
        </article>
        <article class="family-card fc-red">
          <svg class="ai ai-current big" viewBox="0 0 48 48" aria-hidden="true">
            <defs>
              <clipPath id="current-clip">
                <circle cx="24" cy="24" r="19" />
              </clipPath>
            </defs>
            <g clip-path="url(#current-clip)">
              <path
                class="cur-wave w1"
                d="M-20 18c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0"
              />
              <path
                class="cur-wave w2"
                d="M-20 26c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0"
              />
              <path
                class="cur-wave w3"
                d="M-20 34c4-3 8-3 12 0s8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0 8 3 12 0 8-3 12 0"
              />
            </g>
            <circle class="no-ring" cx="24" cy="24" r="19" />
            <path class="no-slash" d="M10.5 37.5 37.5 10.5" />
          </svg>
          <h3>No cruces corrientes</h3>
          <p>
            Si hay agua corriendo en la calle o el arroyo, espera y busca otro
            camino
          </p>
        </article>
      </div>
    </section>

    <section class="sources-section">
      <h2>Fuentes para seguir aprendiendo</h2>
      <a :href="sources.climate" target="_blank" rel="noopener"
        ><span><strong>NOAA</strong> · Entender El Niño y ENOS</span
        ><Icon name="external" :size="18" /></a
      ><a :href="sources.plan" target="_blank" rel="noopener"
        ><span><strong>CENAPRED</strong> · Plan familiar en cuatro pasos</span
        ><Icon name="external" :size="18" /></a
      ><a :href="sources.backpack" target="_blank" rel="noopener"
        ><span><strong>CENAPRED</strong> · Mochila de emergencia</span
        ><Icon name="external" :size="18" /></a
      ><a :href="sources.forecast" target="_blank" rel="noopener"
        ><span><strong>SMN / CONAGUA</strong> · Avisos meteorológicos</span
        ><Icon name="external" :size="18"
      /></a>
    </section>
  </div>
</template>
