// Avisa al sitio cuando un alumno termina un juego propio (le da Cimacoins). nginx lo agrega a cada página de /juegos/.
// Sin alumno con sesión no gana nada: solo se le invita una vez a entrar con el código de su grupo.
// Si no hay internet, guarda el aviso y el sitio lo reintenta la próxima vez que se abra.
(function () {
  if (window.CuencaPuntos) return;
  var PENDIENTES = "cuenca.puntos.pendientes";
  // Juegos terminados en este navegador, para invitar al visitante una sola vez por juego.
  // Las Cimacoins solo las gana el alumno con sesión y se las da el servidor (useFinishRewards.js).
  var TERMINADOS = "cuenca.juegos.terminados";
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

  // Regresa true si es la primera vez que se termina este juego en el navegador.
  function anotarTerminado(clave) {
    try {
      var lista = JSON.parse(localStorage.getItem(TERMINADOS) || "[]");
      if (!Array.isArray(lista)) lista = [];
      if (lista.indexOf(clave) !== -1) return false;
      lista.push(clave);
      localStorage.setItem(TERMINADOS, JSON.stringify(lista.slice(-40)));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Mientras la ventana de opinión está abierta el aviso espera, para no tapar el botón de mandar.
  var avisoEnEspera = null;
  function aviso(texto) {
    if (opinando) {
      avisoEnEspera = texto;
      return;
    }
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

  // Opinión obligatoria al terminar (Comunidad Cimarrona). Mismas llaves que src/composables/useOpinion.js.
  // Tapa la pantalla final hasta que se manda. Si ya opinó en la última hora no sale.
  var OPINION = {
    dispositivo: "cuenca.opinion.dispositivo",
    enviada: "cuenca.opinion.enviada",
    pendiente: "cuenca.opinion.pendiente",
  };
  var PAUSA_OPINION = 60 * 60 * 1000;
  var opinando = false;

  function leer(llave) {
    try {
      return localStorage.getItem(llave);
    } catch (e) {
      return null;
    }
  }
  function guardar(llave, valor) {
    try {
      localStorage.setItem(llave, valor);
    } catch (e) {
      // Sin almacenamiento no se recuerda, el juego sigue igual.
    }
  }
  function idDispositivo() {
    var id = leer(OPINION.dispositivo);
    if (id && /^[0-9a-f-]{36}$/i.test(id)) return id;
    if (window.crypto && crypto.randomUUID) id = crypto.randomUUID();
    else
      id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
        return (c === "x" ? r : (r & 3) | 8).toString(16);
      });
    guardar(OPINION.dispositivo, id);
    return id;
  }
  function opinoHacePoco() {
    var en = Number(leer(OPINION.enviada)) || 0;
    return en > 0 && Date.now() - en < PAUSA_OPINION;
  }

  var ESTILO_OPINION =
    ".cc-op{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;padding:16px;background:#002a19cc;overflow-y:auto;font:16px/1.4 'DM Sans',system-ui,sans-serif;color:#1c2621;text-align:left}" +
    ".cc-op *{box-sizing:border-box}" +
    ".cc-op-card{width:min(520px,100%);max-height:calc(100dvh - 32px);overflow-y:auto;background:#fff;border:2px solid #003d24;border-radius:24px;box-shadow:0 4px 0 #003d24;padding:24px}" +
    ".cc-op-head{display:flex;align-items:center;gap:14px;margin-bottom:12px}" +
    ".cc-op-head img{width:88px;height:auto;flex:none}" +
    ".cc-op h2{margin:0 0 4px;font:800 34px/1 'Barlow Condensed',system-ui,sans-serif;color:#003d24}" +
    ".cc-op p{margin:0}" +
    ".cc-op-legend{font-weight:700;margin:8px 0 6px!important}" +
    ".cc-op-stars{display:flex;gap:4px;flex-wrap:wrap}" +
    ".cc-op-star{width:52px;height:52px;display:grid;place-items:center;border:0;border-radius:14px;background:transparent;color:#b9a98a;cursor:pointer;padding:0}" +
    ".cc-op-star svg{width:40px;height:40px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linejoin:round}" +
    ".cc-op-star.on svg{fill:#dd971a;stroke:#8a5a00}" +
    ".cc-op-star:focus-visible{outline:3px solid #003d24;outline-offset:2px}" +
    ".cc-op-label{min-height:22px;font-weight:700;color:#8a5a00;margin:4px 0 12px!important}" +
    ".cc-op label{display:block;font-weight:700;margin-bottom:6px}.cc-op label span{font-weight:400;color:#4a5650}" +
    ".cc-op textarea{width:100%;min-height:88px;padding:12px 14px;font:inherit;color:inherit;background:#fff;border:2px solid #7c8a82;border-radius:14px;resize:vertical}" +
    ".cc-op textarea:focus-visible{outline:3px solid #003d24;outline-offset:2px}" +
    ".cc-op-hint{font-size:15px;color:#4a5650;margin-top:4px!important}" +
    ".cc-op-trap{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}" +
    ".cc-op-error{margin-top:12px!important;padding:12px 16px;border-radius:14px;background:#ffebee;color:#8e0e18;font-weight:700}" +
    ".cc-op-send{width:100%;min-height:56px;margin-top:16px;border:2px solid #00723f;border-radius:14px;background:#00723f;color:#fff;font-family:inherit;font-size:18px;font-weight:700;box-shadow:0 4px 0 #003d24;cursor:pointer}" +
    ".cc-op-send:disabled{opacity:.7;cursor:wait}" +
    ".cc-op-send:focus-visible{outline:3px solid #003d24;outline-offset:3px}" +
    ".cc-op-anon{font-size:15px;color:#4a5650;margin-top:10px!important;text-align:center}" +
    "@media (max-width:420px){.cc-op{padding:10px}.cc-op-card{padding:18px;max-height:calc(100dvh - 20px)}.cc-op h2{font-size:28px}.cc-op-star{width:48px;height:48px}.cc-op-star svg{width:36px;height:36px}}";
  var ESTRELLA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z"/></svg>';
  var NOMBRES = ["No me gustó", "Le falta", "Está bien", "Me gustó", "¡Me encantó!"];

  function opinar() {
    if (opinando || opinoHacePoco() || !document.body) return;
    opinando = true;
    var calificacion = 0;
    var antes = document.activeElement;
    var caja = document.createElement("div");
    caja.className = "cc-op";
    caja.setAttribute("role", "dialog");
    caja.setAttribute("aria-modal", "true");
    caja.setAttribute("aria-labelledby", "cc-op-titulo");
    var estrellas = "";
    for (var n = 1; n <= 5; n++) {
      estrellas +=
        '<button type="button" class="cc-op-star" role="radio" aria-checked="false" data-n="' + n + '" aria-label="' +
        n + (n === 1 ? " estrella: " : " estrellas: ") + NOMBRES[n - 1] + '">' + ESTRELLA + "</button>";
    }
    caja.innerHTML =
      "<style>" + ESTILO_OPINION + "</style>" +
      '<form class="cc-op-card" novalidate>' +
      '<div class="cc-op-head"><img src="/brand/cuenca/mascota-240.webp" alt="" width="88" height="86">' +
      '<div><h2 id="cc-op-titulo">¡Terminaste!</h2><p>Antes de ver tu resultado, cuéntanos qué te pareció</p></div></div>' +
      '<p class="cc-op-legend" id="cc-op-leyenda">¿Cuántas estrellas le das a Cuenca Cimarrona?</p>' +
      '<div class="cc-op-stars" role="radiogroup" aria-labelledby="cc-op-leyenda">' + estrellas + "</div>" +
      '<p class="cc-op-label" aria-hidden="true">Toca una estrella</p>' +
      '<label for="cc-op-comentario">Platícanos qué te gustó o qué cambiarías<span> (opcional)</span></label>' +
      '<textarea id="cc-op-comentario" maxlength="500" rows="3"></textarea>' +
      '<p class="cc-op-hint">No pongas tu nombre. Te quedan <b>500</b> letras</p>' +
      '<div class="cc-op-trap" aria-hidden="true"><input type="text" name="sitio" tabindex="-1" autocomplete="off"></div>' +
      '<p class="cc-op-error" role="alert" hidden></p>' +
      '<button type="submit" class="cc-op-send">Mandar y ver mi resultado</button>' +
      '<p class="cc-op-anon">Es anónimo: no guardamos tu nombre, tu escuela ni tu IP</p>' +
      "</form>";
    var botones = caja.querySelectorAll(".cc-op-star");
    var etiqueta = caja.querySelector(".cc-op-label");
    var texto = caja.querySelector("textarea");
    var quedan = caja.querySelector(".cc-op-hint b");
    var error = caja.querySelector(".cc-op-error");
    var enviar = caja.querySelector(".cc-op-send");
    function pintar(hasta) {
      for (var i = 0; i < botones.length; i++) {
        botones[i].classList.toggle("on", i < hasta);
        botones[i].setAttribute("aria-checked", String(i + 1 === calificacion));
      }
      etiqueta.textContent = hasta ? NOMBRES[hasta - 1] : "Toca una estrella";
    }
    function elegir() {
      calificacion = Number(this.getAttribute("data-n"));
      error.hidden = true;
      pintar(calificacion);
    }
    function asomar() {
      pintar(Number(this.getAttribute("data-n")));
    }
    for (var b = 0; b < botones.length; b++) {
      botones[b].addEventListener("click", elegir);
      botones[b].addEventListener("mouseenter", asomar);
      botones[b].addEventListener("mouseleave", function () {
        pintar(calificacion);
      });
    }
    texto.addEventListener("input", function () {
      quedan.textContent = String(500 - texto.value.length);
    });
    // Las teclas no llegan al juego de atrás, Esc no cierra la ventana y el foco no sale de ella.
    caja.addEventListener("keydown", function (e) {
      e.stopPropagation();
      if (e.key === "Escape") e.preventDefault();
      if (e.key === "Tab") {
        var focos = caja.querySelectorAll("button, textarea");
        var primero = focos[0];
        var ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    });
    caja.addEventListener("keyup", function (e) {
      e.stopPropagation();
    });
    function cerrar() {
      guardar(OPINION.enviada, String(Date.now()));
      caja.remove();
      opinando = false;
      if (antes && antes.focus) antes.focus();
      if (avisoEnEspera) {
        aviso(avisoEnEspera);
        avisoEnEspera = null;
      }
    }
    function fallo(mensaje) {
      error.textContent = mensaje;
      error.hidden = false;
      enviar.disabled = false;
      enviar.textContent = "Mandar y ver mi resultado";
    }
    caja.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!calificacion) {
        fallo("Toca las estrellas para calificar");
        botones[0].focus();
        return;
      }
      var cuerpo = {
        rating: calificacion,
        comment: texto.value.trim() || null,
        device: idDispositivo(),
        origin: "actividad",
        sitio: caja.querySelector("[name=sitio]").value,
      };
      enviar.disabled = true;
      enviar.textContent = "Mandando…";
      fetch("/api/opiniones", {
        method: "POST",
        credentials: "same-origin",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      }).then(
        function (respuesta) {
          // 429: ya opinó hace poco desde este dispositivo o esta red. No se le detiene.
          if (respuesta.ok || respuesta.status === 429) return cerrar();
          return respuesta
            .json()
            .catch(function () {
              return {};
            })
            .then(function (datos) {
              var errores = datos.errors || {};
              fallo((errores.comment && errores.comment[0]) || (errores.rating && errores.rating[0]) || datos.message || "Algo salió mal. Intenta otra vez");
            });
        },
        function () {
          // Sin internet: se guarda y el sitio la manda la próxima vez que se abra.
          guardar(OPINION.pendiente, JSON.stringify(cuerpo));
          cerrar();
        },
      );
    });
    document.body.appendChild(caja);
    botones[0].focus();
  }

  function terminar(clave) {
    if (!/^[a-z0-9-]{2,60}$/.test(clave) || enviados[clave]) return;
    enviados[clave] = true;
    opinar();
    var nuevo = anotarTerminado(clave);
    pedir(clave, "terminar")
      .then(function (respuesta) {
        // Sin alumno con sesión no hay Cimacoins: se le invita a entrar con su grupo.
        if (respuesta.status === 401) {
          if (nuevo) aviso("¡Terminaste! Entra con el código de tu grupo para ganar Cimacoins");
          return null;
        }
        if (!respuesta.ok) return null;
        return respuesta.json();
      })
      .then(function (datos) {
        if (datos && datos.new && datos.points) aviso("¡Ganaste " + datos.points * 10 + " Cimacoins!");
      })
      .catch(function () {
        guardarPendiente(clave);
      });
  }

  function iniciar(clave) {
    pedir(clave, "inicio").catch(function () {});
  }

  window.CuencaPuntos = { terminar: terminar, iniciar: iniciar, opinar: opinar };

  var ruta = location.pathname;

  // Arma tu mochila avisa desde su propio código al mostrar los resultados.
  if (ruta.indexOf("/juegos/reto-60-segundos/") === 0) iniciar("mochila");

  // El memorama y Alto al Fuego avisan desde su propio código al terminar la partida.
  if (ruta.indexOf("/juegos/memorama/") === 0) iniciar("memorama");
  if (ruta.indexOf("/juegos/alto-al-fuego/") === 0) iniciar("alto-al-fuego");

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
