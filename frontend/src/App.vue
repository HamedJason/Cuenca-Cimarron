<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import Icon from "./components/Icon.vue";
import Modal from "./components/Modal.vue";
import LessonModal from "./components/LessonModal.vue";
import { storageAvailable } from "./composables/useProgress";
import { useVisits } from "./composables/useVisits";
const route = useRoute();
function recoverLogo(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = "true";
  image.src = "/brand/cuenca/icono-192.png";
}
const showStats = ref(false);
const { stats, statsState, loadStats } = useVisits();
// Mismo orden que el menú que ya estaba publicado: Inicio, Juegos, Información, Consejos.
const navigation = [
  { to: "/", label: "Inicio", icon: "home" },
  { to: "/juegos", label: "Juegos", icon: "gamepad" },
  { to: "/informacion", label: "Información", icon: "book" },
  { to: "/consejos", label: "Consejos", icon: "shield" },
];
const isActive = (item) =>
  item.to === route.path || (item.match || []).includes(route.path);
const menuOpen = ref(false);
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);
// El botón flotante no se muestra donde ya están los juegos.
// Siempre visible, salvo en la página de juegos.
const showPlayButton = computed(() => route.path !== "/juegos");
const socials = [
  { label: "Instagram", href: "https://www.instagram.com/", icon: '<rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>' },
  { label: "YouTube", href: "https://www.youtube.com/", icon: '<path d="M21 8.2a2.6 2.6 0 0 0-1.8-1.8C17.6 6 12 6 12 6s-5.6 0-7.2.4A2.6 2.6 0 0 0 3 8.2 27 27 0 0 0 2.6 12 27 27 0 0 0 3 15.8a2.6 2.6 0 0 0 1.8 1.8C6.4 18 12 18 12 18s5.6 0 7.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.8 27 27 0 0 0-.4-3.8Z"/><path d="m10 15 5-3-5-3v6Z"/>' },
  { label: "TikTok", href: "https://www.tiktok.com/", icon: '<path d="M15 4c.3 2.2 1.6 3.5 4 3.7v3.1c-1.4 0-2.7-.4-4-1.1v5.7a5.6 5.6 0 1 1-4.8-5.5v3.1a2.5 2.5 0 1 0 1.7 2.4V4H15Z"/>' },
  { label: "Facebook", href: "https://www.facebook.com/", icon: '<path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1V10H8v3h2.4v8h3.1Z"/>' },
];
// El encabezado se compacta y marca su borde al bajar por la página.
const scrolled = ref(false);
const onScroll = () => {
  scrolled.value = window.scrollY > 8;
};
onMounted(() => {
  loadStats();
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
});
</script>
<template>
  <a class="skip-link" href="#main-content">Saltar al contenido</a>
  <header :class="['site-header', { scrolled, 'menu-open': menuOpen }]">
    <div class="wrap header-row">
      <RouterLink class="brand" to="/" aria-label="Cuenca Cimarrona, inicio"
        ><img
          class="brand-icon"
          src="/brand/cuenca/icono-96.webp"
          alt=""
          width="44"
          height="44"
          @error="recoverLogo"
        /><span class="wordmark">Cuenca Cimarrona</span></RouterLink
      >
      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="menu-principal"
        @click="menuOpen = !menuOpen"
      >
        <Icon :name="menuOpen ? 'close' : 'menu'" :size="22" class="menu-toggle-icon" />
        {{ menuOpen ? "Cerrar" : "Menú" }}
      </button>
      <nav
        id="menu-principal"
        :class="['site-nav', { open: menuOpen }]"
        aria-label="Principal"
      >
        <template v-for="item in navigation" :key="item.label">
          <RouterLink
            v-if="item.to"
            :to="item.to"
            :class="['nav-link', { active: isActive(item) }]"
            :aria-current="isActive(item) ? 'page' : undefined"
            ><span class="nav-icon" aria-hidden="true"
              ><Icon :name="item.icon" :size="20" /></span
            >{{ item.label }}</RouterLink
          >
          <a
            v-else
            :href="item.href"
            :class="['nav-link', { active: isActive(item) }]"
            ><span class="nav-icon" aria-hidden="true"
              ><Icon :name="item.icon" :size="20" /></span
            >{{ item.label }}</a
          >
        </template>
      </nav>
    </div>
    <!-- Agua que corre por la cuenca: una línea de olas bajo el encabezado -->
    <div class="header-wave-wrap" aria-hidden="true"><svg class="header-wave" viewBox="0 0 240 12" preserveAspectRatio="none">
      <path class="hw-fill" d="M0 0V8c20-5 40-5 60 0s40 5 60 0 40-5 60 0 40 5 60 0V0Z" />
      <path class="hw-front" d="M0 8c20-5 40-5 60 0s40 5 60 0 40-5 60 0 40 5 60 0" />
    </svg></div>
  </header>
  <div class="workspace">
    <main id="main-content" tabindex="-1">
      <div v-if="!storageAvailable" class="storage-warning" role="status">
        El navegador no permite guardar tu avance. Puedes usar las listas
        durante esta sesión.
      </div>
      <RouterView />
    </main>
    <footer class="footer">
      <div class="footer-main">
        <RouterLink to="/" class="footer-brand" aria-label="Cuenca Cimarrona, inicio"
          ><img src="/brand/cuenca/icono-96.webp" alt="" width="56" height="56" /><span
            class="wordmark"
            aria-hidden="true"
            >Cuenca<br />Cimarrona</span
          ></RouterLink
        >
        <img
          class="footer-uabc"
          src="/assets/images/logo_uabc-80.webp"
          alt="Escudo UABC"
          width="40"
          height="52"
        />
        <span class="footer-copy">© 2026 · Proyecto académico UABC</span>
        <nav class="social-links" aria-label="Redes sociales">
          <a
            v-for="social in socials"
            :key="social.label"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="social.label"
            :title="social.label"
            ><svg viewBox="0 0 24 24" aria-hidden="true" v-html="social.icon"
          /></a>
        </nav>
      </div>
      <div class="footer-tools">
        <RouterLink to="/estilos" class="footer-link">Estilos</RouterLink>
        <button class="visits-tag" @click="showStats = true">
          <span
            class="status-dot"
            :class="{ muted: statsState !== 'ready' }"
          ></span
          ><span v-if="statsState === 'ready'"
            ><b>{{ stats.unique_visitors.toLocaleString("es-MX") }}</b> visitas
            únicas</span
          ><span v-else>{{
            statsState === "loading" ? "Conectando…" : "Contador no disponible"
          }}</span>
        </button>
      </div>
    </footer>
  </div>
  <RouterLink v-if="showPlayButton" to="/juegos" class="play-fab cta"
    ><span class="play-fab-icon" aria-hidden="true"
      ><Icon name="gamepad" :size="30" /></span
    ><span class="play-fab-text"
      ><strong>Aprende jugando</strong></span
    ></RouterLink
  >
  <Modal :open="showStats" title="Visitas al sitio" @close="showStats = false">
    <div v-if="statsState === 'ready'" class="metrics">
      <div>
        <strong>{{ stats.unique_visitors.toLocaleString("es-MX") }}</strong
        ><span>visitas únicas por navegador</span>
      </div>
      <div>
        <strong>{{ stats.total_visits.toLocaleString("es-MX") }}</strong
        ><span>sesiones registradas</span>
      </div>
    </div>
    <div v-else class="note">
      <Icon name="info" />
      <p>
        {{
          statsState === "loading"
            ? "Consultando el contador…"
            : "El contador no está disponible en este momento. No mostramos cifras estimadas."
        }}
      </p>
    </div>
    <p class="small muted-text">
      Usamos un identificador aleatorio en este navegador para evitar contar
      cada recarga como una persona nueva. No pedimos tu nombre ni correo. Otro
      dispositivo o borrar los datos puede contar como otra visita única.
    </p>
    <button
      v-if="statsState === 'offline'"
      class="button primary"
      @click="loadStats()"
    >
      Volver a intentar <Icon name="reset" :size="18" /></button
  ></Modal>
  <LessonModal />
</template>
