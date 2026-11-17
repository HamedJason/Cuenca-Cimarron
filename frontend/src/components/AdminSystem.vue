<script setup>
// Estado del sitio y mantenimiento, para quien mantiene vivo el sistema.
import { ref, computed, onMounted } from "vue";
import Icon from "./Icon.vue";
import FormField from "./FormField.vue";
import { api } from "../composables/api";

const data = ref(null);
const error = ref("");
const message = ref("");
const busy = ref(false);
const year = ref("");
const confirmText = ref("");

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
const years = computed(() => Object.entries(data.value?.school_years ?? {}).filter(([y]) => y !== data.value?.current_school_year));

async function load() {
  error.value = "";
  try {
    data.value = await api("/admin/sistema");
  } catch (e) {
    error.value = e.message;
  }
}
onMounted(load);

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
async function closeYear() {
  busy.value = true;
  message.value = "";
  try {
    const r = await api("/admin/sistema/cerrar-ciclo", { method: "POST", body: { school_year: year.value, confirm: confirmText.value } });
    message.value = `Ciclo ${year.value} cerrado: ${r.archived} grupos archivados`;
    confirmText.value = "";
    year.value = "";
    await load();
  } catch (e) {
    message.value = e.errors?.confirm ? "Escribe CERRAR en mayúsculas para confirmar" : e.message;
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
      <div class="maint-item">
        <div>
          <h3>Limpieza</h3>
          <p class="muted-text">Borra sesiones caducadas y enlaces viejos, y borra los nombres de alumnos de grupos archivados hace más de 60 días. El sitio ya lo hace solo de vez en cuando</p>
        </div>
        <button class="button secondary" type="button" :disabled="busy" @click="cleanup">Limpiar ahora</button>
      </div>
      <div class="maint-item">
        <div>
          <h3>Cerrar ciclo escolar</h3>
          <p class="muted-text">Archiva todos los grupos de un ciclo terminado. Ya nadie entra con sus códigos y los nombres de los alumnos se borran 60 días después. El ciclo actual es {{ data.current_school_year }}</p>
          <p v-if="!years.length" class="small muted-text">No hay grupos activos de ciclos anteriores</p>
          <form v-else class="inline-form" @submit.prevent="closeYear">
            <FormField v-slot="{ id }" label="Ciclo">
              <select :id="id" v-model="year">
                <option value="" disabled>Elige uno</option>
                <option v-for="[y, total] in years" :key="y" :value="y">{{ y }} ({{ total }} grupos)</option>
              </select>
            </FormField>
            <FormField v-slot="{ id }" label="Escribe CERRAR para confirmar">
              <input :id="id" v-model.trim="confirmText" autocomplete="off" />
            </FormField>
            <button class="button primary" type="submit" :disabled="busy || !year || confirmText !== 'CERRAR'">Cerrar ciclo</button>
          </form>
        </div>
      </div>
    </section>
  </template>
</template>
