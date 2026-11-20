<script setup>
// "Ver todas": ventana con buscador y lista que se carga de 20 en 20 al bajar.
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import Modal from "./Modal.vue";
import Icon from "./Icon.vue";
import AdminSchoolItem from "./AdminSchoolItem.vue";
import { api } from "../composables/api";

const props = defineProps({ open: Boolean, status: { type: String, required: true }, title: String, isAdmin: Boolean });
const emit = defineEmits(["close", "map", "changed"]);
const q = ref("");
const schools = ref([]);
const total = ref(0);
const more = ref(false);
const page = ref(0);
const state = ref("idle");
const sentinel = ref(null);
let observer = null;
let timer = 0;
let request = 0;

async function loadPage(reset = false) {
  if (state.value === "loading" && !reset) return;
  const mine = ++request;
  if (reset) {
    page.value = 0;
    schools.value = [];
  }
  state.value = "loading";
  try {
    const params = new URLSearchParams({ estado: props.status, pagina: String(page.value + 1), por: "20" });
    if (q.value.trim()) params.set("q", q.value.trim());
    const data = await api(`/admin/escuelas?${params}`);
    if (mine !== request) return;
    schools.value = [...schools.value, ...data.schools];
    total.value = data.total;
    more.value = data.more;
    page.value += 1;
    state.value = "ready";
  } catch (e) {
    if (mine === request) state.value = e.message;
  }
}

function watchSentinel() {
  observer?.disconnect();
  if (!sentinel.value) return;
  observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting) && more.value && state.value === "ready") loadPage();
  }, { rootMargin: "200px" });
  observer.observe(sentinel.value);
}

watch(() => props.open, async (value) => {
  if (!value) return observer?.disconnect();
  q.value = "";
  await loadPage(true);
  await nextTick();
  watchSentinel();
});
watch(q, () => {
  clearTimeout(timer);
  timer = setTimeout(() => loadPage(true), 300);
});
onBeforeUnmount(() => {
  observer?.disconnect();
  clearTimeout(timer);
});
</script>

<template>
  <Modal :open="open" :title="title" wide class="modal-list" @close="emit('close')">
    <div class="field">
      <label for="buscar-escuelas-admin">Buscar por nombre, CCT, colonia o correo</label>
      <div class="combo">
        <Icon name="search" :size="20" class="combo-icon" />
        <input id="buscar-escuelas-admin" v-model="q" type="search" autocomplete="off" spellcheck="false" maxlength="80" />
      </div>
    </div>
    <p class="small muted-text" role="status">{{ state === "loading" && !schools.length ? "Cargando…" : `${total} ${total === 1 ? "escuela" : "escuelas"}` }}</p>
    <p v-if="!['idle', 'loading', 'ready'].includes(state)" class="form-alert is-error" role="alert">{{ state }}</p>
    <p v-else-if="state === 'ready' && !schools.length" class="muted-text">No hay escuelas con eso</p>
    <ul class="review-list">
      <AdminSchoolItem v-for="school in schools" :key="school.id" :school="school" :is-admin="isAdmin" @map="emit('map', $event)" @changed="emit('changed')" />
    </ul>
    <div ref="sentinel" class="list-sentinel" aria-hidden="true"></div>
    <p v-if="state === 'loading' && schools.length" class="small muted-text" role="status">Cargando más…</p>
  </Modal>
</template>
