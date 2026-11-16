<script setup>
// Crea la primera cuenta de administración con la clave de instalación. Solo sirve una vez.
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import FormField from "../components/FormField.vue";
import { api } from "../composables/api";
import { setupNeeded, accountState, loadAccount, setAccount } from "../composables/useAccount";

const router = useRouter();
loadAccount(true);
const form = reactive({ clave: "", name: "", email: "", password: "" });
const errors = ref({});
const message = ref("");
const sending = ref(false);

async function submit() {
  sending.value = true;
  errors.value = {};
  message.value = "";
  try {
    const data = await api("/configurar", { method: "POST", body: form });
    setAccount(data.user);
    setupNeeded.value = false;
    router.push("/admin");
  } catch (error) {
    errors.value = error.errors;
    message.value = Object.keys(error.errors).length ? "" : error.message;
  } finally {
    sending.value = false;
  }
}
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>Configurar el sitio</h1>
      <p>Primera cuenta de administración</p>
    </header>
    <div class="form-card narrow">
      <p v-if="accountState !== 'ready'" role="status">Cargando…</p>
      <template v-else-if="!setupNeeded">
        <p class="form-alert is-ok" role="status"><Icon name="check" :size="20" />El sitio ya tiene administración</p>
        <RouterLink to="/escuelas" class="button primary">Entrar</RouterLink>
      </template>
      <form v-else novalidate @submit.prevent="submit">
        <FormField v-slot="{ id, describedby }" label="Clave de instalación" hint="La tiene quien instaló el sitio" :error="errors.clave">
          <input :id="id" v-model.trim="form.clave" autocomplete="off" spellcheck="false" maxlength="100" :aria-describedby="describedby" required />
        </FormField>
        <FormField v-slot="{ id }" label="Tu nombre" :error="errors.name">
          <input :id="id" v-model.trim="form.name" autocomplete="name" maxlength="80" required />
        </FormField>
        <FormField v-slot="{ id }" label="Correo" :error="errors.email">
          <input :id="id" v-model.trim="form.email" type="email" autocomplete="email" maxlength="160" required />
        </FormField>
        <FormField v-slot="{ id, describedby }" label="Contraseña" hint="Al menos 10 caracteres" :error="errors.password">
          <input :id="id" v-model="form.password" type="password" autocomplete="new-password" maxlength="200" :aria-describedby="describedby" required />
        </FormField>
        <p v-if="message" class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ message }}</p>
        <button class="button primary" type="submit" :disabled="sending">{{ sending ? "Creando…" : "Crear cuenta" }}</button>
      </form>
    </div>
  </div>
</template>
