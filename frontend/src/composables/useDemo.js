// Modo testeo (/testeo_20nov): se recuerda en este navegador para mostrar en todo el sitio
// los botones "Regresar a testeo" y "Salir de testeo".
import { ref } from "vue";
import { api } from "./api";

const KEY = "cuenca.testeo";

function read() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export const inDemo = ref(read());

export function markDemo() {
  inDemo.value = true;
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // Sin almacenamiento los botones solo duran mientras no se recargue
  }
}

export function clearDemo() {
  inDemo.value = false;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Igual que arriba
  }
}

// Si la demo ya se apagó (o pasaron las 24 horas) los botones desaparecen solos
export async function checkDemo() {
  if (!inDemo.value) return;
  try {
    await api("/demo");
  } catch (e) {
    if (e.status === 404) clearDemo();
  }
}

// Cierra todas las cuentas demo de este navegador y sale del modo testeo
export async function leaveDemo() {
  await api("/demo/salir", { method: "POST" }).catch(() => {});
  try {
    sessionStorage.removeItem("cuenca.soy-yo");
  } catch {
    // Igual que arriba
  }
  clearDemo();
}
