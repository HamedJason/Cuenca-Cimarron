<script setup>
// Entrar a un grupo con su código y el nombre, o regresar con el código personal.
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import FormField from "../components/FormField.vue";
import MascotGuide from "../components/MascotGuide.vue";
import { api } from "../composables/api";
import { student, studentState, loadStudent, setStudent, studentLogout } from "../composables/useStudent";

const route = useRoute();
const router = useRouter();
const mode = computed(() => route.meta.mode);
loadStudent();

const code = ref("");
const preview = ref(null);
const name = ref("");
const returnCode = ref("");
const error = ref("");
const busy = ref(false);
const done = ref(false);

async function lookUp() {
  error.value = "";
  preview.value = null;
  if (!/^\d{6}$/.test(code.value)) {
    error.value = "El código del grupo tiene 6 números";
    return;
  }
  busy.value = true;
  try {
    preview.value = (await api(`/unirse/${code.value}`)).classroom;
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}
watch(
  () => [route.params.code, route.query.codigo],
  ([groupCode, personal]) => {
    if (mode.value === "unirse" && groupCode) {
      code.value = String(groupCode);
      lookUp();
    }
    if (mode.value === "regresar" && personal) returnCode.value = String(personal);
  },
  { immediate: true },
);

async function join() {
  error.value = "";
  busy.value = true;
  try {
    const data = await api("/unirse", { method: "POST", body: { code: code.value, name: name.value } });
    setStudent(data.student);
    markMe();
    done.value = true;
  } catch (e) {
    error.value = e.errors?.name || e.errors?.code || e.message;
  } finally {
    busy.value = false;
  }
}
async function comeBack() {
  error.value = "";
  busy.value = true;
  try {
    const data = await api("/regresar", { method: "POST", body: { code: returnCode.value } });
    setStudent(data.student);
    markMe();
    done.value = true;
  } catch (e) {
    error.value = e.errors?.code || e.message;
  } finally {
    busy.value = false;
  }
}
function markMe() {
  try {
    sessionStorage.setItem("cuenca.soy-yo", "1");
  } catch {
    // Sin almacenamiento solo se vuelve a preguntar.
  }
}
async function notMe() {
  await studentLogout();
  done.value = false;
  name.value = "";
  router.replace(mode.value === "unirse" ? { path: "/unirse" } : { path: "/regresar" });
}
</script>
<template>
  <div class="page account-page join-page">
    <header class="page-heading">
      <h1>{{ mode === "unirse" ? "Entra a tu grupo" : "Regresa a tu grupo" }}</h1>
      <p>{{ mode === "unirse" ? "Con el código que te dio tu docente" : "Con tu código personal" }}</p>
    </header>

    <p v-if="studentState === 'loading' && !student" class="form-card narrow" role="status">Cargando…</p>

    <div v-else-if="student" class="form-card narrow join-done">
      <MascotGuide :size="120" :bubble="done ? '¡Listo!' : '¡Hola!'" class="join-mascot" />
      <h2 class="form-title">{{ done ? `Listo, ${student.name}` : `Ya entraste como ${student.name}` }}</h2>
      <p>{{ student.classroom }} con {{ student.teacher }}</p>
      <p class="muted-text">Este equipo ya te recuerda. La próxima vez no tienes que escribir nada</p>
      <div class="form-actions">
        <RouterLink to="/juegos" class="button primary">Empezar</RouterLink>
        <button class="text-link" type="button" @click="notMe">No soy {{ student.name }}</button>
      </div>
    </div>

    <template v-else-if="mode === 'unirse'">
      <form v-if="!preview" class="form-card narrow" novalidate @submit.prevent="lookUp">
        <FormField v-slot="{ id }" label="Código del grupo" :error="error">
          <input :id="id" v-model.trim="code" class="code-entry" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="000000" />
        </FormField>
        <button class="button primary" type="submit" :disabled="busy || code.length !== 6">Seguir</button>
        <RouterLink to="/regresar" class="text-link">Ya entré antes y tengo código personal</RouterLink>
      </form>

      <form v-else class="form-card narrow" novalidate @submit.prevent="join">
        <p class="join-preview">Vas a entrar a <b>{{ preview.name }}</b> con <b>{{ preview.teacher }}</b></p>
        <p class="muted-text small">{{ preview.school }}</p>
        <template v-if="preview.open">
          <FormField v-slot="{ id, describedby }" label="¿Cómo te llamas?" hint="Tu nombre como te dicen en clase" :error="error">
            <input :id="id" v-model="name" maxlength="30" autocomplete="given-name" :aria-describedby="describedby" />
          </FormField>
          <p class="privacy-mini"><Icon name="info" :size="18" /><span>Solo guardamos tu nombre y tu grupo para que tu maestra o maestro vea tu avance. No pedimos correo ni fotos. <RouterLink to="/privacidad#alumnos" class="inline-link">Aviso de privacidad</RouterLink></span></p>
          <div class="form-actions">
            <button class="button primary" type="submit" :disabled="busy || name.trim().length < 2">Entrar</button>
            <button class="text-link" type="button" @click="preview = null">No es mi grupo</button>
          </div>
        </template>
        <template v-else>
          <p class="form-alert is-error" role="alert">Este grupo ya no recibe alumnos nuevos</p>
          <RouterLink to="/regresar" class="text-link">Ya entré antes y tengo código personal</RouterLink>
        </template>
      </form>
    </template>

    <form v-else class="form-card narrow" novalidate @submit.prevent="comeBack">
      <FormField v-slot="{ id, describedby }" label="Tu código personal" hint="Te lo da tu docente. Se ve como LMX-482" :error="error">
        <input :id="id" v-model.trim="returnCode" class="code-entry" maxlength="12" autocomplete="off" autocapitalize="characters" spellcheck="false" :aria-describedby="describedby" />
      </FormField>
      <button class="button primary" type="submit" :disabled="busy || returnCode.length < 6">Entrar</button>
      <RouterLink to="/unirse" class="text-link">Es mi primera vez</RouterLink>
    </form>
  </div>
</template>
