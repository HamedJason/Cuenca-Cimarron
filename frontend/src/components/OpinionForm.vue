<script setup>
// Formulario de Comunidad Cimarrona: de 1 a 5 cimarrones (obligatorio) y comentario opcional.
// Se usa en la página y en la ventana que sale al terminar una actividad.
import { ref, computed, useId } from "vue";
import Icon from "./Icon.vue";
import CimarronHead from "./CimarronHead.vue";
import { sendOpinion, MAX_COMMENT } from "../composables/useOpinion";

const props = defineProps({
  origin: { type: String, default: "comunidad" },
  // En la ventana obligatoria: si no hay internet se guarda y deja seguir
  required: Boolean,
  submitLabel: { type: String, default: "Mandar mi opinión" },
});
const emit = defineEmits(["sent"]);
const labels = ["No me gustó", "Le falta", "Está bien", "Me gustó", "¡Me encantó!"];
const rating = ref(0);
const hover = ref(0);
const comment = ref("");
const sitio = ref("");
const state = ref("idle");
const message = ref("");
const starsError = ref("");
const id = useId();
const shown = computed(() => hover.value || rating.value);
const left = computed(() => MAX_COMMENT - comment.value.length);

async function submit() {
  if (!rating.value) {
    starsError.value = "Toca los cimarrones para calificar";
    return;
  }
  starsError.value = "";
  state.value = "sending";
  const result = await sendOpinion(
    { rating: rating.value, comment: comment.value, sitio: sitio.value, origin: props.origin },
    { offline: props.required },
  );
  if (result.ok) {
    state.value = "idle";
    emit("sent", result);
    rating.value = 0;
    comment.value = "";
    return;
  }
  // En la ventana obligatoria, si el servidor dice que ya opinó hace poco, se deja seguir.
  if (props.required && result.status === 429) {
    state.value = "idle";
    emit("sent", { ok: true, limited: true });
    return;
  }
  state.value = "error";
  message.value = result.errors?.comment || result.errors?.rating || result.message;
}
</script>
<template>
  <form class="opinion-form" novalidate @submit.prevent="submit">
    <fieldset class="opinion-stars-field">
      <legend class="opinion-legend">¿Cuántos cimarrones le das a Cuenca Cimarrona?</legend>
      <div class="opinion-stars" @mouseleave="hover = 0">
        <label
          v-for="n in 5"
          :key="n"
          :class="['opinion-star', { on: n <= shown }]"
          @mouseenter="hover = n"
        >
          <input v-model="rating" type="radio" :name="`${id}-cimarrones`" :value="n" class="sr-only" @change="starsError = ''" />
          <CimarronHead :fill="n <= shown ? 1 : 0" :size="44" />
          <span class="sr-only">{{ n }} de 5: {{ labels[n - 1] }}</span>
        </label>
      </div>
      <p class="opinion-star-label" aria-hidden="true">{{ shown ? labels[shown - 1] : "Toca un cimarrón" }}</p>
      <p v-if="starsError" class="field-error" role="alert">{{ starsError }}</p>
    </fieldset>

    <div class="field">
      <label :for="`${id}-comentario`">Platícanos qué te gustó o qué cambiarías<span class="field-optional"> (opcional)</span></label>
      <textarea
        :id="`${id}-comentario`"
        v-model="comment"
        rows="3"
        :maxlength="MAX_COMMENT"
        :aria-describedby="`${id}-quedan`"
      ></textarea>
      <p :id="`${id}-quedan`" class="field-hint">No pongas tu nombre. Te quedan {{ left }} letras</p>
    </div>

    <!-- Campo trampa para robots: la gente no lo ve -->
    <div class="opinion-trap" aria-hidden="true">
      <label :for="`${id}-sitio`">No llenes este campo</label>
      <input :id="`${id}-sitio`" v-model="sitio" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <p v-if="state === 'error'" class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ message }}</p>
    <button class="button primary opinion-submit" type="submit" :disabled="state === 'sending'">
      <CimarronHead :fill="1" :size="26" />{{ state === "sending" ? "Mandando…" : submitLabel }}
    </button>
    <p class="small muted-text opinion-anon">Es anónimo: no guardamos tu nombre, tu escuela ni tu IP</p>
  </form>
</template>
