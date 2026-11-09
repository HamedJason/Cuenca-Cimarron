<script setup>
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import MascotGuide from "../components/MascotGuide.vue";
import { openLesson } from "../composables/useLesson";
import { emergency, lessons, risks } from "../data";

// Información: los tres temas abren su ventana en lugar de otra página.
// /informacion?tema=mochila abre directo esa ventana (enlaces viejos y compartidos).
const route = useRoute();
const router = useRouter();
function openFromQuery(tema) {
  if (!tema) return;
  openLesson(String(tema));
  router.replace({ query: {} });
}
// Se espera al montaje para que la ventana (en App.vue) ya exista.
onMounted(() => openFromQuery(route.query.tema));
watch(() => route.query.tema, openFromQuery);
const telHref = (number) => `tel:${number.replace(/\s/g, "")}`;
</script>
<template>
  <div class="page info-page">
    <header class="gm-hero info-hero">
      <div class="gm-hero-copy">
        <span class="gm-kicker"><Icon name="book" :size="20" /> Lo esencial</span>
        <h1>El Niño en Tijuana</h1>
        <p>Qué es, qué riesgos trae a tu colonia y cómo prepararte en familia</p>
        <ul class="gm-chips">
          <li><Icon name="book" :size="18" /> 3 temas</li>
          <li><Icon name="people" :size="18" /> Para toda la familia</li>
        </ul>
      </div>
      <div class="info-hero-art">
        <img
          src="/assets/images/hero-el-nino.webp"
          alt="Ilustración de Tijuana durante la lluvia, con una ruta segura y artículos de emergencia"
          width="960"
          height="540"
        />
        <MascotGuide class="info-hero-mascot" :size="150" eager />
      </div>
    </header>

    <section aria-labelledby="titulo-temas" class="gm-section">
      <span class="cc-silhouette gm-bg-sil gm-bg-sil-1" aria-hidden="true"></span>
      <div class="gm-section-head">
        <h2 id="titulo-temas" class="section-title">Aprende en tres pasos</h2>
        <p class="section-lead">Toca "Ver información" para abrir cada tema</p>
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
            <h3>{{ lesson.title }}</h3>
            <p>{{ lesson.short }}</p>
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
          <p class="section-lead">Los tres riesgos que más se presentan con lluvia fuerte</p>
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
          :class="['advice-card', 'info-card', `tone-${risk.tone}`]"
        >
          <span class="advice-icon" aria-hidden="true"
            ><Icon :name="risk.icon" :size="32"
          /></span>
          <strong>{{ risk.title }}</strong>
          <span>{{ risk.text }}</span>
        </article>
      </div>
    </section>

    <section aria-labelledby="titulo-jugar" class="section-space">
      <div class="info-play cc-watermark">
        <MascotGuide :size="130" bubble="¡Practica conmigo!" />
        <div>
          <h2 id="titulo-jugar" class="section-title">Aprende jugando</h2>
          <p>Pon a prueba lo que aprendiste con los juegos del sitio</p>
        </div>
        <RouterLink to="/juegos" class="button primary cta"
          ><Icon name="gamepad" :size="22" /> Ver los juegos</RouterLink
        >
      </div>
    </section>

    <section aria-labelledby="titulo-numeros-info" class="section-space">
      <h2 id="titulo-numeros-info" class="section-title">Números de emergencia</h2>
      <p class="tap-hint">Si hay peligro, llama al 911. Toca un número para llamar</p>
      <div class="phone-grid info-phones">
        <div class="phone-card theme-911">
          <span class="phone-icon" aria-hidden="true"><Icon name="phone" :size="26" /></span>
          <p class="phone-name">Emergencias</p>
          <a href="tel:911" class="cta" aria-label="Llamar al 911">911</a>
        </div>
        <div
          v-for="item in emergency.phones"
          :key="item.name"
          :class="['phone-card', `theme-${item.theme}`]"
        >
          <span class="phone-icon" aria-hidden="true"
            ><Icon :name="item.icon" :size="26"
          /></span>
          <p class="phone-name">{{ item.name }}</p>
          <a
            v-for="number in item.numbers"
            :key="number"
            :href="telHref(number)"
            class="cta"
            :aria-label="`Llamar a ${item.name}, ${number}`"
            >{{ number }}</a
          >
        </div>
      </div>
    </section>
  </div>
</template>
