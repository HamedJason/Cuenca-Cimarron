<script setup>
// Mapa para marcar dónde está la escuela. Un toque en el mapa, arrastrar el punto o tocar una de las
// escuelas cercanas lo mueve. Tiene vista de satélite para reconocer la escuela desde arriba.
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
// near: [lat, lng, zoom] para acercar el mapa. nearby: escuelas cercanas [{ lat, lng, name }] que se pueden tocar
const props = defineProps({
  lat: Number,
  lng: Number,
  readonly: Boolean,
  near: { type: Array, default: null },
  nearby: { type: Array, default: () => [] },
});
const emit = defineEmits(["update", "pick"]);
const el = ref(null);
const failed = ref(false);
let map;
let marker;
let others;
let L;
const center = [32.5027, -117.0037];

function place(lat, lng) {
  const icon = L.divIcon({
    className: "",
    html: '<span class="school-pin" aria-hidden="true"></span>',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
  if (marker) {
    marker.setLatLng([lat, lng]);
    return;
  }
  marker = L.marker([lat, lng], { icon, alt: "Ubicación de la escuela", draggable: !props.readonly, zIndexOffset: 1000 }).addTo(map);
  // El punto también se puede arrastrar a la entrada
  marker.on("dragend", () => {
    const point = marker.getLatLng();
    emit("update", { lat: Number(point.lat.toFixed(6)), lng: Number(point.lng.toFixed(6)) });
  });
}

// Escuelas cercanas: puntos chicos con su nombre. Tocar una pone ahí el punto de la escuela
function drawNearby(list) {
  if (!map) return;
  others?.remove();
  others = L.layerGroup().addTo(map);
  for (const school of list) {
    const dot = L.marker([school.lat, school.lng], {
      icon: L.divIcon({ className: "", html: '<span class="school-dot" aria-hidden="true"></span>', iconSize: [22, 22], iconAnchor: [11, 11] }),
      alt: school.name,
      title: school.name,
      keyboard: !props.readonly,
    });
    dot.bindTooltip(school.name, { direction: "top", offset: [0, -10] });
    if (!props.readonly) {
      dot.on("click", () => {
        place(school.lat, school.lng);
        emit("pick", school);
      });
    }
    dot.addTo(others);
  }
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
  // Si la dirección se encontró antes de que cargara el mapa, se empieza ahí
  const near = !props.lat && props.near;
  const start = props.lat && props.lng ? [props.lat, props.lng] : near ? near.slice(0, 2) : center;
  map = L.map(el.value, { scrollWheelZoom: false }).setView(start, props.lat ? 16 : near ? (near[2] ?? 15) : 12);
  const streets = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);
  // Foto aérea de Esri con los nombres de las calles encima
  const esri = "https://server.arcgisonline.com/ArcGIS/rest/services";
  const satellite = L.layerGroup([
    L.tileLayer(`${esri}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 19, attribution: "Imágenes &copy; Esri" }),
    L.tileLayer(`${esri}/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 19 }),
  ]);
  L.control.layers({ Mapa: streets, "Satélite": satellite }, null, { collapsed: false, position: "topright" }).addTo(map);
  if (props.lat && props.lng) place(props.lat, props.lng);
  drawNearby(props.nearby);
  if (!props.readonly) {
    map.on("click", (event) => {
      const lat = Number(event.latlng.lat.toFixed(6));
      const lng = Number(event.latlng.lng.toFixed(6));
      place(lat, lng);
      emit("update", { lat, lng });
    });
  }
});
// Si la ubicación cambia desde fuera (por ejemplo al elegir una escuela del catálogo), el punto se mueve solo
watch(
  () => [props.lat, props.lng],
  ([lat, lng]) => {
    if (!map) return;
    if (!lat || !lng) {
      marker?.remove();
      marker = null;
      return;
    }
    const moved = !marker || marker.getLatLng().distanceTo([lat, lng]) > 1;
    place(lat, lng);
    if (moved) map.setView([lat, lng], Math.max(map.getZoom(), 16));
  },
);
watch(
  () => props.near,
  (point) => {
    if (map && point && !props.lat) map.setView(point.slice(0, 2), point[2] ?? 15);
  },
);
watch(() => props.nearby, drawNearby);
onBeforeUnmount(() => map?.remove());
</script>
<template>
  <div class="location-picker">
    <div ref="el" class="location-picker-canvas" role="region" aria-label="Mapa para marcar la ubicación de la escuela"></div>
    <p v-if="failed" class="field-hint">No se pudo cargar el mapa. Recarga la página para marcar la ubicación</p>
  </div>
</template>
