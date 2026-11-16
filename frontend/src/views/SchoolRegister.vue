<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import FormField from "../components/FormField.vue";
import SchoolForm from "../components/SchoolForm.vue";
import { api } from "../composables/api";
import { setAccount } from "../composables/useAccount";

const router = useRouter();
const school = ref({
  name: "",
  cct: "",
  level: "",
  shift: "",
  sector: "",
  colonia: "",
  address: "",
  lat: null,
  lng: null,
  contact_name: "",
});
const login = reactive({ email: "", password: "", privacy: false, families_informed: false });
const errors = ref({});
const message = ref("");
const sending = ref(false);

async function submit() {
  sending.value = true;
  errors.value = {};
  message.value = "";
  try {
    const data = await api("/escuelas", { method: "POST", body: { ...school.value, ...login } });
    setAccount(data.user);
    router.push({ path: "/escuelas", query: { nueva: "1" } });
  } catch (error) {
    errors.value = error.errors;
    message.value = Object.keys(error.errors).length ? "Revisa los campos marcados" : error.message;
  } finally {
    sending.value = false;
  }
}
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>Registra tu escuela</h1>
      <p>Para que tus docentes armen grupos y sus alumnos sumen puntos</p>
    </header>
    <form class="form-card" novalidate @submit.prevent="submit">
      <ol class="steps-mini" aria-label="Cómo funciona">
        <li>Llenas este registro</li>
        <li>Confirmas tu correo</li>
        <li>Revisamos los datos y te avisamos</li>
      </ol>
      <SchoolForm v-model="school" :errors="errors" />
      <fieldset class="form-group">
        <legend>Cuenta</legend>
        <FormField v-slot="{ id }" label="Correo" :error="errors.email">
          <input :id="id" v-model.trim="login.email" type="email" maxlength="160" autocomplete="email" required />
        </FormField>
        <FormField
          v-slot="{ id, describedby }"
          label="Contraseña"
          hint="Al menos 10 caracteres. Puede ser una frase"
          :error="errors.password"
        >
          <input
            :id="id"
            v-model="login.password"
            type="password"
            minlength="10"
            maxlength="200"
            autocomplete="new-password"
            :aria-describedby="describedby"
            required
          />
        </FormField>
      </fieldset>
      <div class="form-group consent">
        <label class="check-row">
          <input v-model="login.privacy" type="checkbox" />
          <span>Leí el <RouterLink to="/privacidad" target="_blank" class="text-link">aviso de privacidad</RouterLink></span>
        </label>
        <p v-if="errors.privacy" class="field-error" role="alert">{{ errors.privacy }}</p>
        <label class="check-row">
          <input v-model="login.families_informed" type="checkbox" />
          <span>La escuela informó a madres, padres o tutores que sus hijos usarán el sitio con su nombre y su grupo</span>
        </label>
        <p v-if="errors.families_informed" class="field-error" role="alert">{{ errors.families_informed }}</p>
      </div>
      <p v-if="message" class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ message }}</p>
      <div class="form-actions">
        <button class="button primary" type="submit" :disabled="sending">
          {{ sending ? "Enviando…" : "Registrar escuela" }}
        </button>
        <RouterLink to="/escuelas" class="text-link">Ya tengo cuenta</RouterLink>
      </div>
    </form>
  </div>
</template>
