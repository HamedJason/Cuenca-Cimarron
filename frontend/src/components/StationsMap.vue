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
        html: `<span class="map-pin${central ? " is-central" : ""}"></span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
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
