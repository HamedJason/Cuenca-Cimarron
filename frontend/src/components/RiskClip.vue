<!-- Animación corta en loop para las tarjetas de riesgo. Solo corre en pantalla y se queda en la imagen fija con Pausar animaciones o reducir movimiento. -->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { motionAllowed } from "../composables/useCanvasScene";
import { ANIM_V } from "../animVersion";

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, default: "" },
});

const base = computed(() => "/assets/animaciones/riesgo-" + props.name);
const video = ref(null);
let visible = false;
let io = null;
let mo = null;
let mq = null;

function sync() {
  const el = video.value;
  if (!el) return;
  if (visible && motionAllowed()) {
    el.preload = "auto";
    el.play()?.catch(() => {});
  } else {
    el.pause();
  }
}

onMounted(() => {
  io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    sync();
  });
  io.observe(video.value);
  mo = new MutationObserver(sync);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  mq?.addEventListener?.("change", sync);
});

onBeforeUnmount(() => {
  io?.disconnect();
  mo?.disconnect();
  mq?.removeEventListener?.("change", sync);
});
</script>

<template>
  <video
    ref="video"
    class="risk-clip"
    :poster="base + '.webp?v=' + ANIM_V"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
    width="640"
    height="400"
    muted
    loop
    playsinline
    disablepictureinpicture
    preload="none"
  >
    <source :src="base + '.webm?v=' + ANIM_V" type="video/webm" />
    <source :src="base + '.mp4?v=' + ANIM_V" type="video/mp4" />
  </video>
</template>
