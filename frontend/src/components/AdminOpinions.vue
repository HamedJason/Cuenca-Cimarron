<script setup>
// Moderación de Comunidad Cimarrona: ocultar o volver a mostrar comentarios.
// Ocultar no borra la calificación, que sigue contando en el promedio.
import { ref, watch } from "vue";
import Icon from "./Icon.vue";
import { api } from "../composables/api";
import { relativeDate } from "../composables/useOpinion";

const filters = [
  { id: "todas", label: "Todas" },
  { id: "ocultas", label: "Ocultas" },
];
const filter = ref("todas");
const items = ref([]);
const summary = ref(null);
const hidden = ref(0);
const more = ref(false);
const state = ref("loading");
const busy = ref(0);
const reasons = { filtro: "Oculta por el filtro de groserías", admin: "Oculta por la administración" };

async function load(append = false) {
  try {
    const params = new URLSearchParams({ filtro: filter.value });
    if (append && items.value.length) params.set("antes_de", items.value[items.value.length - 1].id);
    const data = await api(`/admin/opiniones?${params}`);
    items.value = append ? [...items.value, ...data.opinions] : data.opinions;
    summary.value = data.summary;
    hidden.value = data.hidden;
    more.value = data.more;
    state.value = "ready";
  } catch (error) {
    state.value = error.message;
  }
}
watch(filter, () => load(), { immediate: true });

async function toggle(item) {
  busy.value = item.id;
  try {
    const data = await api(`/admin/opiniones/${item.id}/${item.hidden_reason ? "mostrar" : "ocultar"}`, { method: "POST" });
    item.hidden_reason = data.hidden_reason;
    hidden.value += data.hidden_reason ? 1 : -1;
  } catch (error) {
    alert(error.message);
  } finally {
    busy.value = 0;
  }
}
</script>
<template>
  <section class="form-card" role="tabpanel">
    <h2 class="form-title">Comunidad Cimarrona</h2>
    <p v-if="summary" class="muted-text">
      {{ summary.count }} {{ summary.count === 1 ? "opinión" : "opiniones" }}<template v-if="summary.count">, promedio {{ summary.average }} de 5</template>. Ocultar un comentario no quita su calificación
    </p>
    <div class="chip-filter" role="group" aria-label="Mostrar">
      <button v-for="item in filters" :key="item.id" type="button" :class="['filter-chip', { active: filter === item.id }]" :aria-pressed="filter === item.id" @click="filter = item.id">
        {{ item.label }}<b v-if="item.id === 'ocultas'"> {{ hidden }}</b>
      </button>
    </div>
    <p v-if="state === 'loading'" role="status">Cargando…</p>
    <p v-else-if="state !== 'ready'" class="form-alert is-error" role="alert">{{ state }}</p>
    <p v-else-if="!items.length" class="muted-text">No hay comentarios en esta lista</p>
    <ul v-else class="review-list admin-opinions">
      <li v-for="item in items" :key="item.id" :class="['admin-opinion', { 'is-hidden': item.hidden_reason }]">
        <span class="community-card-stars" :aria-label="`${item.rating} de 5 estrellas`">
          <Icon v-for="n in 5" :key="n" name="star" :size="18" :class="{ on: n <= item.rating }" />
        </span>
        <p>{{ item.comment }}</p>
        <p class="small muted-text">
          {{ relativeDate(item.created_at) }} · {{ item.origin === "actividad" ? "al terminar una actividad" : "en la página" }}<template v-if="item.hidden_reason"> · {{ reasons[item.hidden_reason] }}</template>
        </p>
        <button class="button secondary" type="button" :disabled="busy === item.id" @click="toggle(item)">
          <Icon :name="item.hidden_reason ? 'eye' : 'close'" :size="18" />{{ item.hidden_reason ? "Volver a mostrar" : "Ocultar" }}
        </button>
      </li>
    </ul>
    <button v-if="more" class="button secondary" type="button" @click="load(true)">Ver más</button>
  </section>
</template>
