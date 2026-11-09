import { createApp } from "vue";
import { createRouter, createWebHashHistory, START_LOCATION } from "vue-router";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import App from "./App.vue";
import Home from "./views/Home.vue";
// El inicio carga de inmediato; las demás páginas se descargan al visitarlas.
const Learn = () => import("./views/Learn.vue");
const Plan = () => import("./views/Plan.vue");
const Backpack = () => import("./views/Backpack.vue");
const Styles = () => import("./views/Styles.vue");
const Games = () => import("./views/Games.vue");
import "./style.css";
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: Home, meta: { title: "Emergencias" } },
    {
      path: "/el-nino",
      component: Learn,
      meta: { title: "El fenómeno de El Niño" },
    },
    { path: "/plan", component: Plan, meta: { title: "Mi plan familiar" } },
    { path: "/mochila", component: Backpack, meta: { title: "Mi mochila" } },
    { path: "/estilos", component: Styles, meta: { title: "Estilos" } },
    { path: "/identidad", redirect: "/estilos" },
    { path: "/juegos", component: Games, meta: { title: "Juegos" } },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  // Al cargar o recargar, la página empieza hasta arriba (en el propósito).
  // Al cambiar de página se sube al inicio; si solo cambia la consulta (?juego=...)
  // se queda donde está, para que el botón pueda llevar a las instrucciones.
  // Con atrás y adelante del navegador se vuelve a donde estabas.
  scrollBehavior: (to, from, saved) => {
    if (from === START_LOCATION) return { top: 0 };
    if (saved) return saved;
    if (to.path === from.path) return false;
    return { top: 0 };
  },
});
router.afterEach((to) => {
  document.title = `${to.meta.title} · Cuenca Cimarrona`;
});
// El navegador no restaura la posición al recargar: de eso se encarga el router.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
createApp(App).use(router).mount("#app");
