<script setup>
// Recuperar el acceso sin correo:
// - olvide: correo, un código de recuperación y la contraseña nueva
// - contrasena: enlace que da la administración para poner contraseña nueva
// - invitacion: enlace para entrar por primera vez al panel
// - confirmar: enlaces viejos de confirmación de correo
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import FormField from "../components/FormField.vue";
import RecoveryCodes from "../components/RecoveryCodes.vue";
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
const code = ref("");
const password = ref("");
const codes = ref(null);
const codesLeft = ref(null);
const account = ref(null);

const titles = {
  confirmar: "Confirmar correo",
  olvide: "Olvidé mi contraseña",
  contrasena: "Contraseña nueva",
  invitacion: "Acceso al panel",
};
const home = computed(() => (["admin", "viewer"].includes(account.value?.role) ? "/admin" : "/escuelas"));

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
      const data = await api("/contrasena/codigo", { method: "POST", body: { email: email.value, code: code.value, password: password.value } });
      setAccount(data.user);
      account.value = data.user;
      codesLeft.value = data.codes_left;
    } else if (mode.value === "invitacion") {
      const data = await api("/invitacion", { method: "POST", body: { token: token.value, password: password.value } });
      setAccount(data.user);
      account.value = data.user;
      codes.value = data.recovery_codes;
    } else {
      await api("/contrasena/nueva", { method: "POST", body: { token: token.value, password: password.value } });
    }
    state.value = "done";
  } catch (error) {
    state.value = "error";
    errors.value = error.errors;
    message.value = error.errors.password || error.errors.email || error.errors.code || error.message;
  }
}
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>{{ titles[mode] }}</h1>
    </header>
    <div :class="['form-card', { narrow: !codes }]">
      <template v-if="mode === 'confirmar'">
        <p v-if="state === 'sending'" role="status">Confirmando…</p>
        <p v-else-if="state === 'done'" class="form-alert is-ok" role="status"><Icon name="check" :size="20" />Tu correo quedó confirmado</p>
        <p v-else-if="state === 'error'" class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ message }}</p>
        <RouterLink to="/escuelas" class="button primary">Ir a mi cuenta</RouterLink>
      </template>

      <RecoveryCodes v-else-if="codes" :codes="codes" :email="account?.email" @done="router.push(home)" />

      <template v-else-if="state === 'done'">
        <p class="form-alert is-ok" role="status"><Icon name="check" :size="20" />Tu contraseña quedó cambiada</p>
        <div v-if="codesLeft !== null && codesLeft <= 3" class="note is-gold">
          <Icon name="info" />
          <p>Te {{ codesLeft === 1 ? "queda 1 código" : `quedan ${codesLeft} códigos` }} de recuperación. Entra a tu cuenta y genera códigos nuevos</p>
        </div>
        <RouterLink :to="codesLeft !== null ? home : '/escuelas'" class="button primary">{{ codesLeft !== null ? "Ir a mi cuenta" : "Entrar" }}</RouterLink>
      </template>

      <form v-else novalidate @submit.prevent="submit">
        <template v-if="mode === 'olvide'">
          <p class="muted-text">Usa uno de los códigos de recuperación que guardaste al registrarte. Cada código sirve una vez</p>
          <FormField v-slot="{ id }" label="Correo de la cuenta" :error="errors.email">
            <input :id="id" v-model.trim="email" type="email" autocomplete="email" maxlength="160" required />
          </FormField>
          <FormField v-slot="{ id, describedby }" label="Código de recuperación" hint="Se ve como ABCD-EFGH" :error="errors.code">
            <input :id="id" v-model.trim="code" class="code-entry" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="20" :aria-describedby="describedby" required />
          </FormField>
        </template>
        <FormField
          v-slot="{ id, describedby }"
          :label="mode === 'invitacion' ? 'Elige tu contraseña' : 'Contraseña nueva'"
          hint="Al menos 10 caracteres. Puede ser una frase"
          :error="errors.password"
        >
          <input :id="id" v-model="password" type="password" autocomplete="new-password" maxlength="200" :aria-describedby="describedby" required />
        </FormField>
        <p v-if="message && !errors.email && !errors.password && !errors.code" class="form-alert is-error" role="alert">
          <Icon name="info" :size="20" />{{ message }}
        </p>
        <div class="form-actions">
          <button class="button primary" type="submit" :disabled="state === 'sending'">Guardar contraseña</button>
          <RouterLink to="/escuelas" class="text-link">Regresar</RouterLink>
        </div>
        <p v-if="mode === 'olvide'" class="small muted-text">¿Ya no tienes tus códigos? Escribe a cualquiera de los correos del pie de página y la administración del sitio te ayuda</p>
      </form>
    </div>
  </div>
</template>
