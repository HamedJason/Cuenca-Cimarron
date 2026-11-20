<script setup>
// Mapa para marcar dónde está la escuela. Un toque en el mapa o arrastrar el punto lo mueve.
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
// near: [lat, lng, zoom] aproximado (la calle o la colonia) para acercar el mapa cuando todavía no hay ubicación
const props = defineProps({ lat: Number, lng: Number, readonly: Boolean, near: { type: Array, default: null } });
const emit = defineEmits(["update"]);
const el = ref(null);
const failed = ref(false);
let map;
let marker;
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
  marker = L.marker([lat, lng], { icon, alt: "Ubicación de la escuela", draggable: !props.readonly }).addTo(map);
  // El punto también se puede arrastrar a la entrada
  marker.on("dragend", () => {
    const point = marker.getLatLng();
    emit("update", { lat: Number(point.lat.toFixed(6)), lng: Number(point.lng.toFixed(6)) });
  });
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
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);
  if (props.lat && props.lng) place(props.lat, props.lng);
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
    // Se quitó el punto (por ejemplo uno automático que ya no corresponde a la dirección)
    if (!lat || !lng) {
      marker?.remove();
      marker = null;
      return;
    }
    place(lat, lng);
    map.setView([lat, lng], 16);
  },
);
watch(
  () => props.near,
  (point) => {
    if (map && point && !props.lat) map.setView(point.slice(0, 2), point[2] ?? 15);
  },
);
onBeforeUnmount(() => map?.remove());
</script>
<template>
  <div class="location-picker">
    <div ref="el" class="location-picker-canvas" role="region" aria-label="Mapa para marcar la ubicación de la escuela"></div>
    <p v-if="failed" class="field-hint">No se pudo cargar el mapa. Puedes registrarte sin marcar la ubicación</p>
  </div>
</template>
