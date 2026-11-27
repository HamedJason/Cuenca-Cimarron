<script setup>
import AnimClip from "../components/AnimClip.vue";
import Icon from "../components/Icon.vue";
import PointsTag from "../components/PointsTag.vue";
import { ref, computed, watch } from "vue";
import { RouterLink } from "vue-router";
import Modal from "../components/Modal.vue";
import StationsMap from "../components/StationsMap.vue";
import ShelterMap from "../components/ShelterMap.vue";
import MascotGuide from "../components/MascotGuide.vue";
import FollowSection from "../components/FollowSection.vue";
import { emergency, games, advice } from "../data";
import { esTijuana, estacionesDe, telefono, textos } from "../municipios";
import { municipioActual as muni } from "../composables/useMunicipio";
// Lo que cambia según el municipio elegido (useMunicipio). Sin elegir, es Tijuana.
// Refugios, mapa de riesgo y el aviso del gobierno son de Tijuana y solo salen ahí.
const tijuana = computed(() => esTijuana(muni.value));
const text = computed(() => textos(muni.value));
import { rand } from "../composables/useCanvasScene";
import { openLesson } from "../composables/useLesson";
import { useGamePlays } from "../composables/useGamePlays";
const { plays, loadPlays, registerPlay } = useGamePlays();
loadPlays();
import { useVisits } from "../composables/useVisits";
// Contador del propósito: sube de 0 a la cifra real una sola vez.
// App.vue registra la visita; aquí solo se lee la cifra.
const { stats, statsState } = useVisits();
const shownCount = ref(0);
const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
  document.documentElement.classList.contains("motion-off");
