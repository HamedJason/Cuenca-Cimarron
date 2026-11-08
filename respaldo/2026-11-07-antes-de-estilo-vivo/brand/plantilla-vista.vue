<!-- Copiar a src/views y registrar la ruta en src/main.js. -->
<script setup>
import Icon from "../components/Icon.vue";
</script>
<template>
  <div class="page">
    <div class="page-heading">
      <span class="section-kicker">Contexto opcional</span>
      <h1>Un título claro y cercano<span class="gold-dot">.</span></h1>
      <p>Describe en una frase qué puede hacer aquí la persona.</p>
    </div>
    <section class="paper-panel">
      <Icon name="leaf" :size="32" />
      <h2>Una idea por sección.</h2>
      <p>Usa los colores, las tipografías y los espacios del sistema.</p>
      <RouterLink to="/plan" class="button primary"
        >Ver mi plan</RouterLink>
    </section>
  </div>
</template>
