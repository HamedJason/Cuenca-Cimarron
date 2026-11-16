<script setup>
// En equipos compartidos: al abrir el sitio con sesión guardada se pregunta "¿Eres Ana?".
// Se pregunta una vez por visita.
import { ref, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import Modal from "./Modal.vue";
import { student, studentLogout } from "../composables/useStudent";

const router = useRouter();
const open = ref(false);
const KEY = "cuenca.soy-yo";
function answered() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
watch(
  student,
  (value) => {
    // Se abre después de montar: la ventana solo reacciona a cambios.
    if (value && !answered()) nextTick(() => (open.value = true));
  },
  { immediate: true },
);
function yes() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Sin almacenamiento solo se vuelve a preguntar en la próxima visita.
  }
  open.value = false;
}
async function no() {
  open.value = false;
  await studentLogout();
  router.push("/unirse");
}
</script>
<template>
  <Modal :open="open" :title="student ? `¿Eres ${student.name}?` : ''" @close="yes">
    <p v-if="student">{{ student.classroom }} con {{ student.teacher }}</p>
    <div class="form-actions check-actions">
      <button class="button primary" type="button" @click="yes">Sí, soy yo</button>
      <button class="button secondary" type="button" @click="no">No soy yo</button>
    </div>
  </Modal>
</template>
