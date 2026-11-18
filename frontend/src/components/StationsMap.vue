<script setup>
// Mapa de las estaciones de bomberos. Leaflet se carga solo cuando se abre la
// ventana, así el inicio no se vuelve más pesado.
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from "vue";

const props = defineProps({
  stations: { type: Array, required: true },
  centralPhone: { type: String, required: true },
  mapHref: { type: Function, required: true },
  // Dónde está la persona (solo si tocó "Usar mi ubicación")
  here: { type: Object, default: null },
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

const kindLabel = { fire: "Bomberos", police: "Policía", redcross: "Cruz Roja" };

function popup(item) {
  const police = item.kind === "police";
  const redcross = item.kind === "redcross";
  // Sin teléfono propio: bomberos de Tijuana → la Central; lo demás → 911
  const central = item.kind === "fire" && !item.city;
  const calls = item.phones
    ? item.phones.map((phone) => `<a class="map-pop-call" href="${tel(phone)}">${escape(phone)}</a>`).join("")
    : item.phone
      ? `<a class="map-pop-call" href="${tel(item.phone)}">${escape(item.phone)}</a>`
      : central
        ? `<small>Sin teléfono propio, llama a la Central</small><a class="map-pop-call" href="${tel(props.centralPhone)}">Central ${escape(props.centralPhone)}</a>`
        : `<small>Sin teléfono propio publicado</small><a class="map-pop-call" href="tel:911">911</a>`;
  return `<div class="map-pop${police ? " is-police" : ""}${redcross ? " is-redcross" : ""}">
    <small class="map-pop-kind">${kindLabel[item.kind]}${item.city ? ` · ${escape(item.city)}` : ""}</small>
    <strong>${escape(item.name)}</strong>
    ${item.area ? `<span>${escape(item.area)}</span>` : ""}
    ${calls}
    <a class="map-pop-route" href="${props.mapHref(item)}" target="_blank" rel="noopener">Cómo llegar</a>
  </div>`;
}

// Escudo de policía, con el mismo trazo café de las ilustraciones.
const policeIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2 4.2 5.4v5.4c0 5 3.3 9.2 7.8 11 4.5-1.8 7.8-6 7.8-11V5.4Z" fill="#1e5fbf" stroke="#0b2f75" stroke-width="1.3" stroke-linejoin="round"/><path d="m12 7 1.5 3 3.3.5-2.4 2.3.6 3.3-3-1.6-3 1.6.6-3.3-2.4-2.3 3.3-.5Z" fill="#ffc83d" stroke="#0b2f75" stroke-width="1" stroke-linejoin="round"/></svg>`;

// Cruz roja sobre fondo blanco, con el mismo trazo de las otras figuras.
const redCrossIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3.5h6v5.5h5.5v6H15v5.5H9V15H3.5V9H9Z" fill="#d7192d" stroke="#6e0d17" stroke-width="1.3" stroke-linejoin="round"/></svg>`;

// Dibujo de un camión de bomberos, con trazo café como el resto de las ilustraciones.
const pinIcon = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.8 7.4h10.6M2.8 9h10.6M4.6 7.4V9M7 7.4V9M9.4 7.4V9M11.8 7.4V9" fill="none" stroke="#4a1500" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/><path d="M1.6 10h13v8.2h-13Z" fill="#e53935" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><path d="M14.6 11.2h4.3l3.5 3.8v3.2h-7.8Z" fill="#e53935" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><path d="M15.7 12.3h2.7l2.2 2.4h-4.9Z" fill="#bfe8ff" stroke="#4a1500" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/><path d="M16.1 11.2V9.8h1.8v1.4" fill="#ffc83d" stroke="#4a1500" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/><path d="M2.2 14.6h12M15 16.2h6.8" fill="none" stroke="#ffc83d" stroke-width="1.3" stroke-linecap="round"/><path d="M3.4 11.6h3.2v1.8H3.4ZM8.2 11.6h3.2v1.8H8.2Z" fill="#fff4e0" stroke="#4a1500" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"/><circle cx="5.8" cy="18.4" r="2.3" fill="#3b2b26" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="5.8" cy="18.4" r=".8" fill="#fff"/><circle cx="18" cy="18.4" r="2.3" fill="#3b2b26" stroke="#4a1500" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="18" cy="18.4" r=".8" fill="#fff"/></svg>`;

function draw(fit) {
  if (!map) return;
  layer.clearLayers();
  const points = props.stations.filter((item) => item.lat);
  for (const item of points) {
    const central = item.id === "central";
    const police = item.kind === "police";
    const redcross = item.kind === "redcross";
    L.marker([item.lat, item.lng], {
      title: item.name,
      alt: item.name,
      icon: L.divIcon({
        className: "",
        html: `<span class="map-pin${central ? " is-central" : ""}${police ? " is-police" : ""}${redcross ? " is-redcross" : ""}">${police ? policeIcon : redcross ? redCrossIcon : pinIcon}</span>`,
        iconSize: [44, 52],
        iconAnchor: [22, 52],
        popupAnchor: [0, -48],
      }),
    })
      .bindPopup(popup(item))
      .addTo(layer);
  }
  if (props.here) {
    L.marker([props.here.lat, props.here.lng], {
      title: "Estás aquí",
      alt: "Estás aquí",
      zIndexOffset: 1000,
      icon: L.divIcon({
        className: "",
        html: '<span class="map-here"><span class="sr-only">Estás aquí</span></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    })
      .bindPopup('<div class="map-pop"><strong>Estás aquí</strong></div>')
      .addTo(layer);
  }
  if (fit) fitAll();
}

// Con tu ubicación: se acerca a ti y a los tres lugares más cercanos (la lista ya viene ordenada).
// Sin ella: muestra todos los puntos.
function fitAll() {
  const points = props.stations.filter((item) => item.lat);
  const focus = props.here
    ? [props.here, ...points.slice(0, 3)]
    : points;
  if (!focus.length) return;
  map.fitBounds(
    focus.map((item) => [item.lat, item.lng]),
    { padding: [32, 32], maxZoom: props.here ? 15 : 14 },
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
  () => [props.stations, props.here],
  () => draw(true),
);

onBeforeUnmount(() => {
  observer?.disconnect();
  map?.remove();
});
</script>
<template>
  <div class="stations-map">
    <div ref="el" class="stations-map-canvas" role="region" aria-label="Mapa de bomberos, policía y Cruz Roja de Tijuana y Rosarito"></div>
    <p v-if="!ready && !failed" class="stations-map-note" role="status">Cargando el mapa…</p>
    <p v-if="failed" class="stations-map-note">No se pudo cargar el mapa. La lista de abajo tiene todos los lugares</p>
  </div>
</template>
