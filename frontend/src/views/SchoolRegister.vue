<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import FormField from "../components/FormField.vue";
import SchoolForm from "../components/SchoolForm.vue";
import SchoolPicker from "../components/SchoolPicker.vue";
import RecoveryCodes from "../components/RecoveryCodes.vue";
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
  postal_code: "",
  lat: null,
  lng: null,
  contact_name: "",
});
const login = reactive({ email: "", password: "", privacy: false, families_informed: false, sin_cct: false });
const errors = ref({});
const message = ref("");
const sending = ref(false);
const codes = ref(null);
const finish = () => router.push({ path: "/escuelas", query: { nueva: "1" } });
// Primero se busca la escuela en el catálogo. Si no aparece, se llena a mano.
const mode = ref("buscar");
const picked = ref(null);
const formKey = ref(0);
function pick(found) {
  picked.value = found;
  Object.assign(school.value, {
    name: found.name,
    cct: found.cct,
    level: found.level ?? "",
    shift: found.shift ?? "",
    sector: found.sector ?? "",
    colonia: found.colonia ?? "",
    address: found.address ?? "",
    postal_code: found.postal_code ?? "",
    lat: found.lat,
    lng: found.lng,
  });
  formKey.value++;
  mode.value = "elegida";
}
function manual() {
  picked.value = null;
  // Si venía de una escuela del catálogo, se limpian sus datos para escribir la propia
  Object.assign(school.value, { name: "", cct: "", level: "", shift: "", sector: "", colonia: "", address: "", postal_code: "", lat: null, lng: null });
  login.sin_cct = false;
  formKey.value++;
  mode.value = "manual";
}

async function submit() {
  sending.value = true;
  errors.value = {};
  message.value = "";
  try {
    const data = await api("/escuelas", { method: "POST", body: { ...school.value, ...login } });
    setAccount(data.user);
    // Antes de seguir, la escuela guarda sus códigos de recuperación.
    codes.value = data.recovery_codes;
    window.scrollTo({ top: 0 });
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
      <p>Para que tus docentes armen grupos y sus alumnos ganen Cimacoins</p>
    </header>
    <div v-if="codes" class="form-card">
      <RecoveryCodes :codes="codes" :email="login.email" @done="finish" />
    </div>
    <form v-else class="form-card" novalidate @submit.prevent="submit">
      <ol class="steps-mini" aria-label="Cómo funciona">
        <li>Llenas este registro</li>
        <li>Guardas tus códigos de recuperación</li>
        <li>Das de alta a tus docentes</li>
      </ol>
      <SchoolPicker v-if="mode === 'buscar'" @pick="pick" @manual="manual" />
      <template v-else>
        <div v-if="picked" class="note">
          <Icon name="check" />
          <div>
            <p>Elegiste <b>{{ picked.name }}</b> (CCT {{ picked.cct }}). Ya llenamos sus datos{{ picked.lat ? " y su ubicación" : "" }}. Solo completa lo que falte</p>
            <button class="text-link" type="button" @click="mode = 'buscar'">Buscar otra escuela</button>
          </div>
        </div>
        <button v-else class="text-link" type="button" @click="mode = 'buscar'">Buscar mi escuela en el catálogo</button>
        <SchoolForm :key="formKey" v-model="school" :errors="errors" :from-catalog="Boolean(picked)" :geo="picked?.geo ?? ''" :no-cct="login.sin_cct" @no-cct="login.sin_cct = $event" />
      </template>
      <template v-if="mode !== 'buscar'">
      <fieldset class="form-group">
        <legend>Cuenta</legend>
        <FormField v-slot="{ id, describedby }" label="Correo" hint="Con él entras a tu cuenta. El sitio no manda correos" :error="errors.email">
          <input :id="id" v-model.trim="login.email" type="email" maxlength="160" autocomplete="email" :aria-describedby="describedby" required />
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
        <label class="consent-row">
          <input v-model="login.privacy" type="checkbox" />
          <span>Leí el <RouterLink to="/privacidad" target="_blank" class="text-link">aviso de privacidad</RouterLink></span>
        </label>
        <p v-if="errors.privacy" class="field-error" role="alert">{{ errors.privacy }}</p>
        <label class="consent-row">
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
      </template>
    </form>
  </div>
</template>
