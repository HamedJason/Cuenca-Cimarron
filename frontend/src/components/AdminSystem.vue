<script setup>
// Estado del sitio y mantenimiento, para quien mantiene vivo el sistema.
import { ref, reactive, computed, onMounted } from "vue";
import Icon from "./Icon.vue";
import FormField from "./FormField.vue";
import { api } from "../composables/api";

const data = ref(null);
const error = ref("");
const message = ref("");
const busy = ref(false);
// La cuenta del modo demostración no puede cambiar la dirección ni apagar la demo
const props = defineProps({ isDemo: Boolean });

const n = (v) => Number(v ?? 0).toLocaleString("es-MX");
const size = (bytes) => (bytes == null ? "—" : bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const date = (iso) => (iso ? new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) : "");
const countLabels = {
  escuelas: "Escuelas",
  docentes: "Docentes",
  grupos: "Grupos",
  alumnos: "Alumnos",
  alumnos_anonimos: "Alumnos sin nombre (grupos archivados)",
  actividades_completadas: "Actividades completadas",
  visitas: "Visitas al sitio",
  equipos_con_sesion: "Equipos con sesión de alumno o docente",
  sesiones_de_cuentas: "Sesiones abiertas de cuentas",
  bitacora: "Registros en la bitácora",
};

// Dirección del sitio (antes estaba en Ajustes): con ella se arman los enlaces de grupos y docentes
const site = reactive({ public_url: "", domain: "", effective: "", errors: {}, message: "" });
async function loadSite() {
  if (props.isDemo) return;
  const r = await api("/admin/ajustes");
  Object.assign(site, { public_url: r.settings.public_url ?? "", domain: r.settings.domain ?? "", effective: r.settings.effective_url, errors: {}, message: "" });
}
async function saveSite() {
  site.errors = {};
  site.message = "";
  try {
    const r = await api("/admin/ajustes", { method: "PUT", body: { public_url: site.public_url, domain: site.domain } });
    site.effective = r.settings.effective_url;
    site.message = "Guardado";
  } catch (e) {
    site.errors = e.errors ?? {};
    site.message = Object.keys(site.errors).length ? "Revisa los campos marcados" : e.message;
  }
}

// Modo demostración: crea las cuentas demo y abre /testeo_20nov por 24 horas
const demoConfirm = ref("");
const demoAction = computed(() => (data.value?.demo?.on ? "apagar" : "encender"));
async function toggleDemo() {
  busy.value = true;
  message.value = "";
  try {
    await api("/admin/sistema/demo", { method: "POST", body: { accion: demoAction.value, confirm: demoConfirm.value } });
    message.value = demoAction.value === "encender" ? "Modo demostración encendido. Entra a /testeo_20nov" : "Modo demostración apagado. Se borró todo lo demo";
    demoConfirm.value = "";
    await load();
  } catch (e) {
    message.value = e.message;
  } finally {
    busy.value = false;
  }
}

async function load() {
  error.value = "";
  try {
    data.value = await api("/admin/sistema");
  } catch (e) {
    error.value = e.message;
  }
}
onMounted(() => {
  load();
  loadSite().catch(() => {});
});

