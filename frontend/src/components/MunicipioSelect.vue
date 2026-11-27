<script setup>
// Botón del encabezado con el municipio actual. Al tocarlo se elige otro de la lista
// o se detecta con la ubicación del navegador (se convierte en municipio aquí mismo, nada se manda).
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import Icon from "./Icon.vue";
import { municipios } from "../municipios";
import { zonaDe, OUTSIDE } from "../zonas";
import { useMunicipio } from "../composables/useMunicipio";

const { municipio, actual, fijar } = useMunicipio();
const open = ref(false);
const note = ref("");
const locating = ref(false);
const root = ref(null);
const list = ref(null);

async function toggle() {
  open.value = !open.value;
  note.value = "";
  if (open.value) {
    await nextTick();
    list.value?.querySelector("[aria-checked='true'], button")?.focus();
  }
}
function close() {
  open.value = false;
}
function choose(id) {
  fijar(id);
  close();
}
function detect() {
  note.value = "";
  if (!("geolocation" in navigator)) {
    note.value = "Este navegador no puede dar tu ubicación. Elige tu municipio de la lista";
    return;
  }
  locating.value = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      locating.value = false;
      const { municipio: name } = zonaDe(position.coords.latitude, position.coords.longitude);
      if (name === OUTSIDE) {
        note.value = "Tu ubicación queda fuera de Baja California. Elige un municipio de la lista";
        return;
      }
      fijar(name);
      close();
    },
    (error) => {
      locating.value = false;
      note.value =
        error?.code === 1
          ? "No diste permiso para usar tu ubicación. Elige tu municipio de la lista"
          : "No pudimos saber dónde estás. Elige tu municipio de la lista";
    },
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 3600000 },
  );
}
function onDocument(event) {
  if (open.value && root.value && !root.value.contains(event.target)) close();
}
function onKey(event) {
  if (open.value && event.key === "Escape") {
    close();
    root.value?.querySelector(".muni-chip")?.focus();
  }
}
onMounted(() => {
  document.addEventListener("pointerdown", onDocument);
  document.addEventListener("keydown", onKey);
});
onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocument);
  document.removeEventListener("keydown", onKey);
});
</script>

<template>
  <div ref="root" class="muni">
    <button
      class="muni-chip"
      type="button"
      :aria-expanded="open"
      aria-controls="lista-municipios"
      :aria-label="`Municipio: ${actual.nombre}. Cambiar municipio`"
      :title="`${actual.nombre}. Cambiar municipio`"
      @click="toggle"
    >
      <Icon name="pin" :size="20" /><span class="muni-chip-name">{{ actual.nombre }}</span>
    </button>
    <div v-if="open" id="lista-municipios" class="muni-panel">
      <p class="muni-panel-title">¿Dónde vives?</p>
      <ul ref="list" class="muni-list" role="radiogroup" aria-label="Municipio">
        <li v-for="m in municipios" :key="m.id">
          <button
            type="button"
            role="radio"
            :aria-checked="m.id === actual.id"
            :class="['muni-option', { on: m.id === actual.id }]"
            @click="choose(m.id)"
          >
            <Icon v-if="m.id === actual.id" name="check" :size="18" />{{ m.nombre }}
          </button>
        </li>
      </ul>
      <button type="button" class="button secondary muni-detect" :disabled="locating" @click="detect">
        <Icon name="pin" :size="18" /> {{ locating ? "Buscando dónde estás…" : "Detectar con mi ubicación" }}
      </button>
      <p v-if="note" class="muni-note" role="status">{{ note }}</p>
      <p v-else-if="!municipio" class="muni-note">Por ahora ves el sitio de Tijuana</p>
    </div>
  </div>
</template>
