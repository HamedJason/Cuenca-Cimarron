<script setup>
// Ventana con el mapa de una escuela: se centra en ella y abre su globo con el nombre.
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import Modal from "./Modal.vue";

const props = defineProps({ school: { type: Object, default: null } });
const emit = defineEmits(["close"]);
const mapEl = ref(null);
let map = null;

const escape = (text) => String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function draw() {
  const s = props.school;
  if (!s?.lat || !s?.lng) return;
  await nextTick();
  const L = (await import("leaflet")).default;
  await import("leaflet/dist/leaflet.css");
  map?.remove();
  map = L.map(mapEl.value, { scrollWheelZoom: true }).setView([s.lat, s.lng], 17);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);
  const icon = L.divIcon({ className: "", html: '<span class="school-pin is-selected" aria-hidden="true"></span>', iconSize: [40, 40], iconAnchor: [20, 20] });
  L.marker([s.lat, s.lng], { icon, title: s.name, alt: s.name })
    .addTo(map)
    .bindPopup(`<strong>${escape(s.name)}</strong><br>${escape(s.address)}${s.colonia ? `, ${escape(s.colonia)}` : ""}`, { autoPan: true })
    .openPopup();
  // El tamaño final de la ventana se conoce hasta que termina de abrirse
  setTimeout(() => {
    map?.invalidateSize();
    map?.setView([s.lat, s.lng], 17);
  }, 150);
}

watch(() => props.school, (value) => {
  if (value) draw();
  else {
    map?.remove();
    map = null;
  }
});
onBeforeUnmount(() => map?.remove());
</script>

<template>
  <Modal :open="Boolean(school)" :title="school?.name ?? ''" wide class="modal-map" @close="emit('close')">
    <p v-if="school" class="modal-intro">{{ school.address }}{{ school.colonia ? `, ${school.colonia}` : "" }}</p>
    <div ref="mapEl" class="school-map-canvas" role="region" :aria-label="`Mapa de ${school?.name ?? 'la escuela'}`"></div>
    <a
      v-if="school"
      class="text-link"
      :href="`https://www.openstreetmap.org/?mlat=${school.lat}&mlon=${school.lng}#map=17/${school.lat}/${school.lng}`"
      target="_blank"
      rel="noopener"
      >Abrir en OpenStreetMap</a
    >
  </Modal>
</template>
