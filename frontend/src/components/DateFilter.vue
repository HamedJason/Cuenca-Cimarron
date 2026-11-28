<script setup>
// Filtro de fechas de los paneles: Desde, Hasta y atajos (Este mes, Últimos 30 días, Todo).
// Avisa con "change" cuando las fechas quedan bien para volver a pedir los datos.
import { useId } from "vue";
import { presets } from "../composables/dateRange";

const props = defineProps({ range: { type: Object, required: true } });
const emit = defineEmits(["change"]);
const id = useId();
function pick(preset) {
  props.range.apply(preset);
  emit("change");
}
function changed() {
  if (!props.range.bad.value) emit("change");
}
</script>
<template>
  <div class="date-filter">
    <div class="chip-filter" role="group" aria-label="Fechas">
      <button v-for="p in presets" :key="p.id" type="button" class="filter-chip" @click="pick(p.id)">{{ p.label }}</button>
    </div>
    <div class="field-row date-filter-inputs">
      <div class="field">
        <label :for="`${id}-desde`">Desde</label>
        <input :id="`${id}-desde`" v-model="range.desde.value" type="date" @change="changed" />
      </div>
      <div class="field">
        <label :for="`${id}-hasta`">Hasta</label>
        <input :id="`${id}-hasta`" v-model="range.hasta.value" type="date" :min="range.desde.value || undefined" @change="changed" />
      </div>
    </div>
    <p v-if="range.bad.value" class="form-alert is-error" role="alert">La fecha final tiene que ser después de la inicial</p>
    <p v-else class="small muted-text">
      {{ range.desde.value || range.hasta.value ? "Las actividades y Cimacoins cuentan solo esas fechas" : "Sin fechas se ve todo lo que hay" }}
    </p>
  </div>
</template>
