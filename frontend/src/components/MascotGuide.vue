<script setup>
// El cimarrón guía (manual de identidad Cuenca Cimarrona, pág. 3 y 10).
// Siempre a la izquierda de lo que presenta: su mano derecha abierta señala hacia la derecha.
// Nunca se voltea, gira ni deforma: solo entra deslizándose y flota un poco.
import { ref, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  // Ancho en px; abajo de 64 px el manual pide el icono, no la mascota
  size: { type: Number, default: 160 },
  // Frase corta opcional en un globo de diálogo
  bubble: { type: String, default: "" },
  eager: { type: Boolean, default: false },
});

const root = ref(null);
const visible = ref(false);
let observer;

onMounted(() => {
  if (!("IntersectionObserver" in window)) {
    visible.value = true;
    return;
  }
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        visible.value = true;
        observer.disconnect();
      }
    },
    { threshold: 0.3 },
  );
  observer.observe(root.value);
});
onBeforeUnmount(() => observer?.disconnect());

const height = Math.round((props.size * 469) / 480);
</script>
<template>
  <figure
    ref="root"
    :class="['mascot', { visible, 'has-bubble': bubble }]"
    :style="{ '--mascot-w': `${size}px` }"
  >
    <img
      src="/brand/cuenca/mascota-240.webp"
      srcset="/brand/cuenca/mascota-240.webp 240w, /brand/cuenca/mascota-480.webp 480w"
      :sizes="`${size}px`"
      :width="size"
      :height="height"
      alt=""
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
    />
    <figcaption v-if="bubble" class="mascot-bubble">{{ bubble }}</figcaption>
  </figure>
</template>
