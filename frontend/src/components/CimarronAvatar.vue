<script setup>
// Cimarrón del alumno en pequeño (botón de tareas y otros lugares), con el mismo arte de Mi cimarrón.
// El arte (src/avatar/art.js) pesa, así que se descarga solo cuando se muestra un avatar.
// avatar: una pieza por grupo, como lo guarda la cuenta ({ cabeza: "casco-verde", ... }).
import { computed, shallowRef } from "vue";

const props = defineProps({
  avatar: { type: Object, default: () => ({}) },
  size: { type: Number, default: 160 },
  // Solo cabeza y hombros, para tamaños pequeños.
  bust: { type: Boolean, default: true },
  label: String,
});
const art = shallowRef(null);
let loading = null;
function loadArt() {
  loading ??= import("../avatar/art.js").then((module) => (art.value = module));
  return loading;
}
loadArt();
const markup = computed(() => {
  if (!art.value) return "";
  const { svg, assemble } = art.value;
  // Sin marco ni efecto: en pequeño estorban.
  const state = { ...props.avatar, marco: "ninguno", efecto: "ninguno" };
  return svg(assemble(state, { layerIds: false }), props.bust ? "232 120 560 560" : "0 0 1024 1024", props.size);
});
defineExpose({ loadArt });
</script>
<template>
  <span
    class="cimarron-avatar"
    role="img"
    :aria-label="label || 'Cimarrón del alumno'"
    :style="{ width: `${size}px`, height: `${size}px` }"
    v-html="markup"
  />
</template>
<style>
.cimarron-avatar {
  display: inline-block;
  flex: none;
  overflow: hidden;
  border-radius: 50%;
  background: #cfe9d9;
}
.cimarron-avatar svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
