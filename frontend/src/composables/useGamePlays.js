// Entradas a cada juego (el ojito de las tarjetas). Se cuenta un clic en
// "Jugar ahora" por navegador y sesión; el servidor guarda la cifra para todos.
import { ref } from "vue";
import { browserIds } from "./useVisits";

const plays = ref({});
let loading = null;

export function loadPlays() {
  loading ??= fetch("/api/game-sessions", {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (data?.plays && typeof data.plays === "object") plays.value = data.plays;
    })
    .catch(() => {
      // Sin servidor no se muestra el ojito: nunca cifras inventadas.
      loading = null;
    });
  return loading;
}

export async function registerPlay(game) {
  try {
    const { visitor, session } = browserIds();
    const response = await fetch("/api/game-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ visitor_id: visitor, session_id: session, game }),
      // El juego se abre en otra pestaña: la petición termina aunque cambie el foco.
      keepalive: true,
    });
    if (!response.ok) return;
    const data = await response.json();
    if (Number.isInteger(data.plays)) plays.value = { ...plays.value, [game]: data.plays };
  } catch {
    // Si falla, el juego se abre igual.
  }
}

export function useGamePlays() {
  return { plays, loadPlays, registerPlay };
}
