<script setup>
// Panel de la escuela: resumen, docentes, grupos (con el avance por alumno), lecturas y juegos
// más usados, crecimiento por semana y descargas. Todo es solo de esta escuela (lo controla el servidor).
import { computed, onMounted, ref } from "vue";
import Icon from "./Icon.vue";
import Modal from "./Modal.vue";
import DateFilter from "./DateFilter.vue";
import { api } from "../composables/api";
import { useDateRange } from "../composables/dateRange";

const range = useDateRange();
const data = ref(null);
const error = ref("");
const n = (value) => Number(value ?? 0).toLocaleString("es-MX");
const day = (iso) => (iso ? new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "Nunca");

async function load() {
  error.value = "";
  try {
    const q = range.params();
    data.value = await api(`/escuela/panel${q ? `?${q}` : ""}`);
  } catch (e) {
    error.value = e.message;
  }
}
onMounted(load);

const tiles = computed(() => {
  const t = data.value?.totals;
  if (!t) return [];
  return [
    { label: "Docentes", value: t.teachers },
    { label: "Grupos", value: t.classrooms },
    { label: "Alumnos", value: t.students },
    { label: "Alumnos activos esta semana", value: t.active_students },
    { label: "Actividades completadas", value: t.completions },
    { label: "Cimacoins ganadas", value: t.coins },
  ];
});
const maxOf = (rows, key) => Math.max(1, ...rows.map((r) => r[key]));
const weekLabel = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const weekMetric = ref("completions");

// Avance de un grupo: el mismo cuadro que ve su docente
const group = ref(null);
const progress = ref(null);
const progressError = ref("");
async function openGroup(item) {
  group.value = item;
  progress.value = null;
  progressError.value = "";
  try {
    progress.value = await api(`/escuela/grupos/${item.id}/avance`);
  } catch (e) {
    progressError.value = e.message;
  }
}

