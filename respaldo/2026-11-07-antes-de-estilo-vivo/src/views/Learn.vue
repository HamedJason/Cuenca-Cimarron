<script setup>
import Icon from "../components/Icon.vue";
import { sources } from "../data";
</script>
<template>
  <div class="page">
    <div class="page-heading">
      <h1>Qué es El Niño</h1>
    </div>
    <section class="learn-feature">
      <div>
        <h2>Empieza en el océano Pacífico</h2>
        <p>
          El Niño es la fase cálida de un ciclo climático llamado ENOS. El
          calentamiento de las aguas superficiales del Pacífico ecuatorial
          central y oriental modifica la interacción entre el océano y la
          atmósfera.
        </p>
        <p>
          Esto puede cambiar los patrones de lluvia y temperatura en distintas
          partes del mundo.
        </p>
        <a
          :href="sources.climate"
          target="_blank"
          rel="noopener"
          class="text-link light-link"
          >Leer la explicación de NOAA <Icon name="external" :size="16"
        /></a>
      </div>
    </section>
    <section class="paper-panel section-space tijuana-facts">
      <h2>Qué se espera en Tijuana</h2>
      <ul>
        <li>
          El 5 de noviembre de 2026, el Cabildo de Tijuana declaró emergencia
          preventiva por El Niño.
        </li>
        <li>
          Según Protección Civil municipal, las lluvias más fuertes llegarían
          desde la segunda semana de diciembre y durante enero. Podrían seguir
          hasta febrero o marzo de 2027.
        </li>
        <li>
          Los riesgos que señalan las autoridades son inundaciones, deslaves y
          daños en viviendas en laderas.
        </li>
        <li>
          El pronóstico puede cambiar. Revisa los
          <RouterLink to="/">avisos oficiales</RouterLink> antes de salir.
        </li>
      </ul>
      <p class="micro">
        Fuente:
        <a
          href="https://puntonorte.info/2026/11/05/cabildo-de-tijuana-emite-declaratoria-de-emergencia-ante-inminente-llegada-de-el-nino/"
          target="_blank"
          rel="noopener"
          >Punto Norte, 5 de noviembre de 2026</a
        >, con declaraciones del alcalde y del director de Protección Civil
        Municipal.
      </p>
    </section>
    <section class="paper-panel section-space tijuana-facts">
      <h2>Qué significa para tu familia</h2>
      <ul>
        <li>
          No todas las lluvias se deben a El Niño. Este sitio no muestra alertas
          en tiempo real: revisa los avisos oficiales.
        </li>
        <li>
          Puedes prepararte desde ahora con el plan familiar y la mochila de
          emergencia.
        </li>
        <li>Si hay corriente de agua en la calle o el arroyo, no la cruces.</li>
      </ul>
      <RouterLink to="/plan" class="text-link"
        >Hacer el plan familiar</RouterLink
      >
    </section>
    <section class="sources-section">
      <h2>Fuentes para seguir aprendiendo</h2>
      <a :href="sources.climate" target="_blank" rel="noopener"
        ><span><strong>NOAA</strong> · Entender El Niño y ENOS</span
        ><Icon name="external" :size="18" /></a
      ><a :href="sources.plan" target="_blank" rel="noopener"
        ><span><strong>CENAPRED</strong> · Plan familiar en cuatro pasos</span
        ><Icon name="external" :size="18" /></a
      ><a :href="sources.backpack" target="_blank" rel="noopener"
        ><span><strong>CENAPRED</strong> · Mochila de emergencia</span
        ><Icon name="external" :size="18" /></a
      ><a :href="sources.forecast" target="_blank" rel="noopener"
        ><span
          ><strong>SMN / CONAGUA</strong> · Avisos meteorológicos
          oficiales</span
        ><Icon name="external" :size="18"
      /></a>
    </section>
  </div>
</template>
