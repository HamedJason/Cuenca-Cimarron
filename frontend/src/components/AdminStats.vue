<script setup>
// Estadísticas de la administración: escuelas en el mapa, alumnos por escuela y colonia
// y actividades más completadas. Solo cifras, sin nombres de alumnos.
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { api } from "../composables/api";
import { labelOf, levels } from "../composables/useAccount";

const data = ref(null);
const error = ref("");
const mapEl = ref(null);
let map;

const n = (value) => Number(value).toLocaleString("es-MX");
const tiles = computed(() =>
  data.value
    ? [
        { label: "Escuelas aprobadas", value: data.value.totals.schools },
        { label: "Docentes", value: data.value.totals.teachers },
        { label: "Grupos activos", value: data.value.totals.classrooms },
        { label: "Alumnos", value: data.value.totals.students },
        { label: "Actividades completadas", value: data.value.totals.completions },
        { label: "Puntos ganados", value: data.value.totals.points },
      ]
    : [],
);
const maxActivity = computed(() => Math.max(1, ...(data.value?.activities ?? []).map((a) => a.completions)));
const maxWeek = computed(() => Math.max(1, ...(data.value?.weeks ?? []).map((w) => w.completions)));
const weekLabel = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const escape = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

async function drawMap() {
  const points = data.value.schools.filter((s) => s.lat && s.lng);
  if (!points.length || !mapEl.value) return;
  const L = (await import("leaflet")).default;
  await import("leaflet/dist/leaflet.css");
  map = L.map(mapEl.value, { scrollWheelZoom: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);
  const icon = L.divIcon({ className: "", html: '<span class="school-pin" aria-hidden="true"></span>', iconSize: [30, 30], iconAnchor: [15, 15] });
  for (const s of points) {
    L.marker([s.lat, s.lng], { icon, title: s.name, alt: s.name })
      .bindPopup(`<strong>${escape(s.name)}</strong><br>${escape(s.colonia)}<br>${n(s.students)} alumnos · ${n(s.completions)} actividades`)
      .addTo(map);
  }
  map.fitBounds(points.map((s) => [s.lat, s.lng]), { padding: [30, 30], maxZoom: 14 });
}

onMounted(async () => {
  try {
    data.value = await api("/admin/estadisticas");
    await nextTick();
    drawMap().catch(() => {});
  } catch (e) {
    error.value = e.message;
  }
});
onBeforeUnmount(() => map?.remove());
</script>
<template>
  <p v-if="error" class="form-card form-alert is-error" role="alert">{{ error }}</p>
  <p v-else-if="!data" class="form-card" role="status">Cargando…</p>
  <template v-else>
    <section class="form-card">
      <h2 class="form-title">Resumen</h2>
      <div class="stat-tiles">
        <div v-for="tile in tiles" :key="tile.label" class="stat-tile">
          <strong>{{ n(tile.value) }}</strong>
          <span>{{ tile.label }}</span>
        </div>
      </div>
      <p v-if="data.totals.pending_schools" class="small muted-text">{{ data.totals.pending_schools }} escuelas esperan revisión</p>
    </section>

    <section class="form-card">
      <h2 class="form-title">Escuelas en el mapa</h2>
      <div v-if="data.schools.some((s) => s.lat)" ref="mapEl" class="location-picker-canvas stats-map" role="region" aria-label="Mapa de escuelas participantes"></div>
      <p v-else class="muted-text">Ninguna escuela aprobada marcó su ubicación</p>
    </section>

    <section class="form-card">
      <h2 class="form-title">Actividades más completadas</h2>
      <ul class="bar-list">
        <li v-for="item in data.activities" :key="item.key" :title="`${item.title}: ${n(item.completions)}`">
          <span class="bar-label">{{ item.title }}</span>
          <span class="bar-track"><span class="bar-fill" :style="{ width: `${(item.completions / maxActivity) * 100}%` }"></span></span>
          <span class="bar-value">{{ n(item.completions) }}</span>
        </li>
      </ul>
    </section>

    <section class="form-card">
      <h2 class="form-title">Actividades completadas por semana</h2>
      <div class="week-chart" role="img" :aria-label="`Últimas 8 semanas: ${data.weeks.map((w) => `${weekLabel(w.week)} ${w.completions}`).join(', ')}`">
        <div v-for="w in data.weeks" :key="w.week" class="week-col" :title="`Semana del ${weekLabel(w.week)}: ${n(w.completions)}`">
          <span class="week-value">{{ n(w.completions) }}</span>
          <span class="week-bar" :style="{ height: `${Math.max(2, (w.completions / maxWeek) * 75)}%` }"></span>
          <span class="week-label">{{ weekLabel(w.week) }}</span>
        </div>
      </div>
    </section>

    <section class="form-card">
      <h2 class="form-title">Por colonia</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Colonia</th><th class="num">Escuelas</th><th class="num">Alumnos</th></tr></thead>
          <tbody>
            <tr v-for="row in data.colonias" :key="row.colonia"><td>{{ row.colonia }}</td><td class="num">{{ n(row.schools) }}</td><td class="num">{{ n(row.students) }}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="form-card">
      <h2 class="form-title">Por escuela</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Escuela</th><th>Nivel</th><th>Colonia</th><th class="num">Alumnos</th><th class="num">Actividades</th></tr></thead>
          <tbody>
            <tr v-for="s in data.schools" :key="s.id">
              <td>{{ s.name }}</td><td>{{ labelOf(levels, s.level) }}</td><td>{{ s.colonia }}</td><td class="num">{{ n(s.students) }}</td><td class="num">{{ n(s.completions) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </template>
</template>
