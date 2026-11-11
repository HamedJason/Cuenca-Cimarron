// Modo claro u oscuro. Sigue al sistema (y cambia si el sistema cambia). El botón de media luna
// del encabezado lo cambia a mano; esa elección se guarda en este navegador.
// index.html pone el tema antes de pintar para que no parpadee.
import { ref } from "vue";

const KEY = "cuenca.theme";
const media = window.matchMedia?.("(prefers-color-scheme: dark)") ?? null;

function stored() {
  try {
    const value = localStorage.getItem(KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

const theme = ref(stored() ?? (media?.matches ? "dark" : "light"));

function apply(value) {
  theme.value = value;
  document.documentElement.dataset.theme = value;
}

media?.addEventListener?.("change", (event) => {
  if (!stored()) apply(event.matches ? "dark" : "light");
});

// Si la elección coincide con la del sistema se borra, y el sitio vuelve a seguir al sistema.
function toggleTheme() {
  const next = theme.value === "dark" ? "light" : "dark";
  apply(next);
  const system = media?.matches ? "dark" : "light";
  try {
    if (next === system) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch {
    /* sin almacenamiento: dura hasta recargar */
  }
}

export function useTheme() {
  apply(theme.value);
  return { theme, toggleTheme };
}
