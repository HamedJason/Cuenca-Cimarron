<script setup>
import { ref } from "vue";
import Icon from "./Icon.vue";
const props = defineProps({ link: { type: String, required: true }, shareText: String });
const copied = ref(false);
async function copy() {
  try {
    await navigator.clipboard.writeText(props.link);
    copied.value = true;
    setTimeout(() => (copied.value = false), 2500);
  } catch {
    window.prompt("Copia el enlace", props.link);
  }
}
const whatsapp = () => `https://wa.me/?text=${encodeURIComponent(`${props.shareText ? `${props.shareText} ` : ""}${props.link}`)}`;
</script>
<template>
  <div class="link-box">
    <code>{{ link }}</code>
    <button class="button secondary small-button" type="button" @click="copy">
      <Icon :name="copied ? 'check' : 'copy'" :size="18" />{{ copied ? "Copiado" : "Copiar" }}
    </button>
    <a v-if="shareText" class="button secondary small-button" :href="whatsapp()" target="_blank" rel="noopener noreferrer"><Icon name="share" :size="18" />WhatsApp</a>
  </div>
</template>
