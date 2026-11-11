<script setup>
// Pantalla de bienvenida al estilo de las entradas de Netflix o Disney: una animación corta
// (5 s en total) con el sello, el nombre y las instituciones que colaboran, y se va sola.
// Sale una vez por visita (sessionStorage) y siempre deja a la mano el 911.
import { ref, onMounted, onBeforeUnmount } from "vue";
import Icon from "./Icon.vue";

const KEY = "cuenca.splash";
// Tiempo en pantalla antes de desvanecerse (la salida dura 0.8 s más)
const DURATION = 4200;

const partners = [
  { name: "Universidad Autónoma de Baja California", src: "/assets/images/aliados/uabc.webp", w: 263, h: 360 },
  { name: "Facultad de Ciencias Químicas e Ingeniería", src: "/assets/images/aliados/fcqi.webp", w: 166, h: 360 },
  { name: "Ayuntamiento de Tijuana", src: "/assets/images/aliados/ayuntamiento-tijuana.webp", w: 360, h: 143 },
  { name: "Protección Civil Tijuana", src: "/assets/images/aliados/proteccion-civil-tijuana.webp", w: 352, h: 360 },
  { name: "Bomberos Tijuana", src: "/assets/images/aliados/bomberos-tijuana.webp", w: 360, h: 360 },
  { name: "Cruz Roja Mexicana, Delegación Tijuana", src: "/assets/images/aliados/cruz-roja-tijuana.webp", w: 238, h: 360 },
];

function alreadySeen() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

const open = ref(!alreadySeen());
let timer;

function close() {
  if (!open.value) return;
  open.value = false;
  document.documentElement.classList.remove("splash-open");
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* sin almacenamiento: vuelve a salir en la siguiente carga */
  }
}

onMounted(() => {
  if (!open.value) return;
  document.documentElement.classList.add("splash-open");
  timer = setTimeout(close, DURATION);
});
onBeforeUnmount(() => {
  clearTimeout(timer);
  document.documentElement.classList.remove("splash-open");
});
</script>
<template>
  <Transition name="splash">
    <div
      v-if="open"
      class="splash"
      role="dialog"
      aria-modal="true"
      aria-labelledby="splash-title"
    >
      <div class="splash-card">
        <img
          class="splash-seal"
          src="/brand/cuenca/sello-480.webp"
          alt=""
          width="180"
          height="180"
        />
        <h2 id="splash-title" class="wordmark splash-name">Cuenca Cimarrona</h2>
        <span class="splash-line" aria-hidden="true"></span>
        <p class="splash-lead">es una colaboración entre</p>
        <ul class="splash-partners">
          <li v-for="(partner, i) in partners" :key="partner.name" :style="{ '--i': i }">
            <img
              :src="partner.src"
              :alt="partner.name"
              :title="partner.name"
              :width="partner.w"
              :height="partner.h"
              decoding="async"
            />
          </li>
        </ul>
      </div>
      <a class="splash-911" href="tel:911"
        ><Icon name="phone" :size="18" /> ¿Emergencia? Llama al 911</a
      >
    </div>
  </Transition>
</template>
