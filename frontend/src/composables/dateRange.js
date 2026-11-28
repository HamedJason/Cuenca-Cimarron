// Filtro de fechas de los paneles: Desde, Hasta y atajos. Las fechas van como YYYY-MM-DD.
import { computed, ref } from "vue";

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const presets = [
  { id: "mes", label: "Este mes" },
  { id: "30", label: "Últimos 30 días" },
  { id: "todo", label: "Todo" },
];

export function useDateRange() {
  const desde = ref("");
  const hasta = ref("");
  const bad = computed(() => Boolean(desde.value && hasta.value && hasta.value < desde.value));
  function apply(id, today = new Date()) {
    if (id === "todo") {
      desde.value = "";
      hasta.value = "";
    } else if (id === "mes") {
      desde.value = iso(new Date(today.getFullYear(), today.getMonth(), 1));
      hasta.value = iso(today);
    } else {
      desde.value = iso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29));
      hasta.value = iso(today);
    }
  }
  // Parámetros para la API (sin los vacíos)
  const params = (extra = {}) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...extra, desde: desde.value, hasta: hasta.value })) if (v) p.set(k, v);
    return p.toString();
  };
  return { desde, hasta, bad, apply, params };
}
