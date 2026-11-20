<script setup>
// Juegos de otros sitios: cuando el alumno regresa a esta pestaña se le pregunta si ya terminó.
// El servidor revisa cuánto tiempo pasó y, si va bien, hace una pregunta corta sobre el juego
// y da los puntos (y con ellos las Cimacoins de terminar). Sin sesión no se pregunta nada.
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import Modal from "./Modal.vue";
import ActivityQuestion from "./ActivityQuestion.vue";
import { student } from "../composables/useStudent";
import { activityByKey, isDone } from "../composables/useActivities";
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
function check() {
  if (document.visibilityState !== "visible" || open.value || !student.value) return;
  const data = read();
  if (!data) return;
  // A las 3 horas el servidor ya no acepta la respuesta: se deja de preguntar.
  if (Date.now() - data.at > 3 * 3600 * 1000 || isDone(data.key)) {
    clear();
    return;
  }
  // Recién abierto el juego todavía no hay nada que preguntar.
  if (Date.now() - data.at < 20 * 1000) return;
  pending.value = data;
  if (!activity.value) return;
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
      <ActivityQuestion v-else :activity-key="activity.key" @done="done" />
    </template>
  </Modal>
</template>
