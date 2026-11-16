// Avisa al sitio cuando un alumno termina un juego propio. nginx lo agrega a cada página de /juegos/.
// Si no hay alumno con sesión no hace nada y el juego sigue igual.
// Si no hay internet, guarda el aviso y el sitio lo reintenta la próxima vez que se abra.
(function () {
  if (window.CuencaPuntos) return;
  var PENDIENTES = "cuenca.puntos.pendientes";
  var enviados = {};

  function guardarPendiente(clave) {
    try {
      var lista = JSON.parse(localStorage.getItem(PENDIENTES) || "[]");
      if (lista.indexOf(clave) === -1) lista.push(clave);
      localStorage.setItem(PENDIENTES, JSON.stringify(lista.slice(-20)));
    } catch (e) {
      // Sin almacenamiento el aviso se pierde, el juego sigue igual.
    }
  }

  function aviso(texto) {
    var caja = document.createElement("div");
    caja.setAttribute("role", "status");
    caja.textContent = texto;
    caja.style.cssText =
      "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;" +
      "background:#00723f;color:#fff;font:700 18px/1.3 system-ui,sans-serif;padding:14px 22px;" +
      "border-radius:14px;box-shadow:0 4px 0 #003d24;max-width:90vw;text-align:center";
    document.body.appendChild(caja);
    setTimeout(function () {
      caja.remove();
    }, 5000);
  }

  function pedir(clave, accion) {
    return fetch("/api/actividades/" + encodeURIComponent(clave) + "/" + accion, {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      keepalive: true,
    });
  }

  function terminar(clave) {
    if (!/^[a-z0-9-]{2,60}$/.test(clave) || enviados[clave]) return;
    enviados[clave] = true;
    pedir(clave, "terminar")
      .then(function (respuesta) {
        if (!respuesta.ok) return null;
        return respuesta.json();
      })
      .then(function (datos) {
        if (datos && datos.new && datos.points) aviso("¡Sumaste " + datos.points + " puntos!");
      })
      .catch(function () {
        guardarPendiente(clave);
      });
  }

  function iniciar(clave) {
    pedir(clave, "inicio").catch(function () {});
  }

  window.CuencaPuntos = { terminar: terminar, iniciar: iniciar };

  var ruta = location.pathname;

  // Arma tu mochila avisa desde su propio código al mostrar los resultados.
  if (ruta.indexOf("/juegos/reto-60-segundos/") === 0) iniciar("mochila");

  // La novela visual avisa desde Ren'Py al llegar a cualquiera de sus finales (script.rpy).
  if (ruta.indexOf("/juegos/novela-visual/") === 0) iniciar("novela-visual");

  // Misión Tijuana cuenta como una sola actividad: suma al llegar a la pantalla final de cualquier misión.
  if (ruta.indexOf("/juegos/mision-tijuana/") === 0) {
    var esMision = !/\/(index\.html)?$/.test(ruta);
    if (esMision) iniciar("mision-tijuana");
    var finales =
      /¡Llegaste a salvo!|¡Llegaron a salvo!|¡Están a salvo!|¡Lo lograste!|¡Curso terminado!|Así terminó tu historia|Lo que hay que saber del Cañón del Pato/;
    var observador = new MutationObserver(function () {
      var titulos = document.querySelectorAll("h2");
      for (var i = 0; i < titulos.length; i++) {
        if (finales.test(titulos[i].textContent || "")) {
          terminar("mision-tijuana");
          observador.disconnect();
          return;
        }
      }
    });
    var vigilar = function () {
      observador.observe(document.body, { childList: true, subtree: true, characterData: true });
    };
    if (document.body) vigilar();
    else document.addEventListener("DOMContentLoaded", vigilar);
  }
})();
