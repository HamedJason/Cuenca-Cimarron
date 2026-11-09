<script setup>
import Icon from "../components/Icon.vue";
import MascotGuide from "../components/MascotGuide.vue";
import { games } from "../data";
import { useGamePlays } from "../composables/useGamePlays";
const { plays, loadPlays, registerPlay } = useGamePlays();
loadPlays();
const playsLabel = (n) => `${n.toLocaleString("es-MX")} ${n === 1 ? "entrada" : "entradas"}`;
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
          <li><Icon name="game" :size="18" /> {{ games.length }} juegos</li>
          <li><Icon name="people" :size="18" /> En familia o en grupo</li>
        </ul>
      </div>

      <div class="gm-scene-wrap">
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
          <!-- Fichas hexagonales: una por juego (mapa, novela, cronómetro, concurso y mochila) -->
          <g class="gm-token gm-token-4" transform="translate(326 92)">
            <path d="M22 0 44 13v25L22 51 0 38V13Z" />
            <svg x="10" y="13" width="24" height="24" viewBox="0 0 24 24" class="gm-token-icon">
              <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2ZM9 3v16m6-14v16" />
            </svg>
          </g>
          <g class="gm-token gm-token-5" transform="translate(44 40)">
            <path d="M22 0 44 13v25L22 51 0 38V13Z" />
            <svg x="10" y="13" width="24" height="24" viewBox="0 0 24 24" class="gm-token-icon">
              <path d="M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2Zm0 0v16" />
            </svg>
          </g>
          <g class="gm-token gm-token-1" transform="translate(250 40)">
            <path d="M26 0 52 15v30L26 60 0 45V15Z" />
            <svg x="12" y="16" width="28" height="28" viewBox="0 0 24 24" class="gm-token-icon">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </g>
          <g class="gm-token gm-token-2" transform="translate(150 96)">
            <path d="M22 0 44 13v25L22 51 0 38V13Z" />
            <svg x="10" y="13" width="24" height="24" viewBox="0 0 24 24" class="gm-token-icon">
              <path d="M4 17h16l-2-4V8a6 6 0 0 0-12 0v5ZM9 21h6" />
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
        <h2 id="titulo-dinamicas" class="section-title">Elige un juego</h2>
        <p class="section-lead">Cada juego se abre en otra pestaña</p>
      </div>
      <div class="gm-grid">
        <article
          v-for="(game, i) in games"
          :key="game.id"
          :class="['gm-card', 'cc-watermark', `tone-${game.tone}`]"
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
            <div class="game-tag-row">
              <span class="game-tag"
                ><Icon :name="game.icon" :size="16" /> {{ game.tag }}</span
              >
              <span
                v-if="Number.isInteger(plays[game.id])"
                class="game-views"
                :title="playsLabel(plays[game.id])"
                ><Icon name="eye" :size="16" />
                <span aria-hidden="true">{{ plays[game.id].toLocaleString("es-MX") }}</span
                ><span class="visually-hidden">{{ playsLabel(plays[game.id]) }}</span></span
              >
            </div>
            <h3>{{ game.title }}</h3>
            <p>{{ game.text }}</p>
            <ul class="gm-meta">
              <li v-for="m in game.meta" :key="m.text">
                <Icon :name="m.icon" :size="18" /> {{ m.text }}
              </li>
            </ul>
            <a
              :href="game.href"
              target="_blank"
              rel="noopener"
              class="button primary gm-play cta"
              @click="registerPlay(game.id)"
            >
              <Icon name="gamepad" :size="22" /> Jugar ahora
              <span class="visually-hidden">(se abre en otra pestaña)</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
