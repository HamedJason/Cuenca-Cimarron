<script setup>
import { computed, onBeforeUnmount, onMounted, ref, useId } from "vue";
import Icon from "./Icon.vue";
import { motionAllowed } from "../composables/useCanvasScene";
import { sources } from "../data";

// Diagrama del Pacífico: año normal contra año de El Niño.
// Se usa en El Niño (/el-nino) y en la ventana "Qué es El Niño".
const uid = useId();
const id = (name) => `${uid}-${name}`;
const mode = ref("normal");
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
// Se escribe directo en el atributo d para no rerenderizar el componente.
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
});
onBeforeUnmount(() => cancelAnimationFrame(seaFrame));
</script>
<template>
  <div class="pacific-lab">
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
            <linearGradient :id="id('sky')" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#9fd3ff" />
              <stop offset="1" stop-color="#e3f3ff" />
            </linearGradient>
            <linearGradient :id="id('deep')" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#2a74d8" />
              <stop offset="1" stop-color="#0b2f75" />
            </linearGradient>
            <linearGradient :id="id('warm')" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#e63946" />
              <stop offset="1" stop-color="#ffa62b" />
            </linearGradient>
            <clipPath :id="id('frame')">
              <rect width="1000" height="440" rx="18" />
            </clipPath>
          </defs>
          <g :clip-path="`url(#${id('frame')})`">
            <rect width="1000" height="440" :fill="`url(#${id('sky')})`" />
            <rect y="210" width="1000" height="230" :fill="`url(#${id('deep')})`" />
            <path
              class="pac-warm warm-normal"
              d="M0 210H1000V216C780 222 520 250 300 300C180 326 80 340 0 344Z"
              :fill="`url(#${id('warm')})`"
            />
            <path
              class="pac-warm warm-nino"
              d="M0 210H1000V286C760 290 500 288 260 286C150 286 70 288 0 290Z"
              :fill="`url(#${id('warm')})`"
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
            <path class="pac-land" d="M1000 120C960 128 935 160 915 210H1000Z" />
          </g>
        </svg>
        <p class="pac-axis" aria-hidden="true">
          <span><Icon name="arrow" :size="16" class="flip-x" /> Asia y Australia</span><span>América <Icon name="arrow" :size="16" /></span>
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
  </div>
</template>
