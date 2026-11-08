<script setup>
import { ref } from "vue";
import Icon from "../components/Icon.vue";
import Modal from "../components/Modal.vue";
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
</script>
<template>
  <div class="page">
    <div class="page-heading">
      <h1>Mochila de emergencia</h1>
      <p>
        Prepara lo esencial con tiempo y adapta esta lista a las necesidades de
        tu familia.
      </p>
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
            /><span class="supply-icon"
              ><Icon :name="item.icon" :size="27" /></span
            ><span
              ><strong>{{ item.name }}</strong
              ><small>{{ item.detail }}</small></span
            ><span v-if="packed.includes(item.id)" class="ready-label"
              >Listo</span
            ></label
          >
        </div>
      </section>
      <aside class="backpack-summary">
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
              ? "Guardado automáticamente en este navegador."
              : "Avance disponible solo durante esta sesión."
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
        <div class="note">
          <p>
            ¿No tienes mascotas? Puedes dejar ese artículo pendiente. La lista
            es una guía, no una calificación.
          </p>
        </div>
      </aside>
    </div>
    <div class="note section-space">
      <Icon name="info" />
      <p>
        Ubica la mochila en un lugar accesible, comprueba su peso y revisa
        periódicamente las caducidades.
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
