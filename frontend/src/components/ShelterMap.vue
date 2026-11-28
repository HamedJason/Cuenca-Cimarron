<script setup>
// Mapa chico del refugio elegido en el inicio. Si el punto es del poblado o de la calle (aprox), lo dice. No se arrastra ni se acerca:
// todo el mapa es un enlace que abre "Cómo llegar" en Google Maps, así en el
// celular no atrapa el scroll de la página.
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  shelter: { type: Object, required: true },
  href: { type: String, required: true },
});

const el = ref(null);
const ready = ref(false);
const failed = ref(false);
let L;
let map;
let marker;
let observer;

// Casita con el mismo trazo café de las otras figuras del mapa.
const houseIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.2 12 3.6l9 7.6" fill="none" stroke="#4a1500" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M5.4 10v10h13.2V10L12 4.6Z" fill="#fff4e0" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round"/><path d="M10 20v-5.2h4V20" fill="#ffc83d" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round"/><path d="M12 9.2v3.4M10.3 10.9h3.4" stroke="#d7192d" stroke-width="1.6" stroke-linecap="round"/></svg>`;

function place() {
  if (!map || !props.shelter.lat) return;
  const point = [props.shelter.lat, props.shelter.lng];
  map.setView(point, 15, { animate: false });
  if (marker) {
    marker.setLatLng(point);
  } else {
    marker = L.marker(point, {
      interactive: false,
      keyboard: false,
      icon: L.divIcon({
        className: "",
        html: `<span class="map-pin is-shelter">${houseIcon}</span>`,
        iconSize: [44, 52],
        iconAnchor: [22, 52],
      }),
    }).addTo(map);
  }
}

// Leaflet se pide hasta que el mapa está por aparecer en pantalla, así el inicio carga igual de rápido.
let seen;
onMounted(() => {
  seen = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      seen.disconnect();
      start();
    },
    { rootMargin: "300px" },
  );
  seen.observe(el.value);
});

async function start() {
  try {
    const mod = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    L = mod.default;
  } catch {
    failed.value = true;
    return;
  }
  map = L.map(el.value, {
    dragging: false,
    touchZoom: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    zoomControl: false,
    attributionControl: true,
  });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap",
  }).addTo(map);
  place();
  ready.value = true;
  // El alto depende de la tarjeta de al lado: al cambiar, se vuelve a centrar.
  observer = new ResizeObserver(() => {
    map.invalidateSize();
    place();
  });
  observer.observe(el.value);
}

watch(() => props.shelter, place);

onBeforeUnmount(() => {
  seen?.disconnect();
  observer?.disconnect();
  map?.remove();
});
</script>
<template>
  <a
    class="shelter-map"
    :href="href"
    target="_blank"
    rel="noopener"
    :aria-label="`Mapa de ${shelter.name}, ${shelter.address}${shelter.aprox ? ', ubicación aproximada' : ''}. Abre Cómo llegar en Google Maps`"
  >
    <div ref="el" class="shelter-map-canvas" aria-hidden="true"></div>
    <span v-if="shelter.aprox" class="shelter-map-badge">Ubicación aproximada</span>
    <p v-if="!ready && !failed" class="shelter-map-note">Cargando el mapa…</p>
    <p v-if="failed" class="shelter-map-note">
      No se pudo cargar el mapa. Toca aquí para verlo en Google Maps
    </p>
  </a>
</template>
