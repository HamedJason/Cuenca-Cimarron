// Contador de visitas compartido: lo usan el pie de página y el inicio.
// App.vue registra la visita al cargar el sitio; el inicio solo lee la cifra.
import { ref } from "vue";

const stats = ref(null);
const statsState = ref("loading");
let pending = null;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Identificadores al azar del navegador y de la sesión (también los usa el contador de juegos).
export function browserIds() {
  let visitor = localStorage.getItem("cuenca.visitor");
  let session = sessionStorage.getItem("cuenca.session");
  if (!visitor || !uuidPattern.test(visitor)) {
    visitor = crypto.randomUUID();
    localStorage.setItem("cuenca.visitor", visitor);
  }
  if (!session || !uuidPattern.test(session)) {
    session = crypto.randomUUID();
    sessionStorage.setItem("cuenca.session", session);
  }
  return { visitor, session };
}

async function request() {
  statsState.value = "loading";
  try {
    const { visitor, session } = browserIds();
    const response = await fetch("/api/visits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ visitor_id: visitor, session_id: session }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Unavailable");
    const data = await response.json();
    if (
      !Number.isInteger(data.unique_visitors) ||
      !Number.isInteger(data.total_visits)
    )
      throw new Error("Invalid metrics");
    stats.value = data;
    statsState.value = "ready";
  } catch {
    statsState.value = "offline";
  } finally {
    pending = null;
  }
}

// Registra la visita y trae la cifra; si ya hay una consulta en curso, la reutiliza.
function loadStats() {
  pending ??= request();
  return pending;
}

export function useVisits() {
  return { stats, statsState, loadStats };
}