const downloads = [
  { id: "docentes", label: "Docentes", text: "Grupos, alumnos, actividades y última actividad de cada docente" },
  { id: "grupos", label: "Grupos", text: "Docente, alumnos, actividades, Cimacoins y última actividad de cada grupo" },
  { id: "actividades", label: "Actividades", text: "Cuántas veces se completó cada lectura o juego en tu escuela" },
];
const exportHref = (id) => {
  const q = range.params();
  return `/api/escuela/exportar/${id}${q ? `?${q}` : ""}`;
};
</script>
<template>
  <section class="form-card school-dashboard" aria-labelledby="titulo-panel-escuela">
    <div class="panel-head">
      <h2 id="titulo-panel-escuela" class="form-title">Así va tu escuela</h2>
      <button class="button secondary small-button" type="button" @click="load"><Icon name="reset" :size="18" />Actualizar</button>
    </div>
    <DateFilter :range="range" @change="load" />
    <p v-if="error" class="form-alert is-error" role="alert">{{ error }}</p>
    <p v-else-if="!data" role="status">Cargando…</p>
    <div v-else class="stat-tiles">
      <div v-for="tile in tiles" :key="tile.label" class="stat-tile">
        <strong>{{ n(tile.value) }}</strong>
        <span>{{ tile.label }}</span>
      </div>
    </div>
  </section>

  <template v-if="data">
    <section class="form-card" aria-labelledby="titulo-docentes-uso">
      <h2 id="titulo-docentes-uso" class="form-title">Cómo va cada docente</h2>
      <p v-if="!data.teachers.length" class="muted-text">Todavía no hay docentes</p>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Docente</th><th class="num">Grupos</th><th class="num">Alumnos</th><th class="num">Actividades</th><th>Última actividad</th></tr></thead>
          <tbody>
            <tr v-for="t in data.teachers" :key="t.id" :class="{ 'is-off': !t.active }">
              <td>{{ t.name }}<span v-if="!t.active" class="small muted-text"> (dado de baja)</span></td>
              <td class="num">{{ n(t.classrooms) }}</td><td class="num">{{ n(t.students) }}</td><td class="num">{{ n(t.completions) }}</td>
              <td>{{ day(t.last_activity) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="form-card" aria-labelledby="titulo-grupos-uso">
      <h2 id="titulo-grupos-uso" class="form-title">Grupos</h2>
      <p v-if="!data.classrooms.length" class="muted-text">Todavía no hay grupos. Cada docente arma los suyos desde su enlace</p>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Grupo</th><th>Docente</th><th class="num">Alumnos</th><th class="num">Actividades</th><th class="num">Cimacoins</th><th>Última actividad</th><th>Código</th><th><span class="sr-only">Avance</span></th></tr></thead>
          <tbody>
            <tr v-for="c in data.classrooms" :key="c.id">
              <td>{{ c.name }} <span class="small muted-text">{{ c.grade }}</span></td>
              <td>{{ c.teacher }}</td>
              <td class="num">{{ n(c.students) }}</td><td class="num">{{ n(c.completions) }}</td><td class="num">{{ n(c.coins) }}</td>
              <td>{{ day(c.last_activity) }}</td>
              <td><code>{{ c.code }}</code> <span v-if="!c.open" class="small muted-text">cerrado</span></td>
              <td><button class="button secondary small-button" type="button" @click="openGroup(c)">Ver avance</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="stats-pair">
      <section class="form-card" aria-labelledby="titulo-mas-usadas">
        <h2 id="titulo-mas-usadas" class="form-title">Lecturas y juegos más usados</h2>
        <p v-if="!data.activities.length" class="muted-text">Todavía no hay actividades completadas en estas fechas</p>
        <ul class="bar-list compact">
          <li v-for="a in data.activities.slice(0, 10)" :key="a.title" :title="`${a.title}: ${n(a.completions)}`">
            <span class="bar-label">{{ a.title }}</span>
            <span class="bar-track"><span class="bar-fill" :style="{ width: `${(a.completions / maxOf(data.activities, 'completions')) * 100}%` }"></span></span>
            <span class="bar-value">{{ n(a.completions) }}</span>
          </li>
        </ul>
      </section>
      <section class="form-card" aria-labelledby="titulo-semanas-escuela">
        <div class="panel-head">
          <h2 id="titulo-semanas-escuela" class="form-title">Por semana</h2>
          <div class="chip-filter" role="group" aria-label="Qué mostrar">
            <button v-for="m in [['completions', 'Actividades'], ['students', 'Alumnos nuevos']]" :key="m[0]" type="button" :class="['filter-chip', { active: weekMetric === m[0] }]" :aria-pressed="weekMetric === m[0]" @click="weekMetric = m[0]">{{ m[1] }}</button>
          </div>
        </div>
        <div class="week-chart" role="img" :aria-label="data.weeks.map((w) => `${weekLabel(w.week)} ${w[weekMetric]}`).join(', ')">
          <div v-for="w in data.weeks" :key="w.week" class="week-col" :title="`Semana del ${weekLabel(w.week)}: ${n(w[weekMetric])}`">
            <span class="week-value">{{ n(w[weekMetric]) }}</span>
            <span class="week-bar" :style="{ height: `${Math.max(2, (w[weekMetric] / maxOf(data.weeks, weekMetric)) * 75)}%` }"></span>
            <span class="week-label">{{ weekLabel(w.week) }}</span>
          </div>
        </div>
      </section>
    </div>

    <section class="form-card" aria-labelledby="titulo-descargas-escuela">
      <h2 id="titulo-descargas-escuela" class="form-title">Descargar datos</h2>
      <p class="small muted-text">Archivos CSV que se abren en Excel o en Google Sheets, con las fechas de arriba. No llevan nombres de alumnos. El avance por alumno se baja desde cada grupo</p>
      <ul class="export-list">
        <li v-for="item in downloads" :key="item.id">
          <span><strong>{{ item.label }}</strong><span class="small muted-text">{{ item.text }}</span></span>
          <a v-if="!range.bad.value" class="button secondary small-button" :href="exportHref(item.id)" :download="`${item.id}.csv`"><Icon name="download" :size="18" />Descargar</a>
        </li>
      </ul>
    </section>
  </template>

  <Modal :open="Boolean(group)" :title="group ? `Avance de ${group.name}` : ''" wide @close="group = null">
    <p v-if="progressError" class="form-alert is-error" role="alert">{{ progressError }}</p>
    <p v-else-if="!progress" role="status">Cargando…</p>
    <template v-else>
      <p class="small muted-text">Docente: {{ group.teacher }}. Las tareas son las que su docente le asignó al grupo</p>
      <p v-if="!progress.students.length" class="muted-text">Este grupo todavía no tiene alumnos</p>
      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Alumno</th>
              <th v-for="t in progress.tasks" :key="t.key">{{ t.title }}</th>
              <th class="num">Tareas hechas</th><th class="num">Cimacoins</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in progress.students" :key="s.id">
              <td>{{ s.name }}</td>
              <td v-for="t in progress.tasks" :key="t.key">{{ s.done.includes(t.key) ? "Sí" : "No" }}</td>
              <td class="num">{{ s.tasks_done }} de {{ progress.tasks.length }}</td>
              <td class="num">{{ n(s.coins_earned) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <a class="button secondary" :href="`/api/escuela/grupos/${group.id}/avance.csv`" download><Icon name="download" :size="18" />Descargar el avance en CSV</a>
    </template>
  </Modal>
</template>
