// Tareas que asignó el docente al grupo del alumno. Llegan con /api/yo.
import { ref } from "vue";

export const tasks = ref([]);
export const isAssigned = (key) => tasks.value.some((task) => task.key === key);
