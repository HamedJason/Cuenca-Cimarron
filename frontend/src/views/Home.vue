<script setup>
import Icon from "../components/Icon.vue";
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import Modal from "../components/Modal.vue";
import MascotGuide from "../components/MascotGuide.vue";
import { emergency, games, advice } from "../data";
import { rand } from "../composables/useCanvasScene";
const telHref = (number) => `tel:${number.replace(/\s/g, "")}`;
const raindrops = Array.from({ length: 14 }, () => ({
  left: `${rand(45, 99).toFixed(1)}%`,
  delay: `${rand(0, 1.6).toFixed(2)}s`,
  duration: `${rand(1.1, 1.85).toFixed(2)}s`,
}));
const titleRain = Array.from({ length: 130 }, () => ({
  left: `${rand(-4, 100).toFixed(1)}%`,
  height: `${rand(12, 22).toFixed(0)}px`,
  delay: `${rand(-1.4, 0).toFixed(2)}s`,
  duration: `${rand(0.7, 1.1).toFixed(2)}s`,
  opacity: rand(0.7, 1).toFixed(2),
}));
// Refugios: se elige uno en la lista y se muestra su tarjeta, sin recorrer los siete.
const shelterIndex = ref(0);
const shelter = computed(() => emergency.shelters[shelterIndex.value]);
const area = (address) => address.split(",").pop().trim();
// El mapa de riesgo se abre en una ventana dentro del sitio.
const showMap = ref(false);
const mapLoaded = ref(false);
function openMap() {
  mapLoaded.value = false;
  showMap.value = true;
}
const mapHref = (shelter) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${shelter.name}, ${shelter.address}, Tijuana, B.C.`,
  )}`;
