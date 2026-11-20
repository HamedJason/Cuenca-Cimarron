<script setup>
import AnimClip from "../components/AnimClip.vue";
import Icon from "../components/Icon.vue";
import StepCards from "../components/StepCards.vue";
import { completedSteps, planTasks, taskId } from "../composables/useProgress";
import { sources, steps } from "../data";
const print = () => window.print();
</script>
<template>
  <div class="page">
    <div class="page-heading">
      <h1>Plan familiar</h1>
      <p>
        Cuatro pasos para saber qué hacer en familia si hay una emergencia.
        Abre cada paso y marca lo que ya hicieron
      </p>
    </div>
    <div class="plan-summary">
      <div class="plan-summary-text">
        <strong>{{ completedSteps }} de 4 pasos completados</strong>
        <p>
          {{ planTasks.length }} de 12 acciones marcadas · tu avance se guarda
          en este navegador
        </p>
        <button class="button secondary" @click="print">
          <Icon name="print" :size="18" /> Imprimir guía
        </button>
      </div>
      <AnimClip
        name="plan-familiar"
        class="family"
        label="La familia sale de la casa y se junta en el punto de reunión"
      />
    </div>
    <StepCards />
    <div class="two-column section-space">
      <article class="paper-panel">
        <h2>Adapten el plan a su casa</h2>
        <p>
          Piensen en cómo es su casa, a qué hora está cada quien, quién
          necesita ayuda para moverse, sus medicinas y sus mascotas
        </p>
        <RouterLink to="/mochila" class="text-link"
          >Preparar mi mochila</RouterLink
        >
      </article>
      <article class="paper-panel warm">
        <h2>Dibujen un mapa de su casa</h2>
        <p>
          En una hoja dibuja los cuartos, las salidas, los peligros y el lugar
          para verse. Pégala donde todos la vean
        </p>
        <a :href="sources.plan" target="_blank" rel="noopener" class="text-link"
          >Ver la guía de CENAPRED <Icon name="external" :size="16"
        /></a>
      </article>
    </div>
    <section class="print-only">
      <article v-for="step in steps" :key="step.id">
        <h2>{{ step.number }}. {{ step.title }}</h2>
        <p v-for="(task, i) in step.tasks" :key="i">
          <span class="print-box" aria-hidden="true"
            ><Icon v-if="planTasks.includes(taskId(step, i))" name="check" :size="14"
          /></span>
          {{ task }}
        </p>
      </article>
    </section>
  </div>
</template>
