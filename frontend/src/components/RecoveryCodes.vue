<script setup>
// Códigos de recuperación. Se muestran una sola vez y hay que guardarlos antes de seguir:
// descargarlos, imprimirlos o copiarlos, y marcar que ya quedaron guardados.
import { ref, computed } from "vue";
import Icon from "./Icon.vue";

const props = defineProps({
  codes: { type: Array, required: true },
  email: { type: String, default: "" },
  // Cuando la administración los genera para una escuela, se le entregan a la escuela.
  forOther: { type: Boolean, default: false },
  continueLabel: { type: String, default: "Ya los guardé, continuar" },
});
const emit = defineEmits(["done"]);
const saved = ref(false);
const acted = ref(false);
const copied = ref(false);
const canContinue = computed(() => saved.value && acted.value);

const text = computed(() =>
  [
    "Cuenca Cimarrona · Códigos de recuperación",
    props.email ? `Cuenta: ${props.email}` : "",
    `Generados el ${new Date().toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short" })}`,
    "",
    "Si olvidas tu contraseña, entra a Escuelas, toca Olvidé mi contraseña y usa uno de estos códigos.",
    "Cada código sirve una sola vez. Guárdalos en un lugar seguro.",
    "",
    ...props.codes,
  ]
    .filter((line, i) => line !== "" || i > 2)
    .join("\n"),
);

function download() {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text.value], { type: "text/plain;charset=utf-8" }));
  link.download = "codigos-cuenca-cimarrona.txt";
  link.click();
  URL.revokeObjectURL(link.href);
  acted.value = true;
}
async function copy() {
  try {
    await navigator.clipboard.writeText(text.value);
    copied.value = true;
    acted.value = true;
  } catch {
    window.prompt("Copia los códigos", props.codes.join("  "));
    acted.value = true;
  }
}
function print() {
  acted.value = true;
  window.print();
}
</script>
<template>
  <section class="recovery" aria-labelledby="titulo-codigos">
    <div class="recovery-alert" role="alert">
      <Icon name="info" :size="30" />
      <div>
        <h2 id="titulo-codigos">{{ forOther ? "Entrega estos códigos a la escuela" : "Guarda tus códigos de recuperación" }}</h2>
        <p v-if="!forOther">
          El sitio no manda correos. <b>Si olvidas tu contraseña, solo con uno de estos códigos puedes poner otra.</b>
          Cada código sirve una vez. No se vuelven a mostrar.
        </p>
        <p v-else>Los códigos anteriores de la escuela ya no sirven. Mándaselos por un medio seguro. No se vuelven a mostrar.</p>
      </div>
    </div>

    <ol class="recovery-codes">
      <li v-for="code in codes" :key="code"><code>{{ code }}</code></li>
    </ol>

    <div class="form-actions no-print">
      <button class="button primary" type="button" @click="download"><Icon name="download" :size="20" />Descargar</button>
      <button class="button secondary" type="button" @click="print"><Icon name="print" :size="20" />Imprimir</button>
      <button class="button secondary" type="button" @click="copy"><Icon :name="copied ? 'check' : 'copy'" :size="20" />{{ copied ? "Copiados" : "Copiar" }}</button>
    </div>

    <label class="consent-row recovery-check no-print">
      <input v-model="saved" type="checkbox" />
      <span>{{ forOther ? "Ya se los entregué o los guardé para entregarlos" : "Ya guardé mis códigos en un lugar seguro. Entiendo que sin ellos no podré recuperar mi contraseña por mi cuenta" }}</span>
    </label>
    <p v-if="saved && !acted" class="small muted-text no-print">Primero descárgalos, imprímelos o cópialos</p>
    <button class="button primary no-print" type="button" :disabled="!canContinue" @click="emit('done')">{{ continueLabel }}</button>
  </section>
</template>
