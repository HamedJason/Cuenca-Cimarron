import { ref, watch } from "vue";
export const storageAvailable = ref(true);
export function readList(raw, allowed) {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value)
      ? [...new Set(value.filter((v) => allowed.includes(v)))]
      : [];
  } catch {
    return [];
  }
}
export function savedList(key, allowed) {
  let initial = [];
  try {
    initial = readList(localStorage.getItem(key), allowed);
  } catch {
    storageAvailable.value = false;
  }
  const state = ref(initial);
  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        storageAvailable.value = false;
      }
    },
    { deep: true },
  );
  return state;
}
