<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { motionAllowed } from "../composables/useCanvasScene";
import { ANIM_V } from "../animVersion";

// Animación corta en loop (public/assets/animaciones/<name>.webm, .mp4 y .webp).
// Solo corre en pantalla y se queda en la imagen fija con "Pausar animaciones" o reducir movimiento.
const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: "" },
  // Tamaño del video exportado (las franjas del inicio miden 640x130)
  width: { type: Number, default: 640 },
  height: { type: Number, default: 400 },
});

const base = `/assets/animaciones/${props.name}`;
const video = ref(null);
let visible = false;
let io = null;
let classObserver = null;
let media = null;

function sync() {
  const v = video.value;
  if (!v) return;
  if (visible && motionAllowed()) {
    if (v.preload !== "auto") v.preload = "auto";
    v.play().catch(() => {});
  } else {
    v.pause();
  }
}

onMounted(() => {
  io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    sync();
  });
  io.observe(video.value);
  classObserver = new MutationObserver(sync);
  classObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  media?.addEventListener?.("change", sync);
});

onBeforeUnmount(() => {
  io?.disconnect();
  classObserver?.disconnect();
  media?.removeEventListener?.("change", sync);
});
</script>

<template>
  <video
    ref="video"
    class="anim-clip"
    :poster="`${base}.webp?v=${ANIM_V}`"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    :width="width"
    :height="height"
    muted
    loop
    playsinline
    disablepictureinpicture
    preload="none"
  >
    <source :src="`${base}.webm?v=${ANIM_V}`" type="video/webm" />
    <source :src="`${base}.mp4?v=${ANIM_V}`" type="video/mp4" />
  </video>
</template>
