<script setup>
// Comunidad Cimarrona: opiniones anónimas de quienes usan el sitio.
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import Icon from "../components/Icon.vue";
import MascotGuide from "../components/MascotGuide.vue";
import CimarronHead from "../components/CimarronHead.vue";
import CimarronRating from "../components/CimarronRating.vue";
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

// Se muestran hasta 30 comentarios (los más recientes). Llegan de 10 en 10 al bajar por la página.
const MAX_SHOWN = 30;
const sentinel = ref(null);
let observer = null;

async function load(append = false) {
  if (append && (loadingMore.value || !more.value)) return;
  if (append) loadingMore.value = true;
  try {
    const before = append && opinions.value.length ? opinions.value[opinions.value.length - 1].id : 0;
    const data = await loadOpinions(before);
    summary.value = data.summary;
    opinions.value = (append ? [...opinions.value, ...data.opinions] : data.opinions).slice(0, MAX_SHOWN);
    more.value = data.more && opinions.value.length < MAX_SHOWN;
    state.value = "ready";
  } catch (error) {
    if (!append) state.value = "error";
  } finally {
    loadingMore.value = false;
  }
  await nextTick();
  watchSentinel();
}
// Al acercarse al final de la lista se piden los siguientes
function watchSentinel() {
  observer?.disconnect();
  if (!sentinel.value || !more.value || !("IntersectionObserver" in window)) return;
  observer = new IntersectionObserver((list) => {
    if (list.some((e) => e.isIntersecting)) load(true);
  }, { rootMargin: "400px" });
  observer.observe(sentinel.value);
}
onMounted(() => load());
onBeforeUnmount(() => observer?.disconnect());

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
            <CimarronHead :fill="1" :size="34" />Dar mi opinión
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
        <CimarronRating :value="summary.average ?? 0" :size="40" />
        <span>{{ summary.count.toLocaleString("es-MX") }} {{ summary.count === 1 ? "opinión" : "opiniones" }}</span>
      </div>
      <ul class="community-bars" aria-label="Opiniones por número de cimarrones">
        <li v-for="n in [5, 4, 3, 2, 1]" :key="n">
          <span class="community-bar-label">{{ n }} <CimarronHead :fill="1" :size="20" /><span class="sr-only">de 5</span></span>
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
          <CimarronRating :value="item.rating" :size="26" />
          <p>{{ item.comment }}</p>
          <time :datetime="item.created_at" class="small muted-text">{{ relativeDate(item.created_at) }}</time>
        </li>
      </ul>
      <div v-if="more" ref="sentinel" class="community-sentinel" role="status">
        <span v-if="loadingMore">Cargando más opiniones…</span>
      </div>
    </section>
  </div>
</template>
