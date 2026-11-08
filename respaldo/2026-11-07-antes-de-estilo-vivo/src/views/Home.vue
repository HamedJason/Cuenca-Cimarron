<script setup>
import Icon from "../components/Icon.vue";
import { emergency } from "../data";
const telHref = (number) => `tel:${number.replace(/\s/g, "")}`;
const mapHref = (shelter) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${shelter.name}, ${shelter.address}, Tijuana, B.C.`,
  )}`;
</script>
<template>
  <div class="page emergency-page">
    <section class="call-911" aria-labelledby="titulo-911">
      <h1 id="titulo-911">Emergencias en Tijuana</h1>
      <p>
        Si alguien está en peligro, llama al 911. Ahí atienden policía,
        ambulancia y bomberos.
      </p>
      <a class="call-main" href="tel:911">Llamar al 911</a>
    </section>

    <section aria-labelledby="titulo-numeros">
      <h2 id="titulo-numeros">Otros números</h2>
      <ul class="phone-list">
        <li v-for="item in emergency.phones" :key="item.name">
          <span class="phone-name">{{ item.name }}</span>
          <span class="phone-numbers">
            <a
              v-for="number in item.numbers"
              :key="number"
              :href="telHref(number)"
              :aria-label="`Llamar a ${item.name}, ${number}`"
              >{{ number }}</a
            >
          </span>
        </li>
      </ul>
      <p class="fine-print">
        Para una ambulancia de Cruz Roja también se llama al 911.
      </p>
    </section>

    <section aria-labelledby="titulo-avisos">
      <h2 id="titulo-avisos">Avisos oficiales</h2>
      <ul class="link-list">
        <li v-for="notice in emergency.notices" :key="notice.url">
          <a :href="notice.url" target="_blank" rel="noopener"
            ><span
              ><strong>{{ notice.title }}</strong
              ><small>{{ notice.detail }}</small></span
            ><Icon name="external" :size="18"
          /></a>
        </li>
      </ul>
    </section>

    <div class="emergency-columns">
      <section aria-labelledby="titulo-refugios">
        <h2 id="titulo-refugios">Refugios temporales</h2>
        <p class="section-note">
          Para usar un refugio, comunícate con tu delegación. Si hay peligro,
          llama al 911.
        </p>
        <ul class="shelter-list">
          <li v-for="shelter in emergency.shelters" :key="shelter.name">
            <strong>{{ shelter.name }}</strong>
            <span>{{ shelter.address }}</span>
            <a :href="mapHref(shelter)" target="_blank" rel="noopener"
              >Cómo llegar</a
            >
          </li>
        </ul>
        <a
          class="text-link"
          :href="emergency.sheltersUrl"
          target="_blank"
          rel="noopener"
          >Lista oficial de refugios</a
        >
      </section>

      <section aria-labelledby="titulo-riesgo">
        <h2 id="titulo-riesgo">¿Tu colonia es zona de riesgo?</h2>
        <p class="section-note">
          Busca tu calle en el mapa del Atlas de Riesgo 2024 del municipio. Ahí
          aparecen las zonas con riesgo de inundación y de deslave.
        </p>
        <a
          class="button primary"
          :href="emergency.riskMapUrl"
          target="_blank"
          rel="noopener"
          >Abrir el mapa de riesgo</a
        >
        <a
          class="text-link pdf-link"
          :href="emergency.riskAtlasPdf"
          target="_blank"
          rel="noopener"
          >Atlas completo en PDF</a
        >
      </section>
    </div>

    <section aria-labelledby="titulo-preparate">
      <h2 id="titulo-preparate">Para prepararte con tiempo</h2>
      <ul class="link-list">
        <li>
          <RouterLink to="/el-nino"
            ><span
              ><strong>Qué es El Niño y qué se espera en Tijuana</strong></span
            ></RouterLink
          >
        </li>
        <li>
          <RouterLink to="/plan"
            ><span><strong>Hacer el plan familiar</strong></span></RouterLink
          >
        </li>
        <li>
          <RouterLink to="/mochila"
            ><span
              ><strong>Revisar la mochila de emergencia</strong></span
            ></RouterLink
          >
        </li>
      </ul>
    </section>

    <p class="verified-note">
      Números y enlaces verificados en los sitios oficiales el
      {{ emergency.verifiedOn }}.
    </p>
  </div>
</template>
