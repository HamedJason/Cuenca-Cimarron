<script setup>
// Cuántos códigos de recuperación le quedan a la cuenta y cómo generar unos nuevos.
import { ref, computed } from "vue";
import Icon from "./Icon.vue";
import FormField from "./FormField.vue";
import RecoveryCodes from "./RecoveryCodes.vue";
import { api } from "../composables/api";
import { account, loadAccount } from "../composables/useAccount";

const left = computed(() => account.value?.recovery_codes_left ?? 0);
const asking = ref(false);
const password = ref("");
const error = ref("");
const codes = ref(null);
async function generate() {
  error.value = "";
  try {
    codes.value = (await api("/codigos-recuperacion", { method: "POST", body: { password: password.value } })).recovery_codes;
    password.value = "";
    asking.value = false;
  } catch (e) {
    error.value = e.errors?.password || e.message;
  }
}
function done() {
  codes.value = null;
  loadAccount(true);
}
</script>
<template>
  <div class="my-codes">
    <RecoveryCodes v-if="codes" :codes="codes" :email="account?.email" continue-label="Ya los guardé" @done="done" />
    <template v-else>
      <div :class="['note', { 'is-gold': left <= 3 }]">
        <Icon :name="left <= 3 ? 'info' : 'check'" />
        <div>
          <p v-if="left > 3">Te quedan <b>{{ left }}</b> códigos de recuperación. Con uno puedes poner otra contraseña si la olvidas</p>
          <p v-else-if="left > 0">Solo te {{ left === 1 ? "queda 1 código" : `quedan ${left} códigos` }} de recuperación. Genera códigos nuevos y guárdalos</p>
          <p v-else>No tienes códigos de recuperación. Si olvidas tu contraseña no podrás recuperarla por tu cuenta. Genera códigos nuevos y guárdalos</p>
          <button v-if="!asking" class="text-link" type="button" @click="asking = true">Generar códigos nuevos</button>
        </div>
      </div>
      <form v-if="asking" class="inline-form" @submit.prevent="generate">
        <FormField v-slot="{ id, describedby }" label="Tu contraseña actual" hint="Los códigos anteriores dejan de servir" :error="error">
          <input :id="id" v-model="password" type="password" autocomplete="current-password" maxlength="200" :aria-describedby="describedby" />
        </FormField>
        <button class="button primary small-button" type="submit" :disabled="!password">Generar</button>
        <button class="button secondary small-button" type="button" @click="asking = false">Cancelar</button>
      </form>
    </template>
  </div>
</template>