async function cleanup() {
  busy.value = true;
  message.value = "";
  try {
    const r = await api("/admin/sistema/limpieza", { method: "POST" });
    message.value = `Limpieza hecha: ${r.device_sessions_removed} sesiones viejas de equipos, ${r.account_sessions_removed} de cuentas y ${r.students_anonymized} nombres de alumnos borrados por privacidad`;
    await load();
  } catch (e) {
    message.value = e.message;
  } finally {
    busy.value = false;
  }
}
</script>
<template>
  <p v-if="error" class="form-card form-alert is-error" role="alert">{{ error }}</p>
  <p v-else-if="!data" class="form-card" role="status">Cargando…</p>
  <template v-else>
    <section class="form-card" role="tabpanel">
      <div class="panel-head">
        <h2 class="form-title">Estado del sitio</h2>
        <button class="button secondary small-button" type="button" @click="load"><Icon name="reset" :size="18" />Revisar otra vez</button>
      </div>
      <ul class="health-list">
        <li v-for="check in data.checks" :key="check.key" :class="['health-item', check.ok ? 'is-ok' : 'is-warn']">
          <span class="health-dot" aria-hidden="true"><Icon :name="check.ok ? 'check' : 'info'" :size="18" /></span>
          <span class="health-text">
            <b>{{ check.label }}</b>
            <span>{{ check.key === "backup" && check.date ? `Último respaldo: ${date(check.date)}` : check.detail }}<template v-if="check.key === 'catalog' && check.date"> · actualizado el {{ date(check.date) }}</template></span>
          </span>
          <span class="sr-only">{{ check.ok ? "Bien" : "Revisar" }}</span>
        </li>
      </ul>
      <p class="small muted-text">Versión {{ data.commit }} · PHP {{ data.php }} · Laravel {{ data.laravel }} · Base de datos {{ size(data.database_size) }}</p>
    </section>

    <section class="form-card">
      <h2 class="form-title">Qué hay en la base</h2>
      <div class="table-wrap">
        <table class="data-table">
          <tbody>
            <tr v-for="(value, key) in data.counts" :key="key"><td>{{ countLabels[key] ?? key }}</td><td class="num">{{ n(value) }}</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="form-card">
      <h2 class="form-title">Mantenimiento</h2>
      <p v-if="message" class="form-alert is-ok" role="status">{{ message }}</p>
      <div v-if="!isDemo" class="maint-item">
        <div>
          <h3>Limpieza</h3>
          <p class="muted-text">Borra sesiones caducadas y enlaces viejos, y borra los nombres de alumnos de grupos archivados hace más de 60 días. El sitio ya lo hace solo de vez en cuando</p>
        </div>
        <button class="button secondary" type="button" :disabled="busy" @click="cleanup">Limpiar ahora</button>
      </div>
      <div class="maint-item">
        <div>
          <h3>Modo demostración</h3>
          <p v-if="data.demo.on" class="muted-text">
            Encendido<template v-if="data.demo.until">. Se apaga solo el {{ date(data.demo.until) }}</template>. Cualquiera puede entrar a las cuentas demo desde
            <RouterLink class="text-link" to="/testeo_20nov">/testeo_20nov</RouterLink>, pero no pueden ver ni tocar datos reales. Al apagarlo se borra todo lo demo
          </p>
          <p v-else class="muted-text">Apagado. Al encenderlo se crean cuentas y escuelas de ejemplo y se abre /testeo_20nov para la exposición. Se apaga solo a las 24 horas</p>
          <p v-if="data.demo.forced" class="small muted-text">Está forzado por el servidor (DEMO_20NOV=true)</p>
          <form v-if="!isDemo" class="inline-form" @submit.prevent="toggleDemo">
            <FormField v-slot="{ id }" :label="`Escribe ${demoAction.toUpperCase()} para confirmar`">
              <input :id="id" v-model.trim="demoConfirm" autocomplete="off" />
            </FormField>
            <button :class="['button', data.demo.on ? 'secondary' : 'primary']" type="submit" :disabled="busy || demoConfirm.toUpperCase() !== demoAction.toUpperCase()">
              {{ data.demo.on ? "Apagar y borrar lo demo" : "Encender modo demostración" }}
            </button>
          </form>
        </div>
      </div>
    </section>

    <form v-if="!isDemo" class="form-card" novalidate @submit.prevent="saveSite">
      <h2 class="form-title">Dirección del sitio</h2>
      <FormField v-slot="{ id, describedby }" label="Dirección pública" optional hint="Con ella se arman los enlaces de los grupos y de los docentes. Se guardó sola al configurar el sitio" :error="site.errors.public_url">
        <input :id="id" v-model.trim="site.public_url" type="url" maxlength="200" :aria-describedby="describedby" />
      </FormField>
      <FormField v-slot="{ id, describedby }" label="Dominio para el HTTPS propio" optional hint="Solo si el servidor usa el HTTPS de Caddy (HTTPS_CADDY=1). En el servidor de la facultad no hace falta" :error="site.errors.domain">
        <input :id="id" v-model.trim="site.domain" maxlength="200" spellcheck="false" :aria-describedby="describedby" />
      </FormField>
      <p class="small muted-text">Los enlaces usan: <b>{{ site.effective }}</b></p>
      <p v-if="site.message" :class="['form-alert', site.message === 'Guardado' ? 'is-ok' : 'is-error']" role="status">{{ site.message }}</p>
      <div class="form-actions">
        <button class="button primary" type="submit">Guardar</button>
      </div>
    </form>
  </template>
</template>
