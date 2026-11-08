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
    <div class="section-heading section-space">
      <div>
        <h2>Qué significa para tu familia</h2>
      </div>
    </div>
    <div class="three-column">
      <article class="paper-panel">
        <h3>El clima puede cambiar</h3>
        <p>
          El Niño puede influir en las lluvias y la temperatura. Sus efectos
          varían según la región y cada episodio.
        </p>
      </article>
      <article class="paper-panel">
        <h3>Una señal no es un pronóstico</h3>
        <p>
          No todas las lluvias se deben a El Niño. Consulta los avisos locales;
          esta página no muestra alertas meteorológicas en tiempo real.
        </p>
      </article>
      <article class="paper-panel">
        <h3>Lo que sí puedes hacer</h3>
        <p>
          Reconoce tu entorno, organiza tu plan familiar y prepara tu mochila.
          Evita cruzar corrientes de agua y sigue las indicaciones locales.
        </p>
        <RouterLink to="/plan" class="text-link"
          >Hacer el plan familiar</RouterLink
        >
      </article>
    </div>
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
      <p class="micro">
        Material educativo de un proyecto estudiantil UABC. Ante una emergencia,
        sigue las indicaciones de las autoridades locales.
      </p>
    </section>
  </div>
</template>
