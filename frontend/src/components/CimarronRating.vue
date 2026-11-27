<script setup>
// Calificación de 0 a 5 con cabezas de cimarrón. El promedio puede llenar una a medias.
import CimarronHead from "./CimarronHead.vue";
const props = defineProps({ value: { type: Number, default: 0 }, size: { type: Number, default: 24 } });
const fillOf = (n) => Math.min(1, Math.max(0, props.value - (n - 1)));
const label = () => `${props.value.toLocaleString("es-MX", { maximumFractionDigits: 1 })} de 5`;
</script>
<template>
  <span class="cimarron-rating" role="img" :aria-label="label()">
    <CimarronHead v-for="n in 5" :key="n" :fill="fillOf(n)" :size="size" />
  </span>
</template>
