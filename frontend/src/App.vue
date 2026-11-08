<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Icon from "./components/Icon.vue";
import Modal from "./components/Modal.vue";
import { storageAvailable } from "./composables/useProgress";
const route = useRoute();
const motionKey = "cuenca.motion";
const readMotion = () => {
  try {
    return localStorage.getItem(motionKey) !== "off";
  } catch {
    return true;
  }
};
const motionOn = ref(readMotion());
const applyMotion = () =>
  document.documentElement.classList.toggle("motion-off", !motionOn.value);
applyMotion();
function toggleMotion() {
  motionOn.value = !motionOn.value;
  applyMotion();
  try {
    localStorage.setItem(motionKey, motionOn.value ? "on" : "off");
  } catch {
    /* Sin almacenamiento: el cambio dura solo esta visita. */
  }
}
const showStats = ref(false);
const stats = ref(null);
const statsState = ref("loading");
const navigation = [
  { to: "/", label: "Emergencias" },
  { to: "/el-nino", label: "El Niño" },
  { to: "/plan", label: "Plan familiar" },
  { to: "/mochila", label: "Mochila" },
];
async function loadStats() {
  statsState.value = "loading";
  try {
    let visitor = localStorage.getItem("cuenca.visitor");
    let session = sessionStorage.getItem("cuenca.session");
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
  <header class="site-header">
    <div class="wrap header-row">
      <RouterLink class="brand" to="/"
        ><img
          src="/brand/uabc-escudo-menu.png"
          alt="Escudo UABC"
          width="26"
          height="36"
        /><span>Cuenca Cimarrón</span></RouterLink
      >
      <nav class="site-nav" aria-label="Principal">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          :class="['nav-link', { active: route.path === item.to }]"
          :aria-current="route.path === item.to ? 'page' : undefined"
          >{{ item.label }}</RouterLink
        >
      </nav>
    </div>
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
      <button
        class="motion-toggle"
        :aria-pressed="!motionOn"
        @click="toggleMotion"
      >
        {{ motionOn ? "Pausar animaciones" : "Reanudar animaciones" }}
      </button>
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
