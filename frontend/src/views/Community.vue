<script setup>
// Comunidad Cimarrona: opiniones anónimas de quienes usan el sitio.
import { ref, computed, onMounted, nextTick } from "vue";
import Icon from "../components/Icon.vue";
import MascotGuide from "../components/MascotGuide.vue";
import OpinionForm from "../components/OpinionForm.vue";
import { loadOpinions, relativeDate } from "../composables/useOpinion";

const summary = ref(null);
const opinions = ref([]);
const more = ref(false);
const state = ref("loading");
const loadingMore = ref(false);
const formOpen = ref(false);
const thanks = ref(false);
const formBox = ref(null);

async function load(append = false) {
  if (append) loadingMore.value = true;
  try {
    const before = append && opinions.value.length ? opinions.value[opinions.value.length - 1].id : 0;
    const data = await loadOpinions(before);
    summary.value = data.summary;
    opinions.value = append ? [...opinions.value, ...data.opinions] : data.opinions;
    more.value = data.more;
    state.value = "ready";
  } catch (error) {
    if (!append) state.value = "error";
  } finally {
    loadingMore.value = false;
  }
}
onMounted(() => load());

async function openForm() {
  formOpen.value = true;
  thanks.value = false;
  await nextTick();
  formBox.value?.querySelector("input")?.focus();
}
function sent(result) {
  formOpen.value = false;
  thanks.value = true;
  if (result.summary) summary.value = result.summary;
  load();
}

const average = computed(() => (summary.value?.average ?? 0).toLocaleString("es-MX", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
const barWidth = (n) => (summary.value?.count ? `${Math.round((summary.value.stars[n] / summary.value.count) * 100)}%` : "0%");
</script>
<template>
  <div class="page community-page">
    <header class="page-heading">
      <h1>Comunidad Cimarrona</h1>
      <p>Lo que opinan quienes usan el sitio. Sin nombres</p>
    </header>

    <section class="community-top" aria-label="Tu opinión">
      <div class="community-cta">
        <MascotGuide :size="120" bubble="¿Qué te pareció?" eager />
        <div class="community-cta-body">
          <button v-if="!formOpen" class="button primary community-open" type="button" :aria-expanded="formOpen" @click="openForm">
            <Icon name="star" :size="26" />Dar mi opinión
          </button>
          <p v-if="thanks" class="form-alert is-ok" role="status"><Icon name="heart" :size="20" />¡Gracias! Tu opinión ya cuenta</p>
        </div>
      </div>
      <div v-if="formOpen" ref="formBox" class="form-card community-form">
        <div class="panel-head">
          <h2 class="form-title">Tu opinión</h2>
          <button class="text-link" type="button" @click="formOpen = false">Cancelar</button>
        </div>
        <OpinionForm origin="comunidad" @sent="sent" />
      </div>
    </section>

    <section v-if="summary" class="community-summary form-card is-tint" aria-label="Resumen de opiniones">
      <div class="community-average">
        <strong>{{ summary.count ? average : "Sin" }}</strong>
        <span class="community-average-stars" :aria-label="summary.count ? `${average} de 5 estrellas` : 'Sin calificaciones'">
          <Icon v-for="n in 5" :key="n" name="star" :size="26" :class="{ on: n <= Math.round(summary.average ?? 0) }" />
        </span>
        <span>{{ summary.count.toLocaleString("es-MX") }} {{ summary.count === 1 ? "opinión" : "opiniones" }}</span>
      </div>
      <ul class="community-bars" aria-label="Opiniones por estrellas">
        <li v-for="n in [5, 4, 3, 2, 1]" :key="n">
          <span class="community-bar-label">{{ n }} <Icon name="star" :size="16" /></span>
          <span class="community-bar"><span :style="{ width: barWidth(n) }"></span></span>
          <span class="community-bar-count">{{ summary.stars[n] }}</span>
        </li>
      </ul>
    </section>

    <section class="community-list" aria-labelledby="titulo-comentarios">
      <h2 id="titulo-comentarios" class="section-title">Comentarios</h2>
      <p v-if="state === 'loading'" role="status">Cargando…</p>
      <div v-else-if="state === 'error'" class="note">
        <Icon name="info" />
        <p>No pudimos cargar las opiniones. <button class="text-link" type="button" @click="load()">Intentar otra vez</button></p>
      </div>
      <p v-else-if="!opinions.length" class="muted-text">Todavía no hay comentarios. El tuyo puede ser el primero</p>
      <ul v-else class="community-cards">
        <li v-for="item in opinions" :key="item.id" class="community-card">
          <span class="community-card-stars" :aria-label="`${item.rating} de 5 estrellas`">
            <Icon v-for="n in 5" :key="n" name="star" :size="20" :class="{ on: n <= item.rating }" />
          </span>
          <p>{{ item.comment }}</p>
          <time :datetime="item.created_at" class="small muted-text">{{ relativeDate(item.created_at) }}</time>
        </li>
      </ul>
      <button v-if="more" class="button secondary community-more" type="button" :disabled="loadingMore" @click="load(true)">
        {{ loadingMore ? "Cargando…" : "Ver más" }}
      </button>
    </section>
  </div>
</template>