</script>
<template>
  <div class="home">
    <section class="band band-green" aria-labelledby="titulo-911">
      <div class="wrap hero-911">
        <div class="hero-911-text">
          <p class="hero-place">Tijuana, Baja California</p>
          <h1 id="titulo-911">¿Es una emergencia?</h1>
          <p class="hero-lead">
            Llama al 911: contestan policía, ambulancia y bomberos
          </p>
        </div>
        <a class="call-main cta" href="tel:911" aria-label="Llamar al 911"
          ><span class="call-ring" aria-hidden="true"
            ><Icon name="phone" :size="44" /></span
          ><span class="call-text"
            ><span class="call-label">Llamar al</span
            ><span class="call-number">911</span></span
          ></a
        >
      </div>
    </section>

    <section class="band band-gold" aria-labelledby="titulo-alerta">
      <div class="rain" aria-hidden="true">
        <span
          v-for="(drop, i) in raindrops"
          :key="i"
          :style="{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
          }"
        ></span>
      </div>
      <div class="wrap alert-row">
        <div>
          <h2 id="titulo-alerta">
            Tijuana está en emergencia preventiva por El Niño
          </h2>
          <p>
            Las lluvias más fuertes se esperan en diciembre y enero
          </p>
          <p>
            Declaratoria del Cabildo, 5 de noviembre de 2026
          </p>
        </div>
        <div class="alert-actions">
          <a
            class="button dark cta"
            :href="emergency.notices[0].url"
            target="_blank"
            rel="noopener"
            >Ver avisos oficiales</a
          ><a
            class="text-link on-gold"
            :href="emergency.notices[2].url"
            target="_blank"
            rel="noopener"
            >Avisos del clima (SMN)</a
          >
        </div>
      </div>
    </section>

    <div class="wrap home-body">
      <section aria-labelledby="titulo-numeros">
        <h2 id="titulo-numeros" class="section-title">Números de dependencias</h2>
        <p class="tap-hint">Toca para llamar</p>
        <div class="phone-grid">
          <div
            v-for="item in emergency.phones"
            :key="item.name"
            :class="['phone-card', `theme-${item.theme}`]"
          >
            <span v-if="item.theme === 'fire'" class="flames" aria-hidden="true"
              ><span></span><span></span><span></span
            ></span>
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

      <div class="split">
        <section class="shelters" aria-labelledby="titulo-refugios">
          <h2 id="titulo-refugios" class="section-title">
            Refugios temporales
          </h2>
          <p class="section-note">
            Para entrar a un refugio, llama a tu delegación; si hay peligro, al
            911
          </p>
          <div class="shelter-picker">
            <label for="refugio" class="field-label"
              >Elige uno de los {{ emergency.shelters.length }} refugios</label
            >
            <div class="select-wrap">
              <select id="refugio" v-model="shelterIndex" class="select">
                <option
                  v-for="(item, i) in emergency.shelters"
                  :key="item.name"
                  :value="i"
                >
                  {{ item.name }} · {{ area(item.address) }}
                </option>
              </select>
              <Icon name="chevron" :size="22" class="select-chevron" />
            </div>
            <div class="shelter-card" aria-live="polite">
              <span class="shelter-pin" aria-hidden="true"
                ><Icon name="pin" :size="26"
              /></span>
              <span class="shelter-info"
                ><strong>{{ shelter.name }}</strong
                ><span>{{ shelter.address }}</span></span
              >
              <a
                class="pill"
                :href="mapHref(shelter)"
                target="_blank"
                rel="noopener"
                :aria-label="`Cómo llegar a ${shelter.name}`"
                ><Icon name="route" :size="20" /> Cómo llegar</a
              >
            </div>
          </div>
          <a
            class="text-link"
            :href="emergency.sheltersUrl"
            target="_blank"
            rel="noopener"
            >Lista oficial de refugios</a
          >
        </section>

        <section class="risk-card" aria-labelledby="titulo-riesgo">
          <Icon name="pin" :size="44" />
          <h2 id="titulo-riesgo">¿Tu colonia es zona de riesgo?</h2>
          <p>Búscala en el mapa de inundaciones y deslaves del municipio</p>
          <button class="button primary cta" type="button" @click="openMap">
            <Icon name="map" :size="20" /> Abrir el mapa de riesgo
          </button>
          <a
            class="text-link"
            :href="emergency.riskAtlasPdf"
            target="_blank"
            rel="noopener"
            >Atlas completo en PDF</a
          >
        </section>
      </div>

      <section class="home-games" aria-labelledby="titulo-juegos">
        <div class="section-head has-mascot">
          <MascotGuide :size="150" bubble="¡Practica conmigo!" />
          <div class="section-head-text">
            <span class="label">Aprende jugando</span>
            <h2 id="titulo-juegos" class="section-title">Juegos y dinámicas</h2>
            <p class="section-lead">
              Practica rutas seguras, decisiones y tu mochila de emergencia
            </p>
          </div>
          <RouterLink to="/juegos" class="button secondary"
            >Ver todos los juegos</RouterLink
          >
        </div>
        <div class="game-grid">
          <component
            :is="game.href ? 'a' : RouterLink"
            v-for="game in games"
            :key="game.id"
            v-bind="
              game.href
                ? { href: game.href, target: '_blank', rel: 'noopener' }
                : { to: { path: '/juegos', query: { juego: game.id } } }
            "
            :class="['game-card', 'cc-watermark', `tone-${game.tone}`]"
            ><span class="game-card-art"
              ><img
                :src="game.image"
                :alt="game.alt"
                width="480"
                height="270"
                loading="lazy" /></span
            ><span class="game-card-body"
              ><span class="game-tag">{{ game.tag }}</span
              ><strong>{{ game.title }}</strong
              ><span>{{ game.short }}</span></span
            ></component
          >
        </div>
      </section>

      <section aria-labelledby="titulo-prepara">
        <div class="rain-title">
          <h2 id="titulo-prepara" class="section-title">
            Prepárate antes de que llueva
          </h2>
          <span class="rain-title-drops" aria-hidden="true"
            ><span
              v-for="(drop, i) in titleRain"
              :key="i"
              :style="{
                left: drop.left,
                height: drop.height,
                opacity: drop.opacity,
                animationDelay: drop.delay,
                animationDuration: drop.duration,
              }"
            ></span
          ></span>
        </div>
        <p class="section-lead">
          Lo esencial sobre El Niño, tu familia y lo que conviene tener listo
        </p>
        <div class="prep-grid">
          <RouterLink to="/el-nino" class="prep-card cc-watermark"
            ><span class="prep-icon" aria-hidden="true"
              ><svg class="pi-wind" viewBox="0 0 48 48">
                <path d="M4 16h26c5 0 6-8 1-8" />
                <path d="M4 25h36" />
                <path d="M4 34h22c5 0 6 8 1 8" /></svg></span
            ><strong>Qué es El Niño</strong
            ><span>Y qué se espera en Tijuana</span></RouterLink
          >
          <RouterLink to="/plan" class="prep-card cc-watermark"
            ><span class="prep-icon" aria-hidden="true"
              ><svg class="pi-fold" viewBox="0 0 48 48">
                <path class="pf-left" d="M4 9 17 6v33L4 42Z" />
                <path class="pf-mid" d="M17 6l14 3v33l-14-3Z" />
                <path class="pf-right" d="M31 9l13-3v33l-13 3Z" />
                <path
                  class="pf-route"
                  d="M10 30c6-8 10 4 17-6s10-2 13-8"
                /></svg></span
            ><strong>Plan familiar</strong
            ><span>4 pasos para decidir qué hacer</span></RouterLink
          >
          <RouterLink to="/mochila" class="prep-card cc-watermark"
            ><span class="prep-icon" aria-hidden="true"
              ><svg class="pi-pack" viewBox="0 0 48 48">
                <g class="pp-item">
                  <rect x="20" y="3" width="8" height="13" rx="2.5" />
                  <rect
                    class="pp-cap"
                    x="21.5"
                    y="0.5"
                    width="5"
                    height="3.5"
                    rx="1"
                  />
                </g>
                <path class="pp-handle" d="M19 12v-2a5 5 0 0 1 10 0v2" />
                <rect
                  class="pp-strap"
                  x="6.5"
                  y="24"
                  width="4"
                  height="14"
                  rx="2"
                />
                <rect
                  class="pp-strap"
                  x="37.5"
                  y="24"
                  width="4"
                  height="14"
                  rx="2"
                />
                <rect
                  class="pp-body"
                  x="10"
                  y="13"
                  width="28"
                  height="33"
                  rx="9"
                />
                <rect
                  class="pp-pocket"
                  x="15"
                  y="31"
                  width="18"
                  height="11"
                  rx="4"
                />
                <path class="pp-seam" d="M18 35h12" />
                <g class="pp-lid">
                  <path d="M10 24v-2a9 9 0 0 1 9-9h10a9 9 0 0 1 9 9v2Z" />
                  <rect
                    class="pp-buckle"
                    x="22"
                    y="20"
                    width="4"
                    height="8"
                    rx="1.5"
                  />
                </g></svg></span
            ><strong>Mochila de emergencia</strong
            ><span>12 cosas para tener listas</span></RouterLink
          >
        </div>
      </section>

      <section aria-labelledby="titulo-consejos">
        <div class="section-head">
          <div>
            <h2 id="titulo-consejos" class="section-title">
              Consejos para actuar mejor
            </h2>
            <p class="section-lead">
              Qué hacer antes, durante y después de la lluvia
            </p>
          </div>
          <a href="/pages/recursos.html" class="button secondary"
            >Ver todos los consejos</a
          >
        </div>
        <div class="advice-grid">
          <a
            v-for="item in advice"
            :key="item.id"
            :href="item.href"
            :class="['advice-card', `tone-${item.tone}`]"
            ><span class="advice-icon" aria-hidden="true"
              ><svg
                v-if="item.icon === 'umbrella'"
                class="advice-umbrella"
                viewBox="0 0 48 48"
              >
                <path
                  class="umbrella-canopy"
                  d="M5 23a19 19 0 0 1 38 0c-4-3-8-3-12 0-4-3-8-3-12 0-5-3-9-3-14 0Z"
                />
                <path class="umbrella-stem" d="M24 22v15c0 5 8 6 8 0" />
                <path class="drop-line rain-a" d="m12 30-2 5" />
                <path class="drop-line rain-b" d="m37 31-2 5" /></svg
              ><svg
                v-else-if="item.icon === 'storm'"
                class="advice-storm"
                viewBox="0 0 48 48"
              >
                <path
                  class="storm-cloud"
                  d="M11 27a8 8 0 0 1 1-16 12 12 0 0 1 23 4 7 7 0 0 1 2 13H11Z"
                />
                <path class="drop-line rain-a" d="m17 32-2 6" />
                <path class="drop-line rain-b" d="m26 32-2 8" />
                <path class="drop-line rain-c" d="m35 32-2 6" /></svg
              ><svg v-else class="advice-home" viewBox="0 0 48 48">
                <circle class="home-sun" cx="34" cy="13" r="5" />
                <path
                  class="home-rays"
                  d="M34 3v3m0 14v3m10-10h-3M27 13h-3m17-7-2 2m-10 10-2 2m14 0-2-2M28 8l-2-2"
                />
                <path
                  class="home-shape"
                  d="m7 23 17-14 17 14M12 20v21h24V20M20 41V28h9v13"
                /></svg></span
            ><strong>{{ item.title }}</strong
            ><span>{{ item.text }}</span></a
          >
        </div>
      </section>
    </div>
    <Modal
      :open="showMap"
      title="Mapa de riesgo de Tijuana"
      wide
      @close="showMap = false"
    >
      <div class="map-intro">
        <MascotGuide :size="88" eager />
        <p class="modal-intro">
          Atlas de Riesgos 2024 del IMPLAN. Busca tu colonia y acerca el mapa
        </p>
      </div>
      <div class="map-frame">
        <p v-if="!mapLoaded" class="map-loading" role="status">
          <Icon name="map" :size="28" /> Cargando el mapa…
        </p>
        <iframe
          v-if="showMap"
          :src="emergency.riskMapUrl"
          title="Atlas de Riesgos de Tijuana 2024"
          loading="lazy"
          allow="fullscreen; geolocation"
          @load="mapLoaded = true"
        ></iframe>
      </div>
      <a
        class="text-link"
        :href="emergency.riskMapUrl"
        target="_blank"
        rel="noopener"
        ><Icon name="external" :size="18" /> Abrir en otra pestaña</a
      >
    </Modal>
  </div>
</template>
