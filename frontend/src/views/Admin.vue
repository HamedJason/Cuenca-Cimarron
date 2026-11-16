<script setup>
import { ref, reactive, watch, computed, defineAsyncComponent } from "vue";
import Icon from "../components/Icon.vue";
import FormField from "../components/FormField.vue";
import { api } from "../composables/api";
import { account, accountState, loadAccount, logout, labelOf, levels, shifts, sectors, cctPattern } from "../composables/useAccount";

const AdminStats = defineAsyncComponent(() => import("../components/AdminStats.vue"));
loadAccount();
const isAdmin = computed(() => account.value?.role === "admin");
const tabs = [
  { id: "escuelas", label: "Escuelas" },
  { id: "estadisticas", label: "Estadísticas" },
  { id: "ajustes", label: "Ajustes" },
  { id: "respaldos", label: "Respaldos" },
];
const tab = ref("escuelas");

// Escuelas
const filter = ref("pending");
const schools = ref([]);
const counts = ref({});
const loadingSchools = ref(false);
const listError = ref("");
async function loadSchools() {
  loadingSchools.value = true;
  listError.value = "";
  try {
    const data = await api(`/admin/escuelas?estado=${filter.value}`);
    schools.value = data.schools;
    counts.value = data.counts;
  } catch (error) {
    listError.value = error.message;
  } finally {
    loadingSchools.value = false;
  }
}
watch([filter, isAdmin], () => isAdmin.value && loadSchools(), { immediate: true });

const reviewing = reactive({ id: null, cct: "", reason: "", error: "", busy: false });
function openReview(school) {
  Object.assign(reviewing, { id: school.id, cct: school.cct ?? "", reason: "", error: "", busy: false });
}
async function review(school, action) {
  reviewing.busy = true;
  reviewing.error = "";
  try {
    if (action === "aprobar") {
      if (reviewing.cct && !cctPattern.test(reviewing.cct)) throw new Error("La CCT debe verse como 02DPR0123X");
      await api(`/admin/escuelas/${school.id}/aprobar`, { method: "POST", body: { cct: reviewing.cct || null } });
    } else {
      await api(`/admin/escuelas/${school.id}/rechazar`, { method: "POST", body: { reason: reviewing.reason } });
    }
    reviewing.id = null;
    loadSchools();
  } catch (error) {
    reviewing.error = error.errors?.cct || error.errors?.reason || error.message;
  } finally {
    reviewing.busy = false;
  }
}

// Ajustes
const settings = ref(null);
const form = reactive({});
const settingsErrors = ref({});
const settingsMessage = ref("");
const testTo = ref("");
const testMessage = ref("");
async function loadSettings() {
  const data = await api("/admin/ajustes");
  settings.value = data.settings;
  Object.assign(form, {
    domain: data.settings.domain ?? "",
    public_url: data.settings.public_url ?? "",
    mail_host: data.settings.mail_host ?? "",
    mail_port: data.settings.mail_port ?? "",
    mail_username: data.settings.mail_username ?? "",
    mail_password: "",
    mail_encryption: data.settings.mail_encryption ?? "tls",
    mail_from_address: data.settings.mail_from_address ?? "",
    mail_from_name: data.settings.mail_from_name ?? "",
  });
}
async function saveSettings() {
  settingsErrors.value = {};
  settingsMessage.value = "";
  try {
    const body = { ...form, mail_port: form.mail_port ? Number(form.mail_port) : null };
    const data = await api("/admin/ajustes", { method: "PUT", body });
    settings.value = data.settings;
    form.mail_password = "";
    settingsMessage.value = "Guardado";
  } catch (error) {
    settingsErrors.value = error.errors;
    settingsMessage.value = Object.keys(error.errors).length ? "Revisa los campos marcados" : error.message;
  }
}
async function testMail() {
  testMessage.value = "Mandando…";
  try {
    await api("/admin/ajustes/correo-prueba", { method: "POST", body: { to: testTo.value || null } });
    testMessage.value = "Correo mandado. Revisa la bandeja de entrada";
  } catch (error) {
    testMessage.value = error.message;
  }
}

// Respaldos
const backups = ref([]);
const backupKey = ref("");
async function loadBackups() {
  const data = await api("/admin/respaldos");
  backups.value = data.backups;
}
async function newBackupKey() {
  if (settings.value?.backup_key_set && !confirm("Ya hay una clave. Si generas otra, la anterior deja de funcionar. ¿Seguir?")) return;
  const data = await api("/admin/respaldo/clave", { method: "POST" });
  backupKey.value = data.key;
  if (settings.value) settings.value.backup_key_set = true;
}
const size = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const date = (iso) => new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });

