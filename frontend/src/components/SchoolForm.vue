<script setup>
// Datos de la escuela. Se usa al registrarse y al corregir los datos desde el panel.
import { ref, watch } from "vue";
import FormField from "./FormField.vue";
import LocationPicker from "./LocationPicker.vue";
import { levels, shifts, sectors } from "../composables/useAccount";
import { searchCatalog } from "../composables/useCatalog";
const model = defineModel({ type: Object, required: true });
// fromCatalog: los datos vienen del catálogo de la SEP y la CCT no se cambia.
// noCct: la escuela marcó que no sabe su CCT (solo al registrarse a mano).
const props = defineProps({
  errors: { type: Object, default: () => ({}) },
  fromCatalog: Boolean,
  noCct: Boolean,
  askNoCct: { type: Boolean, default: true },
});
const emit = defineEmits(["no-cct"]);

// Sin ubicación: el mapa se acerca a la colonia usando escuelas del catálogo que están en ella
const near = ref(null);
const plain = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
let timer;
watch(
  () => model.value.colonia,
  (colonia) => {
    clearTimeout(timer);
    if (model.value.lat || plain(colonia).length < 3) return;
    timer = setTimeout(async () => {
      try {
        const found = (await searchCatalog(colonia)).filter((s) => s.lat && plain(s.colonia).includes(plain(colonia)));
        if (!found.length) return;
        near.value = [found.reduce((a, s) => a + s.lat, 0) / found.length, found.reduce((a, s) => a + s.lng, 0) / found.length];
      } catch {
        // Sin catálogo el mapa se queda en Tijuana
      }
    }, 600);
  },
  { immediate: true },
);
function setLocation({ lat, lng }) {
  model.value.lat = lat;
  model.value.lng = lng;
}
</script>
<template>
  <fieldset class="form-group">
    <legend>Escuela</legend>
    <FormField v-slot="{ id }" label="Nombre de la escuela" :error="errors.name">
      <input :id="id" v-model.trim="model.name" maxlength="160" autocomplete="organization" required />
    </FormField>
    <FormField
      v-slot="{ id, describedby }"
      label="Clave de Centro de Trabajo (CCT)"
      :optional="noCct"
      :hint="fromCatalog ? 'Viene del catálogo de la SEP' : 'Ejemplo 02DPR0123X. Viene en la boleta o en los documentos de la escuela'"
      :error="errors.cct"
    >
      <input
        :id="id"
        v-model.trim="model.cct"
        :aria-describedby="describedby"
        maxlength="10"
        autocapitalize="characters"
        spellcheck="false"
        :readonly="fromCatalog"
        :disabled="askNoCct && noCct && !fromCatalog"
        :required="!noCct"
        pattern="[0-9]{2}[A-Za-z]{3}[0-9]{4}[A-Za-z]"
        @input="model.cct = model.cct.toUpperCase()"
      />
    </FormField>
    <label v-if="askNoCct && !fromCatalog" class="consent-row">
      <input type="checkbox" :checked="noCct" @change="emit('no-cct', $event.target.checked); if ($event.target.checked) model.cct = ''" />
      <span>No sé la CCT de mi escuela. La agrego después</span>
    </label>
    <div class="field-row">
      <FormField v-slot="{ id }" label="Nivel" :error="errors.level">
        <select :id="id" v-model="model.level" required>
          <option value="" disabled>Elige uno</option>
          <option v-for="item in levels" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
      </FormField>
      <FormField v-slot="{ id }" label="Turno" :error="errors.shift">
        <select :id="id" v-model="model.shift" required>
          <option value="" disabled>Elige uno</option>
          <option v-for="item in shifts" :key="item.value" :value="item.value">{{ item.label }}</option>
        </select>
      </FormField>
    </div>
    <fieldset class="field choice-row">
      <legend>Tipo de escuela</legend>
      <label v-for="item in sectors" :key="item.value" class="choice">
        <input v-model="model.sector" type="radio" name="sector" :value="item.value" required />
        {{ item.label }}
      </label>
      <p v-if="errors.sector" class="field-error" role="alert">{{ errors.sector }}</p>
    </fieldset>
  </fieldset>
  <fieldset class="form-group">
    <legend>Dónde está</legend>
    <FormField v-slot="{ id }" label="Colonia" :error="errors.colonia">
      <input :id="id" v-model.trim="model.colonia" maxlength="120" required />
    </FormField>
    <FormField v-slot="{ id }" label="Calle y número" :error="errors.address">
      <input :id="id" v-model.trim="model.address" maxlength="200" autocomplete="street-address" required />
    </FormField>
    <div class="field">
      <span class="field-label">Ubicación en el mapa <span class="field-optional">(opcional)</span></span>
      <p class="field-hint">{{ model.lat ? "Ya está marcada. Si no es la entrada, toca el lugar correcto en el mapa" : "Toca el mapa donde está la entrada de la escuela" }}</p>
      <LocationPicker :lat="model.lat" :lng="model.lng" :near="near" @update="setLocation" />
      <p v-if="errors.lat || errors.lng" class="field-error" role="alert">{{ errors.lat || errors.lng }}</p>
    </div>
  </fieldset>
  <fieldset class="form-group">
    <legend>Responsable</legend>
    <FormField v-slot="{ id }" label="Nombre de la persona responsable" :error="errors.contact_name">
      <input :id="id" v-model.trim="model.contact_name" maxlength="120" autocomplete="name" required />
    </FormField>
  </fieldset>
</template>
