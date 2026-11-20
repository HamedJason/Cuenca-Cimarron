// Cimacoins por terminar cada juego (premios termino-*). Solo para el alumno con sesión:
// en cuanto el servidor le marca una actividad completa se pide el premio,
// y el servidor solo lo da si de verdad la tiene completa. Sin sesión no hay monedas.
import { watch } from "vue";
import { progress } from "./useStudent";
import { earn, isAccountWallet, isClaimed, finishRewardId } from "./useCimacoins";

// Juegos propios terminados en este navegador (los anota public/juegos/cuenca-puntos.js).
// Solo sirve para invitar al visitante una vez a entrar con su grupo: no da monedas.
export const FINISHED_GAMES = "cuenca.juegos.terminados";

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
  watch(() => [isAccountWallet.value, progress.value.completed], () => claimStudentFinishes(), { immediate: true });
}
