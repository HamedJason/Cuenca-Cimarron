<script setup>
// Lecturas cortas: un tema por página, se lee en un minuto y termina con una pregunta.
// Los alumnos con sesión ganan puntos (y con ellos Cimacoins). Los demás leen igual.
import { computed } from "vue";
import { useRoute } from "vue-router";
import Icon from "../components/Icon.vue";
import PointsTag from "../components/PointsTag.vue";
import ActivityQuestion from "../components/ActivityQuestion.vue";
import { moduleThemes, allModules, findModule, activityKeyOf } from "../learnModules";
import { student } from "../composables/useStudent";
import { isDone } from "../composables/useActivities";

const route = useRoute();
const current = computed(() => (route.params.id ? findModule(String(route.params.id)) : null));
const next = computed(() => {
  if (!current.value) return null;
  const i = allModules.findIndex((m) => m.id === current.value.id);
  return allModules[i + 1] ?? null;
});
const doneCount = computed(() => allModules.filter((m) => isDone(activityKeyOf(m.id))).length);
</script>
<template>
  <div class="page account-page lessons-page">
    <header class="page-heading">
      <h1>{{ current ? current.title : "Lecturas cortas" }}</h1>
      <p>{{ current ? current.themeTitle : "Un tema en un minuto, con una pregunta al final" }}</p>
    </header>

    <template v-if="current">
      <article class="form-card lesson-short">
        <PointsTag :activity-key="activityKeyOf(current.id)" />
        <p class="lesson-short-lead"><Icon :name="current.icon" :size="28" />{{ current.lead }}</p>
        <ul v-if="current.points.length" class="plain-list lesson-short-points">
          <li v-for="point in current.points" :key="point"><Icon name="check" :size="20" />{{ point }}</li>
        </ul>
        <p v-if="current.tip" class="note"><Icon name="info" /><span>{{ current.tip }}</span></p>
        <ActivityQuestion :key="current.id" :activity-key="activityKeyOf(current.id)" />
        <p v-if="!student" class="small muted-text">Entra con el código de tu grupo para ganar puntos y Cimacoins con estas preguntas</p>
      </article>
      <div class="form-actions">
        <RouterLink v-if="next" :to="`/aprende/${next.id}`" class="button primary">Siguiente: {{ next.title }}</RouterLink>
        <RouterLink to="/aprende" class="text-link">Todas las lecturas</RouterLink>
      </div>
    </template>

    <p v-else-if="route.params.id" class="form-card">No encontramos esa lectura. <RouterLink to="/aprende" class="inline-link">Ver todas</RouterLink></p>

    <template v-else>
      <p v-if="student" class="note"><Icon name="star" /><span>Llevas {{ doneCount }} de {{ allModules.length }} lecturas. Cada pregunta bien contestada te da 10 puntos</span></p>
      <section v-for="theme in moduleThemes" :key="theme.id" class="form-card">
        <h2 class="form-title">{{ theme.title }}</h2>
        <ul class="lesson-short-list">
          <li v-for="m in theme.modules" :key="m.id">
            <RouterLink :to="`/aprende/${m.id}`" class="lesson-short-card">
              <Icon :name="m.icon" :size="26" />
              <span>
                <b>{{ m.title }}</b>
                <PointsTag :activity-key="activityKeyOf(m.id)" />
              </span>
            </RouterLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
