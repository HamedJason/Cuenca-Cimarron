<script setup>
import Icon from "../components/Icon.vue";
import { games, gameCredits, developers, designSupport } from "../data";

// Cada juego con sus creadores, en el mismo orden que la página de Juegos
const credited = games
  .filter((game) => gameCredits[game.id])
  .map((game) => ({ ...game, people: gameCredits[game.id] }));
const studentCount = new Set(
  credited
    .filter((game) => game.people !== developers)
    .flatMap((game) => game.people),
).size;
</script>
<template>
  <div class="page team-page">
    <header class="gm-hero team-hero">
      <div class="gm-hero-copy">
        <span class="gm-kicker"><Icon name="people" :size="20" /> Nosotros</span>
        <h1>Nuestro equipo</h1>
        <p>Las personas que hicieron esta página y cada uno de sus juegos</p>
        <ul class="gm-chips">
          <li><Icon name="gamepad" :size="18" /> {{ credited.length }} juegos</li>
          <li>
            <Icon name="people" :size="18" />
            {{ studentCount + developers.length + designSupport.length }} personas
          </li>
        </ul>
      </div>
      <ul class="team-hero-art" aria-hidden="true">
        <li v-for="game in credited" :key="game.id">
          <img :src="game.image" alt="" width="320" height="200" loading="lazy" />
        </li>
      </ul>
    </header>

    <section aria-labelledby="titulo-desarrollo" class="team-section">
      <div class="gm-section-head">
        <h2 id="titulo-desarrollo" class="section-title">Equipo de desarrollo</h2>
        <p class="section-lead">Hacen toda la página y el juego Misión Tijuana</p>
      </div>
      <ul class="team-people">
        <li v-for="name in developers" :key="name" class="team-person tone-green">
          <span class="team-avatar" aria-hidden="true"><Icon name="gamepad" :size="22" /></span>
          {{ name }}
        </li>
      </ul>
    </section>

    <section aria-labelledby="titulo-apoyo" class="team-section">
      <div class="gm-section-head">
        <h2 id="titulo-apoyo" class="section-title">Apoyo en diseño</h2>
        <p class="section-lead">Ayudaron con el diseño de la página</p>
      </div>
      <ul class="team-people">
        <li v-for="name in designSupport" :key="name" class="team-person tone-gold">
          <span class="team-avatar" aria-hidden="true"><Icon name="palette" :size="22" /></span>
          {{ name }}
        </li>
      </ul>
    </section>

    <section aria-labelledby="titulo-creadores" class="team-section">
      <div class="gm-section-head">
        <h2 id="titulo-creadores" class="section-title">Creadores de los juegos</h2>
        <p class="section-lead">Cada juego lo hizo un equipo de estudiantes</p>
      </div>
      <div class="team-games">
        <article
          v-for="(game, i) in credited"
          :key="game.id"
          :class="['team-game', `tone-${game.tone}`]"
          :style="{ '--i': i }"
        >
          <div class="team-game-art">
            <img :src="game.image" :alt="game.alt" width="640" height="400" loading="lazy" />
          </div>
          <div class="team-game-body">
            <span class="team-game-tag">{{ game.tag }}</span>
            <h3>{{ game.title }}</h3>
            <ul class="team-game-people">
              <li v-for="name in game.people" :key="name">
                <Icon name="check" :size="16" /> {{ name }}
              </li>
            </ul>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
<style scoped>
.team-hero-art {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.team-hero-art li {
  overflow: hidden;
  border: 3px solid var(--edge);
  border-radius: 14px;
  box-shadow: 0 4px 0 var(--shadow);
}
.team-hero-art li:nth-child(even) {
  transform: translateY(14px);
}
.team-hero-art img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
}
.team-section {
  margin-bottom: 44px;
}
.team-people {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.team-person {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: 3px solid var(--tone-strong);
  border-radius: var(--radius-card);
  background: var(--tone-bg);
  color: var(--tone-ink);
  box-shadow: 0 4px 0 var(--tone-edge);
  font-weight: 700;
  line-height: 1.25;
}
.team-avatar {
  display: grid;
  flex: none;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--tone-strong);
  color: #fff;
}
.team-games {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}
.team-game {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 3px solid var(--tone-strong);
  border-radius: var(--radius-block);
  background: var(--tone-bg);
  color: var(--tone-ink);
  box-shadow: 0 6px 0 var(--tone-edge);
  animation: gm-in 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) both;
  animation-delay: calc(var(--i) * 90ms);
}
.team-game-art img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.team-game-body {
  display: grid;
  gap: 8px;
  padding: 16px 18px 20px;
}
.team-game-tag {
  justify-self: start;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--tone-strong);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}
.team-game h3 {
  margin: 0;
  font-size: 24px;
  line-height: 1.1;
}
.team-game-people {
  display: grid;
  gap: 6px;
  margin: 4px 0 0;
  padding: 0;
  list-style: none;
}
.team-game-people li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--ink);
  line-height: 1.3;
}
.team-game-people :deep(svg) {
  flex: none;
  margin-top: 2px;
  color: var(--tone-strong);
}
:global(:root[data-theme="dark"]) .tone-blue .team-game-tag {
  color: #10213f;
}
.tone-gold .team-game-tag,
.tone-gold .team-avatar {
  /* Guinda oscuro fijo: en modo oscuro --title se vuelve claro y no se lee sobre el dorado */
  color: #611232;
}
@media (max-width: 900px) {
  .team-games {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .team-hero-art {
    max-width: 460px;
    justify-self: center;
  }
}
@media (max-width: 600px) {
  .team-games {
    grid-template-columns: 1fr;
  }
}
@media (prefers-reduced-motion: reduce) {
  .team-game {
    animation: none;
  }
}
</style>
