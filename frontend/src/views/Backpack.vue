<script setup>
import { ref } from "vue";
import Icon from "../components/Icon.vue";
import Modal from "../components/Modal.vue";
import BackpackScene from "../components/BackpackScene.vue";
import { supplies, sources } from "../data";
import {
  packed,
  backpackPercent,
  togglePacked,
  storageAvailable,
} from "../composables/useProgress";
const resetOpen = ref(false);
const groups = [...new Set(supplies.map((x) => x.group))];
const print = () => window.print();
// Un color por artículo para que la lista se lea de un vistazo.
const tones = {
  agua: ["#1e6fd9", "#e6f0ff"],
  alimentos: ["#d9480f", "#fff0e6"],
  botiquin: ["#d62828", "#ffebee"],
  linterna: ["#b07a00", "#fff6d6"],
  radio: ["#6a3fb5", "#f2edff"],
  documentos: ["#0f7c86", "#e3f6f7"],
  dinero: ["#00723f", "#e6f4ec"],
  silbato: ["#c2410c", "#fff1e6"],
  abrigo: ["#3b5bdb", "#edf2ff"],
  higiene: ["#c2255c", "#ffeef4"],
  mascotas: ["#8a5a2b", "#f8efe6"],
  carga: ["#2b8a3e", "#ebfbee"],
};
const toneStyle = (id, i) => ({
  "--tone": tones[id]?.[0] ?? "#00723f",
  "--tone-bg": tones[id]?.[1] ?? "#e6f4ec",
  "--i": i,
});
</script>
<template>
  <div class="page">
    <div class="page-heading pack-hero">
      <div class="pack-hero-text">
        <h1>Mochila de emergencia</h1>
        <p>Prepara lo esencial con tiempo y adapta la lista a tu familia</p>
      </div>
      <div class="pack-scene"><BackpackScene /></div>
    </div>
    <div class="backpack-layout">
      <section class="supply-list">
        <div v-for="group in groups" :key="group" class="supply-group">
          <h2>{{ group }}</h2>
          <label
            v-for="item in supplies.filter((x) => x.group === group)"
            :key="item.id"
            class="supply-row"
            :class="{ packed: packed.includes(item.id) }"
            ><input
              type="checkbox"
              :checked="packed.includes(item.id)"
              @change="togglePacked(item.id)"
            /><span
              class="supply-icon"
              :style="toneStyle(item.id, supplies.indexOf(item))"
              ><Icon :name="item.icon" :size="26" /></span
            ><span
              ><strong>{{ item.name }}</strong
              ><small>{{ item.detail }}</small></span
            ><span v-if="packed.includes(item.id)" class="ready-label"
              >Listo</span
            ></label
          >
        </div>
      </section>
      <aside
        class="backpack-summary"
        :class="{ complete: packed.length === supplies.length }"
      >
        <span
          v-if="packed.length === supplies.length"
          class="confetti"
          aria-hidden="true"
          ><span v-for="n in 14" :key="n"></span
        ></span>
        <h2>
          {{
            packed.length === supplies.length ? "Lista completa" : "Tu avance"
          }}
        </h2>
        <div class="backpack-number">
          {{ packed.length }}<span> / {{ supplies.length }}</span>
        </div>
        <p>artículos preparados</p>
        <div
          class="progress-track"
          role="progressbar"
          :aria-valuenow="backpackPercent"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Mochila preparada"
        >
          <span :style="{ width: backpackPercent + '%' }"></span>
        </div>
        <p class="micro">
          {{
            storageAvailable
              ? "Guardado automáticamente en este navegador"
              : "Avance disponible solo durante esta sesión"
          }}
        </p>
        <button class="button primary full" @click="print">
          <Icon name="print" :size="18" /> Imprimir mi lista</button
        ><button
          class="text-link reset-button"
          :disabled="!packed.length"
          @click="resetOpen = true"
        >
          <Icon name="reset" :size="15" /> Reiniciar lista
        </button>
      </aside>
    </div>
    <div class="note section-space">
      <Icon name="info" />
      <p>
        Ubica la mochila en un lugar accesible, comprueba su peso y revisa
        periódicamente las caducidades ·
        <a :href="sources.backpack" target="_blank" rel="noopener"
          >Guía de CENAPRED <Icon name="external" :size="13"
        /></a>
      </p>
    </div>
    <Modal
      :open="resetOpen"
      title="¿Empezar la lista de nuevo?"
      @close="resetOpen = false"
      ><p class="modal-intro">
        Se desmarcarán los artículos de tu mochila en este navegador. Tu plan
        familiar se conservará.
      </p>
      <div class="button-row">
        <button class="button secondary" @click="resetOpen = false">
          Conservar mi avance</button
        ><button
          class="button primary"
          @click="
            packed = [];
            resetOpen = false;
          "
        >
          Reiniciar lista
        </button>
      </div></Modal
    >
  </div>
</template>
