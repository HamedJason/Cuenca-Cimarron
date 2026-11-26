// Comunidad Cimarrona: opiniones anónimas (docs/comunidad-cimarrona.md).
// El dispositivo solo guarda un número al azar para el freno de spam y cuándo mandó su última opinión.
// Los juegos propios usan las mismas llaves desde public/juegos/cuenca-puntos.js.
import { ref } from "vue";
import { api, ApiError } from "./api";

export const OPINION_KEYS = {
  device: "cuenca.opinion.dispositivo",
  sent: "cuenca.opinion.enviada",
  closed: "cuenca.opinion.aviso-cerrado",
  time: "cuenca.opinion.tiempo",
  pending: "cuenca.opinion.pendiente",
};
export const MAX_COMMENT = 500;
// Al terminar una actividad no se vuelve a pedir si ya opinó en la última hora.
export const GATE_PAUSE_MS = 60 * 60 * 1000;

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Sin almacenamiento el sitio funciona igual, solo no recuerda.
  }
}

function newId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64;
  b[8] = (b[8] & 63) | 128;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export function deviceId() {
  let id = read(OPINION_KEYS.device);
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    id = newId();
    write(OPINION_KEYS.device, id);
  }
  return id;
}

export const lastSentAt = ref(Number(read(OPINION_KEYS.sent)) || 0);
export const hasOpined = () => lastSentAt.value > 0;
export const sentRecently = (ms = GATE_PAUSE_MS) => lastSentAt.value > 0 && Date.now() - lastSentAt.value < ms;

function markSent() {
  lastSentAt.value = Date.now();
  write(OPINION_KEYS.sent, String(lastSentAt.value));
}

// Regresa { ok, summary } o { ok: false, message, errors }.
// offline: true guarda la opinión para mandarla después (la usa la ventana obligatoria).
export async function sendOpinion({ rating, comment = "", sitio = "", origin = "comunidad" }, { offline = false } = {}) {
  const body = { rating, comment: comment.trim() || null, device: deviceId(), origin, sitio };
  try {
    const data = await api("/opiniones", { method: "POST", body });
    markSent();
    return { ok: true, summary: data.summary };
  } catch (error) {
    if (error instanceof ApiError && error.status === 0 && offline) {
      write(OPINION_KEYS.pending, JSON.stringify(body));
      markSent();
      return { ok: true, queued: true };
    }
    return { ok: false, status: error.status, message: error.message, errors: error.errors ?? {} };
  }
}

// Opinión que no salió por falta de internet: se manda la próxima vez que abra el sitio.
export async function retryPendingOpinion() {
  let body;
  try {
    body = JSON.parse(read(OPINION_KEYS.pending) || "null");
  } catch {
    body = null;
  }
  if (!body?.rating) return;
  try {
    await api("/opiniones", { method: "POST", body: { ...body, device: deviceId() } });
    write(OPINION_KEYS.pending, null);
  } catch (error) {
    // Sin internet se queda para otra vez. Si el servidor la rechaza, se olvida.
    if (error.status !== 0) write(OPINION_KEYS.pending, null);
  }
}

export async function loadOpinions(before = 0) {
  return api(`/opiniones${before ? `?antes_de=${before}` : ""}`);
}

// Ventana obligatoria al terminar una actividad. Regresa una promesa que se cumple cuando ya opinó
// (o de inmediato si opinó en la última hora, para no pedirlo en cada actividad).
export const gate = ref(null);
export function requireOpinion() {
  if (sentRecently()) return Promise.resolve();
  if (gate.value) return gate.value.promise;
  let resolve;
  const promise = new Promise((r) => (resolve = r));
  gate.value = { promise, resolve };
  return promise;
}
export function releaseGate() {
  gate.value?.resolve();
  gate.value = null;
}

// Aviso de los 5 minutos: tiempo de uso acumulado en este dispositivo.
export const TOAST_AFTER_S = 5 * 60;
// Si lo cierra, no vuelve a salir en una semana.
export const TOAST_PAUSE_MS = 7 * 24 * 60 * 60 * 1000;
export const usedSeconds = () => Number(read(OPINION_KEYS.time)) || 0;
export function addUsedSeconds(seconds) {
  write(OPINION_KEYS.time, String(usedSeconds() + seconds));
}
export function toastDismissedRecently() {
  const at = Number(read(OPINION_KEYS.closed)) || 0;
  return at > 0 && Date.now() - at < TOAST_PAUSE_MS;
}
export function dismissToast() {
  write(OPINION_KEYS.closed, String(Date.now()));
}

const rtf = typeof Intl !== "undefined" && Intl.RelativeTimeFormat ? new Intl.RelativeTimeFormat("es-MX", { numeric: "auto" }) : null;
export function relativeDate(iso, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 15 * 60) return "hace un momento";
  if (!rtf) return new Date(iso).toLocaleDateString("es-MX");
  const steps = [
    [3600, "minute", 60],
    [86400, "hour", 3600],
    [604800, "day", 86400],
    [2629800, "week", 604800],
    [31557600, "month", 2629800],
  ];
  for (const [limit, unit, size] of steps) {
    if (abs < limit) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(Math.round(seconds / 31557600), "year");
}
