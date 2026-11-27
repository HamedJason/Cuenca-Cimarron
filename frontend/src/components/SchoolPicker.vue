<script setup>
// Autocompletado de escuelas del catálogo de la SEP: conforme se escribe aparecen sugerencias.
// Con flechas se recorre la lista, Enter elige y Esc la cierra. Al elegir se llenan los datos.
import { ref, computed, watch, useId } from "vue";
import Icon from "./Icon.vue";
import { searchCatalog } from "../composables/useCatalog";
import { labelOf, levels, shifts } from "../composables/useAccount";
import { municipios } from "../municipios";

const emit = defineEmits(["pick", "manual"]);
const id = useId();
const q = ref("");
const results = ref([]);
const state = ref("idle");
const open = ref(false);
const active = ref(-1);
const cache = new Map();
// Municipio para acotar la búsqueda (nombre de la SEP). Vacío busca en todos.
const municipality = ref("");
let timer;
let controller;

async function search(text) {
  const key = `${municipality.value}|${text.toLowerCase()}`;
  if (cache.has(key)) {
    results.value = cache.get(key);
    state.value = "ready";
    return;
  }
  controller?.abort();
  controller = new AbortController();
  state.value = "loading";
  try {
    const found = await searchCatalog(text, controller.signal, municipality.value);
    cache.set(key, found);
    if (text === q.value.trim()) {
      results.value = found;
      state.value = "ready";
    }
  } catch (error) {
    if (error?.name !== "AbortError" && text === q.value.trim()) state.value = "error";
  }
}
watch([q, municipality], ([value]) => {
  clearTimeout(timer);
  const text = value.trim();
  active.value = -1;
  open.value = text.length >= 2;
  if (text.length < 2) {
    results.value = [];
    state.value = "idle";
    return;
  }
  // Una pausa muy corta para no preguntar en cada letra cuando se escribe rápido.
  timer = setTimeout(() => search(text), cache.has(`${municipality.value}|${text.toLowerCase()}`) ? 0 : 120);
});

function choose(school) {
  if (!school || school.registered) return;
  open.value = false;
  emit("pick", school);
}
function onBlur() {
  setTimeout(() => (open.value = false), 150);
}
function onKey(event) {
  if (!open.value || !results.value.length) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    active.value = (active.value + 1) % results.value.length;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    active.value = active.value <= 0 ? results.value.length - 1 : active.value - 1;
  } else if (event.key === "Enter") {
    event.preventDefault();
    choose(results.value[active.value >= 0 ? active.value : 0]);
  } else if (event.key === "Escape") {
    open.value = false;
  }
}
watch(active, (index) => {
  if (index >= 0) document.getElementById(`${id}-op-${index}`)?.scrollIntoView?.({ block: "nearest" });
});

// Resalta las palabras escritas dentro del nombre, sin importar acentos ni mayúsculas.
const fold = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const words = computed(() => fold(q.value).split(/\s+/).filter((w) => w.length >= 2));
function parts(name) {
  const base = fold(name.normalize("NFC"));
  if (base.length !== name.normalize("NFC").length) return [{ text: name, hit: false }];
  const marks = new Array(name.length).fill(false);
  for (const word of words.value) {
    const at = base.indexOf(word);
    if (at >= 0) marks.fill(true, at, at + word.length);
  }
  const out = [];
  const text = name.normalize("NFC");
  for (let i = 0; i < text.length; i++) {
    const last = out[out.length - 1];
    if (last && last.hit === marks[i]) last.text += text[i];
    else out.push({ text: text[i], hit: marks[i] });
  }
  return out;
}
const detail = (school) =>
  [school.level ? labelOf(levels, school.level) : school.level_detail, school.shift && labelOf(shifts, school.shift), school.colonia || school.municipality, `CCT ${school.cct}`]
    .filter(Boolean)
    .join(" · ");
const status = computed(() => {
  if (state.value === "error") return "No se pudo buscar. Puedes llenar los datos a mano";
  if (state.value === "ready" && !results.value.length) return "No aparece ninguna escuela con eso. Prueba con otra palabra o llénala a mano";
  if (state.value === "ready") return `${results.value.length} ${results.value.length === 1 ? "sugerencia" : "sugerencias"}`;
  return "";
});
</script>
<template>
  <section class="form-group school-picker">
    <h2 class="form-title">Busca tu escuela</h2>
    <div class="field">
      <label :for="`${id}-municipio`">Municipio</label>
      <select :id="`${id}-municipio`" v-model="municipality">
        <option value="">Todos los municipios</option>
        <option v-for="m in municipios" :key="m.id" :value="m.sep">{{ m.sep }}</option>
      </select>
    </div>
    <div class="field">
      <label :for="`${id}-input`">Nombre, CCT o colonia</label>
      <div class="combo">
        <Icon name="search" :size="20" class="combo-icon" />
        <input
          :id="`${id}-input`"
          v-model="q"
          type="text"
          role="combobox"
          autocomplete="off"
          spellcheck="false"
          maxlength="80"
          aria-autocomplete="list"
          :aria-expanded="open && results.length > 0"
          :aria-controls="`${id}-list`"
          :aria-activedescendant="active >= 0 ? `${id}-op-${active}` : undefined"
          :aria-describedby="`${id}-hint`"
          placeholder="Empieza a escribir, por ejemplo Benito Juárez"
          @keydown="onKey"
          @focus="open = q.trim().length >= 2"
          @blur="onBlur"
        />
        <span v-if="state === 'loading'" class="combo-spinner" aria-hidden="true"></span>
        <ul v-show="open && results.length" :id="`${id}-list`" class="combo-list" role="listbox" aria-label="Escuelas sugeridas">
          <li
            v-for="(school, i) in results"
            :id="`${id}-op-${i}`"
            :key="school.cct"
            role="option"
            :aria-selected="i === active"
            :aria-disabled="school.registered"
            :class="['combo-option', { active: i === active, taken: school.registered }]"
            @mousedown.prevent="choose(school)"
            @mousemove="active = i"
          >
            <b><template v-for="(part, p) in parts(school.name)" :key="p"><mark v-if="part.hit">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></b>
            <span>{{ detail(school) }}</span>
            <small v-if="school.registered">Ya está registrada</small>
          </li>
        </ul>
      </div>
      <p :id="`${id}-hint`" class="field-hint">Escuelas de Baja California del catálogo de la SEP. Usa las flechas y Enter para elegir</p>
      <p class="sr-only" role="status" aria-live="polite">{{ status }}</p>
      <p v-if="state === 'error' || (state === 'ready' && !results.length)" class="small muted-text">{{ status }}</p>
    </div>
    <button class="text-link" type="button" @click="emit('manual')"><Icon name="info" :size="18" />No encuentro mi escuela, la escribo a mano</button>
  </section>
</template>
