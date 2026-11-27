<script setup>
// Datos de la escuela. Se usa al registrarse y al corregir los datos desde el panel.
import { computed, ref, watch } from "vue";
import FormField from "./FormField.vue";
import LocationPicker from "./LocationPicker.vue";
import { levels, shifts, sectors } from "../composables/useAccount";
import { searchCatalog, nearbyCatalog } from "../composables/useCatalog";
import { municipios, buscarMunicipio } from "../municipios";
import { municipioActual } from "../composables/useMunicipio";
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
  // Municipio de la escuela del catálogo (nombre de la SEP), si se eligió de ahí
  municipality: { type: String, default: "" },
});
const emit = defineEmits(["no-cct"]);

// El punto de la escuela en el mapa es obligatorio. Al elegirla del catálogo ya viene puesto (geo dice de
// dónde salió: sep, inegi o aprox). Si no trae punto, se busca y se pone solo, lo más cerca que se pueda,
// y la escuela lo mueve a la entrada:
// 1. La escuela por su nombre en OpenStreetMap
// 2. La calle con número; si OpenStreetMap no tiene el número, un punto en esa calle
// 3. El centro de las escuelas del catálogo con el mismo código postal
// 4. La colonia, y si no, el centro de las escuelas del catálogo en esa colonia
// Con código postal, lo que OpenStreetMap encuentre a más de 3 km de su centro se descarta.
// También se puede usar el GPS ("Estoy en la escuela") o tocar una de las escuelas cercanas del mapa.
// pinBy: de dónde salió el punto puesto. near = [lat, lng, zoom] para acercar el mapa
const pinBy = ref(model.value.lat ? props.geo || "guardada" : "");
const pickedName = ref("");
const near = ref(null);
const autoPin = () => !model.value.lat || pinBy.value.startsWith("osm-");
const plain = (t) => String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const median = (list) => {
  const sorted = [...list].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const centerOf = (list) => [median(list.map((s) => s.lat)), median(list.map((s) => s.lng))];
// Metros entre dos puntos [lat, lng] (a esta escala basta un plano)
const meters = (a, b) => Math.hypot((a[0] - b[0]) * 111000, (a[1] - b[1]) * 94000);
const validCp = (cp) => /^\d{5}$/.test(cp ?? "") && cp !== "00000";
// Municipio donde está la escuela. Acota la búsqueda de direcciones y del catálogo a ese municipio.
// Empieza con el de la escuela del catálogo o con el que la persona eligió en el sitio.
const muniId = ref(buscarMunicipio(props.municipality)?.id ?? municipioActual.value.id);
const muni = computed(() => buscarMunicipio(muniId.value) ?? municipioActual.value);
// Caja aproximada del municipio para OpenStreetMap: oeste, norte, este, sur
const viewbox = computed(() => muni.value.caja.join(","));
const inArea = ([lat, lng]) => {
  const [west, north, east, south] = muni.value.caja;
  return lat >= south && lat <= north && lng >= west && lng <= east;
};
// Sin punto, el mapa empieza en el municipio (el mapa por sí solo empieza en Tijuana)
if (!model.value.lat && muni.value.id !== "tijuana") near.value = [...muni.value.centro, 12];
const SCHOOL_TYPES = ["school", "kindergarten", "college", "university"];
const found = new Map();
let lastAsk = 0;
// OpenStreetMap pide no más de una búsqueda por segundo
async function osm(q) {
  const box = viewbox.value;
  const key = `${box}|${q}`;
  if (found.has(key)) return found.get(key);
  const wait = lastAsk + 1100 - Date.now();
  if (wait > 0) await new Promise((done) => setTimeout(done, wait));
  lastAsk = Date.now();
  const url =
    "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=mx&bounded=1&accept-language=es" +
    `&viewbox=${box}&q=${encodeURIComponent(q)}`;
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  const [hit] = await response.json();
  const result = hit ? { point: [Number(hit.lat), Number(hit.lon)], category: hit.category, type: hit.type, addresstype: hit.addresstype } : null;
  found.set(key, result);
  return result;
}
// Centro de las escuelas del catálogo con ese código postal
const cpCenters = new Map();
async function cpCenter(cp) {
  if (!validCp(cp)) return null;
  const sep = muni.value.sep;
  const key = `${sep}|${cp}`;
  if (!cpCenters.has(key)) {
    const list = await nearbyCatalog({ cp, municipio: sep }).catch(() => []);
    cpCenters.set(key, list.length ? centerOf(list) : null);
  }
  return cpCenters.get(key);
}
async function fromCatalog(colonia, cp) {
  let same = (await searchCatalog(colonia, undefined, muni.value.sep)).filter((s) => s.lat && plain(s.colonia) === plain(colonia));
  if (validCp(cp) && same.some((s) => s.postal_code === cp)) same = same.filter((s) => s.postal_code === cp);
  return same.length ? { point: centerOf(same) } : null;
}
function putPin([lat, lng], by) {
  model.value.lat = Number(lat.toFixed(6));
  model.value.lng = Number(lng.toFixed(6));
  pinBy.value = by;
}
let timer;
let turn = 0;
watch(
  () => [model.value.name, model.value.address, model.value.colonia, model.value.postal_code, muniId.value],
  ([name, address, colonia, cp]) => {
    clearTimeout(timer);
    const mine = ++turn;
    if (!autoPin() || (plain(colonia).length < 3 && !validCp(cp))) return;
    timer = setTimeout(async () => {
      const zone = await cpCenter(cp).catch(() => null);
      if (mine !== turn) return;
      // Lo de OpenStreetMap solo vale si cae cerca del código postal
      const close = (hit) => !zone || meters(hit.point, zone) <= 3000;
      const hasColonia = plain(colonia).length >= 3;
      const where = hasColonia ? `${colonia}, ${muni.value.sep}, Baja California` : `${muni.value.sep}, Baja California`;
      // [buscar, qué hacer con lo encontrado]: "pin" pone el punto exacto; un número es el acercamiento del mapa
      const tries = [
        plain(name).length >= 3 && [
          () => osm(`${name}, ${where}`),
          (hit) => (hit.category === "amenity" && SCHOOL_TYPES.includes(hit.type) && close(hit) ? ["pin", "osm-escuela"] : null),
        ],
        plain(address).length >= 3 && [
          () => osm(`${address}, ${where}`),
          (hit) =>
            !close(hit)
              ? null
              : /\d/.test(address) && ["house", "building"].includes(hit.addresstype)
                ? ["pin", "osm-casa"]
                : hit.category === "highway"
                  ? [17, "osm-calle"]
                  : null,
        ],
        zone && [() => ({ point: zone }), () => [16, "osm-cp"]],
        hasColonia && [
          () => osm(where),
          // OpenStreetMap no tiene todas las colonias y a veces responde con una tienda del mismo nombre
          (hit) => (["place", "boundary"].includes(hit.category) && close(hit) ? [16, "osm-colonia"] : null),
        ],
        hasColonia && [() => fromCatalog(colonia, cp), () => [16, "osm-colonia"]],
      ].filter(Boolean);
      for (const [find, use] of tries) {
        try {
          const hit = await find();
          if (mine !== turn || !autoPin()) return;
          const action = hit && use(hit);
          if (!action) continue;
          if (action[0] !== "pin") near.value = [...hit.point, action[0]];
          putPin(hit.point, action[1]);
          return;
        } catch {
          // Sin internet o sin catálogo se prueba lo siguiente. Al final el mapa se queda en el municipio
        }
      }
    }, 900);
  },
  { immediate: true },
);

// Escuelas cercanas al punto: las del catálogo (SEP e INEGI) y las que OpenStreetMap tiene dibujadas.
// Se piden de nuevo solo si el punto se movió más de 700 m.
const nearby = ref([]);
let nearbyFrom = null;
let nearbyTimer;
async function osmSchools([lat, lng]) {
  const query = `[out:json][timeout:10];nwr[amenity~"^(school|kindergarten|college|university)$"](around:1500,${lat},${lng});out center 60;`;
  const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return [];
  const { elements = [] } = await response.json();
  return elements
    .map((e) => ({ lat: e.lat ?? e.center?.lat, lng: e.lon ?? e.center?.lon, name: e.tags?.name || "Escuela sin nombre en OpenStreetMap" }))
    .filter((e) => e.lat && e.lng);
}
watch(
  () => [model.value.lat, model.value.lng],
  ([lat, lng]) => {
    clearTimeout(nearbyTimer);
    if (!lat || !lng || (nearbyFrom && meters(nearbyFrom, [lat, lng]) < 700)) return;
    nearbyTimer = setTimeout(async () => {
      const from = [lat, lng];
      nearbyFrom = from;
      // Las del catálogo salen luego luego; las de OpenStreetMap se agregan cuando llegan (su servicio a veces tarda)
      const drawn = osmSchools(from).catch(() => []);
      const catalog = await nearbyCatalog({ lat, lng }).catch(() => []);
      if (nearbyFrom !== from) return;
      const list = catalog.filter((s) => s.cct !== model.value.cct).map((s) => ({ lat: s.lat, lng: s.lng, name: s.name }));
      nearby.value = list;
      const extra = (await drawn).filter((school) => !list.some((s) => meters([s.lat, s.lng], [school.lat, school.lng]) < 40));
      // Las de OpenStreetMap que ya están en el catálogo (a menos de 40 m) no se repiten
      if (nearbyFrom === from && extra.length) nearby.value = [...list, ...extra];
    }, 600);
  },
  { immediate: true },
);

// La escuela tocó o arrastró el punto: desde aquí ya no se mueve solo
function setLocation({ lat, lng }) {
  model.value.lat = lat;
  model.value.lng = lng;
  pinBy.value = "tocado";
}
function pickNearby(school) {
  setLocation(school);
  pinBy.value = "cercana";
  pickedName.value = school.name;
}

// "Estoy en la escuela": el GPS del teléfono pone el punto
const locating = ref(false);
const gpsNote = ref("");
function useGps() {
  gpsNote.value = "";
  if (!navigator.geolocation) {
    gpsNote.value = "Este navegador no puede dar tu ubicación. Marca la escuela en el mapa";
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      locating.value = false;
      const point = [coords.latitude, coords.longitude];
      if (!inArea(point)) {
        gpsNote.value = `Tu ubicación queda fuera de ${muni.value.sep}. Revisa el municipio o usa este botón cuando estés en la escuela`;
        return;
      }
      setLocation({ lat: Number(point[0].toFixed(6)), lng: Number(point[1].toFixed(6)) });
      pinBy.value = "gps";
      if (coords.accuracy > 150) {
        gpsNote.value = `Tu teléfono dio una ubicación poco precisa (unos ${Math.round(coords.accuracy)} m). Revisa el punto`;
      }
    },
    (error) => {
      locating.value = false;
      gpsNote.value =
        error.code === error.PERMISSION_DENIED
          ? "No diste permiso para usar tu ubicación. Marca la escuela en el mapa"
          : "No se pudo obtener tu ubicación. Marca la escuela en el mapa";
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  );
}

// Al cambiar de municipio sin punto puesto, el mapa se va a ese municipio
watch(muniId, () => {
  if (!model.value.lat) near.value = [...muni.value.centro, 12];
});

const pinHint = computed(
  () =>
    ({
      inegi: "Ubicamos tu escuela con el directorio del INEGI. Si el punto no está en la entrada, arrástralo o toca el lugar correcto",
      sep: "Ubicación del catálogo de la SEP. Si el punto no está en la entrada, arrástralo o toca el lugar correcto",
      aprox: "Punto aproximado: hay una escuela con el mismo nombre ahí. Revisa que sea la tuya y mueve el punto si hace falta",
      "osm-escuela": "Encontramos tu escuela en OpenStreetMap. Revisa que el punto esté en la entrada",
      "osm-casa": "Punto aproximado por la dirección. Revisa que esté en la escuela y muévelo si hace falta",
      "osm-calle": "Pusimos el punto en tu calle. Arrástralo o toca la entrada de la escuela",
      "osm-cp": "Pusimos el punto en tu código postal. Arrástralo o toca la entrada de la escuela",
      "osm-colonia": "Pusimos el punto en tu colonia. Arrástralo o toca la entrada de la escuela",
      gps: "Pusimos el punto donde estás. Si no es la entrada, arrástralo",
      cercana: `Pusimos el punto en ${pickedName.value}. Si es otra escuela, toca la entrada de la tuya`,
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
    <FormField v-slot="{ id, describedby }" label="Municipio" hint="Buscamos la dirección solo en este municipio">
      <select :id="id" v-model="muniId" :aria-describedby="describedby">
        <option v-for="m in municipios" :key="m.id" :value="m.id">{{ m.sep }}</option>
      </select>
    </FormField>
    <FormField v-slot="{ id }" label="Colonia" :error="errors.colonia">
      <input :id="id" v-model.trim="model.colonia" maxlength="120" required />
    </FormField>
    <FormField v-slot="{ id }" label="Calle y número" :error="errors.address">
      <input :id="id" v-model.trim="model.address" maxlength="200" autocomplete="street-address" required />
    </FormField>
    <FormField v-slot="{ id, describedby }" label="Código postal" optional hint="Nos ayuda a poner el punto más cerca" :error="errors.postal_code">
      <input
        :id="id"
        v-model.trim="model.postal_code"
        :aria-describedby="describedby"
        inputmode="numeric"
        maxlength="5"
        pattern="[0-9]{5}"
        autocomplete="postal-code"
        @input="model.postal_code = String(model.postal_code ?? '').replace(/\D/g, '')"
      />
    </FormField>
    <div class="field">
      <span class="field-label">Ubicación en el mapa</span>
      <p class="field-hint">
        {{ model.lat ? pinHint : "Toca el mapa donde está la entrada de la escuela. Al escribir la colonia ponemos un punto cerca" }}
      </p>
      <div class="location-tools">
        <button type="button" class="button secondary small-button" :disabled="locating" @click="useGps">
          {{ locating ? "Buscando dónde estás…" : "Estoy en la escuela: usar mi ubicación" }}
        </button>
        <p v-if="gpsNote" class="field-hint" role="status">{{ gpsNote }}</p>
      </div>
      <LocationPicker :lat="model.lat" :lng="model.lng" :near="near" :nearby="nearby" @update="setLocation" @pick="pickNearby" />
      <p v-if="nearby.length" class="field-hint">Los puntos verdes son escuelas cercanas. Si una es la tuya, tócala</p>
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
