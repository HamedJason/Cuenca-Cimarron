<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import Icon from "./components/Icon.vue";
import Modal from "./components/Modal.vue";
import LessonModal from "./components/LessonModal.vue";
import { storageAvailable } from "./composables/useProgress";
import { useVisits } from "./composables/useVisits";
import { socials } from "./data";
const liveSocials = socials.filter((social) => social.href);
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
const team = [
  "Jason Alejandro Hamed Valdez",
  "Fernando Onit Sibaja Gomez",
  "Kevin Osmar Valdez Meza",
];
const contactEmails = [
  "jason.hamed@uabc.edu.mx",
  "onit.sibaja@uabc.edu.mx",
  "k1288703@uabc.edu.mx",
];
// El encabezado se compacta y marca su borde al bajar por la página.
const scrolled = ref(false);
const onScroll = () => {
  // Con margen: al compactarse el encabezado la página se recorre unos píxeles,
  // y con un solo límite eso lo hacía alternar (vibrar) cerca del inicio.
  const y = window.scrollY;
  if (!scrolled.value && y > 48) scrolled.value = true;
  else if (scrolled.value && y < 8) scrolled.value = false;
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
        <div class="header-social">
          <span class="header-social-label">Síguenos</span>
          <a
            v-for="social in liveSocials"
            :key="social.label"
            class="header-social-link"
            :href="social.href"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="`${social.label} de Cuenca Cimarrona`"
            :title="social.label"
            ><svg viewBox="0 0 24 24" aria-hidden="true" v-html="social.icon"
          /></a>
        </div>
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
      <div class="footer-grid">
        <div class="footer-id">
          <div class="footer-logos">
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
          </div>
          <h2 class="footer-title">Síguenos</h2>
          <ul class="social-links" aria-label="Redes sociales">
            <li v-for="social in socials" :key="social.label">
              <a
                v-if="social.href"
                :href="social.href"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="social.label"
                :title="social.label"
                ><svg viewBox="0 0 24 24" aria-hidden="true" v-html="social.icon"
              /></a>
              <span
                v-else
                class="social-soon"
                :title="`${social.label}: próximamente`"
                ><svg viewBox="0 0 24 24" aria-hidden="true" v-html="social.icon" /><span
                  class="sr-only"
                  >{{ social.label }}: próximamente</span
                ></span
              >
            </li>
          </ul>
        </div>
        <div>
          <h2 class="footer-title">Equipo de diseño</h2>
          <ul class="footer-list">
            <li v-for="name in team" :key="name">{{ name }}</li>
          </ul>
        </div>
        <div>
          <h2 class="footer-title">Contacto</h2>
          <ul class="footer-list">
            <li v-for="email in contactEmails" :key="email">
              <a class="footer-mail" :href="`mailto:${email}`"
                ><Icon name="mail" :size="18" />{{ email }}</a
              >
            </li>
          </ul>
        </div>
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
