import { createApp } from "vue";
import { createRouter, createWebHistory, START_LOCATION } from "vue-router";
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
const Info = () => import("./views/Info.vue");
const Tips = () => import("./views/Tips.vue");
const Styles = () => import("./views/Styles.vue");
const Games = () => import("./views/Games.vue");
const Schools = () => import("./views/Schools.vue");
const SchoolRegister = () => import("./views/SchoolRegister.vue");
const AccountLinks = () => import("./views/AccountLinks.vue");
const Setup = () => import("./views/Setup.vue");
const Admin = () => import("./views/Admin.vue");
const Privacy = () => import("./views/Privacy.vue");
const TeacherAccess = () => import("./views/TeacherAccess.vue");
const Teacher = () => import("./views/Teacher.vue");
const Join = () => import("./views/Join.vue");
const Team = () => import("./views/Team.vue");
const Migrants = () => import("./views/Migrants.vue");
const Avatar = () => import("./views/Avatar.vue");
import "./style.css";
import "./cuentas.css";
// Las direcciones viejas con # (enlaces compartidos, QR impresos) se pasan a la forma nueva sin #.
if (window.location.hash.startsWith("#/")) {
  history.replaceState(history.state, "", window.location.hash.slice(1));
}
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home, meta: { title: "Emergencias" } },
    { path: "/informacion", component: Info, meta: { title: "Información" } },
    { path: "/consejos", component: Tips, meta: { title: "Consejos" } },
    // Las páginas anteriores abren el mismo tema en Información
    { path: "/el-nino", redirect: "/informacion?tema=conozca" },
    { path: "/plan", redirect: "/informacion?tema=planfamiliar" },
    { path: "/mochila", redirect: "/informacion?tema=mochila" },
    { path: "/estilos", component: Styles, meta: { title: "Estilos" } },
    { path: "/identidad", redirect: "/estilos" },
    { path: "/juegos", component: Games, meta: { title: "Juegos" } },
    { path: "/escuelas", component: Schools, meta: { title: "Escuelas" } },
    { path: "/escuelas/registro", component: SchoolRegister, meta: { title: "Registra tu escuela" } },
    { path: "/escuelas/confirmar", component: AccountLinks, meta: { title: "Confirmar correo", mode: "confirmar" } },
    { path: "/escuelas/olvide", component: AccountLinks, meta: { title: "Olvidé mi contraseña", mode: "olvide" } },
    { path: "/escuelas/contrasena", component: AccountLinks, meta: { title: "Contraseña nueva", mode: "contrasena" } },
    { path: "/configurar", component: Setup, meta: { title: "Configurar" } },
    { path: "/invitacion", component: AccountLinks, meta: { title: "Invitación", mode: "invitacion" } },
    { path: "/admin", component: Admin, meta: { title: "Administración" } },
    { path: "/privacidad", component: Privacy, meta: { title: "Aviso de privacidad" } },
    { path: "/docente/acceso/:token", component: TeacherAccess, meta: { title: "Acceso de docentes" } },
    { path: "/docente", component: Teacher, meta: { title: "Docentes" } },
    { path: "/unirse/:code?", component: Join, meta: { title: "Entra a tu grupo", mode: "unirse" } },
    { path: "/regresar", component: Join, meta: { title: "Regresa a tu grupo", mode: "regresar" } },
    { path: "/mi-cimarron", component: Avatar, meta: { title: "Mi cimarrón" } },
    { path: "/equipo", component: Team, meta: { title: "Equipo" } },
    { path: "/nosotros", redirect: "/equipo" },
    { path: "/migrantes", component: Migrants, meta: { title: "Para todas las familias" } },
    { path: "/kreyol", redirect: "/migrantes?lang=ht" },
    { path: "/cimarron", redirect: "/mi-cimarron" },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  // Al cargar o recargar, la página empieza hasta arriba (en el propósito).
  // Al cambiar de página se sube al inicio; si solo cambia la consulta (?juego=...)
  // se queda donde está, para que el botón pueda llevar a las instrucciones.
  // Con atrás y adelante del navegador se vuelve a donde estabas.
  scrollBehavior: (to, from, saved) => {
    if (to.hash) return { el: to.hash, top: 80 };
    if (from === START_LOCATION) return { top: 0 };
    if (saved) return saved;
    if (to.path === from.path) return false;
    return { top: 0 };
  },
});
// Después de una actualización del sitio, una pestaña abierta puede pedir archivos que ya no existen.
// En ese caso se recarga la página en la dirección a la que iba.
router.onError((error, to) => {
  if (/dynamically imported module|module script failed|Failed to fetch/i.test(String(error?.message))) {
    const key = "cuenca.recarga";
    try {
      if (sessionStorage.getItem(key) === to.fullPath) return;
      sessionStorage.setItem(key, to.fullPath);
    } catch {
      // Sin almacenamiento se intenta una vez de todos modos.
    }
    window.location.assign(to.fullPath);
  }
});
router.afterEach((to) => {
  document.title = `${to.meta.title} · Cuenca Cimarrona`;
});
// El navegador no restaura la posición al recargar: de eso se encarga el router.
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
createApp(App).use(router).mount("#app");
