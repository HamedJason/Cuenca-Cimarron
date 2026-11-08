<script setup>
import { ref } from "vue";
import { steps } from "../data";
import { planTasks, toggleTask } from "../composables/useProgress";
import Icon from "./Icon.vue";
import Modal from "./Modal.vue";
const selected = ref(null);
const isDone = (s) =>
  s.tasks.every((_, i) => planTasks.value.includes(`${s.id}-${i}`));
</script>
<template>
  <div class="steps-grid">
    <button
      v-for="step in steps"
      :key="step.id"
      class="step-card"
      @click="selected = step"
    >
      <div class="step-top">
        <span class="step-number">{{ step.number }}</span
        ><span class="step-icon"><Icon :name="step.icon" :size="32" /></span>
      </div>
      <h3>{{ step.title }}</h3>
      <p>{{ step.description }}</p>
      <span class="step-action"
        ><span>{{
          isDone(step) ? "Paso completado" : `Ver ${step.tasks.length} acciones`
        }}</span
        ><Icon v-if="isDone(step)" name="check" :size="19"
      /></span>
    </button>
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
            :checked="planTasks.includes(`${selected.id}-${i}`)"
            @change="toggleTask(`${selected.id}-${i}`)"
          /><span>{{ task }}</span></label
        >
      </div>
      <div class="note">
        <p>{{ selected.tip }}</p>
      </div>
      <button class="button primary full" @click="selected = null">
        Listo
      </button>
      <p class="micro">Tu avance se guarda en este navegador.</p></template
    ></Modal
  >
</template>
