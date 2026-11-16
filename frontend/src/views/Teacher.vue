<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import FormField from "../components/FormField.vue";
import TeacherClassroom from "../components/TeacherClassroom.vue";
import { api } from "../composables/api";

const route = useRoute();
const router = useRouter();
const teacher = ref(null);
const state = ref("loading");
const classrooms = ref([]);
const form = ref({ name: "", grade: "" });
const errors = ref({});
const creating = ref(false);
const showArchived = ref(false);

const selectedId = computed(() => Number(route.query.grupo) || null);
const active = computed(() => classrooms.value.filter((c) => !c.archived));
const archived = computed(() => classrooms.value.filter((c) => c.archived));

async function load() {
  try {
    const [me, list] = await Promise.all([api("/docente"), api("/docente/grupos")]);
    teacher.value = me.teacher;
    classrooms.value = list.classrooms;
    state.value = "ready";
  } catch (e) {
    state.value = e.status === 401 ? "out" : e.message;
  }
}
onMounted(load);

async function create() {
  creating.value = true;
  errors.value = {};
  try {
    const data = await api("/docente/grupos", { method: "POST", body: form.value });
    classrooms.value = [data.classroom, ...classrooms.value];
    form.value = { name: "", grade: "" };
    router.push({ query: { grupo: data.classroom.id } });
  } catch (e) {
    errors.value = { ...e.errors, general: Object.keys(e.errors).length ? "" : e.message };
  } finally {
    creating.value = false;
  }
}
function updated(classroom) {
  classrooms.value = classrooms.value.map((c) => (c.id === classroom.id ? classroom : c));
}
async function logout() {
  await api("/docente/salir", { method: "POST" }).catch(() => {});
  teacher.value = null;
  state.value = "out";
}
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>{{ teacher ? `Hola, ${teacher.name}` : "Docentes" }}</h1>
      <p v-if="teacher">{{ teacher.school }}</p>
    </header>

    <p v-if="state === 'loading'" class="form-card" role="status">Cargando…</p>
    <div v-else-if="state === 'out'" class="form-card narrow">
      <h2 class="form-title">Necesitas tu enlace de acceso</h2>
      <p>Pide a tu escuela tu enlace de acceso. Al abrirlo en este equipo ya no tienes que volver a entrar</p>
    </div>
    <p v-else-if="state !== 'ready'" class="form-card form-alert is-error" role="alert">{{ state }}</p>

    <template v-else-if="selectedId">
      <RouterLink :to="{ query: {} }" class="text-link back-link"><Icon name="arrow" :size="18" class="flip" />Todos mis grupos</RouterLink>
      <TeacherClassroom :key="selectedId" :classroom-id="selectedId" @updated="updated" />
    </template>

    <template v-else>
      <section class="form-card">
        <h2 class="form-title">Mis grupos</h2>
        <p v-if="!active.length" class="muted-text">Crea tu primer grupo. Te damos un código para que tus alumnos entren</p>
        <ul class="classroom-grid">
          <li v-for="item in active" :key="item.id">
            <RouterLink :to="{ query: { grupo: item.id } }" class="classroom-card">
              <span class="classroom-name">{{ item.name }}</span>
              <span class="muted-text">{{ item.grade }} · {{ item.students }} {{ item.students === 1 ? "alumno" : "alumnos" }}</span>
              <span class="classroom-code">{{ item.code }}</span>
            </RouterLink>
          </li>
        </ul>
        <button v-if="archived.length" class="text-link" type="button" @click="showArchived = !showArchived">
          {{ showArchived ? "Ocultar" : "Ver" }} grupos archivados ({{ archived.length }})
        </button>
        <ul v-if="showArchived" class="plain-list">
          <li v-for="item in archived" :key="item.id">
            <RouterLink :to="{ query: { grupo: item.id } }" class="text-link">{{ item.name }}</RouterLink>
            <span class="small muted-text">{{ item.school_year }}</span>
          </li>
        </ul>
      </section>

      <form class="form-card" novalidate @submit.prevent="create">
        <h2 class="form-title">Grupo nuevo</h2>
        <div class="field-row">
          <FormField v-slot="{ id, describedby }" label="Nombre del grupo" hint="Así lo ven tus alumnos al entrar, por ejemplo 4° B" :error="errors.name">
            <input :id="id" v-model.trim="form.name" maxlength="60" :aria-describedby="describedby" />
          </FormField>
          <FormField v-slot="{ id }" label="Grado" :error="errors.grade">
            <input :id="id" v-model.trim="form.grade" maxlength="30" placeholder="Por ejemplo 4° de primaria" />
          </FormField>
        </div>
        <p v-if="errors.general" class="form-alert is-error" role="alert">{{ errors.general }}</p>
        <div class="form-actions">
          <button class="button primary" type="submit" :disabled="creating || !form.name || !form.grade">Crear grupo</button>
        </div>
      </form>
      <button class="button secondary" type="button" @click="logout">Salir de este equipo</button>
    </template>
  </div>
</template>