function countUp(target) {
  if (reduceMotion() || target < 10) {
    shownCount.value = target;
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / 1400, 1);
    shownCount.value = Math.round(target * (1 - (1 - t) ** 3));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
watch(
  () => stats.value?.unique_visitors,
  (value) => Number.isInteger(value) && countUp(value),
  { immediate: true },
);
// Compartir: menú del teléfono si existe; si no, se copia el enlace.
const shareState = ref("");
async function shareSite() {
  const data = {
    title: "Cuenca Cimarrona",
    text: text.value.compartir,
    url: window.location.origin,
  };
  try {
    if (navigator.share) {
      await navigator.share(data);
      return;
    }
    await navigator.clipboard.writeText(data.url);
    shareState.value = "Enlace copiado";
  } catch (error) {
    if (error?.name !== "AbortError") shareState.value = "No se pudo copiar";
  }
  setTimeout(() => (shareState.value = ""), 2600);
}
// Foto del equipo: cuando exista, poner aquí la ruta (por ejemplo /assets/images/equipo.webp).
const teamPhoto = ref("");
const telHref = (number) => `tel:${number.replace(/\s/g, "")}`;
// Protección Civil y Bomberos son del municipio. El 089 es nacional.
// Muchos son números de oficina: cada tarjeta dice de qué es y recuerda el 911.
// Si Protección Civil y Bomberos comparten oficina, sale una sola tarjeta.
const phones = computed(() =>
  emergency.phones
    .map((item) => {
      const key = { civil: "proteccionCivil", fire: "bomberos" }[item.theme];
      if (!key) return item;
      const found = telefono(muni.value, key);
      if (key === "bomberos" && found.conjunto) return null;
      const label = item.theme === "civil" ? "Protección Civil" : "Bomberos";
      const name = found.conjunto ? `${found.nombre} ${muni.value.nombre}` : tijuana.value ? item.name : `${label} ${muni.value.nombre}`;
      const note = found.falta ? found.aviso : `${found.tipo ?? "Oficina"}. En emergencia llama al 911`;
      return { ...item, name, numbers: found.numeros, missing: note };
    })
    .filter(Boolean),
);
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
// Refugios: se elige uno en la lista y se muestra su tarjeta, sin recorrer toda la lista.
// En Tijuana son los de Protección Civil (con mapa). En otros municipios, los que se usaron en
// octubre de 2026 (sin coordenadas: solo dirección y "Cómo llegar").
const CENAPRED_REFUGIOS = "https://preparados.gob.mx/apps/RefugiosTemporales/consulta.php";
const shelterList = computed(() => (tijuana.value ? emergency.shelters : (muni.value.refugios ?? [])));
const shelterIndex = ref(0);
watch(() => muni.value.id, () => (shelterIndex.value = 0));
const shelter = computed(() => shelterList.value[shelterIndex.value] ?? null);
const area = (address) => (address || "").split(",").pop().trim();
// El mapa de riesgo se abre en una ventana dentro del sitio.
const showMap = ref(false);
const mapLoaded = ref(false);
function openMap() {
  mapLoaded.value = false;
  showMap.value = true;
}
// Si el lugar trae su propio enlace de Google Maps se usa ese, si no se busca por nombre y dirección.
const mapHref = (shelter) =>
  shelter.mapUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [shelter.name, shelter.address, `${muni.value.sep}, B.C.`].filter(Boolean).join(", "),
  )}`;
// Ayuda cerca de ti: bomberos y polic\u00eda en una ventana con mapa, filtro y buscador.
// Con "Usar mi ubicaci\u00f3n" la lista se ordena de la m\u00e1s cercana a la m\u00e1s lejana;
// la ubicaci\u00f3n solo se usa en este navegador, no se guarda ni se env\u00eda.
// Solo las del municipio elegido (las que no traen city son de Tijuana)
const places = computed(() => [
  ...estacionesDe(muni.value, emergency.fireStations).map((item) => ({ ...item, kind: "fire" })),
  ...estacionesDe(muni.value, emergency.policeStations).map((item) => ({ ...item, kind: "police" })),
  ...estacionesDe(muni.value, emergency.redCrossStations).map((item) => ({ ...item, kind: "redcross" })),
]);
const kindLabel = { fire: "Bomberos", police: "Policía", redcross: "Cruz Roja" };
const kindIcon = { fire: "flame", police: "shield", redcross: "medical" };
// Sin teléfono propio: las estaciones de bomberos de Tijuana se atienden por la
// Central; lo demás (Rosarito y bases de Cruz Roja) se pide al 911.
const usesCentral = (item) => item.kind === "fire" && !item.city;
const placeKinds = [
  { id: "all", label: "Todo" },
  { id: "fire", label: "Bomberos", icon: "flame" },
  { id: "police", label: "Polic\u00eda", icon: "shield" },
  { id: "redcross", label: "Cruz Roja", icon: "medical" },
];
const showStations = ref(false);
const stationQuery = ref("");
const stationKind = ref("all");
const here = ref(null);
const locating = ref(false);
const locateError = ref("");
const plain = (text) =>
  (text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
// Distancia en l\u00ednea recta (km); por calle puede ser un poco m\u00e1s
function distanceKm(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}
const formatKm = (km) =>
  km < 1 ? `a ${Math.round(km * 10) * 100} m` : `a ${km.toFixed(1)} km`;
const stations = computed(() => {
  const query = plain(stationQuery.value.trim());
  let list = places.value.filter(
    (item) =>
      (stationKind.value === "all" || item.kind === stationKind.value) &&
      (!query || plain(`${item.name} ${item.area} ${item.address}`).includes(query)),
  );
  if (here.value) {
    list = list
      .map((item) => ({ ...item, km: item.lat ? distanceKm(here.value, item) : null }))
      .sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
  }
  return list;
});
const centralPhone = emergency.fireStations[0].phone;
// En municipios sin ubicaciones en el mapa solo se muestra la lista
const hasPoints = computed(() => stations.value.some((item) => item.lat));
function openStations(kind = "all") {
  stationQuery.value = "";
  stationKind.value = kind;
  showStations.value = true;
}
function locate() {
  locateError.value = "";
  if (!("geolocation" in navigator)) {
    locateError.value = "Este navegador no puede dar tu ubicaci\u00f3n. Busca por colonia";
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      here.value = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locating.value = false;
    },
    (err) => {
      locating.value = false;
      locateError.value =
        err.code === 1
          ? "No diste permiso para usar tu ubicaci\u00f3n. Puedes buscar por colonia"
          : "No pudimos saber d\u00f3nde est\u00e1s. Intenta de nuevo o busca por colonia";
    },
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
  );
}
const stationMapHref = (item) =>
  `https://www.google.com/maps/search/?api=1&query=${
    item.lat
      ? `${item.lat},${item.lng}`
      : encodeURIComponent(
          [item.address ? "" : item.name, item.address, item.area, `${item.city ?? "Tijuana"}, B.C.`].filter(Boolean).join(", "),
        )
  }`;
</script>
<template>
  <div class="home">
    <section class="purpose-hero cc-watermark" aria-labelledby="titulo-proposito">
      <div class="wrap purpose-row">
        <div class="purpose-text">
          <h1 id="titulo-proposito">{{ text.titulo }}</h1>
          <p class="purpose-lead">
            Información clara, juegos y un plan para que tu familia sepa qué hacer
            antes, durante y después de las lluvias
          </p>
          <ul class="purpose-ways" aria-label="Formas de aprender en el sitio">
            <li>
              <RouterLink to="/informacion"
                ><Icon name="book" :size="22" /> Lee lo esencial</RouterLink
              >
            </li>
            <li>
              <RouterLink to="/juegos"
                ><Icon name="gamepad" :size="22" /> Practica jugando</RouterLink
              >
            </li>
            <li>
              <button type="button" @click="openLesson('planfamiliar')"
                ><Icon name="check" :size="22" /> Arma tu plan</button
              >
            </li>
          </ul>
        </div>
        <div class="purpose-counter" aria-live="polite">
          <p v-if="statsState === 'ready'" class="counter-number">
            {{ shownCount.toLocaleString("es-MX") }}
          </p>
          <p v-else-if="statsState === 'loading'" class="counter-number is-loading">
            <span class="sr-only">Cargando el contador</span>
          </p>
          <p class="counter-label">
            {{
              statsState === "offline"
                ? "Súmate a la gente que ya se está preparando"
                : "personas ya se están preparando"
            }}
          </p>
          <p class="counter-note">Cada persona informada ayuda a su colonia</p>
          <button
            class="button counter-share"
            type="button"
            :aria-label="shareState || 'Invita a alguien'"
            @click="shareSite"
          >
            <Icon name="share" :size="20" />
            <span class="counter-share-text">{{
              shareState || "Invita a alguien"
            }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="band band-green" aria-labelledby="titulo-911">
      <div class="wrap hero-911">
        <div class="hero-911-text">
          <p class="hero-place">{{ text.lugar }}</p>
          <h2 id="titulo-911" class="hero-911-title">¿Es una emergencia?</h2>
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

    <section class="band band-fire" aria-labelledby="titulo-bomberos">
      <div class="wrap fire-row">
        <span class="fire-badge" aria-hidden="true"
          ><Icon name="flame" :size="40"
        /></span>
        <div class="fire-text">
          <h2 id="titulo-bomberos">¿Qué ayuda tienes cerca?</h2>
          <p v-if="places.length">
            Bomberos, policía y Cruz Roja de {{ muni.nombre }}: la más cercana a
            tu colonia, su teléfono y cómo llegar
          </p>
          <p v-else>
            Aún no tenemos las estaciones de {{ muni.nombre }}, en emergencia
            llama al <a href="tel:911">911</a>
          </p>
        </div>
        <button v-if="places.length" class="button primary cta" type="button" @click="openStations()">
          <Icon name="pin" :size="20" /> Ver ayuda cerca de ti
        </button>
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
        <div v-if="tijuana">
          <h2 id="titulo-alerta">
            Tijuana se está preparando para El Niño
          </h2>
          <p>
            Las lluvias más fuertes se esperan en diciembre y enero
          </p>
          <p>
            Aviso del gobierno de Tijuana, 5 de noviembre de 2026
          </p>
        </div>
        <div v-else>
          <h2 id="titulo-alerta">Prepárate para El Niño en {{ muni.nombre }}</h2>
          <p>Antes de salir revisa los avisos del clima</p>
        </div>
        <div class="alert-actions">
          <a
            v-if="tijuana"
            class="button dark cta"
            :href="emergency.notices[0].url"
            target="_blank"
            rel="noopener"
            >Ver avisos oficiales</a
          ><a
            :class="tijuana ? 'text-link on-gold' : 'button dark cta'"
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
        <PointsTag />
        <p class="tap-hint">
          Toca para llamar ·
          <RouterLink
            class="text-link inline-link"
            to="/directorio"
            >Ver todo el directorio</RouterLink
          >
        </p>
        <div class="phone-grid">
          <div
            v-for="item in phones"
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
            <small v-if="item.missing" class="muni-missing">{{ item.missing }}</small>
          </div>
        </div>
        <RouterLink class="kreyol-link" to="/migrantes?lang=ht" lang="ht"
          ><Icon name="people" :size="20" /> Enfòmasyon an kreyòl ayisyen
          <Icon name="arrow" :size="18"
        /></RouterLink>
      </section>

      <div :class="{ split: tijuana || muni.atlas }">
        <section class="shelters" aria-labelledby="titulo-refugios">
          <h2 id="titulo-refugios" class="section-title">
            Refugios temporales
          </h2>
          <p v-if="tijuana" class="section-note">
            Para entrar a un refugio, llama a tu delegación; si hay peligro, al
            911
          </p>
          <p v-else-if="shelterList.length" class="section-note">
            Se usaron como refugio en octubre de 2026. Antes de ir llama al
            <a href="tel:911">911</a> para saber si está abierto
          </p>
          <p v-else class="section-note">
            Aún no tenemos los refugios de {{ muni.nombre }}. Si tienes que salir
            de tu casa por la lluvia, llama al <a href="tel:911">911</a>
          </p>
          <div v-if="shelter" class="shelter-picker">
            <label for="refugio" class="field-label"
              >Elige uno de los {{ shelterList.length }} refugios</label
            >
            <div class="select-wrap">
              <select id="refugio" v-model="shelterIndex" class="select">
                <option
                  v-for="(item, i) in shelterList"
                  :key="item.name"
                  :value="i"
                >
                  {{ item.name }}{{ area(item.address) ? ` · ${area(item.address)}` : "" }}
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
                ><span>{{ shelter.address || "Dirección no publicada" }}</span></span
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
          <ShelterMap v-if="shelter?.lat" :shelter="shelter" :href="mapHref(shelter)" />
          <a
            v-if="tijuana"
            class="text-link"
            :href="emergency.sheltersUrl"
            target="_blank"
            rel="noopener"
            >Lista oficial de refugios</a
          >
          <a
            v-else-if="shelterList.length"
            class="text-link"
            :href="CENAPRED_REFUGIOS"
            target="_blank"
            rel="noopener"
            >Buscador de refugios de CENAPRED</a
          >
          <p v-if="!tijuana && !muni.atlas" class="section-note">
            Todavía no tenemos un mapa de riesgo de {{ muni.nombre }} que se pueda abrir en el celular
          </p>
        </section>

        <section v-if="tijuana" class="risk-card" aria-labelledby="titulo-riesgo">
          <AnimClip name="colonia-riesgo" class="risk-card-clip" />
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
        <section v-else-if="muni.atlas" class="risk-card" aria-labelledby="titulo-riesgo">
          <h2 id="titulo-riesgo">¿Tu colonia es zona de riesgo?</h2>
          <p>
            {{ muni.atlas.label
            }}<template v-if="muni.atlas.nota">. {{ muni.atlas.nota }}</template>
          </p>
          <a class="button primary cta" :href="muni.atlas.url" target="_blank" rel="noopener"
            ><Icon name="map" :size="20" /> Abrir el mapa de riesgo</a
          >
          <a v-if="muni.atlas.pdf" class="text-link" :href="muni.atlas.pdf" target="_blank" rel="noopener"
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
            <p class="section-lead">Pon a prueba lo que sabes</p>
          </div>
          <RouterLink to="/juegos" class="button secondary games-more-top"
            >Ver todos los juegos</RouterLink
          >
        </div>
        <div class="game-grid">
          <component
            :is="game.href ? 'a' : RouterLink"
            v-for="game in games.slice(0, 3)"
            :key="game.id"
            v-bind="
              game.href
                ? { href: game.href, target: '_blank', rel: 'noopener' }
                : { to: { path: '/juegos', query: { juego: game.id } } }
            "
            :class="['game-card', 'cc-watermark', `tone-${game.tone}`]"
            @click="game.href && registerPlay(game.id)"
            ><span class="game-card-art"
              ><img
                :src="game.image"
                :alt="game.alt"
                width="480"
                height="270"
                loading="lazy" /></span
            ><span class="game-card-body"
              ><span class="game-tag-row"
                ><span class="game-tag">{{ game.tag }}</span
                ><span
                  v-if="Number.isInteger(plays[game.id])"
                  class="game-views"
                  ><Icon name="eye" :size="16" />
                  <span aria-hidden="true">{{ plays[game.id].toLocaleString("es-MX") }}</span
                  ><span class="visually-hidden"
                    >{{ plays[game.id] }} entradas</span
                  ></span
                ></span
              ><strong>{{ game.title }}</strong
              ><PointsTag :activity-key="game.id" /><span>{{ game.short }}</span></span
            ></component
          >
        </div>
        <!-- En celular el botón va abajo de las tarjetas -->
        <RouterLink to="/juegos" class="button secondary games-more-bottom"
          >Ver todos los juegos</RouterLink
        >
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
        <div class="prep-grid">
          <button type="button" class="prep-card cc-watermark" @click="openLesson('conozca')"
            ><span class="prep-icon" aria-hidden="true"
              ><svg class="pi-wind" viewBox="0 0 48 48">
                <path d="M4 16h26c5 0 6-8 1-8" />
                <path d="M4 25h36" />
                <path d="M4 34h22c5 0 6 8 1 8" /></svg></span
            ><strong>Qué es El Niño</strong
            ><PointsTag activity-key="lectura-conozca" /><span>Y qué se espera en Tijuana</span></button
          >
          <button type="button" class="prep-card cc-watermark" @click="openLesson('planfamiliar')"
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
            ><PointsTag activity-key="lectura-planfamiliar" /><span>4 pasos para decidir qué hacer</span></button
          >
          <button type="button" class="prep-card cc-watermark" @click="openLesson('mochila')"
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
            ><PointsTag activity-key="lectura-mochila" /><span>12 cosas para tener listas</span></button
          >
        </div>
      </section>

      <section aria-labelledby="titulo-consejos">
        <div class="section-head">
          <div>
            <h2 id="titulo-consejos" class="section-title">
              Consejos para actuar mejor
            </h2>
          </div>
          <RouterLink to="/consejos" class="button secondary"
            >Ver todos los consejos</RouterLink
          >
        </div>
        <div class="advice-grid">
          <a
            v-for="item in advice"
            :key="item.id"
            :href="item.href"
            :class="['advice-card', 'has-strip', `tone-${item.tone}`]"
            ><AnimClip :name="`inicio-${item.id}`" :width="640" :height="130" class="advice-strip"
            /><strong>{{ item.title }}</strong
            ><span>{{ item.text }}</span></a
          >
        </div>
      </section>
      <FollowSection />

      <section class="team" aria-labelledby="titulo-equipo">
        <figure class="team-photo">
          <img
            v-if="teamPhoto"
            :src="teamPhoto"
            alt="Equipo de profesores y estudiantes de Cuenca Cimarrona"
            width="960"
            height="640"
            loading="lazy"
            @error="teamPhoto = ''"
          />
          <div v-else class="team-photo-empty">
            <Icon name="camera" :size="44" />
            <span>Aquí va la foto del equipo</span>
          </div>
        </figure>
        <div class="team-text">
          <span class="label">Quiénes somos</span>
          <h2 id="titulo-equipo" class="section-title">
            Nació en las aulas cimarronas
          </h2>
          <p>
            Cuenca Cimarrona es un proyecto de la UABC. Queremos que las
            {{ text.familias }} sepan qué hacer antes, durante y después de las
            lluvias. Todo es gratis
          </p>
          <h3>Cada quien aprende distinto</h3>
          <p>
            Por eso aquí puedes aprender de varias formas
          </p>
          <ul class="team-ways">
            <li>
              <span class="team-way-icon" aria-hidden="true"
                ><Icon name="book" :size="24" /></span
              ><span><strong>Leer</strong> guías cortas, con iconos</span>
            </li>
            <li>
              <span class="team-way-icon" aria-hidden="true"
                ><Icon name="gamepad" :size="24" /></span
              ><span><strong>Jugar</strong> retos para practicar decisiones</span>
            </li>
            <li>
              <span class="team-way-icon" aria-hidden="true"
                ><Icon name="people" :size="24" /></span
              ><span
                ><strong>Hacer</strong> un plan y una mochila en familia</span
              >
            </li>
          </ul>
        </div>
      </section>
    </div>
    <Modal
      :open="showStations"
      title="Ayuda cerca de ti"
      wide
      @close="showStations = false"
    >
      <p class="modal-intro">
        Si hay fuego, un delito o alguien está en peligro, llama primero al
        <a href="tel:911" class="station-911">911</a>. No vayas a buscar ayuda
        a una estación: la ayuda va hacia ti
      </p>
      <div class="place-tools">
        <div class="place-kinds" role="group" aria-label="Qué mostrar">
          <button
            v-for="kind in placeKinds"
            :key="kind.id"
            type="button"
            :class="['pill', 'place-kind', `kind-${kind.id}`, { on: stationKind === kind.id }]"
            :aria-pressed="stationKind === kind.id"
            @click="stationKind = kind.id"
          >
            <Icon v-if="kind.icon" :name="kind.icon" :size="18" /> {{ kind.label }}
          </button>
        </div>
        <button
          type="button"
          class="button secondary place-locate"
          :disabled="locating"
          @click="locate"
        >
          <Icon name="pin" :size="18" />
          {{ locating ? "Buscando dónde estás…" : here ? "Actualizar mi ubicación" : "Usar mi ubicación" }}
        </button>
      </div>
      <p v-if="locateError" class="station-empty" role="status">{{ locateError }}</p>
      <p v-else-if="here" class="station-map-hint" role="status">
        Primero sale la más cercana. Tu ubicación no se guarda ni se manda a
        nadie
      </p>
      <StationsMap
        v-if="showStations && hasPoints"
        :stations="stations"
        :central-phone="centralPhone"
        :map-href="stationMapHref"
        :here="here"
      />
      <p v-if="hasPoints" class="station-map-hint">Toca un punto para ver su teléfono y cómo llegar</p>
      <label for="buscar-estacion" class="field-label"
        >Busca por colonia, delegación o número de estación</label
      >
      <input
        id="buscar-estacion"
        v-model="stationQuery"
        class="station-search"
        type="search"
        :placeholder="tijuana ? 'Por ejemplo: La Mesa, Playas, Otay, 8' : 'Por ejemplo: Centro'"
        autocomplete="off"
      />
      <p v-if="!stations.length" class="station-empty" role="status">
        No encontramos esa colonia. Prueba con otra o llama al
        <a href="tel:911">911</a>
      </p>
      <ul class="station-list">
        <li
          v-for="item in stations"
          :key="item.id"
          :class="[
            'station-card',
            {
              'is-central': item.id === 'central',
              'is-police': item.kind === 'police',
              'is-redcross': item.kind === 'redcross',
            },
          ]"
        >
          <span class="station-icon" aria-hidden="true"
            ><Icon :name="kindIcon[item.kind]" :size="24"
          /></span>
          <span class="station-info"
            ><span v-if="item.id === 'central'" class="station-tag"
              >Base principal</span
            ><span class="station-kind">{{ kindLabel[item.kind]
            }}{{ item.city ? ` · ${item.city}` : "" }}</span
            ><strong>{{ item.name }}</strong
            ><span v-if="item.area">{{ item.area }}</span
            ><span v-if="item.address" class="station-address">{{
              item.address
            }}</span
            ><span v-if="item.km != null" class="station-distance">{{
              formatKm(item.km)
            }}</span></span
          >
          <span class="station-actions">
            <template v-if="item.phones">
              <a
                v-for="phone in item.phones"
                :key="phone"
                class="pill station-call"
                :href="telHref(phone)"
                :aria-label="`Llamar a ${item.name}, ${phone}`"
                ><Icon name="phone" :size="18" /> {{ phone }}</a
              >
            </template>
            <a
              v-else-if="item.phone"
              class="pill station-call"
              :href="telHref(item.phone)"
              :aria-label="`Llamar a ${item.name}, ${item.phone}`"
              ><Icon name="phone" :size="18" /> {{ item.phone }}</a
            >
            <span v-else-if="!usesCentral(item)" class="station-central-call"
              ><small>Sin teléfono propio publicado, pide ayuda al 911</small
              ><a
                class="pill station-call"
                href="tel:911"
                :aria-label="`Pedir ayuda al 911 para ${item.name}`"
                ><Icon name="phone" :size="18" /> 911</a
              ></span
            >
            <span v-else class="station-central-call"
              ><small>Sin teléfono propio, llama a la Central</small
              ><a
                class="pill station-call"
                :href="telHref(centralPhone)"
                :aria-label="`Llamar a la Central de Bomberos, ${centralPhone}`"
                ><Icon name="phone" :size="18" /> Central
                {{ centralPhone }}</a
              ></span
            >
            <a
              class="pill"
              :href="stationMapHref(item)"
              target="_blank"
              rel="noopener"
              :aria-label="`Cómo llegar a ${item.name}`"
              ><Icon name="route" :size="18" /> Cómo llegar</a
            >
          </span>
        </li>
      </ul>
      <div v-if="tijuana" class="note place-note">
        <Icon name="info" />
        <p>
          <strong>Casetas y módulos de policía:</strong> no aparecen aquí porque
          muchas no tienen personal todo el tiempo y puedes llegar y no encontrar
          a nadie. En una emergencia llama al 911. Las delegaciones de la lista
          son las sedes de la policía municipal en cada zona
        </p>
      </div>
      <div v-if="tijuana" class="note place-note">
        <Icon name="medical" />
        <p>
          <strong>Ambulancia de la Cruz Roja:</strong> pídela al 911, es gratis.
          La ambulancia sale de la base más cercana a ti. Además de las que ves
          en el mapa, la Cruz Roja Tijuana tiene bases en
          {{ emergency.redCrossBases }}, sin dirección publicada
        </p>
      </div>
      <div v-if="tijuana" class="place-links">
        <a
          class="text-link"
          :href="emergency.fireStationsUrl"
          target="_blank"
          rel="noopener"
          ><Icon name="external" :size="18" /> Directorio oficial de Bomberos Tijuana</a
        >
        <a
          class="text-link"
          :href="emergency.policeStationsUrl"
          target="_blank"
          rel="noopener"
          ><Icon name="external" :size="18" /> Delegaciones de la policía municipal</a
        >
        <a
          class="text-link"
          :href="emergency.redCrossUrl"
          target="_blank"
          rel="noopener"
          ><Icon name="external" :size="18" /> Bases de la Cruz Roja Tijuana (Zeta)</a
        >
      </div>
    </Modal>
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
