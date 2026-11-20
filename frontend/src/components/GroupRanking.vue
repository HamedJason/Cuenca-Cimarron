<script setup>
// Ranking del grupo por Cimacoins ganadas. Lo ve solo el docente, arriba de su grupo.
// Cimacoins ganadas = lo que ganó con actividades y premios. No cuenta las 150 iniciales
// y no baja cuando el alumno compra en la tienda.
import { ref, computed, watch } from "vue";
import Icon from "./Icon.vue";
import { api } from "../composables/api";

const props = defineProps({ classroomId: { type: Number, required: true } });
const students = ref([]);
const state = ref("loading");

async function load() {
  state.value = "loading";
  try {
    students.value = (await api(`/docente/grupos/${props.classroomId}/avance`)).students;
    state.value = "ready";
  } catch (e) {
    state.value = e.message;
  }
}
watch(() => props.classroomId, load, { immediate: true });

// Empates comparten lugar
const ranking = computed(() => {
  const rows = [...students.value].sort((a, b) => b.coins_earned - a.coins_earned || a.name.localeCompare(b.name, "es"));
  let place = 0;
  let last = null;
  return rows.map((row, i) => {
    if (row.coins_earned !== last) place = i + 1;
    last = row.coins_earned;
    return { ...row, place };
  });
});
const podium = computed(() => ranking.value.filter((r) => r.place <= 3 && r.coins_earned > 0).slice(0, 3));
const rest = computed(() => ranking.value.filter((r) => !podium.value.includes(r)));
const n = (v) => Number(v ?? 0).toLocaleString("es-MX");
defineExpose({ load });
</script>

<template>
  <section v-if="state !== 'ready' || students.length" class="form-card ranking-card" aria-labelledby="titulo-ranking">
    <div class="panel-head">
      <h2 id="titulo-ranking" class="form-title">Ranking del grupo</h2>
      <button class="button secondary small-button" type="button" @click="load"><Icon name="reset" :size="18" />Actualizar</button>
    </div>
    <p class="muted-text">Cimacoins que ganó cada alumno con sus actividades. Gastar en la tienda no las baja. Solo tú lo ves</p>
    <p v-if="state === 'loading'" role="status">Cargando…</p>
    <p v-else-if="state !== 'ready'" class="form-alert is-error" role="alert">{{ state }}</p>
    <template v-else>
      <ol v-if="podium.length" class="podium" aria-label="Primeros lugares">
        <li v-for="row in podium" :key="row.id" :class="['podium-step', `is-place-${row.place}`]">
          <span class="podium-medal" aria-hidden="true">{{ row.place }}</span>
          <strong class="podium-name">{{ row.name }}</strong>
          <span class="podium-coins"><Icon name="coin" :size="18" />{{ n(row.coins_earned) }}</span>
          <span class="sr-only">Lugar {{ row.place }}</span>
        </li>
      </ol>
      <p v-else class="muted-text">Todavía nadie gana Cimacoins con sus actividades</p>
      <ol v-if="rest.length" class="ranking-list">
        <li v-for="row in rest" :key="row.id">
          <span class="ranking-place">{{ row.place }}</span>
          <span class="ranking-name">{{ row.name }}</span>
          <span class="ranking-coins"><Icon name="coin" :size="16" />{{ n(row.coins_earned) }}</span>
        </li>
      </ol>
    </template>
  </section>
</template>
