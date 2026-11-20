<script setup>
// Botones del modo testeo en computadora, a la izquierda del logo
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Icon from "./Icon.vue";
import { inDemo, checkDemo, leaveDemo } from "../composables/useDemo";

const route = useRoute();
const leaving = ref(false);
const show = computed(() => inDemo.value && route.path !== "/testeo_20nov");

onMounted(checkDemo);

async function exit() {
  leaving.value = true;
  await leaveDemo();
  // Recarga completa para que el sitio olvide las sesiones cerradas
  window.location.assign("/");
}
</script>

<template>
  <nav v-if="show" class="demo-dock" aria-label="Modo testeo">
    <RouterLink to="/testeo_20nov" class="button primary demo-dock-back">
      <Icon name="chevronLeft" :size="22" /> Regresar a testeo
    </RouterLink>
    <button type="button" class="button secondary demo-dock-exit" :disabled="leaving" @click="exit">
      <Icon name="close" :size="20" /> {{ leaving ? "Saliendo…" : "Salir de testeo" }}
    </button>
  </nav>
</template>
