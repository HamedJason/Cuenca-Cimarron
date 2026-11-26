<script setup>
import { ref, watch, computed, defineAsyncComponent } from "vue";
import Icon from "../components/Icon.vue";
import AdminSchoolItem from "../components/AdminSchoolItem.vue";
import { api } from "../composables/api";
import { account, accountState, loadAccount, logout } from "../composables/useAccount";

const AdminStats = defineAsyncComponent(() => import("../components/AdminStats.vue"));
const AdminCatalog = defineAsyncComponent(() => import("../components/AdminCatalog.vue"));
const AdminStaff = defineAsyncComponent(() => import("../components/AdminStaff.vue"));
const AdminSystem = defineAsyncComponent(() => import("../components/AdminSystem.vue"));
const AdminAudit = defineAsyncComponent(() => import("../components/AdminAudit.vue"));
const AdminOpinions = defineAsyncComponent(() => import("../components/AdminOpinions.vue"));
const AdminSchoolsAll = defineAsyncComponent(() => import("../components/AdminSchoolsAll.vue"));
const SchoolMapModal = defineAsyncComponent(() => import("../components/SchoolMapModal.vue"));
loadAccount();
// admin: todo. viewer: cuenta de solo lectura, ve el panel de datos y la lista de escuelas.
const isAdmin = computed(() => account.value?.role === "admin");
const isStaff = computed(() => ["admin", "viewer"].includes(account.value?.role));
// La cuenta del modo demostración no ve cuentas, bitácora ni respaldos (el servidor tampoco se los da).
const isDemo = computed(() => String(account.value?.email ?? "").endsWith("@demo-20nov.invalid"));
const tabs = computed(() =>
  isAdmin.value
    ? [
        { id: "escuelas", label: "Escuelas" },
        { id: "estadisticas", label: "Panel de datos" },
        { id: "sistema", label: "Sistema" },
        ...(isDemo.value
          ? []
          : [
              { id: "opiniones", label: "Opiniones" },
              { id: "cuentas", label: "Cuentas" },
              { id: "bitacora", label: "Bitácora" },
              { id: "respaldos", label: "Respaldos" },
            ]),
      ]
    : [
        { id: "estadisticas", label: "Panel de datos" },
        { id: "escuelas", label: "Escuelas" },
      ],
);
const tab = ref("escuelas");
watch(isStaff, () => {
  if (isStaff.value && !isAdmin.value) tab.value = "estadisticas";
}, { immediate: true });

// Escuelas: se ven las 5 más recientes y "Ver todas" abre la lista completa con buscador.
const filters = [
  { id: "approved", label: "Registradas" },
  { id: "suspended", label: "Suspendidas" },
];
const filter = ref("approved");
const schools = ref([]);
const counts = ref({});
const total = ref(0);
const loadingSchools = ref(false);
const listError = ref("");
const showAll = ref(false);
const mapSchool = ref(null);
async function loadSchools() {
  loadingSchools.value = true;
  listError.value = "";
  try {
    const data = await api(`/admin/escuelas?estado=${filter.value}&por=5`);
    schools.value = data.schools;
    counts.value = data.counts;
    total.value = data.total;
  } catch (error) {
    listError.value = error.message;
  } finally {
    loadingSchools.value = false;
  }
}
watch([filter, isStaff], () => isStaff.value && loadSchools(), { immediate: true });
const filterLabel = computed(() => filters.find((f) => f.id === filter.value)?.label ?? "");

// Respaldos
const backups = ref([]);
const folderReady = ref(true);
const backupKey = ref("");
const backupKeySet = ref(false);
async function loadBackups() {
  const data = await api("/admin/respaldos");
  backups.value = data.backups;
  folderReady.value = data.folder_ready;
  const settings = await api("/admin/ajustes");
  backupKeySet.value = settings.settings.backup_key_set;
}
async function newBackupKey() {
  if (backupKeySet.value && !confirm("Ya hay una clave. Si generas otra, la anterior deja de funcionar. ¿Seguir?")) return;
  const data = await api("/admin/respaldo/clave", { method: "POST" });
  backupKey.value = data.key;
  backupKeySet.value = true;
}
const size = (bytes) => (bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const date = (iso) => new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });

