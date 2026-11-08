<script setup>
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
        Cuatro pasos para decidir en familia cómo actuar ante una emergencia;
        abre cada paso y marca lo que ya hicieron
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
      <svg
        class="family"
        viewBox="0 0 320 160"
        role="img"
        aria-label="Ilustración: una familia de cuatro personas y su perro"
      >
        <ellipse class="fam-ground" cx="160" cy="150" rx="152" ry="9" />
        <g class="fam-adult">
          <rect x="48" y="112" width="10" height="36" rx="4" fill="#003d24" />
          <rect x="62" y="112" width="10" height="36" rx="4" fill="#003d24" />
          <rect x="44" y="56" width="32" height="62" rx="14" fill="#0b4fa8" />
          <circle cx="60" cy="40" r="15" fill="#8d5524" />
          <path d="M45 38a15 15 0 0 1 30 0c-6-6-24-6-30 0Z" fill="#2b1d14" />
        </g>
        <g class="fam-adult">
          <rect x="98" y="110" width="10" height="38" rx="4" fill="#003d24" />
          <rect x="112" y="110" width="10" height="38" rx="4" fill="#003d24" />
          <rect x="94" y="52" width="32" height="64" rx="14" fill="#d62828" />
          <rect
            class="fam-wave"
            x="124"
            y="34"
            width="9"
            height="32"
            rx="4.5"
            fill="#d62828"
          />
          <circle cx="110" cy="36" r="14" fill="#e0ac69" />
          <path d="M95 36c0-12 30-16 30 2-4-8-22-10-30-2Z" fill="#4a2c17" />
        </g>
        <g class="fam-kid kid-a">
          <rect x="152" y="122" width="8" height="26" rx="4" fill="#003d24" />
          <rect x="163" y="122" width="8" height="26" rx="4" fill="#003d24" />
          <rect x="148" y="86" width="27" height="40" rx="11" fill="#dd971a" />
          <circle cx="161" cy="74" r="12" fill="#c68642" />
        </g>
        <g class="fam-kid kid-b">
          <rect x="193" y="124" width="7" height="24" rx="3.5" fill="#003d24" />
          <rect x="203" y="124" width="7" height="24" rx="3.5" fill="#003d24" />
          <rect x="189" y="92" width="25" height="36" rx="10" fill="#00723f" />
          <circle cx="201" cy="80" r="11" fill="#f1c27d" />
          <path d="M190 78c2-10 20-10 22 0-6-4-16-4-22 0Z" fill="#2b1d14" />
        </g>
        <g class="fam-dog">
          <path
            class="fam-tail"
            d="M232 120c-8-4-10-14-6-20"
            stroke="#7a4a24"
            stroke-width="5"
            stroke-linecap="round"
            fill="none"
          />
          <rect x="238" y="128" width="6" height="20" rx="3" fill="#7a4a24" />
          <rect x="266" y="128" width="6" height="20" rx="3" fill="#7a4a24" />
          <ellipse cx="254" cy="124" rx="26" ry="13" fill="#a0663a" />
          <circle cx="282" cy="108" r="12" fill="#a0663a" />
          <ellipse cx="276" cy="104" rx="5" ry="9" fill="#7a4a24" />
          <circle cx="287" cy="106" r="2" fill="#1c2621" />
          <circle cx="294" cy="110" r="2.5" fill="#1c2621" />
        </g>
      </svg>
    </div>
    <StepCards />
    <div class="two-column section-space">
      <article class="paper-panel">
        <h2>Adapten el plan a su casa</h2>
        <p>
          Consideren sus espacios, horarios, movilidad, medicamentos, apoyos y
          el cuidado de las mascotas
        </p>
        <RouterLink to="/mochila" class="text-link"
          >Preparar mi mochila</RouterLink
        >
      </article>
      <article class="paper-panel warm">
        <h2>Dibujen un croquis</h2>
        <p>
          En una hoja dibuja habitaciones, salidas, riesgos y el punto de
          encuentro; colócala donde todos puedan verla
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
          {{ planTasks.includes(taskId(step, i)) ? "☑" : "☐" }} {{ task }}
        </p>
      </article>
    </section>
  </div>
</template>
