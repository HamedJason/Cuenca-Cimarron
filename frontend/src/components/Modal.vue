<script setup>
import { ref, watch, onBeforeUnmount, nextTick, useId } from "vue";
import Icon from "./Icon.vue";
const props = defineProps({ open: Boolean, title: String, wide: Boolean });
const emit = defineEmits(["close"]);
const dialog = ref(null);
// Id propio: puede haber varias ventanas en la misma página.
const titleId = useId();
let trigger;
watch(
  () => props.open,
  async (value) => {
    await nextTick();
    if (value) {
      trigger = document.activeElement;
      dialog.value.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.value?.close();
      document.body.style.overflow = "";
      trigger?.focus();
    }
  },
);
onBeforeUnmount(() => {
  document.body.style.overflow = "";
});
</script>
<template>
  <dialog
    ref="dialog"
    :class="['modal', { 'modal-wide': wide }]"
    :aria-labelledby="titleId"
    @cancel.prevent="emit('close')"
    @click="
      (e) => {
        if (e.target === dialog) emit('close');
      }
    "
  >
    <div class="modal-body">
      <button
        class="icon-button modal-close"
        aria-label="Cerrar ventana"
        @click="emit('close')"
      >
        <Icon name="close" />
      </button>
      <h2 :id="titleId">{{ title }}</h2>
      <slot />
    </div>
  </dialog>
</template>
