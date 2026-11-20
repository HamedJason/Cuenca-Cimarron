<script setup>
import { COINS_PER_POINT } from "../avatar/rewards.js";
// Etiqueta de Cimacoins de una actividad. Solo la ve un alumno con sesión: los visitantes no ven nada.
// Sin activity-key es la etiqueta neutra "Para consultar" de las secciones que no dan Cimacoins.
import { computed } from "vue";
import Icon from "./Icon.vue";
import { student } from "../composables/useStudent";
import { activityByKey, isDone } from "../composables/useActivities";
import { isAssigned } from "../composables/useTasks";

const props = defineProps({ activityKey: String });
const activity = computed(() => (props.activityKey ? activityByKey.value[props.activityKey] : null));
</script>
<template>
  <span v-if="student && !activityKey" class="points-tag is-consult">Para consultar</span>
  <span v-else-if="student && activity" class="points-tags">
    <span v-if="isDone(activity.key)" class="points-tag is-done"><Icon name="check" :size="16" />Completada</span>
    <span v-else class="points-tag is-points"><Icon name="coin" :size="16" />+{{ activity.points * COINS_PER_POINT }} Cimacoins</span>
    <span v-if="isAssigned(activity.key)" class="points-tag is-task"><Icon name="task" :size="16" />Tarea</span>
  </span>
</template>
