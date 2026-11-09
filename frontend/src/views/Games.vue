<script setup>
import { ref, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import MascotGuide from "../components/MascotGuide.vue";
import { games } from "../data";

const route = useRoute();
const router = useRouter();
const selected = ref(null);
const panel = ref(null);
const panelTitle = ref(null);

const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  document.documentElement.classList.contains("motion-off");

// Lleva a las instrucciones y pone el foco en su título (también para lector de pantalla).
function goToPanel() {
  nextTick(() => {
    panel.value?.scrollIntoView({
      behavior: reduceMotion() ? "auto" : "smooth",
      block: "start",
    });
    panelTitle.value?.focus({ preventScroll: true });
  });
}

function pick(id) {
  const same = selected.value?.id === id;
  selected.value = same ? null : games.find((g) => g.id === id) || null;
  router.replace({ query: selected.value ? { juego: selected.value.id } : {} });
  if (selected.value) goToPanel();
}

// Cierra las instrucciones y regresa a las tarjetas.
function backToList() {
  selected.value = null;
  router.replace({ query: {} });
  nextTick(() =>
    document.getElementById("titulo-dinamicas")?.scrollIntoView({
      behavior: reduceMotion() ? "auto" : "smooth",
      block: "start",
    }),
  );
}

// Si se llega desde una tarjeta del inicio, se abre esa dinámica.
watch(
  () => route.query.juego,
  (id) => {
    if (id && selected.value?.id !== id) {
      // Los juegos con enlace no tienen panel de pasos
      selected.value = games.find((g) => g.id === id && !g.href) || null;
      // Espera a que el router termine su propio scroll al inicio de la página.
      if (selected.value) setTimeout(goToPanel, 150);
    }
  },
  { immediate: true },
);
</script>
<template>
  <div class="page games-page">
    <header class="gm-hero">
      <div class="gm-hero-copy">
        <span class="gm-kicker"
          ><Icon name="gamepad" :size="20" /> Aprende jugando</span
        >
        <h1>Juegos y dinámicas</h1>
        <p>Practica con tu familia o tu grupo cómo actuar ante una tormenta</p>
        <ul class="gm-chips">
          <li><Icon name="game" :size="18" /> {{ games.length }} dinámicas</li>
          <li><Icon name="people" :size="18" /> En familia o en grupo</li>
        </ul>
      </div>

      <div class="gm-scene-wrap">
      <!-- La ruta segura se dibuja bajo la lluvia: de eso trata el primer juego -->
        <svg
          class="gm-scene"
          viewBox="0 0 520 300"
          role="img"
          aria-label="Ilustración: una ruta segura se dibuja entre cerros bajo la lluvia"
        >
          <g class="gm-cloud">
            <path
              d="M118 70a26 26 0 0 1 49-11 20 20 0 0 1 35 8 17 17 0 0 1 2 33h-82a16 16 0 0 1-4-30Z"
            />
            <g class="gm-rain">
              <path d="M138 112l-6 16" />
              <path d="M162 112l-6 16" />
              <path d="M186 112l-6 16" />
            </g>
          </g>
          <g class="gm-cloud gm-cloud-2">
            <path
              d="M352 42a20 20 0 0 1 38-8 15 15 0 0 1 27 6 13 13 0 0 1 1 25h-63a12 12 0 0 1-3-23Z"
            />
          </g>
          <path class="gm-hill gm-hill-back" d="M0 232c70-60 140-62 210-34s120 18 180-22 100-34 130-20v144H0Z" />
          <path class="gm-hill gm-hill-front" d="M0 262c60-26 120-30 190-10s150 14 210-8 90-14 120-6v62H0Z" />
          <path
            class="gm-route-base"
            d="M128 250C150 238 130 200 170 202s92 46 136 10 70-92 150-112"
          />
          <path
            class="gm-route"
            pathLength="100"
            d="M128 250C150 238 130 200 170 202s92 46 136 10 70-92 150-112"
          />
          <circle class="gm-stop gm-stop-1" cx="128" cy="250" r="9" />
          <circle class="gm-stop gm-stop-2" cx="170" cy="202" r="9" />
          <circle class="gm-stop gm-stop-3" cx="306" cy="212" r="9" />
          <g class="gm-pin" transform="translate(436 46)">
            <path d="M20 0C9 0 0 9 0 20c0 15 20 36 20 36s20-21 20-36C40 9 31 0 20 0Z" />
            <circle cx="20" cy="20" r="8" />
          </g>
          <!-- Fichas hexagonales: una por juego -->
          <g class="gm-token gm-token-1" transform="translate(250 40)">
            <path d="M26 0 52 15v30L26 60 0 45V15Z" />
            <svg x="12" y="16" width="28" height="28" viewBox="0 0 24 24" class="gm-token-icon">
              <path d="M5 19V7a3 3 0 1 1 6 0v10a3 3 0 0 0 6 0V5m-3 3 3-3 3 3" />
            </svg>
          </g>
          <g class="gm-token gm-token-2" transform="translate(150 96)">
            <path d="M22 0 44 13v25L22 51 0 38V13Z" />
            <svg x="10" y="13" width="24" height="24" viewBox="0 0 24 24" class="gm-token-icon">
              <path d="M12 3v18M12 5h7l2.5 2.5L19 10h-7M12 12H5l-2.5 2.5L5 17h7" />
            </svg>
          </g>
          <g class="gm-token gm-token-3" transform="translate(440 150)">
            <path d="M22 0 44 13v25L22 51 0 38V13Z" />
            <svg x="10" y="13" width="24" height="24" viewBox="0 0 24 24" class="gm-token-icon">
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M9 10h6" />
              <rect x="5" y="6" width="14" height="16" rx="5" />
            </svg>
          </g>
        </svg>
        <MascotGuide class="gm-hero-mascot" :size="170" eager />
      </div>
    </header>

    <section aria-labelledby="titulo-dinamicas" class="gm-section">
      <span class="cc-silhouette gm-bg-sil gm-bg-sil-1" aria-hidden="true"></span>
      <span class="cc-silhouette gm-bg-sil gm-bg-sil-2" aria-hidden="true"></span>
      <div class="gm-section-head">
        <h2 id="titulo-dinamicas" class="section-title">Elige una dinámica</h2>
        <p class="section-lead">Toca "Cómo se juega" para ver los pasos</p>
      </div>
      <div class="gm-grid">
        <article
          v-for="(game, i) in games"
          :key="game.id"
          :class="[
            'gm-card',
            'cc-watermark',
            `tone-${game.tone}`,
            { selected: selected?.id === game.id },
          ]"
          :style="{ '--i': i }"
        >
          <div class="gm-art">
            <img
              :src="game.image"
              :alt="game.alt"
              width="480"
              height="270"
              :loading="i === 0 ? 'eager' : 'lazy'"
            />
            <span class="gm-number" aria-hidden="true">{{ i + 1 }}</span>
            <span :class="['gm-badge', `gm-badge-${game.id}`]" aria-hidden="true"
              ><Icon :name="game.icon" :size="26"
            /></span>
          </div>
          <div class="gm-body">
            <span class="game-tag"
              ><Icon :name="game.icon" :size="16" /> {{ game.tag }}</span
            >
            <h3>{{ game.title }}</h3>
            <p>{{ game.text }}</p>
            <ul class="gm-meta">
              <li v-for="m in game.meta" :key="m.text">
                <Icon :name="m.icon" :size="18" /> {{ m.text }}
              </li>
            </ul>
            <a
              v-if="game.href"
              :href="game.href"
              target="_blank"
              rel="noopener"
              class="button primary gm-play cta"
            >
              <Icon name="gamepad" :size="22" /> Jugar ahora
              <span class="visually-hidden">(se abre en otra pestaña)</span>
            </a>
            <button
              v-else
              class="button primary gm-play cta"
              type="button"
              aria-controls="detalle-juego"
              :aria-expanded="selected?.id === game.id"
              @click="pick(game.id)"
            >
              <Icon :name="selected?.id === game.id ? 'close' : 'gamepad'" :size="22" />
              {{ selected?.id === game.id ? "Ocultar pasos" : "Cómo se juega" }}
            </button>
          </div>
        </article>
      </div>

      <Transition name="gm-panel">
        <aside
          v-if="selected"
          id="detalle-juego"
          ref="panel"
          :key="selected.id"
          :class="['gm-detail', `tone-${selected.tone}`]"
          aria-labelledby="titulo-detalle"
        >
          <div class="gm-detail-head">
            <span class="gm-detail-icon" aria-hidden="true"
              ><Icon :name="selected.icon" :size="34"
            /></span>
            <div>
              <span class="label">Cómo participar</span>
              <h2 id="titulo-detalle" ref="panelTitle" tabindex="-1">
                {{ selected.title }}
              </h2>
              <p>{{ selected.text }}</p>
            </div>
          </div>
          <div class="gm-detail-body">
          <MascotGuide class="gm-detail-mascot" :size="150" bubble="¡Así se juega!" eager />
          <ol class="gm-steps">
            <li
              v-for="(step, n) in selected.steps"
              :key="step"
              :style="{ '--n': n }"
            >
              <span class="gm-step-num" aria-hidden="true">{{ n + 1 }}</span>
              <span class="gm-step-icon" aria-hidden="true"
                ><Icon :name="selected.stepIcons[n]" :size="24"
              /></span>
              <span>{{ step }}</span>
            </li>
          </ol>
          </div>
          <button class="text-link gm-back" type="button" @click="backToList">
            <Icon name="arrow" :size="18" class="flip-x" /> Ver las otras dinámicas
          </button>
        </aside>
      </Transition>
    </section>
  </div>
</template>
