// Cimacoins: la cartera del avatar cimarrón.
// Versión local: todo se guarda en este navegador. Este archivo es ligero (no
// carga el arte del avatar) porque se usa en todo el sitio para dar monedas.
// Cuando exista el inicio de sesión de escuelas, earn() debe pedirle al servidor
// que valide y guarde el premio; aquí solo se evita darlo dos veces.
import { ref, computed } from "vue";

export const WALLET_KEY = "cuenca-cimarrona.economia.v1";
export const STARTER_COINS = 80;

// Premios del sitio. Cada uno se entrega una sola vez (o una vez al día si es daily).
// items: cosméticos que se agregan a la colección junto con las monedas.
export const siteRewards = {
  "visita-diaria": { coins: 20, daily: true, label: "Visita del día" },
  "juego-mision-tijuana": { coins: 40, label: "Abriste Misión Tijuana" },
  "juego-alerta-911": { coins: 40, label: "Abriste Alerta 911" },
  "juego-novela-visual": { coins: 40, label: "Abriste Un paso en falso" },
  "juego-cinco-segundos": { coins: 40, label: "Abriste 5 segundos" },
  "juego-cien-estudiantes": { coins: 40, label: "Abriste 100 estudiantes dijeron" },
  "juego-mochila": { coins: 40, label: "Abriste Arma tu mochila" },
  "mochila-lista": { coins: 100, items: ["espalda/mochila"], label: "Mochila de emergencia lista" },
  "plan-listo": { coins: 100, items: ["cuello/medalla"], label: "Plan familiar completo" },
  "botiquin-listo": { coins: 60, label: "Botiquín completo" },
  explorador: { coins: 60, items: ["marco/explorador"], label: "Visitaste todas las secciones" },
  // Monedas escondidas en los temas y en las páginas
  "moneda-conozca": { coins: 30, label: "Moneda escondida" },
  "moneda-planfamiliar": { coins: 30, label: "Moneda escondida" },
  "moneda-mochila": { coins: 30, label: "Moneda escondida" },
  "moneda-salud": { coins: 30, label: "Moneda escondida" },
  "moneda-911": { coins: 30, label: "Moneda escondida" },
  "moneda-consejos": { coins: 30, label: "Moneda escondida" },
  "moneda-equipo": { coins: 30, label: "Moneda escondida" },
  "moneda-familias": { coins: 30, label: "Moneda escondida" },
};
// Páginas que cuentan para el premio de explorador
export const explorerPages = ["/", "/juegos", "/informacion", "/consejos", "/equipo", "/migrantes"];

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

export const wallet = ref(read());
export const coins = computed(() => wallet.value.coins);
// Último premio, para el aviso flotante
export const lastReward = ref(null);

function save() {
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet.value));
  } catch {
    // Sin almacenamiento las monedas duran lo que dure la pestaña.
  }
}

// Aplica un cambio sobre lo más reciente guardado (por si hay otra pestaña abierta).
// transform devuelve la cartera nueva o null si no hay cambio.
export function updateWallet(transform) {
  const run = () => {
    const latest = read();
    const next = transform(latest);
    wallet.value = next ? normalizeWallet(next) : latest;
    if (next) save();
    return Boolean(next);
  };
  return run();
}

export const isClaimed = (id, w = wallet.value) =>
  siteRewards[id]?.daily ? w.dailyClaims[id] === localDay() : w.claimed.includes(id);

// Entrega un premio del sitio. Devuelve true si se dio ahora.
export function earn(id) {
  const reward = siteRewards[id];
  if (!reward) return false;
  const given = updateWallet((w) => {
    if (isClaimed(id, w)) return null;
    return {
      ...w,
      coins: w.coins + reward.coins,
      owned: [...new Set([...w.owned, ...(reward.items || [])])],
      claimed: reward.daily ? w.claimed : [...w.claimed, id],
      dailyClaims: reward.daily ? { ...w.dailyClaims, [id]: localDay() } : w.dailyClaims,
    };
  });
  if (given) lastReward.value = { id, ...reward, at: Date.now() };
  return given;
}

// Cuenta la visita a una sección; al ver todas se entrega el premio de explorador.
export function visitPage(path) {
  if (!explorerPages.includes(path)) return;
  updateWallet((w) => (w.visited.includes(path) ? null : { ...w, visited: [...w.visited, path] }));
  if (explorerPages.every((p) => wallet.value.visited.includes(p))) earn("explorador");
}

// Otra pestaña cambió la cartera: se actualiza el saldo aquí también.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === WALLET_KEY) wallet.value = read();
  });
}
