import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import App from "./App.vue";
import Home from "./views/Home.vue";
import Backpack from "./views/Backpack.vue";
import Styles from "./views/Styles.vue";
import Learn from "./views/Learn.vue";
import Plan from "./views/Plan.vue";
import Games from "./views/Games.vue";
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
    { path: "/juegos", component: Games, meta: { title: "Aprender jugando" } },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
router.afterEach((to) => {
  document.title = `${to.meta.title} · Cuenca Cimarrón`;
});
createApp(App).use(router).mount("#app");