watch(
  [tab, isAdmin],
  () => {
    if (isAdmin.value && tab.value === "respaldos") loadBackups().catch(() => {});
  },
  { immediate: true },
);
</script>
<template>
  <div class="page account-page">
    <header class="page-heading">
      <h1>{{ isAdmin || !isStaff ? "Administración" : "Panel de datos" }}</h1>
      <p v-if="isStaff">{{ account.email }}</p>
    </header>

    <p v-if="accountState === 'loading' && !account" class="form-card" role="status">Cargando…</p>
    <div v-else-if="!isStaff" class="form-card narrow">
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
          <button v-for="item in filters" :key="item.id" type="button" :class="['filter-chip', { active: filter === item.id }]" :aria-pressed="filter === item.id" @click="filter = item.id">
            {{ item.label }} <b>{{ counts[item.id] ?? 0 }}</b>
          </button>
        </div>
        <p v-if="listError" class="form-alert is-error" role="alert">{{ listError }}</p>
        <p v-else-if="loadingSchools && !schools.length" role="status">Cargando…</p>
        <p v-else-if="!schools.length" class="muted-text">No hay escuelas en esta lista</p>
        <ul class="review-list">
          <AdminSchoolItem v-for="school in schools" :key="school.id" :school="school" :is-admin="isAdmin" @map="mapSchool = $event" @changed="loadSchools" />
        </ul>
        <button v-if="total > schools.length" class="button secondary" type="button" @click="showAll = true">
          <Icon name="search" :size="20" /> Ver todas ({{ total }})
        </button>
      </section>
      <AdminSchoolsAll :open="showAll" :status="filter" :title="`Escuelas ${filterLabel.toLowerCase()}`" :is-admin="isAdmin" @close="showAll = false" @map="mapSchool = $event" @changed="loadSchools" />
      <SchoolMapModal :school="mapSchool" @close="mapSchool = null" />

      <AdminCatalog v-if="tab === 'escuelas'" :can-edit="isAdmin" />

      <AdminStats v-else-if="tab === 'estadisticas'" />

      <AdminStaff v-else-if="tab === 'cuentas' && isAdmin && !isDemo" />

      <AdminSystem v-else-if="tab === 'sistema' && isAdmin" :is-demo="isDemo" />

      <AdminOpinions v-else-if="tab === 'opiniones' && isAdmin && !isDemo" />

      <AdminAudit v-else-if="tab === 'bitacora' && isAdmin && !isDemo" />

      <section v-else-if="tab === 'respaldos' && isAdmin && !isDemo" class="form-card" role="tabpanel">
        <h2 class="form-title">Respaldo en este momento</h2>
        <p class="muted-text">Descarga toda la base de datos en un archivo comprimido</p>
        <a class="button primary" href="/api/admin/respaldo" download><Icon name="download" :size="20" />Descargar respaldo</a>

        <h2 class="form-title">Copias diarias del servidor</h2>
        <p v-if="!folderReady" class="muted-text">Este servidor no guarda copias diarias por su cuenta. Usa el botón de arriba o el respaldo automático en GitHub</p>
        <p v-else-if="!backups.length" class="muted-text">Todavía no hay copias. El servidor hace una al día y guarda las de las últimas dos semanas</p>
        <ul class="plain-list">
          <li v-for="file in backups" :key="file.name">
            <a class="text-link" :href="`/api/admin/respaldos/${file.name}`" download>{{ file.name }}</a>
            <span class="small muted-text">{{ size(file.size) }} · {{ date(file.date) }}</span>
          </li>
        </ul>

        <h2 class="form-title">Respaldo automático en GitHub</h2>
        <p class="muted-text">GitHub puede descargar un respaldo cada día y guardarlo cifrado 14 días. Genera la clave y pégala en el repositorio como secreto <b>RESPALDO_CLAVE</b></p>
        <p v-if="backupKeySet && !backupKey" class="small">Ya hay una clave guardada</p>
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
