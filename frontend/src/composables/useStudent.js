// Alumno con sesión en este equipo. El sitio pregunta una sola vez al abrir (/api/yo).
import { ref, computed } from "vue";
import { api } from "./api";
import { tasks } from "./useTasks";

export const student = ref(null);
// Docente con sesión en este equipo: arma su cimarrón con todo desbloqueado, sin monedas.
export const teacher = ref(null);
// Puntos y actividades completadas. Siempre vienen del servidor.
export const progress = ref({ points: 0, completed: [] });
export const studentState = ref("idle");
let loading = null;

export function loadStudent(force = false) {
  if (loading && !force) return loading;
  studentState.value = "loading";
  loading = api("/yo")
    .then((data) => {
      student.value = data.student;
      teacher.value = data.teacher ?? null;
      progress.value = data.progress ?? { points: 0, completed: [] };
      tasks.value = data.tasks ?? [];
      studentState.value = "ready";
      return data;
    })
    .catch(() => {
      studentState.value = "offline";
      loading = null;
    });
  return loading;
}

export function setStudent(data) {
  student.value = data;
  studentState.value = "ready";
  loading = null;
  // Al entrar se vuelve a pedir todo (puntos, tareas) con la sesión nueva.
  loadStudent(true);
  import("./useActivities").then((module) => module.loadActivities());
}

export async function studentLogout() {
  await api("/yo/salir", { method: "POST" }).catch(() => {});
  student.value = null;
  progress.value = { points: 0, completed: [] };
  tasks.value = [];
  try {
    sessionStorage.removeItem("cuenca.soy-yo");
  } catch {
    // Sin almacenamiento la pregunta vuelve a salir, no pasa nada.
  }
}

export const isStudent = computed(() => Boolean(student.value));
