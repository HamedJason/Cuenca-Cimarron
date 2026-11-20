<script setup>
// Panel de datos: escuelas, docentes y alumnos registrados, por municipio, colonia y nivel,
// con el crecimiento de las últimas semanas. Solo cifras, sin nombres de alumnos.
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import Icon from "./Icon.vue";
import { api } from "../composables/api";
import { labelOf, levels, sectors } from "../composables/useAccount";

const data = ref(null);
// Desde dónde nos visitan: zona aproximada que manda el navegador, sin coordenadas
const zones = ref(null);
const error = ref("");
const mapEl = ref(null);
let map;

const n = (value) => Number(value ?? 0).toLocaleString("es-MX");
const tiles = computed(() => {
  const t = data.value?.totals;
  if (!t) return [];
  return [
    { label: "Escuelas registradas", value: t.schools, note: t.suspended_schools ? `${n(t.suspended_schools)} suspendidas` : "" },
    { label: "Docentes", value: t.teachers },
    { label: "Grupos activos", value: t.classrooms },
    { label: "Alumnos registrados", value: t.students },
    { label: "Alumnos activos esta semana", value: t.active_students },
    { label: "Actividades completadas", value: t.completions },
    { label: "Cimacoins ganadas", value: t.coins_earned },
  ];
});

// Rankings de una sola serie: barras horizontales con el número al final.
const zoneMetric = ref("students");
const zoneMetrics = [
  { id: "students", label: "Alumnos" },
  { id: "schools", label: "Escuelas" },
  { id: "teachers", label: "Docentes" },
];
const topColonias = computed(() =>
  [...(data.value?.colonias ?? [])].sort((a, b) => b[zoneMetric.value] - a[zoneMetric.value] || b.schools - a.schools).slice(0, 10),
);
const maxOf = (rows, key) => Math.max(1, ...rows.map((r) => r[key]));
const levelName = (value) => (value === "Sin dato" ? value : labelOf(levels, value));
const sectorName = (value) => (value === "Sin dato" ? value : labelOf(sectors, value));

const weekMetric = ref("students");
const weekMetrics = [
  { id: "students", label: "Alumnos nuevos" },
  { id: "schools", label: "Escuelas nuevas" },
  { id: "completions", label: "Actividades completadas" },
];
const maxWeek = computed(() => maxOf(data.value?.weeks ?? [], weekMetric.value));
const weekLabel = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const maxActivity = computed(() => maxOf(data.value?.activities ?? [], "completions"));

const sortKey = ref("students");
const schoolRows = computed(() => [...(data.value?.schools ?? [])].sort((a, b) => (sortKey.value === "name" ? a.name.localeCompare(b.name, "es") : b[sortKey.value] - a[sortKey.value])));

