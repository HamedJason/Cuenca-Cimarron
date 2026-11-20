<script setup>
// Aviso flotante cuando ganas Cimacoins en cualquier parte del sitio.
// Va como popover para quedar encima de las ventanas de los temas (que son <dialog>
// en la capa superior); si no, una moneda ganada dentro de un tema no se vería.
import { ref, watch, nextTick } from "vue";
import Icon from "./Icon.vue";
import { lastReward } from "../composables/useCimacoins";
const shown = ref(null);
const region = ref(null);
let timer;
function raise() {
  const el = region.value;
  if (!el?.showPopover) return;
  try {
    // Se vuelve a abrir para quedar arriba de cualquier ventana abierta después
    if (el.matches(":popover-open")) el.hidePopover();
    el.showPopover();
  } catch {
    // Sin popover el aviso se ve igual cuando no hay ventana abierta.
  }
}
watch(lastReward, async (reward) => {
  if (!reward) return;
  shown.value = reward;
  await nextTick();
  raise();
  clearTimeout(timer);
  timer = setTimeout(() => (shown.value = null), 4500);
});
</script>
<template>
  <div ref="region" class="coin-toast-region" popover="manual" role="status" aria-live="polite">
    <Transition name="coin-toast" mode="out-in">
      <div v-if="shown" :key="shown.at" class="coin-toast">
        <span class="coin-toast-icon" aria-hidden="true"><Icon name="coin" :size="26" /></span>
        <span class="coin-toast-text">
          <strong>+{{ shown.coins }} Cimacoins</strong>
          <span>{{ shown.label }}{{ shown.items?.length ? " · ¡y un cosmético nuevo!" : "" }}</span>
        </span>
        <RouterLink to="/mi-cimarron" class="coin-toast-link" @click="shown = null">Ver mi cimarrón</RouterLink>
      </div>
    </Transition>
  </div>
</template>
