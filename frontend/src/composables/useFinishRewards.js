// Cimacoins por terminar cada juego (premios termino-*). Llegan por dos caminos:
// - Visitante sin cuenta: los juegos propios anotan en este navegador que se terminaron
//   (public/juegos/cuenca-puntos.js) y aquí se cobran. Los juegos de otros sitios se cobran
//   al contestar bien la pregunta al regresar (ExternalReturn.vue).
// - Alumno con sesión: en cuanto el servidor le marca una actividad completa se pide el premio,
//   y el servidor solo lo da si de verdad la tiene completa.
import { watch } from "vue";
import { progress } from "./useStudent";
import { earn, isAccountWallet, isClaimed, finishRewardId } from "./useCimacoins";

export const FINISHED_GAMES = "cuenca.juegos.terminados";

function finishedHere() {
  try {
    const list = JSON.parse(localStorage.getItem(FINISHED_GAMES) || "[]");
    return Array.isArray(list) ? list.filter((key) => typeof key === "string") : [];
  } catch {
    return [];
  }
}

// Premios de los juegos terminados en este navegador (solo cartera de visitante).
export async function claimLocalFinishes() {
  if (isAccountWallet.value) return;
  for (const key of finishedHere()) {
    const id = finishRewardId(key);
    if (id && !isClaimed(id)) await earn(id);
  }
}

// Premios de las actividades que el servidor ya le marcó completas al alumno.
export async function claimStudentFinishes(completed = progress.value.completed) {
  if (!isAccountWallet.value) return;
  for (const key of completed) {
    const id = finishRewardId(key);
    if (id && !isClaimed(id)) await earn(id);
  }
}

let started = false;
export function setupFinishRewards() {
  if (started || typeof window === "undefined") return;
  started = true;
  // El juego se abre en otra pestaña: cuando anota que terminó, esta pestaña se entera.
  window.addEventListener("storage", (event) => {
    if (event.key === FINISHED_GAMES) claimLocalFinishes();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") claimLocalFinishes();
  });
  watch(() => [isAccountWallet.value, progress.value.completed], () => claimStudentFinishes(), { immediate: true });
  claimLocalFinishes();
}
