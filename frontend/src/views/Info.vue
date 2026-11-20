<script setup>
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import PointsTag from "../components/PointsTag.vue";
import MascotGuide from "../components/MascotGuide.vue";
import RiskClip from "../components/RiskClip.vue";
import Llamada911 from "../components/Llamada911.vue";
import FamiliaSeparada from "../components/FamiliaSeparada.vue";
import { openLesson } from "../composables/useLesson";
import { lessons, risks } from "../data";

// Información: los temas abren su ventana en lugar de otra página.
// /informacion?tema=mochila abre directo esa ventana (enlaces viejos y compartidos).
// ?ver=911 baja a la llamada al 911 y ?ver=familia, a "Si la familia se separa".
// Los números ahora viven en /directorio: ?ver=numeros y ?ver=dependencias llevan ahí.
const route = useRoute();
const router = useRouter();
function openFromQuery(tema) {
  if (!tema) return;
  openLesson(String(tema));
  router.replace({ query: {} });
}
const anchors = {
  911: "buen-uso-911",
  familia: "familia-separada",
};
function scrollFromQuery(ver) {
  if (ver === "numeros" || ver === "dependencias") {
    router.replace("/directorio");
    return;
  }
  const id = anchors[ver];
  if (!id) return;
  // Después de que el router sube la página y se acomodan las imágenes de arriba
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, 700);
}
// Se espera al montaje para que la ventana (en App.vue) ya exista.
onMounted(() => {
  openFromQuery(route.query.tema);
  scrollFromQuery(route.query.ver);
});
watch(() => route.query.tema, openFromQuery);
watch(() => route.query.ver, scrollFromQuery);
</script>
<template>
  <div class="page info-page">
    <header class="gm-hero info-hero">
      <div class="gm-hero-copy">
        <span class="gm-kicker"><Icon name="book" :size="20" /> Lo esencial</span>
        <h1>El Niño en Tijuana</h1>
        <p>Qué es, qué riesgos trae a tu colonia y cómo prepararte en familia</p>
        <ul class="gm-chips">
          <li><Icon name="book" :size="18" /> {{ lessons.length }} temas</li>
          <li><Icon name="people" :size="18" /> Para toda la familia</li>
          <li class="gm-chip-link">
            <RouterLink to="/migrantes?lang=ht" lang="ht"
              ><Icon name="book" :size="18" /> Enfòmasyon an kreyòl</RouterLink
            >
          </li>
        </ul>
      </div>
      <div class="info-hero-art">
        <img
          src="/assets/images/hero-el-nino.webp"
          alt="Ilustración de Tijuana durante la lluvia, con una ruta segura y artículos de emergencia"
          width="960"
          height="540"
        />
      </div>
    </header>

    <section aria-labelledby="titulo-temas" class="gm-section">
      <span class="cc-silhouette gm-bg-sil gm-bg-sil-1" aria-hidden="true"></span>
      <div class="gm-section-head">
        <h2 id="titulo-temas" class="section-title">Aprende lo esencial</h2>
      </div>
      <div class="gm-grid info-grid">
        <article
          v-for="(lesson, i) in lessons"
          :key="lesson.id"
          :class="['gm-card', 'cc-watermark', `tone-${lesson.tone}`]"
          :style="{ '--i': i }"
        >
          <div class="gm-art">
            <img
              :src="lesson.image"
              :alt="lesson.alt"
              width="480"
              height="270"
              :loading="i === 0 ? 'eager' : 'lazy'"
            />
            <span class="gm-number" aria-hidden="true">{{ i + 1 }}</span>
            <span class="gm-badge" aria-hidden="true"
              ><Icon :name="lesson.icon" :size="26"
            /></span>
          </div>
          <div class="gm-body">
            <PointsTag :activity-key="`lectura-${lesson.id}`" />
            <h3>{{ lesson.title }}</h3>
            <button
              class="button primary cta info-open"
              type="button"
              @click="openLesson(lesson.id)"
            >
              <Icon name="book" :size="22" /> Ver información
            </button>
          </div>
        </article>
      </div>
    </section>

    <section aria-labelledby="titulo-riesgos" class="section-space">
      <div class="section-head">
        <div>
          <h2 id="titulo-riesgos" class="section-title">
            Qué puede pasar en Tijuana
          </h2>
          <PointsTag />
        </div>
        <a
          class="button secondary"
          href="https://proteccioncivil.tijuana.gob.mx/"
          target="_blank"
          rel="noopener"
          ><Icon name="external" :size="18" /> Protección Civil Tijuana</a
        >
      </div>
      <div class="advice-grid">
        <article
          v-for="risk in risks"
          :key="risk.title"
          :class="['advice-card', 'info-card', `tone-${risk.tone}`, { 'risk-clip-card': risk.clip }]"
        >
          <RiskClip v-if="risk.clip" :name="risk.clip" />
          <span v-else class="advice-icon" aria-hidden="true"
            ><Icon :name="risk.icon" :size="32"
          /></span>
          <strong>{{ risk.title }}</strong>
          <span>{{ risk.text }}</span>
        </article>
      </div>
    </section>

    <section aria-labelledby="titulo-lecturas" class="section-space">
      <div class="info-play cc-watermark lessons-invite">
        <div>
          <h2 id="titulo-lecturas" class="section-title">Lecturas cortas</h2>
          <p>Un tema en un minuto, con una pregunta al final. Riesgos, plan familiar y mochila</p>
        </div>
        <RouterLink to="/aprende" class="button primary"
          ><Icon name="book" :size="22" /> Empezar a leer</RouterLink
        >
      </div>
    </section>

    <section aria-labelledby="titulo-jugar" class="section-space">
      <div class="info-play cc-watermark">
        <MascotGuide :size="130" bubble="¡Practica conmigo!" />
        <div>
          <h2 id="titulo-jugar" class="section-title">Aprende jugando</h2>
          <p>Pon a prueba lo que aprendiste</p>
        </div>
        <RouterLink to="/juegos" class="button primary cta"
          ><Icon name="gamepad" :size="22" /> Ver los juegos</RouterLink
        >
      </div>
    </section>

    <Llamada911 />

    <FamiliaSeparada />
  </div>
</template>
