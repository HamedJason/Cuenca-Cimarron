<script setup>
import { nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import Icon from "../components/Icon.vue";
import MascotGuide from "../components/MascotGuide.vue";
import { openLesson } from "../composables/useLesson";
import { tips } from "../data";

// /consejos?momento=durante lleva directo a esa tarjeta (desde el inicio).
const route = useRoute();
watch(
  () => route.query.momento,
  (momento) => {
    if (!momento) return;
    // Se espera a que el router termine de subir la página al inicio.
    nextTick(() =>
      setTimeout(() => {
        const card = document.getElementById(`consejo-${momento}`);
        card?.scrollIntoView({ block: "center" });
        card?.focus({ preventScroll: true });
      }, 400),
    );
  },
  { immediate: true },
);
</script>
<template>
  <div class="page tips-page">
    <header class="gm-hero info-hero">
      <div class="gm-hero-copy">
        <span class="gm-kicker"><Icon name="shield" :size="20" /> Consejos</span>
        <h1>Consejos para la lluvia</h1>
        <p>Qué hacer antes, durante y después de una tormenta</p>
        <ul class="gm-chips">
          <li><Icon name="check" :size="18" /> {{ tips.length }} momentos</li>
          <li><Icon name="people" :size="18" /> Para toda la familia</li>
        </ul>
      </div>
      <div class="info-hero-art">
        <img
          src="/assets/images/game-backpack.webp"
          alt="Ilustración de una mochila con agua, linterna, botiquín y documentos protegidos"
          width="960"
          height="540"
        />
        <MascotGuide class="info-hero-mascot" :size="150" eager />
      </div>
    </header>

    <section aria-labelledby="titulo-momentos">
      <div class="gm-section-head">
        <h2 id="titulo-momentos" class="section-title">Qué hacer en cada momento</h2>
        <p class="section-lead">Lo más importante para mantenerte a salvo</p>
      </div>
      <ol class="tips-list">
        <li
          v-for="(tip, i) in tips"
          :id="`consejo-${tip.id}`"
          :key="tip.id"
          tabindex="-1"
          :class="[
            'tip-card',
            'cc-watermark',
            `tone-${tip.tone}`,
            { highlighted: route.query.momento === tip.id },
          ]"
          :style="{ '--i': i }"
        >
          <span class="advice-icon" aria-hidden="true"
            ><Icon :name="tip.icon" :size="32"
          /></span>
          <div>
            <span class="game-tag">{{ tip.moment }}</span>
            <h3>{{ tip.title }}</h3>
            <p>{{ tip.text }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section aria-labelledby="titulo-preparate" class="section-space">
      <div class="info-play cc-watermark">
        <MascotGuide :size="130" bubble="¡Prepárate conmigo!" />
        <div>
          <h2 id="titulo-preparate" class="section-title">Prepárate antes</h2>
          <p>Haz tu plan familiar y revisa tu mochila de emergencia</p>
        </div>
        <div class="info-play-actions">
          <button class="button primary cta" type="button" @click="openLesson('planfamiliar')">
            <Icon name="map" :size="22" /> Plan familiar
          </button>
          <button class="button secondary" type="button" @click="openLesson('mochila')">
            <Icon name="backpack" :size="22" /> Mochila
          </button>
        </div>
      </div>
    </section>
  </div>
</template>
