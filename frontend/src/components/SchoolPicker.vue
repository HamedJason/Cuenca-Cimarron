<script setup>
// Busca la escuela en el catálogo oficial de la SEP. Al elegirla se llenan sus datos.
import { ref, watch } from "vue";
import Icon from "./Icon.vue";
import FormField from "./FormField.vue";
import { searchCatalog } from "../composables/useCatalog";
import { labelOf, levels, shifts } from "../composables/useAccount";

const emit = defineEmits(["pick", "manual"]);
const q = ref("");
const results = ref([]);
const state = ref("idle");
let timer;
watch(q, (value) => {
  clearTimeout(timer);
  if (value.trim().length < 3) {
    results.value = [];
    state.value = "idle";
    return;
  }
  state.value = "loading";
  timer = setTimeout(async () => {
    try {
      results.value = await searchCatalog(value.trim());
      state.value = "ready";
    } catch {
      state.value = "error";
    }
  }, 300);
});
</script>
<template>
  <section class="form-group school-picker">
    <h2 class="form-title">Busca tu escuela</h2>
    <FormField v-slot="{ id, describedby }" label="Nombre, CCT o colonia" hint="Escuelas de Tijuana y Rosarito del catálogo de la SEP">
      <input :id="id" v-model="q" type="search" autocomplete="off" maxlength="80" :aria-describedby="describedby" placeholder="Por ejemplo Benito Juárez Sánchez Taboada" />
    </FormField>
    <p v-if="state === 'loading'" class="small muted-text" role="status">Buscando…</p>
    <p v-else-if="state === 'error'" class="small muted-text" role="status">No se pudo buscar. Puedes llenar los datos a mano</p>
    <p v-else-if="state === 'ready' && !results.length" class="small muted-text" role="status">No encontramos esa escuela. Prueba con otra palabra o llena los datos a mano</p>
    <ul v-if="results.length" class="picker-list" aria-label="Escuelas encontradas">
      <li v-for="school in results" :key="school.cct">
        <button type="button" class="picker-item" :disabled="school.registered" @click="emit('pick', school)">
          <b>{{ school.name }}</b>
          <span>{{ school.level ? labelOf(levels, school.level) : school.level_detail }}<template v-if="school.shift"> · {{ labelOf(shifts, school.shift) }}</template> · {{ school.colonia || school.municipality }} · CCT {{ school.cct }}</span>
          <small v-if="school.registered">Ya está registrada</small>
        </button>
      </li>
    </ul>
    <button class="text-link" type="button" @click="emit('manual')"><Icon name="info" :size="18" />No encuentro mi escuela, la escribo a mano</button>
  </section>
</template>
