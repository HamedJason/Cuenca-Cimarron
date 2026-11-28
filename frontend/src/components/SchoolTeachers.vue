<script setup>
import { ref, onMounted } from "vue";
import Icon from "./Icon.vue";
import FormField from "./FormField.vue";
import CopyLink from "./CopyLink.vue";
import { api } from "../composables/api";

const teachers = ref([]);
const state = ref("loading");
const name = ref("");
const error = ref("");
const busy = ref(false);
const links = ref({});

async function load() {
  try {
    const t = await api("/escuela/docentes");
    teachers.value = t.teachers;
    state.value = "ready";
  } catch (e) {
    state.value = e.message;
  }
}
onMounted(load);

async function add() {
  busy.value = true;
  error.value = "";
  try {
    const data = await api("/escuela/docentes", { method: "POST", body: { name: name.value } });
    teachers.value = [data.teacher, ...teachers.value];
    links.value = { ...links.value, [data.teacher.id]: data.link };
    name.value = "";
  } catch (e) {
    error.value = e.errors?.name || e.message;
  } finally {
    busy.value = false;
  }
}
async function action(teacher, path) {
  try {
    const data = await api(`/escuela/docentes/${teacher.id}/${path}`, { method: "POST" });
    if (data.link) links.value = { ...links.value, [teacher.id]: data.link };
    if (path === "baja") {
      const { [teacher.id]: _, ...rest } = links.value;
      links.value = rest;
    }
    await load();
  } catch (e) {
    alert(e.message);
  }
}
function confirmDown(teacher) {
  if (confirm(`¿Dar de baja a ${teacher.name}? Su enlace deja de funcionar y sale de su cuenta en todos sus equipos. Sus grupos se conservan`)) action(teacher, "baja");
}
</script>
<template>
  <section class="form-card">
    <h2 class="form-title">Docentes</h2>
    <p class="muted-text">Escribe el nombre del docente y mándale su enlace por WhatsApp o correo. Al abrirlo queda dentro sin contraseña. Cada enlace sirve una vez y dura 14 días</p>
    <form class="inline-form" novalidate @submit.prevent="add">
      <FormField v-slot="{ id }" label="Nombre del docente" :error="error">
        <input :id="id" v-model.trim="name" maxlength="80" autocomplete="off" placeholder="Por ejemplo Laura Pérez" />
      </FormField>
      <button class="button primary" type="submit" :disabled="busy || name.length < 3">Dar de alta</button>
    </form>

    <p v-if="state === 'loading'" role="status">Cargando…</p>
    <p v-else-if="state !== 'ready'" class="form-alert is-error" role="alert">{{ state }}</p>
    <p v-else-if="!teachers.length" class="muted-text">Todavía no hay docentes</p>
    <ul v-else class="review-list">
      <li v-for="teacher in teachers" :key="teacher.id" :class="['review-item', { 'is-off': !teacher.active }]">
        <div class="review-main">
          <h3>{{ teacher.name }}</h3>
          <p>{{ teacher.classrooms }} {{ teacher.classrooms === 1 ? "grupo" : "grupos" }} · {{ teacher.students }} {{ teacher.students === 1 ? "alumno" : "alumnos" }}</p>
          <span v-if="!teacher.active" class="status-badge is-rejected">Dado de baja</span>
          <div v-if="links[teacher.id]" class="link-share">
            <p class="small"><b>Enlace de acceso.</b> Cópialo ahora, no se vuelve a mostrar</p>
            <CopyLink :link="links[teacher.id]" :share-text="`Hola ${teacher.name}, este es tu acceso a Cuenca Cimarrona:`" />
          </div>
        </div>
        <div class="row-actions">
          <template v-if="teacher.active">
            <button class="button secondary small-button" type="button" @click="action(teacher, 'enlace')">Enlace nuevo</button>
            <button class="button secondary small-button" type="button" @click="confirmDown(teacher)">Dar de baja</button>
          </template>
          <button v-else class="button secondary small-button" type="button" @click="action(teacher, 'alta')">Volver a dar de alta</button>
        </div>
      </li>
    </ul>
  </section>

  <p class="small muted-text"><Icon name="info" :size="18" /> Cada docente arma sus grupos desde su enlace. Sus grupos y el avance de sus alumnos salen arriba, en "Así va tu escuela"</p>
</template>
