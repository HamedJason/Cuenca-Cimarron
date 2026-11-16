<script setup>
// Datos de la escuela. Se usa al registrarse y al corregir los datos desde el panel.
import FormField from "./FormField.vue";
import LocationPicker from "./LocationPicker.vue";
import { levels, shifts, sectors } from "../composables/useAccount";
const model = defineModel({ type: Object, required: true });
defineProps({ errors: { type: Object, default: () => ({}) } });
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
      optional
      hint="Ejemplo 02DPR0123X. Si no la tienes a la mano, la completamos al revisar tu registro"
      :error="errors.cct"
    >
      <input
        :id="id"
        v-model.trim="model.cct"
        :aria-describedby="describedby"
        maxlength="10"
        autocapitalize="characters"
        spellcheck="false"
        @input="model.cct = model.cct.toUpperCase()"
      />
    </FormField>
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
      <p class="field-hint">Toca el mapa donde está la entrada de la escuela</p>
      <LocationPicker :lat="model.lat" :lng="model.lng" @update="setLocation" />
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
