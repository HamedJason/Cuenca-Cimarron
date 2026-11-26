<script setup>
// Bitácora: quién hizo qué y cuándo.
import { ref, watch, nextTick, onBeforeUnmount } from "vue";
import { api } from "../composables/api";

const labels = {
  configurar: "Creó la primera cuenta de administración",
  registro: "Registró su escuela",
  "editar-datos": "Corrigió los datos de su escuela",
  "aprobar-escuela": "Aprobó una escuela",
  "rechazar-escuela": "Rechazó una escuela",
  "suspender-escuela": "Suspendió una escuela",
  "reactivar-escuela": "Reactivó una escuela",
  "cambiar-correo-escuela": "Cambió el correo de una escuela",
  "enlace-contrasena-escuela": "Mandó un enlace de contraseña a una escuela",
  "alta-docente": "Dio de alta a un docente",
  "baja-docente": "Dio de baja a un docente",
  "reactivar-docente": "Volvió a dar de alta a un docente",
  "enlace-docente": "Generó un enlace para un docente",
  "acceso-docente": "Entró con su enlace",
  "crear-grupo": "Creó un grupo",
  "cambiar-codigo": "Cambió el código de un grupo",
  "archivar-grupo": "Archivó un grupo",
  "asignar-tareas": "Asignó tareas",
  "borrar-alumno": "Borró a un alumno",
  "reiniciar-acceso-alumno": "Dio un código nuevo a un alumno",
  "guardar-ajustes": "Cambió los ajustes",
  "descargar-respaldo": "Descargó un respaldo",
  "descargar-respaldo-guardado": "Descargó un respaldo guardado",
  "generar-clave-respaldo": "Generó la clave de respaldos",
  "respaldo-automatico": "Respaldo automático de GitHub",
  "invitar-cuenta": "Invitó una cuenta",
  "cambiar-rol": "Cambió el tipo de una cuenta",
  "quitar-cuenta": "Quitó una cuenta",
  "actualizar-catalogo-escuelas": "Actualizó el catálogo de escuelas",
  limpieza: "Hizo limpieza",
  "cerrar-ciclo": "Cerró un ciclo escolar",
  "encender-demo": "Encendió el modo demostración",
  "apagar-demo": "Apagó el modo demostración",
  "ocultar-opinion": "Ocultó un comentario de Comunidad Cimarrona",
  "mostrar-opinion": "Volvió a mostrar un comentario de Comunidad Cimarrona",
};
const entries = ref([]);
const actions = ref([]);
const filter = ref("");
const more = ref(false);
const state = ref("loading");
const loadingMore = ref(false);
const sentinel = ref(null);
let observer = null;

async function load(append = false) {
  if (append && (loadingMore.value || !more.value)) return;
  loadingMore.value = append;
  try {
    const params = new URLSearchParams();
    if (filter.value) params.set("accion", filter.value);
    params.set("por", "20");
    if (append && entries.value.length) params.set("antes_de", entries.value[entries.value.length - 1].id);
    const data = await api(`/admin/bitacora?${params}`);
    entries.value = append ? [...entries.value, ...data.entries] : data.entries;
    actions.value = data.actions;
    more.value = data.more;
    state.value = "ready";
  } catch (e) {
    state.value = e.message;
  } finally {
    loadingMore.value = false;
  }
  await nextTick();
  watchSentinel();
}
// Al llegar al final de la tabla se piden los 20 siguientes
function watchSentinel() {
  observer?.disconnect();
  if (!sentinel.value) return;
  observer = new IntersectionObserver((list) => {
    if (list.some((e) => e.isIntersecting)) load(true);
  }, { rootMargin: "300px" });
  observer.observe(sentinel.value);
}
onBeforeUnmount(() => observer?.disconnect());
watch(filter, () => load(), { immediate: true });
const date = (iso) => new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
const detail = (d) => (d ? Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join(" · ") : "");
</script>
<template>
  <section class="form-card" role="tabpanel">
    <div class="panel-head">
      <h2 class="form-title">Bitácora</h2>
      <label class="audit-filter">
        <span class="sr-only">Filtrar por acción</span>
        <select v-model="filter" class="code-input">
          <option value="">Todas las acciones</option>
          <option v-for="a in actions" :key="a" :value="a">{{ labels[a] ?? a }}</option>
        </select>
      </label>
    </div>
    <p v-if="state === 'loading'" role="status">Cargando…</p>
    <p v-else-if="state !== 'ready'" class="form-alert is-error" role="alert">{{ state }}</p>
    <p v-else-if="!entries.length" class="muted-text">Sin registros</p>
    <div v-else class="table-wrap">
      <table class="data-table">
        <thead><tr><th>Cuándo</th><th>Quién</th><th>Qué hizo</th><th>Sobre qué</th></tr></thead>
        <tbody>
          <tr v-for="e in entries" :key="e.id">
            <td class="nowrap">{{ date(e.at) }}</td>
            <td>{{ e.actor }}</td>
            <td>{{ labels[e.action] ?? e.action }}<br v-if="e.details" /><span v-if="e.details" class="small muted-text">{{ detail(e.details) }}</span></td>
            <td>{{ e.subject }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="more" ref="sentinel" class="list-sentinel" aria-hidden="true"></div>
    <p v-if="loadingMore" class="small muted-text" role="status">Cargando más…</p>
  </section>
</template>
