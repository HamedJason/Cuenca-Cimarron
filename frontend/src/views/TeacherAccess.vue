<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import { api } from "../composables/api";

const route = useRoute();
const router = useRouter();
const error = ref("");
onMounted(async () => {
  try {
    await api("/docente/acceso", { method: "POST", body: { token: String(route.params.token) } });
    router.replace("/docente");
  } catch (e) {
    error.value = e.message;
  }
});
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>Acceso de docentes</h1>
    </header>
    <div class="form-card narrow">
      <p v-if="!error" role="status">Entrando…</p>
      <template v-else>
        <p class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ error }}</p>
        <RouterLink to="/docente" class="button secondary">Ver si ya tengo sesión</RouterLink>
      </template>
    </div>
  </div>
</template>
