<script setup>
import { computed, ref } from "vue";
import AnimClip from "./AnimClip.vue";
import Icon from "./Icon.vue";
import { sources } from "../data";

// Diagrama del Pacífico: año normal contra año de El Niño.
// Se usa en El Niño (/el-nino) y en la ventana "Qué es El Niño".
const mode = ref("normal");
const isNino = computed(() => mode.value === "nino");
const steps = computed(() =>
  isNino.value
    ? [
        "El viento sopla más débil",
        "El agua caliente llega hasta América",
        "Las nubes y la lluvia llegan con ella",
      ]
    : [
        "El viento sopla hacia Asia",
        "Empuja el agua caliente lejos de América",
        "Cerca de América el mar queda frío",
      ],
);
const summary = computed(() =>
  isNino.value
    ? "Año de El Niño: el viento sopla más débil y el agua caliente y la lluvia llegan hasta América"
    : "Año normal: el viento empuja el agua caliente y la lluvia hacia Asia y Australia. Cerca de América el mar queda frío",
);
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
        <AnimClip
          :key="mode"
          class="pacific"
          :name="isNino ? 'pacifico-nino' : 'pacifico-normal'"
          :label="summary"
        />
        <p class="pac-axis" aria-hidden="true">
          <span><Icon name="arrow" :size="16" class="flip-x" /> Asia y Australia</span><span>América <Icon name="arrow" :size="16" /></span>
        </p>
      </div>
      <ol class="lab-steps" aria-live="polite">
        <li v-for="(line, i) in steps" :key="mode + i" :style="{ '--i': i }">
          {{ line }}
        </li>
      </ol>
    </div>
    <p class="lab-note">
      Es un dibujo sencillo ·
      <a :href="sources.climate" target="_blank" rel="noopener"
        >Saber más (NOAA)</a
      >
    </p>
  </div>
</template>
