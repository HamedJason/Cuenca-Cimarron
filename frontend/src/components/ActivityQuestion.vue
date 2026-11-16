<script setup>
// Pregunta al final de una lectura, un consejo o un juego externo. Si contesta bien, suma puntos.
// La respuesta correcta solo la conoce el servidor.
import { ref, computed, useId } from "vue";
import Icon from "./Icon.vue";
import { student } from "../composables/useStudent";
import { activityByKey, isDone, answerActivity } from "../composables/useActivities";

const props = defineProps({ activityKey: { type: String, required: true }, compact: Boolean });
const emit = defineEmits(["done"]);
const activity = computed(() => activityByKey.value[props.activityKey]);
const choice = ref(null);
const state = ref("idle");
const message = ref("");
const earned = ref(0);
const name = useId();

async function send() {
  if (choice.value === null) return;
  state.value = "sending";
  const result = await answerActivity(props.activityKey, choice.value);
  if (result.ok) {
    state.value = "done";
    earned.value = result.points;
    emit("done", result);
  } else {
    state.value = "error";
    message.value = result.message;
  }
}
</script>
<template>
  <section v-if="student && activity?.question" :class="['activity-question', { compact }]" :aria-label="`Pregunta para sumar puntos: ${activity.title}`">
    <p v-if="isDone(activityKey) && state !== 'done'" class="aq-done"><Icon name="check" :size="20" />Ya contestaste esta pregunta</p>
    <template v-else>
      <p class="aq-kicker"><Icon name="star" :size="18" />Pregunta para sumar {{ activity.points }} puntos</p>
      <fieldset v-if="state !== 'done'" class="aq-fieldset">
        <legend class="aq-text">{{ activity.question.text }}</legend>
        <label v-for="(option, i) in activity.question.options" :key="i" :class="['aq-option', { selected: choice === i }]">
          <input v-model="choice" type="radio" :name="name" :value="i" />
          <span>{{ option }}</span>
        </label>
      </fieldset>
      <p v-if="state === 'error'" class="form-alert is-error" role="alert"><Icon name="info" :size="20" />{{ message }}</p>
      <p v-if="state === 'done'" class="form-alert is-ok" role="status">
        <Icon name="star" :size="20" />{{ earned ? `¡Correcto! Sumaste ${earned} puntos` : "¡Correcto!" }}
      </p>
      <button v-else class="button primary" type="button" :disabled="choice === null || state === 'sending'" @click="send">Contestar</button>
    </template>
  </section>
</template>
