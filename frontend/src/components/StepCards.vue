<script setup>
import { ref } from "vue";
import { steps } from "../data";
import {
  isStepDone as isDone,
  planTasks,
  taskId,
  toggleTask,
} from "../composables/useProgress";
import Icon from "./Icon.vue";
import Modal from "./Modal.vue";
const selected = ref(null);
const actionLabel = (s) =>
  isDone(s) ? "Paso completado" : `Ver ${s.tasks.length} acciones`;
</script>
<template>
  <div class="steps-grid">
    <article
      v-for="step in steps"
      :key="step.id"
      class="step-card"
      :class="{ done: isDone(step) }"
    >
      <div class="step-top">
        <span class="step-number">{{ step.number }}</span
        ><span class="step-icon"><Icon :name="step.icon" :size="32" /></span>
      </div>
      <h3>{{ step.title }}</h3>
      <p>{{ step.description }}</p>
      <button
        class="step-action"
        :aria-label="`${step.title}. ${actionLabel(step)}`"
        @click="selected = step"
      >
        <span>{{ actionLabel(step) }}</span
        ><Icon v-if="isDone(step)" name="check" :size="19" />
      </button>
    </article>
  </div>
  <Modal
    :open="!!selected"
    :title="selected ? `Paso ${selected.number}. ${selected.title}` : ''"
    @close="selected = null"
    ><template v-if="selected"
      ><p class="modal-intro">{{ selected.description }}</p>
      <div class="task-list">
        <label v-for="(task, i) in selected.tasks" :key="i" class="task-row"
          ><input
            type="checkbox"
            :checked="planTasks.includes(taskId(selected, i))"
            @change="toggleTask(taskId(selected, i))"
          /><span>{{ task }}</span></label
        >
      </div>
      <div class="note">
        <p>{{ selected.tip }}</p>
      </div>
      <button class="button primary full" @click="selected = null">
        Listo
      </button>
      <p class="micro">Tu avance se guarda en este navegador</p></template
    ></Modal
  >
</template>
