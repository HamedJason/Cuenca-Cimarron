<script setup>
import Icon from "../components/Icon.vue";
import StepCards from "../components/StepCards.vue";
import { completedSteps, planTasks } from "../composables/useProgress";
import { sources, steps } from "../data";
const print = () => window.print();
</script>
<template>
  <div class="page">
    <div class="page-heading">
      <h1>Plan familiar</h1>
      <p>
        Cuatro pasos para decidir en familia cómo actuar ante una emergencia.
        Abre cada paso y marca las acciones que ya hicieron.
      </p>
    </div>
    <div class="plan-summary">
      <div>
        <strong>{{ completedSteps }} de 4 pasos completados</strong>
        <p>
          {{ planTasks.length }} de 12 acciones marcadas. Tu avance se guarda en
          este navegador.
        </p>
      </div>
      <button class="button secondary" @click="print">
        <Icon name="print" :size="18" /> Imprimir guía
      </button>
    </div>
    <StepCards />
    <div class="two-column section-space">
      <article class="paper-panel">
        <h2>Adapten el plan a su casa</h2>
        <p>
          Consideren sus espacios, horarios, movilidad, medicamentos, apoyos y
          el cuidado de las mascotas.
        </p>
        <RouterLink to="/mochila" class="text-link"
          >Preparar mi mochila</RouterLink
        >
      </article>
      <article class="paper-panel warm">
        <h2>Dibujen un croquis</h2>
        <p>
          En una hoja dibuja habitaciones, salidas, riesgos y el punto de
          encuentro. Colócala donde todos puedan verla.
        </p>
        <a :href="sources.plan" target="_blank" rel="noopener" class="text-link"
          >Consultar guía de CENAPRED <Icon name="external" :size="16"
        /></a>
      </article>
    </div>
    <section class="print-only">
      <article v-for="step in steps" :key="step.id">
        <h2>{{ step.number }}. {{ step.title }}</h2>
        <p v-for="(task, i) in step.tasks" :key="i">
          {{ planTasks.includes(`${step.id}-${i}`) ? "☑" : "☐" }} {{ task }}
        </p>
      </article>
    </section>
  </div>
</template>
