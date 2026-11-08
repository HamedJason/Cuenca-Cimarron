<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";
import Icon from "./components/Icon.vue";
import Modal from "./components/Modal.vue";
import { storageAvailable } from "./composables/useProgress";
const route = useRoute();
const menuOpen = ref(false),
  showStats = ref(false),
  stats = ref(null),
  statsState = ref("loading");
const mobileQuery = window.matchMedia("(max-width: 760px)");
const isMobile = ref(mobileQuery.matches);
const updateMobile = (event) => {
  isMobile.value = event.matches;
  if (!event.matches) menuOpen.value = false;
};
mobileQuery.addEventListener("change", updateMobile);
const closeMenuOnEscape = (event) => {
  if (event.key === "Escape" && menuOpen.value) menuOpen.value = false;
};
window.addEventListener("keydown", closeMenuOnEscape);
onBeforeUnmount(() => {
  mobileQuery.removeEventListener("change", updateMobile);
  window.removeEventListener("keydown", closeMenuOnEscape);
});
const navigation = [
  { to: "/", icon: "phone", label: "Emergencias" },
  { to: "/el-nino", icon: "wave", label: "Conoce El Niño" },
  { to: "/plan", icon: "map", label: "Mi plan familiar" },
  { to: "/mochila", icon: "backpack", label: "Mi mochila" },
];
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);
async function loadStats() {
  statsState.value = "loading";
  try {
    let visitor = localStorage.getItem("cuenca.visitor"),
      session = sessionStorage.getItem("cuenca.session");
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!visitor || !uuidPattern.test(visitor)) {
      visitor = crypto.randomUUID();
      localStorage.setItem("cuenca.visitor", visitor);
    }
    if (!session || !uuidPattern.test(session)) {
      session = crypto.randomUUID();
      sessionStorage.setItem("cuenca.session", session);
    }
    const response = await fetch("/api/visits", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ visitor_id: visitor, session_id: session }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Unavailable");
    const data = await response.json();
    if (
      !Number.isInteger(data.unique_visitors) ||
      !Number.isInteger(data.total_visits)
    )
      throw new Error("Invalid metrics");
    stats.value = data;
    statsState.value = "ready";
  } catch {
    statsState.value = "offline";
  }
}
onMounted(loadStats);
</script>
<template>
  <a class="skip-link" href="#main-content">Saltar al contenido</a>
  <div v-if="menuOpen" class="nav-backdrop" @click="menuOpen = false"></div>
  <aside
    class="sidebar"
    :class="{ expanded: menuOpen }"
    :inert="isMobile && !menuOpen"
    aria-label="Navegación principal"
    @keydown.esc="menuOpen = false"
  >
    <button
      v-if="isMobile && menuOpen"
      class="icon-button mobile-nav-close"
      aria-label="Cerrar menú"
      @click="menuOpen = false"
    >
      <Icon name="close" :size="18" />
    </button>
    <RouterLink class="brand" to="/" aria-label="Cuenca Cimarrón, inicio"
      ><img src="/brand/cimarron.svg" alt="" width="53" height="53" /><span
        >CUENCA<strong>CIMARRÓN<span class="brand-dot">.</span></strong></span
      ></RouterLink
    >
    <div class="sidebar-divider"></div>
    <nav>
      <RouterLink
        v-for="item in navigation"
        :key="item.to"
        :to="item.to"
        :class="['nav-link', { active: route.path === item.to }]"
        :aria-current="route.path === item.to ? 'page' : undefined"
        ><Icon :name="item.icon" :size="21" /><span>{{
          item.label
        }}</span></RouterLink
      >
    </nav>
    <div class="sidebar-bottom">
      <div class="university">
        <img
          src="/brand/uabc-escudo-menu.png"
          alt="Escudo UABC"
          width="32"
          height="44"
        />
        <div>
          <strong>Universidad Autónoma<br />de Baja California</strong>
        </div>
      </div>
    </div>
  </aside>
  <div class="workspace">
    <header class="topbar">
      <button
        class="icon-button mobile-menu"
        aria-label="Abrir o cerrar menú"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <Icon name="menu" />
      </button>
      <RouterLink to="/" class="topbar-brand">Cuenca Cimarrón</RouterLink>
    </header>
    <main id="main-content" tabindex="-1">
      <div v-if="!storageAvailable" class="storage-warning" role="status">
        El navegador no permite guardar tu avance. Puedes usar las listas
        durante esta sesión.
      </div>
      <RouterView />
    </main>
    <footer class="footer">
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
    </footer>
  </div>
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
      @click="loadStats"
    >
      Volver a intentar <Icon name="reset" :size="18" /></button
  ></Modal>
</template>
