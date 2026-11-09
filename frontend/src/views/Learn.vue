<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import Icon from "../components/Icon.vue";
import WeatherScene from "../components/WeatherScene.vue";
import PacificLab from "../components/PacificLab.vue";
import { motionAllowed } from "../composables/useCanvasScene";
import { sources } from "../data";
// Viento, lluvia, calor y frío se turnan en un solo recuadro.
const weather = [
  { kind: "wind", label: "Viento" },
  { kind: "rain", label: "Lluvia" },
  { kind: "heat", label: "Calor" },
  { kind: "cold", label: "Frío" },
];
const wxIndex = ref(0);
let wxTimer = 0;
onMounted(() => {
  wxTimer = setInterval(() => {
    if (motionAllowed()) wxIndex.value = (wxIndex.value + 1) % weather.length;
  }, 4500);
});
onBeforeUnmount(() => {
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
      <PacificLab />
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
