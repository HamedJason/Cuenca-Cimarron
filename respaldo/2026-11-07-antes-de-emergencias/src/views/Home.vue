<script setup>
import Icon from "../components/Icon.vue";
import StepCards from "../components/StepCards.vue";
import {
  packed,
  togglePacked,
  backpackPercent,
} from "../composables/useProgress";
import { supplies } from "../data";
</script>
<template>
  <div class="page home-page">
    <section class="hero">
      <h1>Prepara a tu familia ante El Niño</h1>
      <p>
        Un plan familiar en cuatro pasos y una lista de doce artículos para tu
        mochila de emergencia, con base en las guías de CENAPRED. Tu avance se
        guarda en este navegador.
      </p>
    </section>
    <section id="cuatro-pasos" class="steps-section">
      <div class="section-heading">
        <div>
          <span class="section-kicker">Según CENAPRED</span>
          <h2>El plan familiar en 4 pasos</h2>
        </div>
      </div>
      <StepCards />
      <p class="inclusive-note">
        Incluyan en el plan a niñas y niños, personas mayores, personas con
        discapacidad y mascotas.
      </p>
    </section>
    <section class="home-bottom">
      <div class="backpack-preview">
        <h2>Mochila de emergencia</h2>
        <p>Marca lo que ya tienes.</p>
        <div class="preview-checks">
          <label v-for="item in supplies.slice(0, 4)" :key="item.id"
            ><input
              type="checkbox"
              :checked="packed.includes(item.id)"
              @change="togglePacked(item.id)" /><span>{{ item.name }}</span
            ><Icon :name="item.icon" :size="19"
          /></label>
        </div>
        <div class="progress-meta">
          <span
            ><strong>{{ packed.length }} de {{ supplies.length }}</strong>
            artículos preparados</span
          ><RouterLink to="/mochila">Ver la lista completa</RouterLink>
        </div>
        <div
          class="progress-track"
          role="progressbar"
          :aria-valuenow="backpackPercent"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Avance de mi mochila"
        >
          <span :style="{ width: backpackPercent + '%' }"></span>
        </div>
      </div>
      <RouterLink to="/el-nino" class="climate-teaser">
        <h2>¿Qué es El Niño?</h2>
        <p>
          Un calentamiento del océano Pacífico que puede cambiar las lluvias y
          la temperatura. Sus efectos varían según la región.
        </p>
        <span class="teaser-link">Leer la explicación</span>
      </RouterLink>
    </section>
    <p class="source-line">
      Contenido basado en CENAPRED y NOAA.
      <RouterLink to="/el-nino">Ver fuentes</RouterLink>
    </p>
  </div>
</template>
