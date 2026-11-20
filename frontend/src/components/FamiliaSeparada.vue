<script setup>
import Icon from "./Icon.vue";
import AnimClip from "./AnimClip.vue";
import { familySeparation } from "../data";

const uniforms = [
  { icon: "medical", label: "Cruz Roja", tone: "redcross" },
  { icon: "shield", label: "Policía", tone: "police" },
  { icon: "flame", label: "Bomberos", tone: "fire" },
];
</script>

<template>
  <section id="familia-separada" aria-labelledby="titulo-separada" class="section-space fam-sep">
    <div class="gm-section-head">
      <h2 id="titulo-separada" class="section-title">Si la familia se separa</h2>
    </div>
    <div class="fam-sep-layout">
      <AnimClip
        name="familia-separada"
        class="fam-sep-clip"
        label="Una niña no tiene señal en su celular. Espera en el punto de encuentro con una brigadista de la Cruz Roja y su mamá llega por el camino"
      />
      <ul class="fam-sep-cards">
        <li v-for="(card, i) in familySeparation" :key="card.text" :class="['fam-sep-card', `fam-tone-${i}`]">
          <span class="fam-sep-icon" aria-hidden="true"><Icon :name="card.icon" :size="40" /></span>
          <p>{{ card.text }}</p>
          <ul v-if="card.uniforms" class="fam-sep-uniforms">
            <li v-for="item in uniforms" :key="item.label" :class="`agency-${item.tone}`">
              <Icon :name="item.icon" :size="18" /> {{ item.label }}
            </li>
          </ul>
          <a v-if="card.url" class="fam-sep-link" :href="card.url" target="_blank" rel="noopener"
            ><Icon name="external" :size="16" /> {{ card.link }}</a
          >
        </li>
      </ul>
    </div>
  </section>
</template>