// Descarga de la tabla de escuelas en CSV, armada en el navegador.
function downloadCsv() {
  const head = ["Escuela", "CCT", "Municipio", "Colonia", "Nivel", "Tipo", "Docentes", "Grupos", "Alumnos", "Actividades completadas"];
  const cell = (v) => {
    const text = String(v ?? "");
    const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const rows = schoolRows.value.map((s) => [s.name, s.cct, s.municipality, s.colonia, levelName(s.level), sectorName(s.sector), s.teachers, s.classrooms, s.students, s.completions]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `escuelas-cuenca-cimarrona-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

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
      .bindPopup(`<strong>${escape(s.name)}</strong><br>${escape(s.colonia)}, ${escape(s.municipality)}<br>${n(s.teachers)} docentes · ${n(s.students)} alumnos`)
      .addTo(map);
  }
  map.fitBounds(points.map((s) => [s.lat, s.lng]), { padding: [30, 30], maxZoom: 14 });
}

async function load() {
  error.value = "";
  try {
    data.value = await api("/admin/estadisticas");
    zones.value = await api("/admin/zonas").catch(() => null);
    await nextTick();
    map?.remove();
    map = null;
    drawMap().catch(() => {});
  } catch (e) {
    error.value = e.message;
  }
}
onMounted(load);
onBeforeUnmount(() => map?.remove());
</script>
<template>
  <p v-if="error" class="form-card form-alert is-error" role="alert">{{ error }}</p>
  <p v-else-if="!data" class="form-card" role="status">Cargando…</p>
  <template v-else>
    <section class="form-card" role="tabpanel">
      <div class="panel-head">
        <h2 class="form-title">Resumen</h2>
        <button class="button secondary small-button" type="button" @click="load"><Icon name="reset" :size="18" />Actualizar</button>
      </div>
      <div class="stat-tiles">
        <div v-for="tile in tiles" :key="tile.label" class="stat-tile">
          <strong>{{ n(tile.value) }}</strong>
          <span>{{ tile.label }}</span>
          <small v-if="tile.note">{{ tile.note }}</small>
        </div>
      </div>
    </section>

    <section class="form-card">
      <h2 class="form-title">Por municipio</h2>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Municipio</th><th class="num">Escuelas</th><th class="num">Docentes</th><th class="num">Alumnos</th><th class="num">Actividades</th></tr></thead>
          <tbody>
            <tr v-for="row in data.municipalities" :key="row.name"><td>{{ row.name }}</td><td class="num">{{ n(row.schools) }}</td><td class="num">{{ n(row.teachers) }}</td><td class="num">{{ n(row.students) }}</td><td class="num">{{ n(row.completions) }}</td></tr>
            <tr v-if="!data.municipalities.length"><td colspan="5" class="muted-text">Todavía no hay escuelas registradas</td></tr>
          </tbody>
        </table>
      </div>
      <p class="small muted-text">El municipio sale del catálogo de la SEP por la CCT. Las escuelas sin CCT aparecen como "Sin dato"</p>
    </section>

    <section class="form-card">
      <div class="panel-head">
        <h2 class="form-title">Colonias con más registros</h2>
        <div class="chip-filter" role="group" aria-label="Ordenar colonias por">
          <button v-for="m in zoneMetrics" :key="m.id" type="button" :class="['filter-chip', { active: zoneMetric === m.id }]" :aria-pressed="zoneMetric === m.id" @click="zoneMetric = m.id">{{ m.label }}</button>
        </div>
      </div>
      <p v-if="!topColonias.length" class="muted-text">Todavía no hay datos</p>
      <ul class="bar-list">
        <li v-for="row in topColonias" :key="row.name" :title="`${row.name}: ${n(row.schools)} escuelas, ${n(row.teachers)} docentes, ${n(row.students)} alumnos`">
          <span class="bar-label">{{ row.name }}</span>
          <span class="bar-track"><span class="bar-fill" :style="{ width: `${(row[zoneMetric] / maxOf(topColonias, zoneMetric)) * 100}%` }"></span></span>
          <span class="bar-value">{{ n(row[zoneMetric]) }}</span>
        </li>
      </ul>
    </section>

    <div class="stats-pair">
      <section class="form-card">
        <h2 class="form-title">Por nivel</h2>
        <ul class="bar-list compact">
          <li v-for="row in data.levels" :key="row.name" :title="`${levelName(row.name)}: ${n(row.schools)} escuelas, ${n(row.students)} alumnos`">
            <span class="bar-label">{{ levelName(row.name) }}</span>
            <span class="bar-track"><span class="bar-fill" :style="{ width: `${(row.schools / maxOf(data.levels, 'schools')) * 100}%` }"></span></span>
            <span class="bar-value">{{ n(row.schools) }}</span>
          </li>
        </ul>
        <p class="small muted-text">Escuelas por nivel</p>
      </section>
      <section class="form-card">
        <h2 class="form-title">Públicas y privadas</h2>
        <ul class="bar-list compact">
          <li v-for="row in data.sectors" :key="row.name" :title="`${sectorName(row.name)}: ${n(row.schools)} escuelas, ${n(row.students)} alumnos`">
            <span class="bar-label">{{ sectorName(row.name) }}</span>
            <span class="bar-track"><span class="bar-fill" :style="{ width: `${(row.schools / maxOf(data.sectors, 'schools')) * 100}%` }"></span></span>
            <span class="bar-value">{{ n(row.schools) }}</span>
          </li>
        </ul>
        <p class="small muted-text">Escuelas por tipo</p>
      </section>
    </div>

    <section class="form-card">
      <div class="panel-head">
        <h2 class="form-title">Últimas 8 semanas</h2>
        <div class="chip-filter" role="group" aria-label="Qué mostrar">
          <button v-for="m in weekMetrics" :key="m.id" type="button" :class="['filter-chip', { active: weekMetric === m.id }]" :aria-pressed="weekMetric === m.id" @click="weekMetric = m.id">{{ m.label }}</button>
        </div>
      </div>
      <div class="week-chart" role="img" :aria-label="`${weekMetrics.find((m) => m.id === weekMetric).label} por semana: ${data.weeks.map((w) => `${weekLabel(w.week)} ${w[weekMetric]}`).join(', ')}`">
        <div v-for="w in data.weeks" :key="w.week" class="week-col" :title="`Semana del ${weekLabel(w.week)}: ${n(w[weekMetric])}`">
          <span class="week-value">{{ n(w[weekMetric]) }}</span>
          <span class="week-bar" :style="{ height: `${Math.max(2, (w[weekMetric] / maxWeek) * 75)}%` }"></span>
          <span class="week-label">{{ weekLabel(w.week) }}</span>
        </div>
      </div>
    </section>

    <section class="form-card">
      <h2 class="form-title">Escuelas en el mapa</h2>
      <div v-if="data.schools.some((s) => s.lat)" ref="mapEl" class="location-picker-canvas stats-map" role="region" aria-label="Mapa de escuelas registradas"></div>
      <p v-else class="muted-text">Ninguna escuela registrada marcó su ubicación</p>
    </section>

    <section class="form-card">
      <div class="panel-head">
        <h2 class="form-title">Escuelas registradas</h2>
        <button class="button secondary small-button" type="button" :disabled="!schoolRows.length" @click="downloadCsv"><Icon name="download" :size="18" />Descargar CSV</button>
      </div>
      <div class="chip-filter" role="group" aria-label="Ordenar escuelas por">
        <button v-for="m in [['students', 'Alumnos'], ['teachers', 'Docentes'], ['completions', 'Actividades'], ['name', 'Nombre']]" :key="m[0]" type="button" :class="['filter-chip', { active: sortKey === m[0] }]" :aria-pressed="sortKey === m[0]" @click="sortKey = m[0]">{{ m[1] }}</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Escuela</th><th>Municipio</th><th>Colonia</th><th>Nivel</th><th class="num">Docentes</th><th class="num">Grupos</th><th class="num">Alumnos</th><th class="num">Actividades</th></tr></thead>
          <tbody>
            <tr v-for="s in schoolRows" :key="s.id">
              <td>{{ s.name }}<br /><span class="small muted-text">{{ s.cct || "sin CCT" }}</span></td>
              <td>{{ s.municipality }}</td><td>{{ s.colonia }}</td><td>{{ levelName(s.level) }}</td>
              <td class="num">{{ n(s.teachers) }}</td><td class="num">{{ n(s.classrooms) }}</td><td class="num">{{ n(s.students) }}</td><td class="num">{{ n(s.completions) }}</td>
            </tr>
            <tr v-if="!schoolRows.length"><td colspan="8" class="muted-text">Todavía no hay escuelas registradas</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section v-if="zones" class="form-card">
      <div class="panel-head">
        <h2 class="form-title">¿Desde dónde nos visitan?</h2>
        <span class="muted-text">{{ n(zones.total) }} visitantes dijeron su zona</span>
      </div>
      <div class="stats-pair">
        <div>
          <h3 class="zone-subtitle">Por municipio</h3>
          <ul class="bar-list compact">
            <li v-for="row in zones.municipios" :key="row.name" :title="`${row.name}: ${n(row.visits)}`">
              <span class="bar-label">{{ row.name }}</span>
              <span class="bar-track"><span class="bar-fill" :style="{ width: `${(row.visits / maxOf(zones.municipios, 'visits')) * 100}%` }"></span></span>
              <span class="bar-value">{{ n(row.visits) }}</span>
            </li>
          </ul>
          <p v-if="!zones.municipios.length" class="muted-text">Todavía nadie nos ha dicho su zona</p>
        </div>
        <div>
          <h3 class="zone-subtitle">Tijuana, por delegación</h3>
          <ul class="bar-list compact">
            <li v-for="row in zones.tijuana" :key="row.name" :title="`${row.name}: ${n(row.visits)}`">
              <span class="bar-label">{{ row.name }}</span>
              <span class="bar-track"><span class="bar-fill" :style="{ width: `${(row.visits / maxOf(zones.tijuana, 'visits')) * 100}%` }"></span></span>
              <span class="bar-value">{{ n(row.visits) }}</span>
            </li>
          </ul>
          <p v-if="!zones.tijuana.length" class="muted-text">Sin datos de Tijuana todavía</p>
        </div>
      </div>
      <p class="small muted-text">Solo guardamos el municipio y la zona aproximada (la delegación más cercana en Tijuana). Nunca la ubicación exacta</p>
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
  </template>
</template>
