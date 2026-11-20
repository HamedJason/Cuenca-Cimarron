<script setup>
// Datos de la escuela. Se usa al registrarse y al corregir los datos desde el panel.
import { computed, ref, watch } from "vue";
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
  // De dónde salió el punto de una escuela del catálogo: sep, inegi o aprox
  geo: { type: String, default: "" },
});
const emit = defineEmits(["no-cct"]);

// El punto de la escuela en el mapa. Al elegirla del catálogo ya viene puesto (geo dice de dónde salió:
// sep, inegi o aprox). Si no trae punto, se busca solo y se pone, y la escuela lo mueve si no es la entrada:
// 1. La escuela por su nombre en OpenStreetMap: punto en la escuela
// 2. La calle con número: punto si OpenStreetMap tiene ese número; si no, el mapa solo se acerca a la calle
// 3. La colonia, y si no, las escuelas del catálogo en esa colonia: el mapa solo se acerca
// pinBy: de dónde salió el punto puesto. near = [lat, lng, zoom] cuando solo se acerca el mapa
const pinBy = ref(model.value.lat ? props.geo || "guardada" : "");
const near = ref(null);
const nearBy = ref("");
const autoPin = () => !model.value.lat || pinBy.value.startsWith("osm-");
const plain = (t) => String(t ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const median = (list) => {
  const sorted = [...list].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
// Solo Tijuana y Playas de Rosarito
const VIEWBOX = "-117.13,32.58,-116.55,32.05";
const SCHOOL_TYPES = ["school", "kindergarten", "college", "university"];
const found = new Map();
let lastAsk = 0;
// OpenStreetMap pide no más de una búsqueda por segundo
async function osm(q) {
  if (found.has(q)) return found.get(q);
  const wait = lastAsk + 1100 - Date.now();
  if (wait > 0) await new Promise((done) => setTimeout(done, wait));
  lastAsk = Date.now();
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=mx&bounded=1&accept-language=es" +
    `&viewbox=${VIEWBOX}&q=${encodeURIComponent(q)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  const [hit] = await response.json();
  const result = hit ? { point: [Number(hit.lat), Number(hit.lon)], category: hit.category, type: hit.type, addresstype: hit.addresstype } : null;
  found.set(q, result);
  return result;
}
async function fromCatalog(colonia) {
  const same = (await searchCatalog(colonia)).filter((s) => s.lat && plain(s.colonia) === plain(colonia));
  return same.length ? { point: [median(same.map((s) => s.lat)), median(same.map((s) => s.lng))] } : null;
}
function putPin([lat, lng], by) {
  model.value.lat = Number(lat.toFixed(6));
  model.value.lng = Number(lng.toFixed(6));
  pinBy.value = by;
}
let timer;
let turn = 0;
watch(
  () => [model.value.name, model.value.address, model.value.colonia],
  ([name, address, colonia]) => {
    clearTimeout(timer);
    const mine = ++turn;
    if (!autoPin() || plain(colonia).length < 3) return;
    timer = setTimeout(async () => {
      const where = `${colonia}, Baja California`;
      // [buscar, qué hacer con lo encontrado]: "pin" pone el punto; un número solo acerca el mapa
      const tries = [
        plain(name).length >= 3 && [
          () => osm(`${name}, ${where}`),
          (hit) => (hit.category === "amenity" && SCHOOL_TYPES.includes(hit.type) ? ["pin", "osm-escuela"] : null),
        ],
        plain(address).length >= 3 && [
          () => osm(`${address}, ${where}`),
          (hit) => (/\d/.test(address) && ["house", "building"].includes(hit.addresstype) ? ["pin", "osm-casa"] : [17, "calle"]),
        ],
        [() => osm(where), () => [15, "colonia"]],
        [() => fromCatalog(colonia), () => [15, "colonia"]],
      ].filter(Boolean);
      for (const [find, use] of tries) {
        try {
          const hit = await find();
          if (mine !== turn || !autoPin()) return;
          const action = hit && use(hit);
          if (!action) continue;
          if (action[0] === "pin") {
            putPin(hit.point, action[1]);
          } else {
            // Un punto puesto antes con otra dirección ya no sirve
            if (pinBy.value.startsWith("osm-")) {
              Object.assign(model.value, { lat: null, lng: null });
              pinBy.value = "";
            }
            near.value = [...hit.point, action[0]];
            nearBy.value = action[1];
          }
          return;
        } catch {
          // Sin internet o sin catálogo se prueba lo siguiente; al final el mapa se queda en Tijuana
        }
      }
    }, 900);
  },
  { immediate: true },
);
// La escuela tocó o arrastró el punto: desde aquí ya no se mueve solo
function setLocation({ lat, lng }) {
  model.value.lat = lat;
  model.value.lng = lng;
  pinBy.value = "tocado";
}
const pinHint = computed(
  () =>
    ({
      inegi: "Ubicamos tu escuela con el directorio del INEGI. Si el punto no está en la entrada, arrástralo o toca el lugar correcto",
      sep: "Ubicación del catálogo de la SEP. Si el punto no está en la entrada, arrástralo o toca el lugar correcto",
      aprox: "Punto aproximado: hay una escuela con el mismo nombre ahí. Revisa que sea la tuya y mueve el punto si hace falta",
      "osm-escuela": "Encontramos tu escuela en OpenStreetMap. Revisa que el punto esté en la entrada",
      "osm-casa": "Punto aproximado por la dirección. Revisa que esté en la escuela y muévelo si hace falta",
    })[pinBy.value] ?? "Ya está marcada. Si no es la entrada, arrastra el punto o toca el lugar correcto",
);
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
            ? pinHint
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
