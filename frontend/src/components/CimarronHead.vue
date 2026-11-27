<script setup>
// Cabeza de cimarrón para calificar (Comunidad Cimarrona). fill de 0 a 1: vacía, a medias o llena.
// Vacía usa el color del texto (currentColor). Llena conserva sus colores también en modo oscuro.
import { computed, useId } from "vue";
const props = defineProps({ fill: { type: Number, default: 0 }, size: { type: [Number, String], default: 24 } });
const clip = useId();
const width = computed(() => 24 * Math.min(1, Math.max(0, props.fill)));
const horns = [
  "M8.6 7.2C7 4.6 2.6 5 2.4 8.8c-.2 3.4 3.6 4.2 4.6 1.9.8-1.8-1.1-3-2.2-1.6",
  "M15.4 7.2C17 4.6 21.4 5 21.6 8.8c.2 3.4-3.6 4.2-4.6 1.9-.8-1.8 1.1-3 2.2-1.6",
];
const face = "M8 8.4c0-2.6 8-2.6 8 0l-.7 7c-.4 3.4-1.6 5-3.3 5s-2.9-1.6-3.3-5Z";
const helmet = "M7.5 8.8c0-5 9-5 9 0Z";
const smile = "M10.6 16.6c.8.8 2 .8 2.8 0";
</script>
<template>
  <svg class="cimarron-head" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <defs>
      <clipPath :id="clip"><rect x="0" y="0" :width="width" height="24" /></clipPath>
    </defs>
    <g v-if="fill < 1" stroke="currentColor" stroke-width="1.5">
      <path v-for="d in horns" :key="d" :d="d" />
      <path :d="face" />
      <path :d="helmet" />
      <circle cx="10.4" cy="11.6" r=".55" />
      <circle cx="13.6" cy="11.6" r=".55" />
      <path :d="smile" />
    </g>
    <g v-if="fill > 0" :clip-path="`url(#${clip})`">
      <path v-for="d in horns" :key="`o${d}`" :d="d" stroke="#5c3a10" stroke-width="3.6" />
      <path v-for="d in horns" :key="`i${d}`" :d="d" stroke="#dd971a" stroke-width="2" />
      <path :d="face" fill="#f3c98b" stroke="#5c3a10" stroke-width="1.3" />
      <path :d="helmet" fill="#00723f" stroke="#5c3a10" stroke-width="1.2" />
      <circle cx="10.4" cy="11.6" r=".85" fill="#3b2314" />
      <circle cx="13.6" cy="11.6" r=".85" fill="#3b2314" />
      <path :d="smile" stroke="#5c3a10" stroke-width="1.2" />
    </g>
  </svg>
</template>
