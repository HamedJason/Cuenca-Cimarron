<script setup>
// Juegos de otros sitios: al regresar a esta pestaña se pregunta si ya terminó y luego
// una pregunta corta sobre el juego.
// - Alumno: el servidor revisa cuánto tiempo pasó y da los puntos (y con ellos las Cimacoins de terminar).
// - Visitante: se revisa aquí el tiempo mínimo, el servidor solo revisa la respuesta, y se dan las Cimacoins.
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import Modal from "./Modal.vue";
import ActivityQuestion from "./ActivityQuestion.vue";
import { student } from "../composables/useStudent";
import { activityByKey, isDone, loadActivities } from "../composables/useActivities";
import { finishRewardId, isClaimed } from "../composables/useCimacoins";
import { PENDING_EXTERNAL } from "../composables/useGamePlays";

const pending = ref(null);
const open = ref(false);
const step = ref("ask");
const activity = computed(() => (pending.value ? activityByKey.value[pending.value.key] : null));

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(PENDING_EXTERNAL) || "null");
    return data && typeof data.key === "string" ? data : null;
  } catch {
    return null;
  }
}
function forgetSaved() {
  try {
    localStorage.removeItem(PENDING_EXTERNAL);
  } catch {
    // Nada que borrar.
  }
}
function clear() {
  forgetSaved();
  pending.value = null;
}
// Ya no hay nada que ganar con este juego
function finished(key) {
  if (student.value) return isDone(key);
  const reward = finishRewardId(key);
  return !reward || isClaimed(reward);
}
function check() {
  if (document.visibilityState !== "visible" || open.value) return;
  const data = read();
  if (!data) return;
  // A las 3 horas el servidor ya no acepta la respuesta: se deja de preguntar.
  if (Date.now() - data.at > 3 * 3600 * 1000 || finished(data.key)) {
    clear();
    return;
  }
  // Recién abierto el juego todavía no hay nada que preguntar.
  if (Date.now() - data.at < 20 * 1000) return;
  pending.value = data;
  if (!activity.value) {
    // El visitante no tiene el catálogo cargado hasta que hace falta
    if (!student.value) loadActivities();
    return;
  }
  step.value = "ask";
  open.value = true;
}
onMounted(() => {
  document.addEventListener("visibilitychange", check);
  check();
});
onBeforeUnmount(() => document.removeEventListener("visibilitychange", check));
watch([student, () => Object.keys(activityByKey.value).length], check);

// Ya contestó bien: se borra lo guardado, pero la ventana sigue con el "¡Correcto!" hasta que la cierre.
function done() {
  forgetSaved();
}
function later() {
  open.value = false;
}
function forget() {
  clear();
  open.value = false;
}
</script>
<template>
  <Modal :open="open" :title="activity ? `¿Ya terminaste ${activity.title}?` : ''" @close="later">
    <template v-if="activity">
      <div v-if="step === 'ask'" class="form-actions check-actions">
        <button class="button primary" type="button" @click="step = 'question'">Sí, ya terminé</button>
        <button class="button secondary" type="button" @click="later">Todavía no</button>
        <button class="text-link" type="button" @click="forget">No lo voy a terminar</button>
      </div>
      <ActivityQuestion v-else :activity-key="activity.key" :started-at="pending?.at" @done="done" />
    </template>
  </Modal>
</template>
