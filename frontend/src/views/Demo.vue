<script setup>
// Demo para la exposición del 20 de noviembre. Solo funciona si el servidor tiene DEMO_20NOV=true:
// si no, la API responde 404 y aquí no aparece ningún botón.
import { onBeforeUnmount, onMounted, ref } from "vue";
import Icon from "../components/Icon.vue";
import { api } from "../composables/api";
import { markDemo, clearDemo } from "../composables/useDemo";

const state = ref("loading");
const info = ref(null);
const busy = ref("");
const error = ref("");

async function load() {
  try {
    info.value = await api("/demo");
    state.value = "on";
    // Desde aquí el sitio muestra los botones "Regresar a testeo" y "Salir de testeo"
    markDemo();
  } catch {
    state.value = "off";
    clearDemo();
  }
}

// Al regresar con el botón Atrás del navegador la página sale del caché tal como se dejó,
// con el botón en "Entrando…" y todos deshabilitados. Se reinicia y se vuelve a consultar.
function onPageShow(event) {
  if (!event.persisted) return;
  busy.value = "";
  error.value = "";
  load();
}

onMounted(() => {
  load();
  window.addEventListener("pageshow", onPageShow);
});
onBeforeUnmount(() => window.removeEventListener("pageshow", onPageShow));

const roles = [
  { id: "admin", icon: "shield", title: "Entrar como super admin", text: "Ver escuelas, cifras y desde dónde nos visitan", to: "/admin" },
  { id: "escuela", icon: "home", title: "Entrar como escuela", text: "Ver a sus docentes y sus grupos", to: "/escuelas" },
  { id: "profesor", icon: "people", title: "Entrar como profesor", text: "Grupos con código, avance de cada alumno y tareas", to: "/docente" },
  { id: "alumno", icon: "star", title: "Entrar como alumno", text: "Puntos, Cimacoins, tareas y su cimarrón", to: "/" },
];

async function enter(role, to) {
  busy.value = role;
  error.value = "";
  try {
    await api(`/demo/entrar/${role}`, { method: "POST" });
    // En la demo no se pregunta "¿Eres tú?" al alumno: ya sabemos que es Ana Demo
    try {
      if (role === "alumno") sessionStorage.setItem("cuenca.soy-yo", "1");
    } catch {
      // Sin almacenamiento solo aparece la pregunta
    }
    // Recarga completa para que el sitio lea la sesión nueva
    window.location.assign(to);
  } catch (e) {
    error.value = e.message;
    busy.value = "";
  }
}

async function leave() {
  busy.value = "salir";
  await api("/demo/salir", { method: "POST" }).catch(() => {});
  window.location.assign("/testeo_20nov");
}
</script>

<template>
  <div class="page demo-page">
    <p v-if="state === 'loading'" class="form-card" role="status">Cargando…</p>

    <section v-else-if="state === 'off'" class="form-card demo-off">
      <h1 class="section-title">Esta página no existe</h1>
      <RouterLink to="/" class="button primary"><Icon name="home" :size="20" /> Ir al inicio</RouterLink>
    </section>

    <template v-else>
      <header class="gm-hero demo-hero">
        <div class="gm-hero-copy">
          <span class="gm-kicker"><Icon name="star" :size="20" /> Demo del 20 de noviembre</span>
          <h1>Recorrido por Cuenca Cimarrona</h1>
          <p>Entra a cada cuenta de ejemplo y muestra cómo funciona</p>
        </div>
      </header>

      <p v-if="!info.ready" class="form-card form-alert is-error" role="alert">
        <Icon name="info" :size="20" /> Faltan los datos demo. En el panel de administración, en Sistema, apaga y vuelve a encender el modo demostración
      </p>
      <p v-if="error" class="form-card form-alert is-error" role="alert"><Icon name="info" :size="20" /> {{ error }}</p>

      <section aria-labelledby="titulo-roles" class="section-space">
        <h2 id="titulo-roles" class="section-title">Entra a una cuenta</h2>
        <div class="demo-grid">
          <button
            v-for="role in roles"
            :key="role.id"
            type="button"
            class="demo-card is-role"
            :disabled="!info.ready || busy !== ''"
            @click="enter(role.id, role.to)"
          >
            <span class="demo-icon" aria-hidden="true"><Icon :name="role.icon" :size="34" /></span>
            <strong>{{ role.title }}</strong>
            <span>{{ busy === role.id ? "Entrando…" : role.text }}</span>
          </button>
        </div>
      </section>

      <section aria-labelledby="titulo-atajos" class="section-space">
        <h2 id="titulo-atajos" class="section-title">Atajos</h2>
        <div class="demo-grid">
          <button type="button" class="demo-card" :disabled="!info.ready || busy !== ''" @click="enter('alumno', '/mi-cimarron')">
            <span class="demo-icon" aria-hidden="true"><Icon name="coin" :size="34" /></span>
            <strong>Ver personajes del cimarrón</strong>
            <span>Entra como Ana Demo y abre su cimarrón con piezas compradas</span>
          </button>
          <RouterLink to="/escuelas/registro" class="demo-card">
            <span class="demo-icon" aria-hidden="true"><Icon name="document" :size="34" /></span>
            <strong>Flujo de registro de escuela</strong>
            <span>El formulario real para dar de alta una escuela</span>
          </RouterLink>
          <RouterLink :to="`/unirse/${info.classrooms[0]?.code ?? ''}`" class="demo-card">
            <span class="demo-icon" aria-hidden="true"><Icon name="people" :size="34" /></span>
            <strong>Unirse a un grupo con código</strong>
            <span>Código del grupo demo</span>
            <span class="demo-code">{{ info.classrooms[0]?.code ?? "------" }}</span>
          </RouterLink>
          <RouterLink to="/informacion?ver=911" class="demo-card">
            <span class="demo-icon" aria-hidden="true"><Icon name="phone" :size="34" /></span>
            <strong>Ver el nuevo 911</strong>
            <span>La llamada paso a paso, el juego y la dirección</span>
          </RouterLink>
          <RouterLink to="/directorio" class="demo-card">
            <span class="demo-icon" aria-hidden="true"><Icon name="contacts" :size="34" /></span>
            <strong>Ver el Directorio</strong>
            <span>Todos los números de emergencia en un lugar</span>
          </RouterLink>
          <RouterLink to="/juegos" class="demo-card">
            <span class="demo-icon" aria-hidden="true"><Icon name="gamepad" :size="34" /></span>
            <strong>Juegos nuevos</strong>
            <span>Memorama, Alto al Fuego y Código 120</span>
          </RouterLink>
        </div>
      </section>

      <section class="section-space demo-facts">
        <p v-if="info.school"><strong>Escuela:</strong> {{ info.school }}</p>
        <p v-if="info.other_school"><strong>Otra escuela:</strong> {{ info.other_school }}</p>
        <p v-if="info.until"><strong>La demo se apaga sola:</strong> {{ new Date(info.until).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" }) }}</p>
        <p v-if="info.teacher"><strong>Profesor:</strong> {{ info.teacher }}</p>
        <p v-for="c in info.classrooms" :key="c.code"><strong>{{ c.name }}:</strong> código {{ c.code }}</p>
        <p v-if="info.student_code"><strong>Código personal de Ana Demo:</strong> {{ info.student_code }}</p>
        <button class="button secondary" type="button" :disabled="busy === 'salir'" @click="leave">
          <Icon name="reset" :size="20" /> Cerrar sesión y volver a la demo
        </button>
      </section>
    </template>
  </div>
</template>
