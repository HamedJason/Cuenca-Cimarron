// Catálogo de actividades que dan puntos y lo que ya completó el alumno.
// El navegador solo avisa; el servidor decide si suma.
import { ref, computed } from "vue";
import { api, ApiError } from "./api";
import { student, progress } from "./useStudent";

export const activities = ref([]);
let loading = null;

export function loadActivities() {
  loading ??= api("/actividades")
    .then((data) => {
      activities.value = data.activities;
    })
    .catch(() => {
      loading = null;
    });
  return loading;
}

export const activityByKey = computed(() => Object.fromEntries(activities.value.map((a) => [a.key, a])));
export const isDone = (key) => progress.value.completed.includes(key);

function applyResult(key, data) {
  if (!data?.completed) return;
  progress.value = {
    points: data.total ?? progress.value.points,
    completed: progress.value.completed.includes(key) ? progress.value.completed : [...progress.value.completed, key],
  };
}

export async function startActivity(key) {
  if (!student.value) return;
  try {
    await api(`/actividades/${key}/inicio`, { method: "POST" });
  } catch {
    // Si falla, la actividad se abre igual. Al terminar se avisa qué pasó.
  }
}

// Regresa { ok, points, message }.
export async function answerActivity(key, answer) {
  try {
    const data = await api(`/actividades/${key}/respuesta`, { method: "POST", body: { answer } });
    applyResult(key, data);
    return { ok: true, points: data.points, fresh: data.new };
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      return { ok: false, reason: error.errors?.answer ? "invalida" : undefined, message: error.message };
    }
    return { ok: false, message: error.message };
  }
}

export async function finishActivity(key) {
  try {
    const data = await api(`/actividades/${key}/terminar`, { method: "POST" });
    applyResult(key, data);
    return { ok: true, points: data.points };
  } catch (error) {
    return { ok: false, message: error.message, status: error.status };
  }
}

// Los juegos guardan aquí los avisos que no pudieron mandar sin internet.
const PENDING = "cuenca.puntos.pendientes";
export async function retryPending() {
  if (!student.value) return;
  let keys = [];
  try {
    keys = JSON.parse(localStorage.getItem(PENDING) || "[]");
  } catch {
    return;
  }
  if (!Array.isArray(keys) || !keys.length) return;
  const left = [];
  for (const key of keys.slice(0, 20)) {
    if (typeof key !== "string" || !/^[a-z0-9-]{2,60}$/.test(key)) continue;
    const result = await finishActivity(key);
    if (!result.ok && result.status === 0) left.push(key);
  }
  try {
    if (left.length) localStorage.setItem(PENDING, JSON.stringify(left));
    else localStorage.removeItem(PENDING);
  } catch {
    // Sin almacenamiento no hay pendientes que guardar.
  }
}
