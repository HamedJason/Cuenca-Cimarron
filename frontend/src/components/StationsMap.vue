<script setup>
// Mapa de las estaciones de bomberos. Leaflet se carga solo cuando se abre la
// ventana, así el inicio no se vuelve más pesado.
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

const props = defineProps({
  stations: { type: Array, required: true },
  centralPhone: { type: String, required: true },
  mapHref: { type: Function, required: true },
});

const el = ref(null);
const ready = ref(false);
const failed = ref(false);
let L;
let map;
let layer;
let observer;

const tel = (number) => `tel:${number.replace(/\s/g, "")}`;
const escape = (text) =>
  String(text).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

function popup(item) {
  const phone = item.phone || props.centralPhone;
  const phoneLabel = item.phone ? phone : `Central ${phone}`;
  return `<div class="map-pop">
    <strong>${escape(item.name)}</strong>
    ${item.area ? `<span>${escape(item.area)}</span>` : ""}
    ${item.phone ? "" : '<small>Sin teléfono propio, llama a la Central</small>'}
    <a class="map-pop-call" href="${tel(phone)}">${escape(phoneLabel)}</a>
    <a class="map-pop-route" href="${props.mapHref(item)}" target="_blank" rel="noopener">Cómo llegar</a>
  </div>`;
}

// Dibujo de un camión de bomberos, con trazo café como el resto de las ilustraciones.
const pinIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.8 7.4h10.6M2.8 9h10.6M4.6 7.4V9M7 7.4V9M9.4 7.4V9M11.8 7.4V9" fill="none" stroke="#4a1500" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/><path d="M1.6 10h13v8.2h-13Z" fill="#e53935" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><path d="M14.6 11.2h4.3l3.5 3.8v3.2h-7.8Z" fill="#e53935" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><path d="M15.7 12.3h2.7l2.2 2.4h-4.9Z" fill="#bfe8ff" stroke="#4a1500" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/><path d="M16.1 11.2V9.8h1.8v1.4" fill="#ffc83d" stroke="#4a1500" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/><path d="M2.2 14.6h12M15 16.2h6.8" fill="none" stroke="#ffc83d" stroke-width="1.3" stroke-linecap="round"/><path d="M3.4 11.6h3.2v1.8H3.4ZM8.2 11.6h3.2v1.8H8.2Z" fill="#fff4e0" stroke="#4a1500" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/><circle cx="5.8" cy="18.4" r="2.3" fill="#3b2b26" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="5.8" cy="18.4" r=".8" fill="#fff"/><circle cx="18" cy="18.4" r="2.3" fill="#3b2b26" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="18" cy="18.4" r=".8" fill="#fff"/></svg>`;

function draw(fit) {
  if (!map) return;
  layer.clearLayers();
  const points = props.stations.filter((item) => item.lat);
  for (const item of points) {
    const central = item.id === "central";
    L.marker([item.lat, item.lng], {
      title: item.name,
      alt: item.name,
      icon: L.divIcon({
        className: "",
        html: `<span class="map-pin${central ? " is-central" : ""}">${pinIcon}</span>`,
        iconSize: [44, 52],
        iconAnchor: [22, 52],
        popupAnchor: [0, -48],
      }),
    })
      .bindPopup(popup(item))
      .addTo(layer);
  }
  if (fit) fitAll();
}

function fitAll() {
  const points = props.stations.filter((item) => item.lat);
  if (!points.length) return;
  map.fitBounds(
    points.map((item) => [item.lat, item.lng]),
    { padding: [24, 24], maxZoom: 14 },
  );
}

onMounted(async () => {
  try {
    const mod = await import("leaflet");
    await import("leaflet/dist/leaflet.css");
    L = mod.default;
  } catch {
    failed.value = true;
    return;
  }
  map = L.map(el.value, { scrollWheelZoom: false, zoomSnap: 0.25 });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);
  layer = L.layerGroup().addTo(map);
  draw(true);
  ready.value = true;
  // Mientras la ventana se acomoda al abrir, el mapa se vuelve a centrar en las estaciones.
  const openedAt = performance.now();
  observer = new ResizeObserver(() => {
    map.invalidateSize();
    if (performance.now() - openedAt < 1500) fitAll();
  });
  observer.observe(el.value);
  await nextTick();
  map.invalidateSize();
});

watch(
  () => props.stations,
  () => draw(true),
);

onBeforeUnmount(() => {
  observer?.disconnect();
  map?.remove();
});
</script>
<template>
  <div class="stations-map">
    <div ref="el" class="stations-map-canvas" role="region" aria-label="Mapa de estaciones de bomberos de Tijuana"></div>
    <p v-if="!ready && !failed" class="stations-map-note" role="status">Cargando el mapa…</p>
    <p v-if="failed" class="stations-map-note">No se pudo cargar el mapa. La lista de abajo tiene todas las estaciones</p>
  </div>
</template>
