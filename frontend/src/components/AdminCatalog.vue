<script setup>
// Carga o actualiza el catálogo de escuelas de los 7 municipios de Baja California desde datos.gob.mx.
import { ref, onMounted } from "vue";
import Icon from "./Icon.vue";
import { api } from "../composables/api";
import { SEP_CATALOG, fetchSepCatalog, uploadCatalog } from "../composables/useCatalog";

defineProps({ canEdit: Boolean });
const status = ref(null);
const busy = ref(false);
const progress = ref("");
const error = ref("");
const load = async () => {
  status.value = await api("/admin/catalogo-escuelas").catch(() => null);
};
onMounted(load);
async function update() {
  busy.value = true;
  error.value = "";
  try {
    const schools = await fetchSepCatalog((text) => (progress.value = text));
    if (!schools.length) throw new Error("datos.gob.mx no regresó escuelas. Revisa que el recurso siga siendo el mismo");
    await uploadCatalog(schools, (text) => (progress.value = text));
    progress.value = `Listo: ${schools.length.toLocaleString("es-MX")} escuelas`;
    await load();
  } catch (e) {
    error.value = e.message;
  } finally {
    busy.value = false;
  }
}
const date = (iso) => new Date(iso).toLocaleDateString("es-MX", { dateStyle: "long" });
</script>
<template>
  <section class="form-card">
    <h2 class="form-title">Catálogo de escuelas</h2>
    <p class="muted-text">
      Las escuelas de los 7 municipios de Baja California del Catálogo de Centros de Trabajo de la SEP {{ SEP_CATALOG.year }} (datos.gob.mx). Con él cada escuela se busca y se elige al registrarse. Conviene actualizarlo una vez al año
    </p>
    <p v-if="status">
      <b>{{ status.total.toLocaleString("es-MX") }}</b> escuelas
      <span v-for="(total, mun) in status.by_municipality" :key="mun" class="muted-text"> · {{ mun }} {{ total.toLocaleString("es-MX") }}</span>
      <span v-if="status.updated_at" class="muted-text"> · actualizado el {{ date(status.updated_at) }}</span>
    </p>
    <button v-if="canEdit" class="button secondary" type="button" :disabled="busy" @click="update"><Icon name="download" :size="20" />{{ status?.total ? "Actualizar desde datos.gob.mx" : "Cargar desde datos.gob.mx" }}</button>
    <p v-if="progress" class="small" role="status">{{ progress }}</p>
    <p v-if="error" class="form-alert is-error" role="alert">{{ error }}</p>
  </section>
</template>
