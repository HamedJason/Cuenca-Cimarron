<script setup>
// Páginas a las que llegan los enlaces de los correos: confirmar correo, olvidé mi contraseña y contraseña nueva.
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import FormField from "../components/FormField.vue";
import { api } from "../composables/api";
import { loadAccount, setAccount } from "../composables/useAccount";

const route = useRoute();
const router = useRouter();
const mode = computed(() => route.meta.mode);
const token = computed(() => String(route.query.token || ""));
const state = ref("idle");
const message = ref("");
const errors = ref({});
const email = ref("");
const password = ref("");

const titles = {
  confirmar: "Confirmar correo",
  olvide: "Olvidé mi contraseña",
  contrasena: "Contraseña nueva",
  invitacion: "Acceso al panel",
};

onMounted(async () => {
  if (mode.value !== "confirmar") return;
  state.value = "sending";
  try {
    await api("/correo/confirmar", { method: "POST", body: { token: token.value } });
    state.value = "done";
    loadAccount(true);
  } catch (error) {
    state.value = "error";
    message.value = error.message;
  }
});

async function submit() {
  state.value = "sending";
  errors.value = {};
  message.value = "";
  try {
    if (mode.value === "olvide") {
      await api("/contrasena/olvide", { method: "POST", body: { email: email.value } });
    } else if (mode.value === "invitacion") {
      const data = await api("/invitacion", { method: "POST", body: { token: token.value, password: password.value } });
      setAccount(data.user);
      router.push("/admin");
      return;
    } else {
      await api("/contrasena/nueva", { method: "POST", body: { token: token.value, password: password.value } });
    }
    state.value = "done";
  } catch (error) {
    state.value = "error";
    errors.value = error.errors;
    message.value = error.errors.password || error.errors.email || error.message;
  }
}
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>{{ titles[mode] }}</h1>
    </header>
    <div class="form-card narrow">
      <template v-if="mode === 'confirmar'">
        <p v-if="state === 'sending'" role="status">Confirmando…</p>
        <p v-else-if="state === 'done'" class="form-alert is-ok" role="status"><Icon name="check" :size="20" />Tu correo quedó confirmado</p>
        <p v-else-if="state === 'error'" class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ message }}</p>
        <RouterLink to="/escuelas" class="button primary">Ir a mi cuenta</RouterLink>
      </template>

      <template v-else-if="state === 'done'">
        <p class="form-alert is-ok" role="status">
          <Icon name="check" :size="20" />{{
            mode === "olvide"
              ? "Si ese correo tiene cuenta, te llegará un enlace en unos minutos"
              : "Tu contraseña quedó cambiada"
          }}
        </p>
        <RouterLink to="/escuelas" class="button primary">Entrar</RouterLink>
      </template>

      <form v-else novalidate @submit.prevent="submit">
        <FormField v-if="mode === 'olvide'" v-slot="{ id }" label="Correo de la cuenta" :error="errors.email">
          <input :id="id" v-model.trim="email" type="email" autocomplete="email" maxlength="160" required />
        </FormField>
        <FormField
          v-else
          v-slot="{ id, describedby }"
          :label="mode === 'invitacion' ? 'Elige tu contraseña' : 'Contraseña nueva'"
          hint="Al menos 10 caracteres. Puede ser una frase"
          :error="errors.password"
        >
          <input :id="id" v-model="password" type="password" autocomplete="new-password" maxlength="200" :aria-describedby="describedby" required />
        </FormField>
        <p v-if="message && !errors.email && !errors.password" class="form-alert is-error" role="alert">
          <Icon name="info" :size="20" />{{ message }}
        </p>
        <div class="form-actions">
          <button class="button primary" type="submit" :disabled="state === 'sending'">
            {{ mode === "olvide" ? "Mandar enlace" : "Guardar contraseña" }}
          </button>
          <RouterLink to="/escuelas" class="text-link">Regresar</RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>
