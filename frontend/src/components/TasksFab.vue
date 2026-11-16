<script setup>
// Botón flotante del alumno: "Tareas 2 de 5". Abre su lista con puntos, tareas y actividades extra.
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "./Icon.vue";
import Modal from "./Modal.vue";
import { student, progress, studentLogout } from "../composables/useStudent";
import { tasks } from "../composables/useTasks";
import { activities, isDone } from "../composables/useActivities";

const route = useRoute();
const router = useRouter();
const open = ref(false);
const done = computed(() => tasks.value.filter((t) => t.done).length);
const extras = computed(() => activities.value.filter((a) => !tasks.value.some((t) => t.key === a.key)));
const label = computed(() => (tasks.value.length ? `Tareas ${done.value} de ${tasks.value.length}` : `${progress.value.points} puntos`));
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
      <img src="/brand/cuenca/icono-96.webp" alt="" width="40" height="40" />
      <span>{{ label }}</span>
    </button>
    <Modal :open="open" :title="student.name" class="tasks-sheet" @close="open = false">
      <p class="muted-text">{{ student.classroom }} con {{ student.teacher }}</p>
      <div class="tasks-points">
        <Icon name="star" :size="30" />
        <strong>{{ progress.points }}</strong>
        <span>puntos</span>
      </div>

      <h3 class="tasks-title">Mis tareas</h3>
      <p v-if="!tasks.length" class="muted-text">Tu docente todavía no te deja tareas</p>
      <ul v-else class="tasks-list">
        <li v-for="task in tasks" :key="task.key" :class="{ done: task.done }">
          <span class="tasks-check" aria-hidden="true"><Icon v-if="task.done" name="check" :size="20" /></span>
          <RouterLink :to="task.route" class="tasks-link">
            <span>{{ task.title }}</span>
            <small>{{ task.done ? "Hecha" : `+${task.points} puntos` }}<template v-if="task.due_date && !task.done"> · para el {{ dateText(task.due_date) }}</template></small>
          </RouterLink>
          <span class="sr-only">{{ task.done ? "Hecha" : "Pendiente" }}</span>
        </li>
      </ul>

      <template v-if="extras.length">
        <h3 class="tasks-title">Más actividades con puntos</h3>
        <ul class="tasks-list">
          <li v-for="item in extras" :key="item.key" :class="{ done: isDone(item.key) }">
            <span class="tasks-check" aria-hidden="true"><Icon v-if="isDone(item.key)" name="check" :size="20" /></span>
            <RouterLink :to="item.route" class="tasks-link">
              <span>{{ item.title }}</span>
              <small>{{ isDone(item.key) ? "Hecha" : `+${item.points} puntos` }}</small>
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
