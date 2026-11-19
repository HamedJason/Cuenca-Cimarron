<script setup>
// Tareas del grupo y tabla de avance (alumnos en filas, tareas en columnas).
import { ref, computed, onMounted } from "vue";
import Icon from "./Icon.vue";
import FormField from "./FormField.vue";
import { api } from "../composables/api";

const props = defineProps({ classroom: { type: Object, required: true } });
const tasks = ref([]);
const catalog = ref([]);
const paths = ref([]);
const table = ref({ tasks: [], students: [] });
const state = ref("loading");
const picked = ref([]);
const dueDate = ref("");
const message = ref("");
const today = new Date().toISOString().slice(0, 10);

const available = computed(() => catalog.value.filter((a) => !tasks.value.some((t) => t.key === a.key)));
const kinds = { lectura: "Lecturas", modulo: "Lecturas cortas", consejo: "Consejos", juego: "Juegos", externo: "Juegos de otros sitios" };
const groups = computed(() =>
  Object.entries(kinds)
    .map(([kind, label]) => ({ kind, label, items: available.value.filter((a) => a.kind === kind) }))
    .filter((g) => g.items.length),
);

async function load() {
  try {
    const [t, p] = await Promise.all([api(`/docente/grupos/${props.classroom.id}/tareas`), api(`/docente/grupos/${props.classroom.id}/avance`)]);
    tasks.value = t.tasks;
    catalog.value = t.catalog;
    paths.value = t.paths ?? [];
    table.value = p;
    state.value = "ready";
  } catch (e) {
    state.value = e.message;
  }
}
onMounted(load);

async function assign() {
  message.value = "";
  try {
    await api(`/docente/grupos/${props.classroom.id}/tareas`, { method: "POST", body: { activities: picked.value, due_date: dueDate.value || null } });
    picked.value = [];
    await load();
  } catch (e) {
    message.value = e.errors?.due_date || e.errors?.activities || e.message;
  }
}
// Camino predeterminado: asigna de una vez las actividades que falten.
const titleOf = (key) => catalog.value.find((a) => a.key === key)?.title ?? key;
const pending = (path) => path.activities.filter((key) => !tasks.value.some((t) => t.key === key));
async function assignPath(path) {
  message.value = "";
  try {
    await api(`/docente/grupos/${props.classroom.id}/tareas`, { method: "POST", body: { activities: pending(path), due_date: dueDate.value || null } });
    await load();
  } catch (e) {
    message.value = e.message;
  }
}
async function remove(task) {
  await api(`/docente/grupos/${props.classroom.id}/tareas/${task.key}`, { method: "DELETE" });
  await load();
}
const dateText = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long" });
</script>
<template>
  <p v-if="state === 'loading'" class="form-card" role="status">Cargando…</p>
  <p v-else-if="state !== 'ready'" class="form-card form-alert is-error" role="alert">{{ state }}</p>
  <template v-else>
    <section class="form-card">
      <h2 class="form-title">Avance</h2>
      <p v-if="!table.students.length" class="muted-text">Todavía no entra ningún alumno</p>
      <template v-else>
        <div class="table-wrap">
          <table class="data-table progress-table">
            <thead>
              <tr>
                <th scope="col">Alumno</th>
                <th v-for="task in table.tasks" :key="task.key" scope="col" class="center">{{ task.title }}</th>
                <th scope="col" class="num">Puntos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in table.students" :key="row.id">
                <th scope="row">{{ row.name }}</th>
                <td v-for="task in table.tasks" :key="task.key" class="center">
                  <Icon v-if="row.done.includes(task.key)" name="check" :size="22" class="icon-done" />
                  <span v-else class="icon-missing" aria-hidden="true">·</span>
                  <span class="sr-only">{{ row.done.includes(task.key) ? "Hecha" : "Pendiente" }}</span>
                </td>
                <td class="num"><b>{{ row.points }}</b></td>
              </tr>
            </tbody>
          </table>
        </div>
        <a class="button secondary small-button" :href="`/api/docente/grupos/${classroom.id}/avance.csv`" download><Icon name="download" :size="18" />Descargar CSV</a>
      </template>
    </section>

    <section class="form-card">
      <h2 class="form-title">Tareas del grupo</h2>
      <p v-if="!tasks.length" class="muted-text">Elige abajo las actividades que quieres que hagan tus alumnos. Las ven en su lista de tareas</p>
      <ul v-else class="plain-list task-list">
        <li v-for="task in tasks" :key="task.key">
          <Icon name="task" :size="20" />
          <span><b>{{ task.title }}</b> · {{ task.points }} puntos<span v-if="task.due_date"> · Para el {{ dateText(task.due_date) }}</span></span>
          <button class="text-link" type="button" @click="remove(task)">Quitar</button>
        </li>
      </ul>
    </section>

    <section v-if="!classroom.archived && paths.length" class="form-card">
      <h2 class="form-title">Caminos listos</h2>
      <p class="muted-text">Cada camino es una serie de lecturas, consejos y juegos sobre un tema. Asígnalo completo con un clic</p>
      <ul class="path-list">
        <li v-for="path in paths" :key="path.key" class="path-card">
          <div>
            <h3>{{ path.title }}</h3>
            <p class="muted-text">{{ path.description }}</p>
            <ol class="path-steps">
              <li v-for="key in path.activities" :key="key" :class="{ assigned: tasks.some((t) => t.key === key) }">{{ titleOf(key) }}</li>
            </ol>
          </div>
          <button v-if="pending(path).length" class="button primary small-button" type="button" @click="assignPath(path)">
            Asignar camino ({{ pending(path).length }})
          </button>
          <span v-else class="status-badge is-approved"><Icon name="check" :size="16" />Asignado</span>
        </li>
      </ul>
    </section>

    <form v-if="!classroom.archived && groups.length" class="form-card" @submit.prevent="assign">
      <h2 class="form-title">Asignar actividades</h2>
      <fieldset v-for="group in groups" :key="group.kind" class="form-group">
        <legend>{{ group.label }}</legend>
        <label v-for="item in group.items" :key="item.key" class="consent-row">
          <input v-model="picked" type="checkbox" :value="item.key" />
          <span>{{ item.title }} <span class="muted-text">· {{ item.points }} puntos</span></span>
        </label>
      </fieldset>
      <FormField v-slot="{ id }" label="Fecha límite" optional>
        <input :id="id" v-model="dueDate" type="date" :min="today" />
      </FormField>
      <p v-if="message" class="form-alert is-error" role="alert">{{ message }}</p>
      <div class="form-actions">
        <button class="button primary" type="submit" :disabled="!picked.length">Asignar {{ picked.length || "" }}</button>
      </div>
    </form>
  </template>
</template>
