<script setup>
import { ref, reactive, computed } from "vue";
import { useRoute } from "vue-router";
import Icon from "../components/Icon.vue";
import FormField from "../components/FormField.vue";
import SchoolPanel from "../components/SchoolPanel.vue";
import { api } from "../composables/api";
import { account, accountState, loadAccount, setAccount, logout } from "../composables/useAccount";

const route = useRoute();
loadAccount();
const form = reactive({ email: "", password: "" });
const errors = ref({});
const message = ref("");
const sending = ref(false);
const isNew = computed(() => route.query.nueva === "1");

async function submit() {
  sending.value = true;
  errors.value = {};
  message.value = "";
  try {
    const data = await api("/entrar", { method: "POST", body: form });
    setAccount(data.user);
    form.password = "";
  } catch (error) {
    errors.value = error.errors;
    message.value = error.errors.email || error.message;
  } finally {
    sending.value = false;
  }
}
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>Escuelas</h1>
      <p>Grupos, tareas y puntos para tus alumnos</p>
    </header>

    <p v-if="accountState === 'loading' && !account" class="form-card muted-text" role="status">Cargando…</p>
    <div v-else-if="accountState === 'offline'" class="form-card">
      <p class="form-alert is-error" role="alert"><Icon name="info" :size="20" />No hay conexión con el servidor</p>
      <button class="button secondary" type="button" @click="loadAccount(true)">Volver a intentar</button>
    </div>

    <template v-else-if="account?.role === 'school'">
      <SchoolPanel :is-new="isNew" />
    </template>

    <div v-else-if="account?.role === 'admin'" class="form-card">
      <h2 class="form-title">Hola, {{ account.name }}</h2>
      <p>Tienes una cuenta de administración</p>
      <div class="form-actions">
        <RouterLink to="/admin" class="button primary">Ir a administración</RouterLink>
        <button class="button secondary" type="button" @click="logout">Salir</button>
      </div>
    </div>

    <div v-else class="account-split">
      <form class="form-card" novalidate @submit.prevent="submit">
        <h2 class="form-title">Entrar</h2>
        <FormField v-slot="{ id }" label="Correo">
          <input :id="id" v-model.trim="form.email" type="email" autocomplete="email" maxlength="160" required />
        </FormField>
        <FormField v-slot="{ id }" label="Contraseña">
          <input :id="id" v-model="form.password" type="password" autocomplete="current-password" maxlength="200" required />
        </FormField>
        <p v-if="message" class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ message }}</p>
        <div class="form-actions">
          <button class="button primary" type="submit" :disabled="sending">{{ sending ? "Entrando…" : "Entrar" }}</button>
          <RouterLink to="/escuelas/olvide" class="text-link">Olvidé mi contraseña</RouterLink>
        </div>
      </form>
      <section class="form-card is-tint">
        <h2 class="form-title">¿Tu escuela todavía no tiene cuenta?</h2>
        <ul class="plain-list">
          <li><Icon name="check" :size="20" />Tus docentes arman grupos con un código</li>
          <li><Icon name="check" :size="20" />Los alumnos entran solo con su nombre</li>
          <li><Icon name="check" :size="20" />Cada actividad suma puntos</li>
        </ul>
        <RouterLink to="/escuelas/registro" class="button primary">Registrar mi escuela</RouterLink>
        <p class="small muted-text">¿Eres docente? Pide a tu escuela tu enlace de acceso</p>
      </section>
    </div>
  </div>
</template>
