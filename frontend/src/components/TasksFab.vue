<script setup>
import { coins } from "../composables/useCimacoins";
import { COINS_PER_POINT } from "../avatar/rewards.js";
// Botón flotante del alumno: "Tareas 2 de 5". Abre su lista con sus Cimacoins, tareas y actividades extra.
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "./Icon.vue";
import Modal from "./Modal.vue";
import CimarronAvatar from "./CimarronAvatar.vue";
import { student, progress, studentLogout } from "../composables/useStudent";
import { tasks } from "../composables/useTasks";
import { activities, isDone } from "../composables/useActivities";

const route = useRoute();
const router = useRouter();
const open = ref(false);
const done = computed(() => tasks.value.filter((t) => t.done).length);
const extras = computed(() => activities.value.filter((a) => !tasks.value.some((t) => t.key === a.key)));
const label = computed(() => (tasks.value.length ? `Tareas ${done.value} de ${tasks.value.length}` : `${coins.value.toLocaleString("es-MX")} Cimacoins`));
watch(
  () => route.fullPath,
  () => (open.value = false),
);
const dateText = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long" });
async function leave() {
  open.value = false;
  await studentLogout();
  router.push("/");
}
</script>
<template>
  <template v-if="student">
    <button class="tasks-fab" type="button" :aria-label="`${label}. Abrir mi lista`" @click="open = true">
      <CimarronAvatar :avatar="student.avatar" :size="48" label="" aria-hidden="true" />
      <span>{{ label }}</span>
    </button>
    <Modal :open="open" :title="student.name" class="tasks-sheet" @close="open = false">
      <p class="muted-text">{{ student.classroom }} con {{ student.teacher }}</p>
      <div class="tasks-points">
        <Icon name="coin" :size="30" />
        <strong>{{ coins.toLocaleString("es-MX") }}</strong>
        <span>Cimacoins</span>
      </div>

      <h3 class="tasks-title">Mis tareas</h3>
      <p v-if="!tasks.length" class="muted-text">Tu docente todavía no te deja tareas</p>
      <ul v-else class="tasks-list">
        <li v-for="task in tasks" :key="task.key" :class="{ done: task.done }">
          <span class="tasks-check" aria-hidden="true"><Icon v-if="task.done" name="check" :size="20" /></span>
          <RouterLink :to="task.route" class="tasks-link">
            <span>{{ task.title }}</span>
            <small>{{ task.done ? "Hecha" : `+${task.points * COINS_PER_POINT} Cimacoins` }}<template v-if="task.due_date && !task.done"> · para el {{ dateText(task.due_date) }}</template></small>
          </RouterLink>
          <span class="sr-only">{{ task.done ? "Hecha" : "Pendiente" }}</span>
        </li>
      </ul>

      <template v-if="extras.length">
        <h3 class="tasks-title">Más actividades para ganar Cimacoins</h3>
        <ul class="tasks-list">
          <li v-for="item in extras" :key="item.key" :class="{ done: isDone(item.key) }">
            <span class="tasks-check" aria-hidden="true"><Icon v-if="isDone(item.key)" name="check" :size="20" /></span>
            <RouterLink :to="item.route" class="tasks-link">
              <span>{{ item.title }}</span>
              <small>{{ isDone(item.key) ? "Hecha" : `+${item.points * COINS_PER_POINT} Cimacoins` }}</small>
            </RouterLink>
          </li>
        </ul>
      </template>

      <div class="form-actions tasks-actions">
        <RouterLink to="/mi-cimarron" class="button primary"><Icon name="palette" :size="20" />Mi cimarrón</RouterLink>
        <button class="button secondary" type="button" @click="leave"><Icon name="exit" :size="20" />Salir</button>
      </div>
    </Modal>
  </template>
</template>
