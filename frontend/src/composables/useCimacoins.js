// Cimacoins: la cartera del avatar cimarrón. Este archivo es ligero (no carga el arte
// del avatar) porque se usa en todo el sitio para dar monedas.
//
// Hay dos carteras con la misma forma:
// - Visitante sin cuenta: se guarda en este navegador (localStorage).
// - Alumno con sesión: se guarda en su cuenta (students.wallet) y el servidor valida
//   cada premio y cada compra. Sus puntos de actividades también le dan Cimacoins.
// Las páginas no tienen que saber cuál es: usan earn, buy, completeChallenge,
// revealSecret y saveAvatar, que regresan una promesa con true si hubo cambio.
// Ver docs/avatar-cimarron.md.
import { ref, computed } from "vue";
import { api } from "./api";
import { student, teacher, progress, studentState, loadStudent } from "./useStudent";
import { STARTER_COINS, siteRewards, explorerPages, finishRewardId } from "../avatar/rewards.js";

export { STARTER_COINS, siteRewards, explorerPages, finishRewardId };
export const WALLET_KEY = "cuenca-cimarrona.economia.v1";
export const AVATAR_KEY = "cuenca-cimarrona.avatar.v1";

export const localDay = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const strings = (value) =>
  Array.isArray(value) ? [...new Set(value.filter((v) => typeof v === "string"))] : [];

// Revisión básica de lo guardado: si algo no tiene la forma esperada se usa el inicio.
export function normalizeWallet(raw) {
  const saved = raw?.version === 1;
  const day = (value) => (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "");
  return {
    version: 1,
    coins: saved && Number.isSafeInteger(raw.coins) && raw.coins >= 0 ? raw.coins : STARTER_COINS,
    owned: saved ? strings(raw.owned) : [],
    completed: saved ? strings(raw.completed) : [],
    daily: saved ? day(raw.daily) : "",
    angelic: saved && raw.angelic === true,
    claimed: saved ? strings(raw.claimed).filter((id) => siteRewards[id] && !siteRewards[id].daily) : [],
    dailyClaims:
      saved && raw.dailyClaims && typeof raw.dailyClaims === "object"
        ? Object.fromEntries(
            Object.entries(raw.dailyClaims).filter(([id, d]) => siteRewards[id]?.daily && day(d)),
          )
        : {},
    visited: saved ? strings(raw.visited).filter((p) => explorerPages.includes(p)) : [],
  };
}

function read() {
  try {
    return normalizeWallet(JSON.parse(localStorage.getItem(WALLET_KEY)));
  } catch {
    return normalizeWallet(null);
  }
}

// Cartera de este navegador. Para el alumno solo se usa la lista de secciones visitadas.
const localWallet = ref(read());

// ¿La cartera es la de la cuenta del alumno?
export const isAccountWallet = computed(() => Boolean(student.value?.wallet));
// Solo los alumnos con sesión ganan Cimacoins. Los docentes se personalizan con todo desbloqueado.
// Los visitantes sin cuenta juegan igual, pero sin monedas ni personalización.
export const earnsCoins = computed(() => Boolean(student.value));
export const isTeacherAvatar = computed(() => !student.value && Boolean(teacher.value));
export const canCustomize = computed(() => earnsCoins.value || isTeacherAvatar.value);

// Cartera que ve el sitio. Para el alumno el saldo se recalcula con sus puntos,
// así sube en cuanto gana puntos sin volver a pedir nada al servidor.
export const wallet = computed(() => {
  const account = student.value?.wallet;
  if (!account) return localWallet.value;
  const coins = account.extra + progress.value.points * (account.perPoint ?? 0);
  return { ...account, coins: Math.max(0, coins), visited: localWallet.value.visited };
});
export const coins = computed(() => wallet.value.coins);
// Último premio, para el aviso flotante
export const lastReward = ref(null);

function save() {
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(localWallet.value));
  } catch {
    // Sin almacenamiento las monedas duran lo que dure la pestaña.
  }
}

// Aplica un cambio sobre lo más reciente guardado (por si hay otra pestaña abierta).
// transform devuelve la cartera nueva o null si no hay cambio. Solo para la cartera local.
export function updateWallet(transform) {
  const latest = read();
  const next = transform(latest);
  localWallet.value = next ? normalizeWallet(next) : latest;
  if (next) save();
  return Boolean(next);
}

// Respuesta del servidor: cartera y avatar nuevos del alumno.
function applyAccount(data) {
  if (!student.value || !data?.wallet) return;
  student.value = { ...student.value, wallet: data.wallet, avatar: data.avatar ?? student.value.avatar };
}

// Antes de dar un premio se espera a saber si hay alumno, para no darlo a la cartera equivocada.
async function ready() {
  if (studentState.value === "idle" || studentState.value === "loading") await loadStudent();
  return isAccountWallet.value;
}

export const isClaimed = (id, w = wallet.value) =>
  siteRewards[id]?.daily ? w.dailyClaims?.[id] === localDay() : (w.claimed ?? []).includes(id);

