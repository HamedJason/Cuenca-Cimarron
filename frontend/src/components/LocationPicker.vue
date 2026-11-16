<script setup>
// Mapa para marcar dónde está la escuela. Un toque en el mapa mueve el punto.
import { ref, onMounted, onBeforeUnmount } from "vue";
const props = defineProps({ lat: Number, lng: Number, readonly: Boolean });
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
  if (marker) marker.setLatLng([lat, lng]);
  else marker = L.marker([lat, lng], { icon, alt: "Ubicación de la escuela" }).addTo(map);
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
  const start = props.lat && props.lng ? [props.lat, props.lng] : center;
  map = L.map(el.value, { scrollWheelZoom: false }).setView(start, props.lat ? 16 : 12);
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
onBeforeUnmount(() => map?.remove());
</script>
<template>
  <div class="location-picker">
    <div ref="el" class="location-picker-canvas" role="region" aria-label="Mapa para marcar la ubicación de la escuela"></div>
    <p v-if="failed" class="field-hint">No se pudo cargar el mapa. Puedes registrarte sin marcar la ubicación</p>
  </div>
</template>
