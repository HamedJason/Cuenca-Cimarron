<script setup>
// QR de un enlace, dibujado en el navegador. No sale ningún dato a otro sitio.
import { ref, watch } from "vue";
const props = defineProps({ text: { type: String, required: true }, label: String, size: { type: Number, default: 220 } });
const svg = ref("");
watch(
  () => props.text,
  async (text) => {
    const QRCode = (await import("qrcode")).default;
    svg.value = await QRCode.toString(text, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#003d24", light: "#ffffff" } });
  },
  { immediate: true },
);
</script>
<template>
  <div class="qr-code" role="img" :aria-label="label || `Código QR de ${text}`" :style="{ width: `${size}px` }" v-html="svg" />
</template>