// Entrega un premio del sitio. Resuelve true si se dio ahora.
export async function earn(id) {
  const reward = siteRewards[id];
  if (!reward) return false;
  let given = false;
  // Sin alumno con sesión no hay monedas.
  if (!(await ready())) return false;
  if (await ready()) {
    if (isClaimed(id)) return false;
    try {
      const data = await api("/yo/cimacoins/premio", { method: "POST", body: { id } });
      applyAccount(data);
      given = data.new === true;
    } catch {
      return false;
    }
  } else {
    given = updateWallet((w) => {
      if (isClaimed(id, w)) return null;
      return {
        ...w,
        coins: w.coins + reward.coins,
        owned: [...new Set([...w.owned, ...(reward.items || [])])],
        claimed: reward.daily ? w.claimed : [...w.claimed, id],
        dailyClaims: reward.daily ? { ...w.dailyClaims, [id]: localDay() } : w.dailyClaims,
      };
    });
  }
  if (given) lastReward.value = { id, ...reward, at: Date.now() };
  return given;
}

// Cuenta la visita a una sección; al ver todas se entrega el premio de explorador.
// Las secciones visitadas se cuentan en cada navegador.
export function visitPage(path) {
  if (!earnsCoins.value || !explorerPages.includes(path)) return;
  updateWallet((w) => (w.visited.includes(path) ? null : { ...w, visited: [...w.visited, path] }));
  if (explorerPages.every((p) => localWallet.value.visited.includes(p))) earn("explorador");
}

// Las reglas puras están en avatar/economy.js. Se cargan solo cuando se necesitan
// para no traer la tienda a todas las páginas.
const economy = () => import("../avatar/economy.js");

// Compra una pieza ({group, id}) o un kit ({kit}). Resuelve { ok, message }.
export async function buy(target) {
  if (!(await ready())) return { ok: false, message: "Entra con el código de tu grupo para comprar" };
  if (await ready()) {
    try {
      const body = target.kit ? { kit: target.kit } : { group: target.group, id: target.id };
      applyAccount(await api("/yo/cimacoins/compra", { method: "POST", body }));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.errors?.id || error.message };
    }
  }
  const { purchase } = await economy();
  return { ok: updateWallet((latest) => purchase(latest, target)) };
}

// Reto de "Ganar monedas" con la secuencia correcta. Resuelve true si dio monedas ahora.
export async function completeChallenge(id, answer, day) {
  if (!(await ready())) return false;
  if (await ready()) {
    try {
      const data = await api("/yo/cimacoins/reto", { method: "POST", body: { id } });
      applyAccount(data);
      return data.new === true;
    } catch {
      return false;
    }
  }
  const { completeActivity } = await economy();
  return updateWallet((latest) => completeActivity(latest, id, answer, day));
}

// Secreto del Cimarrón Angelical. Resuelve true si se desbloqueó.
export async function revealSecret(answer) {
  if (!(await ready())) return false;
  if (await ready()) {
    try {
      applyAccount(await api("/yo/cimacoins/secreto", { method: "POST", body: { answer } }));
      return true;
    } catch {
      return false;
    }
  }
  const { unlockSecret } = await economy();
  return updateWallet((latest) => unlockSecret(latest, answer));
}

// Avatar puesto: el del alumno viene de su cuenta; el del visitante, de este navegador.
export function savedAvatar() {
  if (isAccountWallet.value) return student.value.avatar ?? {};
  if (isTeacherAvatar.value) return teacher.value.avatar ?? {};
  try {
    return JSON.parse(localStorage.getItem(AVATAR_KEY)) ?? {};
  } catch {
    return {};
  }
}

// Guarda el avatar. Para el alumno se espera un momento por si sigue cambiando piezas.
let avatarTimer;
export function saveAvatar(state) {
  if (isTeacherAvatar.value) {
    teacher.value = { ...teacher.value, avatar: state };
    clearTimeout(avatarTimer);
    return new Promise((resolve) => {
      avatarTimer = setTimeout(async () => {
        try {
          await api("/docente/cimarron", { method: "PUT", body: { avatar: state } });
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 600);
    });
  }
  if (!isAccountWallet.value) {
    try {
      localStorage.setItem(AVATAR_KEY, JSON.stringify(state));
      return Promise.resolve(true);
    } catch {
      return Promise.resolve(false);
    }
  }
  student.value = { ...student.value, avatar: state };
  clearTimeout(avatarTimer);
  return new Promise((resolve) => {
    avatarTimer = setTimeout(async () => {
      try {
        applyAccount(await api("/yo/cimarron", { method: "PUT", body: { avatar: state } }));
        resolve(true);
      } catch {
        resolve(false);
      }
    }, 600);
  });
}

// Otra pestaña cambió la cartera local: se actualiza el saldo aquí también.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === WALLET_KEY) localWallet.value = read();
  });
}