watch(
  [tab, isAdmin],
  () => {
    if (!isAdmin.value) return;
    if (tab.value === "ajustes" || tab.value === "respaldos") loadSettings().catch(() => {});
    if (tab.value === "respaldos") loadBackups().catch(() => {});
  },
  { immediate: true },
);
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>Administración</h1>
      <p v-if="isAdmin">{{ account.email }}</p>
    </header>

    <p v-if="accountState === 'loading' && !account" class="form-card" role="status">Cargando…</p>
    <div v-else-if="!isAdmin" class="form-card narrow">
      <p>Esta página es solo para la administración del sitio</p>
      <RouterLink to="/escuelas" class="button primary">Entrar</RouterLink>
    </div>

    <template v-else>
      <div class="panel-tabs" role="tablist" aria-label="Secciones">
        <button
          v-for="item in tabs"
          :key="item.id"
          role="tab"
          type="button"
          :aria-selected="tab === item.id"
          :class="['panel-tab', { active: tab === item.id }]"
          @click="tab = item.id"
        >
          {{ item.label }}
        </button>
        <button class="panel-tab is-quiet" type="button" @click="logout">Salir</button>
      </div>

      <section v-if="tab === 'escuelas'" class="form-card" role="tabpanel">
        <div class="chip-filter" role="group" aria-label="Mostrar">
          <button v-for="item in [['pending', 'En revisión'], ['approved', 'Aprobadas'], ['rejected', 'Rechazadas']]" :key="item[0]" type="button" :class="['filter-chip', { active: filter === item[0] }]" :aria-pressed="filter === item[0]" @click="filter = item[0]">
            {{ item[1] }} <b>{{ counts[item[0]] ?? 0 }}</b>
          </button>
        </div>
        <p v-if="listError" class="form-alert is-error" role="alert">{{ listError }}</p>
        <p v-else-if="loadingSchools" role="status">Cargando…</p>
        <p v-else-if="!schools.length" class="muted-text">No hay escuelas en esta lista</p>
        <ul class="review-list">
          <li v-for="school in schools" :key="school.id" class="review-item">
            <div class="review-main">
              <h3>{{ school.name }}</h3>
              <p>{{ labelOf(levels, school.level) }} · {{ labelOf(shifts, school.shift) }} · {{ labelOf(sectors, school.sector) }}</p>
              <p>{{ school.address }}, {{ school.colonia }}</p>
              <p>CCT: <b>{{ school.cct || "sin CCT" }}</b> · {{ school.contact_name }} · {{ school.email }}
                <span :class="['status-badge', school.email_verified ? 'is-approved' : 'is-pending']">{{ school.email_verified ? "Correo confirmado" : "Correo sin confirmar" }}</span>
              </p>
              <p v-if="school.lat"><a class="text-link" :href="`https://www.openstreetmap.org/?mlat=${school.lat}&mlon=${school.lng}#map=17/${school.lat}/${school.lng}`" target="_blank" rel="noopener">Ver en el mapa</a></p>
              <p v-if="school.rejection_reason" class="small">Motivo: {{ school.rejection_reason }}</p>
            </div>
            <div v-if="reviewing.id === school.id" class="review-form">
              <FormField v-slot="{ id }" label="CCT" optional>
                <input :id="id" v-model.trim="reviewing.cct" maxlength="10" @input="reviewing.cct = reviewing.cct.toUpperCase()" />
              </FormField>
              <button class="button primary" type="button" :disabled="reviewing.busy" @click="review(school, 'aprobar')">Aprobar</button>
              <FormField v-slot="{ id }" label="Motivo para rechazar">
                <input :id="id" v-model.trim="reviewing.reason" maxlength="300" />
              </FormField>
              <button class="button secondary" type="button" :disabled="reviewing.busy || reviewing.reason.length < 5" @click="review(school, 'rechazar')">Rechazar</button>
              <p v-if="reviewing.error" class="field-error" role="alert">{{ reviewing.error }}</p>
            </div>
            <button v-else-if="school.status !== 'approved'" class="button secondary" type="button" @click="openReview(school)">Revisar</button>
          </li>
        </ul>
      </section>

      <AdminStats v-else-if="tab === 'estadisticas'" />

      <form v-else-if="tab === 'ajustes'" class="form-card" role="tabpanel" novalidate @submit.prevent="saveSettings">
        <p v-if="!settings" role="status">Cargando…</p>
        <template v-else>
          <fieldset class="form-group">
            <legend>Dirección del sitio</legend>
            <FormField v-slot="{ id, describedby }" label="Dominio para el HTTPS de Caddy" optional hint="Solo si el servidor usa el HTTPS propio del sitio (HTTPS_CADDY=1). En el servidor de la facultad no hace falta" :error="settingsErrors.domain">
              <input :id="id" v-model.trim="form.domain" maxlength="200" spellcheck="false" :aria-describedby="describedby" :placeholder="settings.domain_env || ''" />
            </FormField>
            <FormField v-slot="{ id, describedby }" label="Dirección pública" optional hint="Con ella se arman los enlaces de los correos y de los grupos. Se guardó sola al configurar el sitio" :error="settingsErrors.public_url">
              <input :id="id" v-model.trim="form.public_url" type="url" maxlength="200" :aria-describedby="describedby" />
            </FormField>
            <p class="small muted-text">Los enlaces de los correos usan: <b>{{ settings.effective_url }}</b></p>
          </fieldset>
          <fieldset class="form-group">
            <legend>Servidor de correo (SMTP)</legend>
            <p class="small muted-text">Sirve una cuenta de correo del proyecto o un servicio como Brevo o Resend. Cada uno indica su servidor, puerto, usuario y contraseña</p>
            <div class="field-row">
              <FormField v-slot="{ id }" label="Servidor" :error="settingsErrors.mail_host">
                <input :id="id" v-model.trim="form.mail_host" maxlength="200" placeholder="smtp-relay.brevo.com" spellcheck="false" />
              </FormField>
              <FormField v-slot="{ id }" label="Puerto" :error="settingsErrors.mail_port">
                <input :id="id" v-model="form.mail_port" inputmode="numeric" maxlength="5" placeholder="587" />
              </FormField>
            </div>
            <FormField v-slot="{ id }" label="Cifrado" :error="settingsErrors.mail_encryption">
              <select :id="id" v-model="form.mail_encryption">
                <option value="tls">STARTTLS (puerto 587)</option>
                <option value="ssl">SSL (puerto 465)</option>
                <option value="none">Sin cifrado</option>
              </select>
            </FormField>
            <FormField v-slot="{ id }" label="Usuario" :error="settingsErrors.mail_username">
              <input :id="id" v-model.trim="form.mail_username" maxlength="200" autocomplete="off" spellcheck="false" />
            </FormField>
            <FormField v-slot="{ id, describedby }" label="Contraseña" :hint="settings.mail_password_set ? 'Ya hay una guardada. Déjalo vacío para conservarla' : ''" :error="settingsErrors.mail_password">
              <input :id="id" v-model="form.mail_password" type="password" maxlength="300" autocomplete="new-password" :aria-describedby="describedby" />
            </FormField>
            <div class="field-row">
              <FormField v-slot="{ id }" label="Correo que envía" optional :error="settingsErrors.mail_from_address">
                <input :id="id" v-model.trim="form.mail_from_address" type="email" maxlength="200" />
              </FormField>
              <FormField v-slot="{ id }" label="Nombre que envía" optional :error="settingsErrors.mail_from_name">
                <input :id="id" v-model.trim="form.mail_from_name" maxlength="100" placeholder="Cuenca Cimarrona" />
              </FormField>
            </div>
          </fieldset>
          <p v-if="settingsMessage" :class="['form-alert', settingsMessage === 'Guardado' ? 'is-ok' : 'is-error']" role="status">{{ settingsMessage }}</p>
          <div class="form-actions">
            <button class="button primary" type="submit">Guardar ajustes</button>
          </div>
          <fieldset class="form-group">
            <legend>Probar el correo</legend>
            <FormField v-slot="{ id }" label="Mandar a" optional>
              <input :id="id" v-model.trim="testTo" type="email" :placeholder="account.email" />
            </FormField>
            <button class="button secondary" type="button" @click="testMail">Mandar correo de prueba</button>
            <p v-if="testMessage" class="small" role="status">{{ testMessage }}</p>
          </fieldset>
        </template>
      </form>

      <section v-else-if="tab === 'respaldos'" class="form-card" role="tabpanel">
        <h2 class="form-title">Respaldo en este momento</h2>
        <p class="muted-text">Descarga toda la base de datos en un archivo comprimido</p>
        <a class="button primary" href="/api/admin/respaldo" download><Icon name="download" :size="20" />Descargar respaldo</a>

        <h2 class="form-title">Copias diarias del servidor</h2>
        <p v-if="!backups.length" class="muted-text">Todavía no hay copias. El servidor hace una al día y guarda las de las últimas dos semanas</p>
        <ul class="plain-list">
          <li v-for="file in backups" :key="file.name">
            <a class="text-link" :href="`/api/admin/respaldos/${file.name}`" download>{{ file.name }}</a>
            <span class="small muted-text">{{ size(file.size) }} · {{ date(file.date) }}</span>
          </li>
        </ul>

        <h2 class="form-title">Respaldo automático en GitHub</h2>
        <p class="muted-text">GitHub puede descargar un respaldo cada día y guardarlo cifrado 90 días. Genera la clave y pégala en el repositorio como secreto <b>RESPALDO_CLAVE</b></p>
        <p v-if="settings?.backup_key_set && !backupKey" class="small">Ya hay una clave guardada</p>
        <button class="button secondary" type="button" @click="newBackupKey">Generar clave</button>
        <div v-if="backupKey" class="note is-gold">
          <Icon name="info" />
          <div>
            <p>Copia esta clave ahora. No se vuelve a mostrar</p>
            <code class="secret-code">{{ backupKey }}</code>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
