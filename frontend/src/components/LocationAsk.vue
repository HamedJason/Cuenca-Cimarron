<script setup>
// Aviso pequeño la primera vez que alguien entra: "¿De qué parte de Baja California nos visitas?".
// Se pregunta una sola vez (la respuesta, también "Ahora no", se recuerda en este navegador).
// Con "Sí" se pide la ubicación al navegador, se convierte aquí en una zona aproximada
// (zonas.js) y al servidor solo va { municipio, zona, fecha }. Las coordenadas no se guardan.
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Icon from "./Icon.vue";
import { zonaDe, OUTSIDE, ZONE_KEY } from "../zonas";

const route = useRoute();
const show = ref(false);
const state = ref("ask");
const place = ref("");
let timer = 0;

function answered() {
  try {
    return Boolean(localStorage.getItem(ZONE_KEY));
  } catch {
    return true;
  }
}
function remember(value) {
  try {
    localStorage.setItem(ZONE_KEY, value);
  } catch {
    // Sin almacenamiento no se vuelve a preguntar en esta pestaña.
  }
}
function close(value) {
  remember(value);
  show.value = false;
}

async function send(result) {
  try {
    await fetch("/api/visitas/zona", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...result, fecha: new Date().toISOString().slice(0, 10) }),
      keepalive: true,
    });
  } catch {
    // Si falla no pasa nada: el sitio sigue igual.
  }
}

function yes() {
  if (!("geolocation" in navigator)) return close("sin-ubicacion");
  state.value = "asking";
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const result = zonaDe(position.coords.latitude, position.coords.longitude);
      send(result);
      remember("listo");
      place.value = result.municipio === OUTSIDE ? "fuera de Baja California" : result.municipio === "Tijuana" ? `Tijuana, ${result.zona}` : result.municipio;
      state.value = "thanks";
      setTimeout(() => (show.value = false), 4000);
    },
    () => close("no"),
    { enableHighAccuracy: false, timeout: 15000, maximumAge: 3600000 },
  );
}

onMounted(() => {
  if (answered()) return;
  // Después de la pantalla de bienvenida, y nunca en la administración ni en la demo
  timer = setTimeout(() => {
    if (!answered() && !/^\/(admin|configurar|testeo_20nov)/.test(route.path)) show.value = true;
  }, 6500);
});
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <aside v-if="show" class="zone-ask" role="dialog" aria-labelledby="zona-titulo" aria-live="polite">
    <template v-if="state === 'thanks'">
      <p id="zona-titulo" class="zone-ask-title"><Icon name="check" :size="22" /> ¡Gracias! Nos visitas desde {{ place }}</p>
    </template>
    <template v-else>
      <p id="zona-titulo" class="zone-ask-title"><Icon name="pin" :size="22" /> ¿Nos dices de qué parte de Baja California nos visitas?</p>
      <p class="zone-ask-note">Solo guardamos la zona, nunca tu ubicación exacta</p>
      <div class="zone-ask-actions">
        <button class="button primary" type="button" :disabled="state === 'asking'" @click="yes">Sí</button>
        <button class="button secondary" type="button" @click="close('no')">Ahora no</button>
      </div>
    </template>
  </aside>
</template>
