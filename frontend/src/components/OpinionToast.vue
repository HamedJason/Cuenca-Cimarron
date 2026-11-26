<script setup>
// Aviso "¡Danos tu opinión!" tras 5 minutos de uso acumulado en este dispositivo.
// No sale si ya opinó aquí, si lo cerró en la última semana ni estando en Comunidad Cimarrona.
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "./Icon.vue";
import {
  TOAST_AFTER_S,
  addUsedSeconds,
  usedSeconds,
  hasOpined,
  lastSentAt,
  toastDismissedRecently,
  dismissToast,
  gate,
} from "../composables/useOpinion";

const route = useRoute();
const router = useRouter();
const ready = ref(false);
const closed = ref(toastDismissedRecently());
const onCommunity = computed(() => route.path === "/comunidad");
const visible = computed(() => ready.value && !closed.value && !onCommunity.value && !hasOpined() && !gate.value && lastSentAt.value === 0);

const TICK = 5;
let timer;
function tick() {
  if (document.visibilityState !== "visible") return;
  addUsedSeconds(TICK);
  if (usedSeconds() >= TOAST_AFTER_S) {
    ready.value = true;
    clearInterval(timer);
  }
}
onMounted(() => {
  if (closed.value || hasOpined()) return;
  if (usedSeconds() >= TOAST_AFTER_S) ready.value = true;
  else timer = setInterval(tick, TICK * 1000);
});
onBeforeUnmount(() => clearInterval(timer));
watch(lastSentAt, () => clearInterval(timer));

function close() {
  closed.value = true;
  dismissToast();
}
function go() {
  // Al ir a opinar ya no hace falta recordarlo: si no opina, sale otra vez en una semana.
  close();
  router.push("/comunidad");
}
</script>
<template>
  <Transition name="opinion-toast">
    <aside v-if="visible" class="opinion-toast" aria-label="Danos tu opinión">
      <button class="opinion-toast-main" type="button" @click="go">
        <img src="/brand/cuenca/mascota-240.webp" alt="" width="88" height="86" />
        <span class="opinion-toast-text">
          <strong>¡Danos tu opinión!</strong>
          <span>Toca aquí para ir a Comunidad Cimarrona</span>
        </span>
      </button>
      <button class="icon-button opinion-toast-close" type="button" aria-label="Cerrar aviso" @click="close">
        <Icon name="close" :size="20" />
      </button>
    </aside>
  </Transition>
</template>
