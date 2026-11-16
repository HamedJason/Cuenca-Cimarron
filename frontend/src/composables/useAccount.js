// Sesión de escuela o administrador. Se pide una vez y se comparte entre páginas.
import { ref } from "vue";
import { api } from "./api";

export const account = ref(null);
export const setupNeeded = ref(false);
export const accountState = ref("idle");
let loading = null;

export function loadAccount(force = false) {
  if (loading && !force) return loading;
  accountState.value = "loading";
  loading = api("/sesion")
    .then((data) => {
      account.value = data.user;
      setupNeeded.value = data.setup_needed;
      accountState.value = "ready";
    })
    .catch(() => {
      accountState.value = "offline";
      loading = null;
    });
  return loading;
}

export function setAccount(user) {
  account.value = user;
  accountState.value = "ready";
}

export async function logout() {
  await api("/salir", { method: "POST" }).catch(() => {});
  account.value = null;
}

export const levels = [
  { value: "preescolar", label: "Preescolar" },
  { value: "primaria", label: "Primaria" },
  { value: "secundaria", label: "Secundaria" },
  { value: "media-superior", label: "Media superior" },
];
export const shifts = [
  { value: "matutino", label: "Matutino" },
  { value: "vespertino", label: "Vespertino" },
  { value: "nocturno", label: "Nocturno" },
  { value: "completo", label: "Tiempo completo" },
];
export const sectors = [
  { value: "publica", label: "Pública" },
  { value: "privada", label: "Privada" },
];
export const labelOf = (list, value) => list.find((item) => item.value === value)?.label ?? value;

// CCT: 2 números de estado, 3 letras, 4 números y una letra. Ejemplo 02DPR0123X.
export const cctPattern = /^\d{2}[A-Z]{3}\d{4}[A-Z]$/;
