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

// Sin ubicación marcada, el mapa se acerca a la dirección escrita para que la escuela toque su entrada.
// La mayoría de las escuelas del catálogo de la SEP no trae su ubicación real, así que se busca así:
// 1. Calle y colonia en OpenStreetMap  2. Solo la colonia  3. Escuelas del catálogo en esa misma colonia.
// Nunca marca el punto sola: solo acerca el mapa. near = [lat, lng, zoom]
const near = ref(null);
const nearBy = ref("");
const plain = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const median = (list) => {
  const sorted = [...list].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
// Solo Tijuana y Playas de Rosarito
const VIEWBOX = "-117.13,32.58,-116.55,32.05";
const found = new Map();
async function osm(q) {
  if (found.has(q)) return found.get(q);
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=mx&bounded=1&accept-language=es" +
    `&viewbox=${VIEWBOX}&q=${encodeURIComponent(q)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  const [hit] = await response.json();
  const point = hit ? [Number(hit.lat), Number(hit.lon)] : null;
  found.set(q, point);
  return point;
}
async function fromCatalog(colonia) {
  const same = (await searchCatalog(colonia)).filter((s) => s.lat && plain(s.colonia) === plain(colonia));
  return same.length ? [median(same.map((s) => s.lat)), median(same.map((s) => s.lng))] : null;
}
let timer;
let turn = 0;
watch(
  () => [model.value.address, model.value.colonia],
  ([address, colonia]) => {
    clearTimeout(timer);
    const mine = ++turn;
    if (model.value.lat || plain(colonia).length < 3) return;
    timer = setTimeout(async () => {
      const tries = [
        plain(address).length >= 3 && [() => osm(`${address}, ${colonia}, Baja California`), 17, "calle"],
        [() => osm(`${colonia}, Baja California`), 15, "colonia"],
        [() => fromCatalog(colonia), 15, "colonia"],
      ].filter(Boolean);
      for (const [find, zoom, by] of tries) {
        try {
          const point = await find();
          if (mine !== turn || model.value.lat) return;
          if (point) {
            near.value = [...point, zoom];
            nearBy.value = by;
            return;
          }
        } catch {
          // Sin internet o sin catálogo se prueba lo siguiente; al final el mapa se queda en Tijuana
        }
      }
    }, 900);
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
      <p class="field-hint">
        {{
          model.lat
            ? "Ya está marcada. Si no es la entrada, toca el lugar correcto en el mapa"
            : nearBy === "calle"
              ? "El mapa se acercó a la calle que escribiste. Toca la entrada de la escuela"
              : nearBy === "colonia"
                ? "El mapa se acercó a tu colonia. Busca la escuela y toca su entrada"
                : "Toca el mapa donde está la entrada de la escuela"
        }}
      </p>
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
