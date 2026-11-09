import { ref, computed } from "vue";
import { lessons } from "../data";

// Una sola ventana de temas para todo el sitio (se monta en App.vue).
// Información y el inicio la abren con openLesson("mochila"), etc.
const openId = ref(null);

export const activeLesson = computed(
  () => lessons.find((lesson) => lesson.id === openId.value) || null,
);
export function openLesson(id) {
  if (lessons.some((lesson) => lesson.id === id)) openId.value = id;
}
export function closeLesson() {
  openId.value = null;
}
