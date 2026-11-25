// ¿Llamo al 911? Cuatro misiones con personajes inventados y momentos "Ahora tú".
// El contenido está en escenas.js. El juego no pide, no escribe y no guarda datos del niño:
// solo recuerda en este aparato qué medallas ya ganó.
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var CLAVE_VOZ = "cuenca.llamada911.voz";
  var CLAVE_MEDALLAS = "cuenca.llamada911.medallas";

  function leer(clave, porDefecto) {
    try { var v = localStorage.getItem(clave); return v === null ? porDefecto : JSON.parse(v); } catch (e) { return porDefecto; }
  }
  function guardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) {}
  }
  function revolver(lista) {
    var a = lista.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function azar(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
  function el(tag, clase, texto) {
    var n = document.createElement(tag);
    if (clase) n.className = clase;
    if (texto !== undefined) n.textContent = texto;
    return n;
  }
  function sacudir(n) { n.classList.remove("tiembla"); void n.offsetWidth; n.classList.add("tiembla"); }

  // ---------- Voz ----------
  var puedeHablar = "speechSynthesis" in window;
  var vozActiva = leer(CLAVE_VOZ, true) !== false;

  function hablar(texto) {
    if (!puedeHablar || !vozActiva || !texto) return;
    window.speechSynthesis.cancel();
    var frase = new SpeechSynthesisUtterance(texto);
    frase.lang = "es-MX";
    frase.rate = 0.95;
    frase.pitch = 1.05;
    window.speechSynthesis.speak(frase);
  }
  function callar() { if (puedeHablar) window.speechSynthesis.cancel(); }
  function pintarVoz() {
    var b = $("voz");
    b.setAttribute("aria-pressed", String(vozActiva));
    b.setAttribute("aria-label", vozActiva ? "Voz encendida" : "Voz apagada");
    b.classList.toggle("apagada", !vozActiva);
  }
  if (!puedeHablar) $("voz").hidden = true;
  $("voz").addEventListener("click", function () {
    vozActiva = !vozActiva;
    guardar(CLAVE_VOZ, vozActiva);
    if (!vozActiva) callar();
    pintarVoz();
  });
  pintarVoz();

  // Los números se leen uno por uno: "seis seis cuatro, uno dos tres…"
  function digitosEnVoz(numero) {
    return grupos(numero).map(function (g) { return g.split("").join(" "); }).join(", ");
  }

  // ---------- Sonidos (se generan en el navegador, sin archivos) ----------
  var audio = null;
  function ctx() {
    if (!audio) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audio = new AC();
    }
    if (audio.state === "suspended") audio.resume();
    return audio;
  }
  function tono(frecuencias, inicio, duracion, volumen, tipo) {
    var a = ctx();
    if (!a) return;
    var t = a.currentTime + (inicio || 0);
    var g = a.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(volumen || 0.15, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duracion);
    g.connect(a.destination);
    frecuencias.forEach(function (f) {
      var o = a.createOscillator();
      o.type = tipo || "sine";
      o.frequency.setValueAtTime(f, t);
      o.connect(g);
      o.start(t);
      o.stop(t + duracion + 0.05);
    });
  }
  var sonido = {
    bien: function () { tono([660], 0, 0.15, 0.18, "triangle"); tono([990], 0.12, 0.25, 0.18, "triangle"); },
    pieza: function () { tono([784], 0, 0.12, 0.14, "triangle"); },
    casi: function () { tono([330], 0, 0.22, 0.12, "sine"); tono([262], 0.18, 0.3, 0.12, "sine"); },
    tecla: function (d) {
      var filas = { 1: 697, 2: 697, 3: 697, 4: 770, 5: 770, 6: 770, 7: 852, 8: 852, 9: 852, 0: 941 };
      var cols = { 1: 1209, 4: 1209, 7: 1209, 2: 1336, 5: 1336, 8: 1336, 0: 1336, 3: 1477, 6: 1477, 9: 1477 };
      tono([filas[d], cols[d]], 0, 0.16, 0.08, "sine");
    },
    timbre: function (veces) { for (var i = 0; i < veces; i++) tono([440, 480], i * 1.1, 0.8, 0.07, "sine"); },
    sirena: function () {
      for (var i = 0; i < 4; i++) { tono([740], i * 0.5, 0.24, 0.06, "square"); tono([587], i * 0.5 + 0.25, 0.24, 0.06, "square"); }
    },
    fiesta: function () { [523, 659, 784, 1047].forEach(function (f, i) { tono([f], i * 0.12, 0.25, 0.15, "triangle"); }); },
  };

  // ---------- Pantallas ----------
  var pantallaActual = "inicio";
  function mostrar(nombre) {
    pantallaActual = nombre;
    document.querySelectorAll(".pantalla").forEach(function (p) {
      p.classList.toggle("activa", p.dataset.pantalla === nombre);
    });
    window.scrollTo(0, 0);
    var titulo = document.querySelector('[data-pantalla="' + nombre + '"] h1, [data-pantalla="' + nombre + '"] h2');
    if (titulo) { titulo.setAttribute("tabindex", "-1"); titulo.focus({ preventScroll: true }); }
  }

  // ---------- Medallas y mapa ----------
  var medallas = leer(CLAVE_MEDALLAS, []);
  if (!Array.isArray(medallas)) medallas = [];
  function mision(id) { return window.MISIONES.filter(function (m) { return m.id === id; })[0]; }
  function todas() { return window.MISIONES.every(function (m) { return medallas.indexOf(m.id) !== -1; }); }

  var arrancar = { historieta: function () { misionHistorieta(); }, emergencia: misionEmergencia, direccion: misionDireccion, llamada: misionLlamada };

  function pintarMapa() {
    var lista = $("misiones");
    lista.innerHTML = "";
    window.MISIONES.forEach(function (m, i) {
      var ganada = medallas.indexOf(m.id) !== -1;
      var li = el("li");
      var b = el("button", "mision" + (ganada ? " ganada" : ""));
      b.type = "button";
      b.innerHTML = '<span class="n"></span><span class="ico" aria-hidden="true"></span><span class="txt"><b></b><small></small></span><span class="estado" aria-hidden="true"></span>';
      b.querySelector(".n").textContent = i + 1;
      b.querySelector(".ico").textContent = m.emoji;
      b.querySelector("b").textContent = m.titulo;
      b.querySelector("small").textContent = ganada ? "Medalla: " + m.medalla : "¡Juega!";
      b.querySelector(".estado").textContent = ganada ? "🏅" : "▶";
      b.setAttribute("aria-label", "Misión " + (i + 1) + ": " + m.titulo + (ganada ? ". Ya ganaste la medalla " + m.medalla : ""));
      b.addEventListener("click", function () { ctx(); arrancar[m.id](); });
      li.appendChild(b);
      lista.appendChild(li);
    });
    var n = window.MISIONES.filter(function (m) { return medallas.indexOf(m.id) !== -1; }).length;
    $("medallas-cuenta").textContent = todas() ? "🏅 ¡Eres Héroe del 911!" : "Medallas: " + n + " de " + window.MISIONES.length;
  }

  function irAlMapa() {
    callar();
    $("confirmar").hidden = true;
    $("reiniciar").hidden = medallas.length === 0;
    pintarMapa();
    mostrar("mapa");
  }

  // Empezar de cero: borra las medallas (para que juegue otro niño en el mismo aparato)
  $("reiniciar").addEventListener("click", function () {
    $("confirmar").hidden = false;
    $("reiniciar").hidden = true;
    $("confirmar-no").focus();
  });
  $("confirmar-no").addEventListener("click", function () {
    $("confirmar").hidden = true;
    $("reiniciar").hidden = false;
  });
  $("confirmar-si").addEventListener("click", function () {
    medallas = [];
    guardar(CLAVE_MEDALLAS, medallas);
    terminoTodasAhora = false;
    irAlMapa();
    hablar("¡Listo! Todas las misiones están nuevas.");
  });

  // ---------- Al terminar una misión: medalla, dato real y "Ahora tú" ----------
  var terminoTodasAhora = false;

  function ganar(id, resultado) {
    var m = mision(id);
    var antes = todas();
    if (medallas.indexOf(id) === -1) { medallas.push(id); guardar(CLAVE_MEDALLAS, medallas); }
    terminoTodasAhora = !antes && todas();
    $("logro-emoji").textContent = m.emoji;
    $("t-logro").textContent = m.medalla;
    $("logro-resultado").textContent = resultado || "";
    $("logro-dato").textContent = m.dato;
    $("logro-seguir").onclick = function () {
      if (m.ahoraTu) ahoraTu(m.ahoraTu);
      else despuesDeMision();
    };
    mostrar("logro");
    sonido.fiesta();
    hablar("¡Ganaste la medalla " + m.medalla + "! ¿Sabías que? " + m.dato);
  }

  function despuesDeMision() {
    if (terminoTodasAhora) {
      terminoTodasAhora = false;
      $("final-cuantas").textContent = "Ganaste las " + window.MISIONES.length + " medallas";
      mostrar("final");
      sonido.fiesta();
      hablar("¡Eres un héroe del 911! Ahora imprime tu tarjeta de héroe y llénala con tu familia.");
      // Si el juego está dentro de Cuenca Cimarrona, avisa para las Cimacoins (cuenca-puntos.js)
      if (window.CuencaPuntos) window.CuencaPuntos.terminar("llamada-911");
    } else {
      irAlMapa();
    }
  }

  function ahoraTu(datos) {
    $("t-ahora").textContent = datos.titulo;
    $("ahora-pide").textContent = datos.pide;
    var lista = $("ahora-lista");
    lista.innerHTML = "";
    datos.lista.forEach(function (t) { lista.appendChild(el("li", "", t)); });
    $("ahora-ayuda").hidden = true;
    $("ahora-ayuda").textContent = datos.ayuda;
    $("ahora-saltar").textContent = "Ahora no";
    $("ahora-bien").onclick = function () {
      sonido.fiesta();
      hablar("¡Excelente! Ya te la sabes.");
      despuesDeMision();
    };
    $("ahora-practicar").onclick = function () {
      $("ahora-ayuda").hidden = false;
      $("ahora-saltar").textContent = "Seguir";
      hablar(datos.ayuda);
    };
    $("ahora-saltar").onclick = despuesDeMision;
    mostrar("ahora-tu");
    hablar(datos.titulo + " " + datos.pide);
  }

  // ---------- Misión: Mi historieta del 911 ----------
  // 1) Ordenar las 4 viñetas  2) Elegir lo que dice el niño en cada una  3) Colorear con bote de pintura
  // Las imágenes vienen como data: (js/historieta-imagenes.js) para que el lienzo se pueda leer
  // aunque el juego se abra con doble clic (file://).
  var TAM = 1024;
  var COLORES = ["#e53935", "#fb8c00", "#fdd835", "#7cb342", "#00723f", "#29b6f6", "#1e56c8", "#8e44ad", "#f48fb1", "#8d6e63", "#bdbdbd", "#ffffff"];
  var hist = null;

  function imgVineta(i) { return (window.HISTORIETA_IMG || {})[String(i + 1)] || null; }
  var IMGS = {};
  function imagenDe(i) {
    if (!IMGS[i] && imgVineta(i)) { IMGS[i] = new Image(); IMGS[i].src = imgVineta(i); }
    return IMGS[i];
  }

  function vinetaHTML(i, conGlobo) {
    var v = window.HISTORIETA[i];
    var f = el("figure", "vineta");
    var src = imgVineta(i);
    if (src) {
      var im = el("img");
      im.src = src;
      im.alt = v.alt;
      f.appendChild(im);
    } else {
      f.classList.add("vineta-falta");
      f.appendChild(el("span", "vineta-emoji", v.emoji)).setAttribute("aria-hidden", "true");
      f.appendChild(el("small", "", v.que));
    }
    if (conGlobo) {
      f.appendChild(el("p", "globo-hist" + (conGlobo === "…" ? " vacio" : "") + (conGlobo.length > 55 ? " largo" : ""), conGlobo));
      // Lo que dice alguien antes (p. ej. la operadora por el teléfono)
      if (v.antes) f.appendChild(el("p", "globo-hist globo-antes", "📞 " + v.antes));
    }
    return f;
  }

  function histPaso(n) {
    hist.paso = n;
    $("hist-pasos").querySelectorAll("li").forEach(function (li, i) {
      li.className = i < n ? "hecho" : i === n ? "ahora" : "";
    });
    $("hist-aviso").textContent = "";
    $("hist-aviso").className = "aviso";
    $("hist-area").innerHTML = "";
  }

  function histDecir(texto) {
    $("hist-instruccion").textContent = texto;
    $("hist-repetir").onclick = function () { hablar(texto); };
    hablar(texto);
  }

  function histAviso(texto, bien) {
    $("hist-aviso").textContent = texto;
    $("hist-aviso").className = "aviso " + (bien ? "es-bien" : "es-casi");
  }

  function misionHistorieta() {
    hist = { paso: 0, globos: [], bienGlobos: 0, errOrden: 0, lienzos: {}, actual: null, color: COLORES[0] };
    window.HISTORIETA.forEach(function (v, i) { imagenDe(i); });
    mostrar("historieta");
    ordenarVinetas();
  }

  // 1) Ordenar
  function ordenarVinetas() {
    histPaso(0);
    histDecir("Esta historia se revolvió. Toca los cuadros en orden: ¿qué pasó primero?");
    var area = $("hist-area");
    var ranuras = el("ol", "hist-ranuras");
    var huecos = window.HISTORIETA.map(function (v, i) {
      var li = el("li", "hist-ranura" + (i === 0 ? " toca" : ""));
      li.appendChild(el("span", "hist-num", String(i + 1)));
      ranuras.appendChild(li);
      return li;
    });
    var bandeja = el("div", "hist-bandeja");
    var siguiente = 0;
    var orden = revolver(window.HISTORIETA.map(function (v, i) { return i; }));
    // Que nunca salga ya ordenado
    if (orden.every(function (x, i) { return x === i; })) orden.push(orden.shift());
    orden.forEach(function (i) {
      var b = el("button", "hist-carta");
      b.type = "button";
      b.setAttribute("aria-label", window.HISTORIETA[i].que);
      b.appendChild(vinetaHTML(i));
      b.addEventListener("click", function () {
        if (i === siguiente) {
          sonido.pieza();
          var hueco = huecos[i];
          hueco.classList.remove("toca");
          hueco.classList.add("puesta");
          hueco.appendChild(vinetaHTML(i));
          b.disabled = true;
          b.classList.add("usada");
          histAviso(window.HISTORIETA[i].que, true);
          hablar(window.HISTORIETA[i].que);
          siguiente++;
          if (siguiente < huecos.length) { huecos[siguiente].classList.add("toca"); return; }
          sonido.bien();
          setTimeout(function () { elegirGlobo(0); }, 2200);
        } else {
          hist.errOrden++;
          sonido.casi();
          sacudir(b);
          var pista = window.HISTORIETA[siguiente].pistaOrden;
          histAviso(pista, false);
          hablar(pista);
        }
      });
      bandeja.appendChild(b);
    });
    area.appendChild(ranuras);
    area.appendChild(bandeja);
  }

  // 2) Globos: ¿qué dice el niño (o quien hable) en cada cuadro?
  function elegirGlobo(i) {
    histPaso(1);
    var v = window.HISTORIETA[i];
    histDecir("Cuadro " + (i + 1) + ": " + v.que + ". " + (v.antes ? "Le preguntan: " + v.antes + " " : "") + "¿Qué dice " + (v.quien || "el niño") + "?");
    var area = $("hist-area");
    var cont = el("div", "hist-globos");
    var fig = vinetaHTML(i, "…");
    fig.classList.add("grande");
    cont.appendChild(fig);
    var opciones = el("div", "opciones");
    var primero = true;
    revolver(v.opciones).forEach(function (o) {
      var b = el("button", "opcion");
      b.type = "button";
      b.appendChild(el("span", "ico", o.emoji)).setAttribute("aria-hidden", "true");
      b.appendChild(el("span", "txt", o.texto));
      b.addEventListener("click", function () {
        if (o.bien) {
          if (primero) hist.bienGlobos++;
          hist.globos[i] = o.texto;
          sonido.bien();
          b.classList.add("correcta");
          opciones.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
          var g = fig.querySelector(".globo-hist");
          g.textContent = o.texto;
          g.classList.toggle("largo", o.texto.length > 55);
          g.classList.remove("vacio");
          g.classList.add("puesto");
          histAviso("¡Eso es!", true);
          hablar(o.texto);
          setTimeout(function () {
            if (i + 1 < window.HISTORIETA.length) elegirGlobo(i + 1);
            else colorear();
          }, 2000);
        } else {
          primero = false;
          sonido.casi();
          b.classList.add("incorrecta");
          b.disabled = true;
          histAviso(o.pista, false);
          hablar(o.pista);
        }
      });
      opciones.appendChild(b);
    });
    cont.appendChild(opciones);
    area.appendChild(cont);
  }

  // 3) Colorear. Rápido: al pasar el dedo se pinta cada zona que toca (no hay que tocar una por una).
  // Las líneas van encima (multiplicar), así nunca se tapan. Se puede acercar y alejar.
  function prepararLienzo(i, listo) {
    if (hist.lienzos[i]) { listo(hist.lienzos[i]); return; }
    var im = imagenDe(i);
    function cargada() {
      if (hist.lienzos[i]) { listo(hist.lienzos[i]); return; }
      var N = TAM * TAM;
      var c = document.createElement("canvas");
      c.width = c.height = TAM;
      var cx = c.getContext("2d");
      cx.drawImage(im, 0, 0, TAM, TAM);
      // Cierres invisibles: solo cuentan como línea para la pintura, no se ven
      cx.strokeStyle = "#000";
      cx.lineWidth = 3;
      (window.HISTORIETA[i].cierres || []).forEach(function (l) {
        cx.beginPath(); cx.moveTo(l[0], l[1]); cx.lineTo(l[2], l[3]); cx.stroke();
      });
      var px = cx.getImageData(0, 0, TAM, TAM).data;
      var pared = new Uint8Array(N);
      for (var k = 0, j = 0; k < N; k++, j += 4) {
        pared[k] = (px[j] * 0.3 + px[j + 1] * 0.59 + px[j + 2] * 0.11) < 175 ? 1 : 0;
      }
      // Engorda las líneas para tapar huequitos por donde se saldría la pintura
      for (var g = 0; g < 2; g++) {
        var copia = pared.slice();
        for (var q = TAM; q < N - TAM; q++) {
          if (copia[q]) continue;
          var qx = q % TAM;
          if ((qx > 0 && copia[q - 1]) || (qx < TAM - 1 && copia[q + 1]) || copia[q - TAM] || copia[q + TAM]) pared[q] = 1;
        }
      }
      // Numera las zonas (una sola vez): así pintar una zona es instantáneo
      var zona = new Int32Array(N);
      var pila = new Int32Array(N);
      var total = 0;
      for (var s = 0; s < N; s++) {
        if (pared[s] || zona[s]) continue;
        total++;
        var n = 0;
        pila[n++] = s;
        zona[s] = total;
        while (n) {
          var p = pila[--n], ppx = p % TAM;
          if (ppx > 0 && !zona[p - 1] && !pared[p - 1]) { zona[p - 1] = total; pila[n++] = p - 1; }
          if (ppx < TAM - 1 && !zona[p + 1] && !pared[p + 1]) { zona[p + 1] = total; pila[n++] = p + 1; }
          if (p >= TAM && !zona[p - TAM] && !pared[p - TAM]) { zona[p - TAM] = total; pila[n++] = p - TAM; }
          if (p < N - TAM && !zona[p + TAM] && !pared[p + TAM]) { zona[p + TAM] = total; pila[n++] = p + TAM; }
        }
      }
      // Cada zona crece 4 píxeles bajo las líneas para que no quede orilla blanca
      for (var v = 0; v < 4; v++) {
        var antes = zona.slice();
        for (var w = 0; w < N; w++) {
          if (antes[w]) continue;
          var wx = w % TAM;
          var z = (wx > 0 && antes[w - 1]) || (wx < TAM - 1 && antes[w + 1]) || (w >= TAM && antes[w - TAM]) || (w < N - TAM && antes[w + TAM]);
          if (z) zona[w] = z;
        }
      }
      // Lista de píxeles por zona
      var inicio = new Int32Array(total + 2);
      for (var a = 0; a < N; a++) inicio[zona[a] + 1]++;
      for (var b = 1; b < inicio.length; b++) inicio[b] += inicio[b - 1];
      var puesto = inicio.slice();
      var pixeles = new Int32Array(N);
      for (var d = 0; d < N; d++) pixeles[puesto[zona[d]]++] = d;

      var color = cx.createImageData(TAM, TAM);
      color.data.fill(255);
      hist.lienzos[i] = { linea: im, zona: zona, inicio: inicio, pixeles: pixeles, color: color, deshacer: [] };
      listo(hist.lienzos[i]);
    }
    if (im.complete && im.naturalWidth) cargada();
    else im.addEventListener("load", cargada, { once: true });
  }

  function pintarLienzo(L, canvas) {
    var cx = canvas.getContext("2d");
    var tmp = pintarLienzo.tmp || (pintarLienzo.tmp = document.createElement("canvas"));
    tmp.width = tmp.height = TAM;
    tmp.getContext("2d").putImageData(L.color, 0, 0);
    cx.globalCompositeOperation = "source-over";
    cx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
    cx.globalCompositeOperation = "multiply";
    cx.drawImage(L.linea, 0, 0, canvas.width, canvas.height);
    cx.globalCompositeOperation = "source-over";
  }

  // Zona en (x, y); si tocó una línea, busca la zona más cercana
  function zonaEn(L, x, y, buscar) {
    var z = L.zona[y * TAM + x];
    if (z || !buscar) return z;
    for (var r = 2; r <= 10; r += 2) {
      for (var dy = -r; dy <= r; dy += 2) for (var dx = -r; dx <= r; dx += 2) {
        var xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < TAM && yy < TAM && L.zona[yy * TAM + xx]) return L.zona[yy * TAM + xx];
      }
    }
    return 0;
  }

  function pintarZona(L, z, hex) {
    var rr = parseInt(hex.substr(1, 2), 16), gg = parseInt(hex.substr(3, 2), 16), bb = parseInt(hex.substr(5, 2), 16);
    var d = L.color.data;
    for (var k = L.inicio[z]; k < L.inicio[z + 1]; k++) {
      var j = L.pixeles[k] * 4;
      d[j] = rr; d[j + 1] = gg; d[j + 2] = bb;
    }
  }

  function colorear() {
    histPaso(2);
    histDecir("¡Ahora coloréala! Elige un color y pasa el dedo por el dibujo: se pinta todo lo que toques");
    var area = $("hist-area");
    var conImagen = window.HISTORIETA.map(function (v, i) { return i; }).filter(function (i) { return imgVineta(i); });

    var pestanas = el("div", "hist-pestanas");
    var lienzo = el("canvas", "hist-lienzo");
    lienzo.width = lienzo.height = TAM;
    lienzo.setAttribute("aria-label", "Dibujo para colorear");
    var paleta = el("div", "hist-paleta");
    var herramientas = el("div", "hist-herramientas");
    var hoja = el("div", "hist-hoja");
    hoja.appendChild(lienzo);

    // ---- Acercar y alejar ----
    var vista = { z: 1, x: 0, y: 0 };
    var mover = false;
    function aplicarVista() {
      var w = hoja.clientWidth || 1;
      var min = w - w * vista.z;
      vista.x = Math.min(0, Math.max(min, vista.x));
      vista.y = Math.min(0, Math.max(min, vista.y));
      lienzo.style.transform = "translate(" + vista.x + "px," + vista.y + "px) scale(" + vista.z + ")";
      hoja.classList.toggle("acercado", vista.z > 1.01);
      btnMenos.disabled = vista.z <= 1.01;
      btnMas.disabled = vista.z >= 4.99;
    }
    // Acerca dejando quieto el punto (cx, cy) de la hoja
    function zoomEn(nz, cx, cy) {
      nz = Math.min(5, Math.max(1, nz));
      vista.x = cx - (cx - vista.x) * (nz / vista.z);
      vista.y = cy - (cy - vista.y) * (nz / vista.z);
      vista.z = nz;
      aplicarVista();
    }
    function centro() { var w = hoja.clientWidth; return w / 2; }

    var zoom = el("div", "hist-zoom");
    var btnMas = el("button", "", "➕");
    var btnMenos = el("button", "", "➖");
    var btnMover = el("button", "", "✋");
    btnMas.type = btnMenos.type = btnMover.type = "button";
    btnMas.setAttribute("aria-label", "Acercar");
    btnMenos.setAttribute("aria-label", "Alejar");
    btnMover.setAttribute("aria-label", "Mover el dibujo");
    btnMover.setAttribute("aria-pressed", "false");
    btnMas.addEventListener("click", function () { zoomEn(vista.z * 1.5, centro(), centro()); });
    btnMenos.addEventListener("click", function () {
      zoomEn(vista.z / 1.5, centro(), centro());
      if (vista.z <= 1.01) ponerMover(false);
    });
    function ponerMover(si) {
      mover = si;
      btnMover.classList.toggle("activa", si);
      btnMover.setAttribute("aria-pressed", String(si));
      hoja.classList.toggle("moviendo", si);
    }
    btnMover.addEventListener("click", function () {
      if (!mover && vista.z <= 1.01) zoomEn(2, centro(), centro());
      ponerMover(!mover);
    });
    zoom.appendChild(btnMas);
    zoom.appendChild(btnMenos);
    zoom.appendChild(btnMover);
    hoja.appendChild(zoom);

    hoja.addEventListener("wheel", function (ev) {
      ev.preventDefault();
      var r = hoja.getBoundingClientRect();
      zoomEn(vista.z * (ev.deltaY < 0 ? 1.2 : 1 / 1.2), ev.clientX - r.left, ev.clientY - r.top);
    }, { passive: false });

    // ---- Pintar con el dedo, mover y pellizcar ----
    var punteros = {};
    var cuantos = 0;
    var trazo = null, gesto = null, arrastre = null, dibujar = false;

    function aImagen(cx, cy) {
      var r = lienzo.getBoundingClientRect();
      return { x: Math.floor((cx - r.left) / r.width * TAM), y: Math.floor((cy - r.top) / r.height * TAM) };
    }
    function enHoja(cx, cy) { var r = hoja.getBoundingClientRect(); return { x: cx - r.left, y: cy - r.top }; }
    function refrescar() {
      if (dibujar) return;
      dibujar = true;
      requestAnimationFrame(function () {
        dibujar = false;
        var L = hist.lienzos[hist.actual];
        if (L) pintarLienzo(L, lienzo);
      });
    }
    function pintarPunto(L, p, buscar) {
      if (p.x < 0 || p.y < 0 || p.x >= TAM || p.y >= TAM) return;
      var z = zonaEn(L, p.x, p.y, buscar);
      if (!z || trazo.hechas[z]) return;
      trazo.hechas[z] = true;
      if (!trazo.pinto) { trazo.pinto = true; sonido.pieza(); }
      pintarZona(L, z, hist.color);
      refrescar();
    }
    function datosGesto() {
      var ids = Object.keys(punteros), a = punteros[ids[0]], b = punteros[ids[1]];
      var m = enHoja((a.x + b.x) / 2, (a.y + b.y) / 2);
      return { dist: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), mx: m.x, my: m.y };
    }
    function cancelarTrazo() {
      var L = hist.lienzos[hist.actual];
      if (trazo && L && trazo.copia) { L.color.data.set(trazo.copia); L.deshacer.pop(); refrescar(); }
      trazo = null;
    }

    lienzo.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      try { lienzo.setPointerCapture(ev.pointerId); } catch (e) { /* nada */ }
      if (!punteros[ev.pointerId]) cuantos++;
      punteros[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var L = hist.lienzos[hist.actual];
      if (!L) return;
      if (cuantos >= 2) {
        // Dos dedos: acercar/alejar y mover (lo que pintó el primer dedo se deshace)
        cancelarTrazo();
        arrastre = null;
        var g = datosGesto();
        gesto = { dist: g.dist, mx: g.mx, my: g.my, z: vista.z, x: vista.x, y: vista.y };
        return;
      }
      if (mover || ev.button === 1 || ev.button === 2) {
        arrastre = { cx: ev.clientX, cy: ev.clientY, x: vista.x, y: vista.y };
        return;
      }
      var copia = new Uint8ClampedArray(L.color.data);
      L.deshacer.push(copia);
      if (L.deshacer.length > 8) L.deshacer.shift();
      var p = aImagen(ev.clientX, ev.clientY);
      trazo = { hechas: {}, ultimo: p, copia: copia, pinto: false };
      pintarPunto(L, p, true);
    });

    lienzo.addEventListener("pointermove", function (ev) {
      if (!punteros[ev.pointerId]) return;
      punteros[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      if (gesto && cuantos >= 2) {
        var g = datosGesto();
        var nz = Math.min(5, Math.max(1, gesto.z * g.dist / gesto.dist));
        vista.x = g.mx - (gesto.mx - gesto.x) * (nz / gesto.z);
        vista.y = g.my - (gesto.my - gesto.y) * (nz / gesto.z);
        vista.z = nz;
        aplicarVista();
        return;
      }
      if (arrastre) {
        vista.x = arrastre.x + ev.clientX - arrastre.cx;
        vista.y = arrastre.y + ev.clientY - arrastre.cy;
        aplicarVista();
        return;
      }
      var L = hist.lienzos[hist.actual];
      if (!trazo || !L) return;
      // Recorre la línea desde el último punto para no brincarse zonas angostas
      var p = aImagen(ev.clientX, ev.clientY), u = trazo.ultimo;
      var pasos = Math.max(1, Math.ceil(Math.hypot(p.x - u.x, p.y - u.y) / 3));
      for (var s = 1; s <= pasos; s++) {
        pintarPunto(L, { x: Math.round(u.x + (p.x - u.x) * s / pasos), y: Math.round(u.y + (p.y - u.y) * s / pasos) }, false);
      }
      trazo.ultimo = p;
    });

    function soltar(ev) {
      if (!punteros[ev.pointerId]) return;
      delete punteros[ev.pointerId];
      cuantos--;
      if (cuantos < 2) gesto = null;
      if (cuantos === 0) {
        arrastre = null;
        var L = hist.lienzos[hist.actual];
        if (trazo && L && !trazo.pinto) L.deshacer.pop();
        trazo = null;
      }
    }
    lienzo.addEventListener("pointerup", soltar);
    lienzo.addEventListener("pointercancel", soltar);
    lienzo.addEventListener("contextmenu", function (ev) { ev.preventDefault(); });

    function abrir(i) {
      hist.actual = i;
      vista = { z: 1, x: 0, y: 0 };
      ponerMover(false);
      aplicarVista();
      pestanas.querySelectorAll("button").forEach(function (b) { b.classList.toggle("activa", Number(b.dataset.i) === i); });
      prepararLienzo(i, function (L) { if (hist.actual === i) pintarLienzo(L, lienzo); });
    }

    conImagen.forEach(function (i) {
      var b = el("button", "hist-pestana");
      b.type = "button";
      b.dataset.i = i;
      b.setAttribute("aria-label", "Colorear el cuadro " + (i + 1));
      var im = el("img");
      im.src = imgVineta(i);
      im.alt = "";
      b.appendChild(im);
      b.appendChild(el("span", "hist-num", String(i + 1)));
      b.addEventListener("click", function () { sonido.pieza(); abrir(i); });
      pestanas.appendChild(b);
    });

    COLORES.forEach(function (c, k) {
      var b = el("button", "hist-color" + (c === hist.color ? " activa" : ""));
      b.type = "button";
      b.style.background = c;
      b.setAttribute("aria-label", c === "#ffffff" ? "Borrador (blanco)" : "Color " + (k + 1));
      if (c === "#ffffff") b.textContent = "🧽";
      b.addEventListener("click", function () {
        hist.color = c;
        paleta.querySelectorAll("button").forEach(function (x) { x.classList.toggle("activa", x === b); });
        if (mover) ponerMover(false);
        sonido.tecla(1);
      });
      paleta.appendChild(b);
    });

    var deshacer = el("button", "boton claro", "↩️ Deshacer");
    deshacer.type = "button";
    deshacer.addEventListener("click", function () {
      var L = hist.lienzos[hist.actual];
      if (!L || !L.deshacer.length) return;
      L.color.data.set(L.deshacer.pop());
      pintarLienzo(L, lienzo);
    });
    var listo = el("button", "boton grande", "✅ ¡Terminé!");
    listo.type = "button";
    listo.addEventListener("click", terminarHistorieta);
    herramientas.appendChild(deshacer);
    herramientas.appendChild(listo);

    var mesa = el("div", "hist-mesa");
    mesa.appendChild(pestanas);
    mesa.appendChild(hoja);
    mesa.appendChild(paleta);
    area.appendChild(mesa);
    area.appendChild(herramientas);
    if (conImagen.length) abrir(hist.actual != null && conImagen.indexOf(hist.actual) !== -1 ? hist.actual : conImagen[0]);
  }

  // La hoja final: 4 cuadros con sus globos, en una sola imagen (para imprimir o guardar)
  function envolver(cx, texto, ancho) {
    var palabras = texto.split(" "), lineas = [], linea = "";
    palabras.forEach(function (w) {
      var prueba = linea ? linea + " " + w : w;
      if (cx.measureText(prueba).width > ancho && linea) { lineas.push(linea); linea = w; } else linea = prueba;
    });
    if (linea) lineas.push(linea);
    return lineas;
  }

  function redondo(cx, x, y, w, h, r) {
    cx.beginPath();
    cx.moveTo(x + r, y);
    cx.arcTo(x + w, y, x + w, y + h, r);
    cx.arcTo(x + w, y + h, x, y + h, r);
    cx.arcTo(x, y + h, x, y, r);
    cx.arcTo(x, y, x + w, y, r);
    cx.closePath();
  }

  function armarHoja() {
    var P = 900, M = 36, ARRIBA = 150, ABAJO = 110;
    var c = document.createElement("canvas");
    c.width = P * 2 + M * 3;
    c.height = ARRIBA + P * 2 + M * 3 + ABAJO;
    var cx = c.getContext("2d");
    cx.fillStyle = "#fff";
    cx.fillRect(0, 0, c.width, c.height);
    cx.fillStyle = "#003d24";
    cx.font = "800 96px 'Baloo 2', 'DM Sans', sans-serif";
    cx.textAlign = "center";
    cx.textBaseline = "middle";
    cx.fillText("Mi historieta del 911", c.width / 2, ARRIBA / 2 + 20);

    window.HISTORIETA.forEach(function (v, i) {
      var x = M + (i % 2) * (P + M);
      var y = ARRIBA + M + Math.floor(i / 2) * (P + M);
      var L = hist.lienzos[i];
      if (L) {
        var tmp = document.createElement("canvas");
        tmp.width = tmp.height = TAM;
        pintarLienzo(L, tmp);
        cx.drawImage(tmp, x, y, P, P);
      } else if (imgVineta(i)) {
        try { cx.drawImage(imagenDe(i), x, y, P, P); } catch (e) { /* aún no carga */ }
      } else {
        // Sin dibujo: cuadro para dibujarlo a mano en la hoja
        cx.fillStyle = "#003d24";
        cx.font = "160px sans-serif";
        cx.fillText(v.emoji, x + P / 2, y + P / 2 - 40);
        cx.font = "700 46px 'DM Sans', sans-serif";
        cx.fillText("Dibuja aquí: " + v.que.toLowerCase(), x + P / 2, y + P - 90, P - 60);
      }
      cx.lineWidth = 8;
      cx.strokeStyle = "#003d24";
      cx.strokeRect(x, y, P, P);

      // Número
      cx.fillStyle = "#dd971a";
      cx.beginPath(); cx.arc(x + 52, y + 52, 38, 0, Math.PI * 2); cx.fill();
      cx.fillStyle = "#003d24";
      cx.font = "800 48px 'Baloo 2', sans-serif";
      cx.fillText(String(i + 1), x + 52, y + 56);

      // Globo
      var texto = hist.globos[i];
      if (v.antes) {
        // Globo de la operadora, abajo a la izquierda
        cx.font = "700 38px 'Baloo 2', 'DM Sans', sans-serif";
        var la = envolver(cx, "📞 " + v.antes, 380);
        var aw = Math.max.apply(null, la.map(function (l) { return cx.measureText(l).width; })) + 50;
        var ah = la.length * 46 + 34;
        var ax = x + 30, ay = y + P - ah - 40;
        cx.fillStyle = "#e3f0ff";
        cx.strokeStyle = "#003d24";
        cx.lineWidth = 5;
        redondo(cx, ax, ay, aw, ah, 26);
        cx.fill(); cx.stroke();
        cx.fillStyle = "#003d24";
        la.forEach(function (l, k) { cx.fillText(l, ax + aw / 2, ay + 40 + k * 46); });
      }
      if (texto) {
        var largo = texto.length > 55;
        var tl = largo ? 40 : 46, al = largo ? 48 : 54;
        cx.font = "800 " + tl + "px 'Baloo 2', 'DM Sans', sans-serif";
        var lineas = envolver(cx, texto, largo ? 500 : 400);
        var gw = Math.min(largo ? 560 : 460, Math.max.apply(null, lineas.map(function (l) { return cx.measureText(l).width; })) + 60);
        var gh = lineas.length * al + 40;
        var gx = x + P - gw - 30, gy = y + 30;
        cx.fillStyle = "#fff";
        cx.strokeStyle = "#003d24";
        cx.lineWidth = 6;
        redondo(cx, gx, gy, gw, gh, 34);
        cx.fill(); cx.stroke();
        cx.beginPath();
        cx.moveTo(gx + gw * 0.55, gy + gh - 3);
        cx.lineTo(gx + gw * 0.62, gy + gh + 50);
        cx.lineTo(gx + gw * 0.74, gy + gh - 3);
        cx.fill(); cx.stroke();
        cx.fillRect(gx + gw * 0.55 + 4, gy + gh - 8, gw * 0.19 - 8, 8);
        cx.fillStyle = "#003d24";
        lineas.forEach(function (l, k) { cx.fillText(l, gx + gw / 2, gy + 20 + al / 2 + 4 + k * al); });
      }
    });

    // Para escribir a mano (el juego no pide el nombre)
    cx.textAlign = "left";
    cx.fillStyle = "#003d24";
    cx.font = "700 46px 'DM Sans', sans-serif";
    var py = c.height - ABAJO / 2;
    cx.fillText("Hecha por:", M, py);
    cx.lineWidth = 4;
    cx.beginPath(); cx.moveTo(M + 260, py + 22); cx.lineTo(c.width - M, py + 22); cx.stroke();
    return c.toDataURL("image/png");
  }

  function terminarHistorieta() {
    var url = armarHoja();
    $("hist-resultado").src = url;
    $("hist-guardar").href = url;
    mostrar("historieta-lista");
    sonido.fiesta();
    hablar("¡Tu historieta está lista! Imprímela o guárdala. Luego recoge tu medalla");
  }

  $("hist-imprimir").addEventListener("click", function () {
    document.body.classList.add("imprime-historieta");
    window.print();
  });
  window.addEventListener("afterprint", function () { document.body.classList.remove("imprime-historieta"); });
  $("hist-volver").addEventListener("click", function () { mostrar("historieta"); colorear(); });
  $("hist-medalla").addEventListener("click", function () {
    ganar("historieta", "Ordenaste la historia y elegiste " + hist.bienGlobos + " de " + window.HISTORIETA.length + " globos a la primera");
  });

  // ---------- Misión 2: ¿Es emergencia? ----------
  var m1 = { situaciones: [], i: 0, estrellas: 0 };
  var sinImagen = {};

  function misionEmergencia() {
    var n = window.SITUACIONES_POR_PARTIDA || 8;
    var si = revolver(window.ESCENAS.filter(function (e) { return e.emergencia; })).slice(0, Math.ceil(n / 2));
    var no = revolver(window.ESCENAS.filter(function (e) { return !e.emergencia; })).slice(0, Math.floor(n / 2));
    m1 = { situaciones: revolver(si.concat(no)), i: 0, estrellas: 0 };
    pintarEstrellas();
    mostrar("emergencia");
    situacion();
  }

  function pintarEstrellas() {
    var caja = $("estrellas");
    var total = m1.situaciones.length;
    caja.innerHTML = "";
    for (var i = 0; i < total; i++) caja.appendChild(el("span", "estrella" + (i < m1.estrellas ? " llena" : ""), "★"));
    caja.setAttribute("aria-label", m1.estrellas + " estrellas de " + total);
  }

  function situacion() {
    var e = m1.situaciones[m1.i];
    var img = $("escena-img");
    var emoji = $("escena-emoji");
    emoji.textContent = e.emoji;
    img.alt = e.frase;
    img.hidden = true;
    emoji.hidden = false;
    if (!sinImagen[e.id]) {
      img.onload = function () { img.hidden = false; emoji.hidden = true; };
      img.onerror = function () { sinImagen[e.id] = true; };
      img.src = "img/" + e.id + ".webp";
    }
    $("frase").textContent = e.frase;
    $("avance1").style.width = (m1.i / m1.situaciones.length) * 100 + "%";
    $("decide").hidden = false;
    $("decide").querySelectorAll("button").forEach(function (b) { b.disabled = false; });
    $("respuesta").hidden = true;
    $("tarjeta").classList.remove("acierto", "fallo");
    hablar(e.frase + ". ¿Llamas al 911?");
  }

  function responder(diceQueSi) {
    var e = m1.situaciones[m1.i];
    var bien = diceQueSi === e.emergencia;
    $("decide").querySelectorAll("button").forEach(function (b) { b.disabled = true; });
    if (bien) { m1.estrellas++; sonido.bien(); } else { sonido.casi(); }
    pintarEstrellas();
    var veredicto = (bien ? "¡Muy bien! " : "¡Casi! ") + (e.emergencia ? "Sí es emergencia" : "No es emergencia");
    $("veredicto").textContent = veredicto;
    $("porque").textContent = e.porque;
    $("respuesta").hidden = false;
    $("respuesta").className = "respuesta " + (bien ? "es-bien" : "es-casi");
    $("tarjeta").classList.add(bien ? "acierto" : "fallo");
    $("decide").hidden = true;
    hablar(veredicto + ". " + e.porque);
    $("siguiente").focus();
  }

  $("decide").addEventListener("click", function (ev) {
    var b = ev.target.closest("button");
    if (b && !b.disabled) responder(b.dataset.respuesta === "si");
  });
  $("siguiente").addEventListener("click", function () {
    m1.i++;
    if (m1.i < m1.situaciones.length) situacion();
    else ganar("emergencia", "Acertaste " + m1.estrellas + " de " + m1.situaciones.length);
  });
  $("repetir").addEventListener("click", function () {
    var e = m1.situaciones[m1.i];
    if (!$("respuesta").hidden) hablar($("veredicto").textContent + ". " + e.porque);
    else hablar(e.frase + ". ¿Llamas al 911?");
  });

  // ---------- La casa de un personaje: dónde se ven las pistas de su dirección ----------
  function casaHTML(p, tapada) {
    var c = el("div", "casa-escena" + (tapada ? " tapada" : ""));
    c.setAttribute("role", "img");
    c.setAttribute("aria-label", tapada ? "La casa está tapada" :
      "Casa de " + p.nombre + ": " + p.calle + ", número " + p.numero + ", " + p.colonia + ", " + p.cerca);
    var calle = el("div", "letrero-calle"); calle.appendChild(el("span", "", p.calle));
    var colonia = el("div", "letrero-colonia", p.colonia);
    var casa = el("div", "casa-dibujo");
    casa.appendChild(el("span", "casa-emoji", "🏠"));
    casa.appendChild(el("span", "placa", p.numero));
    var cerca = el("div", "cerca-item");
    cerca.appendChild(el("span", "cerca-emoji", p.cercaEmoji));
    cerca.appendChild(el("small", "", p.cerca));
    var nino = el("div", "nino");
    nino.appendChild(el("span", "nino-cara", p.cara));
    nino.appendChild(el("b", "", p.nombre));
    [colonia, calle, casa, nino, cerca].forEach(function (n) { n.setAttribute("aria-hidden", "true"); c.appendChild(n); });
    if (tapada) {
      var tapa = el("div", "tapa");
      tapa.appendChild(el("span", "", "🙈"));
      tapa.appendChild(el("b", "", "¡De memoria!"));
      c.appendChild(tapa);
    }
    return c;
  }

  // ---------- Armador de dirección: piezas que se tocan en orden ----------
  // faltan: claves que el niño debe poner. Las demás salen ya puestas.
  function armador(caja, p, faltan, aviso, alTerminar) {
    caja.innerHTML = "";
    var partes = window.PARTES_DIRECCION;
    var otros = window.PERSONAJES.filter(function (x) { return x.id !== p.id; });
    var raiz = el("div", "armador");
    var ranuras = el("ol", "ranuras");
    var huecos = [];
    partes.forEach(function (parte) {
      var li = el("li", "ranura");
      li.appendChild(el("span", "r-ico", parte.emoji));
      var cuerpo = el("span", "r-cuerpo");
      cuerpo.appendChild(el("small", "", parte.etiqueta));
      var valor = el("b", "r-valor");
      cuerpo.appendChild(valor);
      li.appendChild(cuerpo);
      if (faltan.indexOf(parte.clave) === -1) { valor.textContent = p[parte.clave]; li.classList.add("puesta"); }
      else { valor.textContent = "?"; li.classList.add("vacia"); huecos.push({ parte: parte, li: li, valor: valor }); }
      ranuras.appendChild(li);
    });
    raiz.appendChild(ranuras);

    // Piezas: las buenas, una parecida de otro personaje por cada hueco y una que no sirve
    var piezas = huecos.map(function (h) { return { texto: p[h.parte.clave], buena: true }; });
    huecos.forEach(function (h) { piezas.push({ texto: azar(otros)[h.parte.clave], otra: h.parte.etiqueta }); });
    piezas.push({ texto: azar(window.PIEZAS_TRAMPA), trampa: true });
    // Trampas propias del lugar (p. ej. el número de tu casa cuando hay que dar la del vecino)
    (p.trampas || []).forEach(function (t) { piezas.unshift({ texto: t.texto, msg: t.msg }); });
    var vistos = {};
    piezas = piezas.filter(function (x) { if (vistos[x.texto]) return false; vistos[x.texto] = true; return true; });

    var bandeja = el("div", "piezas");
    var siguiente = 0;
    var errores = 0;
    revolver(piezas).forEach(function (pz) {
      var b = el("button", "pieza", pz.texto);
      b.type = "button";
      b.addEventListener("click", function () {
        var h = huecos[siguiente];
        if (!h) return;
        if (pz.texto === p[h.parte.clave]) {
          sonido.pieza();
          h.valor.textContent = pz.texto;
          h.li.classList.remove("vacia");
          h.li.classList.add("puesta", "recien");
          b.disabled = true;
          b.classList.add("usada");
          siguiente++;
          aviso.textContent = "";
          aviso.className = "aviso";
          if (siguiente < huecos.length) {
            huecos[siguiente].li.classList.add("toca");
          } else {
            sonido.bien();
            alTerminar(errores);
          }
          h.li.classList.remove("toca");
        } else {
          errores++;
          sonido.casi();
          sacudir(b);
          var msg = pz.msg ? pz.msg
            : pz.trampa
            ? "\"" + pz.texto + "\" no le dice a nadie dónde estás"
            : pz.buena ? "Ese va después. Ahora va: " + h.parte.etiqueta.toLowerCase()
            : "Esa no es de " + p.nombre + ". Fíjate bien";
          aviso.textContent = msg;
          aviso.className = "aviso es-casi";
          hablar(msg);
        }
      });
      bandeja.appendChild(b);
    });
    if (huecos[0]) huecos[0].li.classList.add("toca");
    raiz.appendChild(bandeja);
    caja.appendChild(raiz);
  }

  function direccionEnVoz(p) {
    return p.calle + ", número " + p.numero + ", " + p.colonia + ", " + p.cerca.toLowerCase();
  }

  // ---------- Misión 3: Arma la dirección ----------
  var m2 = { personajes: [], i: 0, fase: 0, errores: 0 };

  function misionDireccion() {
    m2 = { personajes: revolver(window.PERSONAJES).slice(0, 2), i: 0, fase: 0, errores: 0 };
    mostrar("direccion");
    rondaDireccion();
  }

  function rondaDireccion() {
    var p = m2.personajes[m2.i];
    var deMemoria = m2.fase === 1;
    $("dir-ronda").textContent = (m2.i * 2 + m2.fase + 1) + " de " + m2.personajes.length * 2;
    $("dir-casa").innerHTML = "";
    $("dir-casa").appendChild(casaHTML(p, deMemoria));
    var faltan = deMemoria
      ? revolver(window.PARTES_DIRECCION.map(function (x) { return x.clave; })).slice(0, 2)
      : window.PARTES_DIRECCION.map(function (x) { return x.clave; });
    var texto = deMemoria
      ? "¿Te acuerdas? Pon lo que falta en la dirección de " + p.nombre
      : p.nombre + " necesita decir dónde vive. Busca las pistas en su casa y arma su dirección";
    $("dir-instruccion").textContent = texto;
    $("dir-aviso").textContent = "";
    $("dir-aviso").className = "aviso";
    $("dir-repetir").onclick = function () { hablar(texto); };
    armador($("dir-armador"), p, faltan, $("dir-aviso"), function (errores) {
      m2.errores += errores;
      $("dir-aviso").textContent = "¡Bien! " + p.nombre + " vive en " + direccionEnVoz(p);
      $("dir-aviso").className = "aviso es-bien";
      hablar("¡Muy bien! " + p.nombre + " vive en " + direccionEnVoz(p));
      setTimeout(function () {
        if (m2.fase === 0) m2.fase = 1;
        else { m2.fase = 0; m2.i++; }
        if (m2.i < m2.personajes.length) rondaDireccion();
        else ganar("direccion", m2.errores === 0 ? "¡Sin un solo error!" : "Armaste " + m2.personajes.length * 2 + " direcciones");
      }, 3800);
    });
    hablar(texto);
  }

  // ---------- Teclado de teléfono (se usa para el número de mamá y para el 911) ----------
  function grupos(numero) {
    if (numero.length === 10) return [numero.slice(0, 3), numero.slice(3, 6), numero.slice(6)];
    return [numero];
  }
  function formato(marcado, total) {
    if (total === 10) {
      var g = [marcado.slice(0, 3), marcado.slice(3, 6), marcado.slice(6)];
      return g.filter(Boolean).join(" ");
    }
    return marcado.split("").join(" ");
  }

  var tecladoActivo = null;

  // cfg: objetivo, prefijo, conPista (dice qué número sigue), alLlamar
  function teclado(caja, cfg) {
    caja.innerHTML = "";
    var tel = el("div", "telefono");
    var pantalla = el("output", "pantallita" + (cfg.objetivo.length > 4 ? " largo" : ""));
    pantalla.setAttribute("aria-live", "polite");
    pantalla.setAttribute("aria-label", "Número marcado");
    var pista = el("p", "pista");
    var grid = el("div", "teclado");
    var teclas = {};
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "borrar", "0", "llamar"].forEach(function (k) {
      var b = el("button");
      b.type = "button";
      if (k === "borrar") { b.className = "borrar"; b.textContent = "⌫"; b.setAttribute("aria-label", "Borrar"); }
      else if (k === "llamar") {
        b.className = "llamar";
        b.setAttribute("aria-label", "Llamar");
        b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.4 11.4 0 00.6 3.6 1 1 0 01-.25 1z"/></svg>';
      } else b.textContent = k;
      teclas[k] = b;
      grid.appendChild(b);
    });
    tel.appendChild(pantalla);
    tel.appendChild(pista);
    tel.appendChild(grid);
    caja.appendChild(tel);

    var marcado = cfg.prefijo || "";
    var errores = 0;
    var listo = false;

    function pintar(texto) {
      pantalla.textContent = formato(marcado, cfg.objetivo.length);
      var completo = marcado === cfg.objetivo;
      teclas.llamar.classList.toggle("listo", completo);
      pista.classList.remove("error");
      if (texto) pista.textContent = texto;
      else if (completo) pista.textContent = "¡Ahora toca el botón verde!";
      else if (cfg.conPista) pista.textContent = "Marca el " + cfg.objetivo[marcado.length];
      else pista.textContent = cfg.textoMemoria || "Marca de memoria";
    }
    function error(msg) {
      errores++;
      pista.textContent = msg;
      pista.classList.add("error");
      sacudir(grid);
      hablar(msg);
    }
    function tocar(k) {
      if (listo) return;
      if (k === "borrar") {
        if (marcado.length > (cfg.prefijo || "").length) marcado = marcado.slice(0, -1);
        pintar();
        return;
      }
      if (k === "llamar") {
        if (marcado !== cfg.objetivo) { error("Primero termina de marcar"); return; }
        listo = true;
        callar();
        teclas.llamar.classList.remove("listo");
        teclas.llamar.classList.add("sonando");
        pista.textContent = "Llamando…";
        sonido.timbre(2);
        setTimeout(function () { teclas.llamar.classList.remove("sonando"); cfg.alLlamar(errores); }, 2300);
        return;
      }
      sonido.tecla(k);
      if (marcado.length >= cfg.objetivo.length) return;
      if (k !== cfg.objetivo[marcado.length]) {
        error(cfg.conPista ? "Busca el " + cfg.objetivo[marcado.length] : "Ese no es. Toca la pista si no te acuerdas");
        return;
      }
      marcado += k;
      pintar();
      if (marcado === cfg.objetivo) hablar("¡Ahora toca el botón verde para llamar!");
    }
    grid.addEventListener("click", function (ev) {
      var b = ev.target.closest("button");
      if (!b) return;
      for (var k in teclas) if (teclas[k] === b) tocar(k);
    });
    pintar();

    var control = {
      tocar: tocar,
      siguiente: function () { return cfg.objetivo[marcado.length]; },
      mostrarPista: function () {
        var d = cfg.objetivo[marcado.length];
        if (!d) return;
        errores++;
        pintar("El que sigue es el " + d);
        hablar("El que sigue es el " + d);
      },
    };
    tecladoActivo = control;
    return control;
  }

  // Teclado físico
  document.addEventListener("keydown", function (ev) {
    if (!tecladoActivo || pantallaActual !== "marcar") return;
    var enBoton = document.activeElement && document.activeElement.tagName === "BUTTON";
    if (/^[0-9]$/.test(ev.key)) { ev.preventDefault(); tecladoActivo.tocar(ev.key); }
    else if (ev.key === "Backspace") { ev.preventDefault(); tecladoActivo.tocar("borrar"); }
    else if (ev.key === "Enter" && !enBoton) { ev.preventDefault(); tecladoActivo.tocar("llamar"); }
  });

  // ---------- Misión 4: la llamada al 911 ----------
  var m4 = { p: null, preguntas: [], paso: 0, bien: 0 };
  var reloj = null;
  var segundos = 0;

  function misionLlamada() {
    var p = azar(window.PERSONAJES);
    m4.timers && m4.timers.forEach(clearTimeout);
    var h = azar(window.HISTORIAS);
    m4 = { p: p, h: h, preguntas: h.preguntas(p), paso: 0, bien: 0, timers: [], reglaDeOro: false };
    var caso = "Eres " + p.nombre + ". " + h.caso(p) + ".";
    // 1) Celular bloqueado: hay que encontrar el botón "Emergencia"
    $("bloq-emoji").textContent = h.emoji;
    $("bloq-texto").textContent = caso;
    $("bloq-aviso").textContent = "";
    $("bloq-aviso").className = "aviso";
    var ahora = new Date();
    $("cel-hora").textContent = ahora.getHours() + ":" + (ahora.getMinutes() < 10 ? "0" : "") + ahora.getMinutes();
    $("cel-fecha").textContent = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][ahora.getDay()];
    contrasena = "";
    pintarPuntos();
    mostrar("bloqueado");
    hablar(caso + " Toma el celular de la casa. Tiene contraseña y no te la sabes. ¿Cómo llamas?");
  }

  // Pantalla bloqueada: los números de la contraseña no sirven, "Emergencia" sí
  var contrasena = "";
  function pintarPuntos() {
    document.querySelectorAll(".cel-puntos span").forEach(function (s, i) { s.classList.toggle("lleno", i < contrasena.length); });
  }
  function pistaBloqueo() {
    var msg = "No sabes la contraseña. Busca el botón que dice Emergencia";
    $("bloq-aviso").textContent = msg;
    $("bloq-aviso").className = "aviso es-casi";
    $("cel-emergencia").classList.add("brilla");
    hablar(msg);
  }
  $("cel-teclas").addEventListener("click", function (ev) {
    var b = ev.target.closest("button");
    if (!b) return;
    sonido.tecla(b.textContent.trim());
    contrasena += b.textContent.trim();
    pintarPuntos();
    if (contrasena.length >= 4) {
      sacudir($("celular"));
      sonido.casi();
      contrasena = "";
      setTimeout(pintarPuntos, 350);
      pistaBloqueo();
    }
  });
  $("cel-cancelar").addEventListener("click", pistaBloqueo);
  $("cel-emergencia").addEventListener("click", function () {
    $("cel-emergencia").classList.remove("brilla");
    sonido.bien();
    // 2) Marcador de emergencia: se marca el 911 aunque el celular esté bloqueado
    $("caso-emoji").textContent = m4.h.emoji;
    $("caso-texto").textContent = "¡Bien! Así se llama aunque el celular esté bloqueado. Ahora marca el 911";
    mostrar("marcar");
    hablar("¡Muy bien! Con el botón Emergencia puedes llamar aunque el celular esté bloqueado. Ahora marca el 9 1 1");
    teclado($("marcar-teclado"), { objetivo: "911", conPista: true, alLlamar: function () { respirar(empezarLlamada); } });
  });

  // 3) Pausa de calma mientras contestan
  function respirar(despues) {
    mostrar("respira");
    var burbuja = $("burbuja-aire");
    var texto = $("respira-texto");
    burbuja.className = "burbuja-aire";
    m4.timers.push(setTimeout(function () { burbuja.className = "burbuja-aire inhala"; }, 60));
    texto.textContent = "Inhala…";
    hablar("Mientras contestan, respira. Inhala…");
    m4.timers.push(setTimeout(function () {
      burbuja.className = "burbuja-aire exhala";
      texto.textContent = "Exhala…";
      hablar("Exhala…");
    }, 2200));
    m4.timers.push(setTimeout(function () {
      texto.textContent = "¡Contestaron!";
      sonido.pieza();
    }, 4400));
    m4.timers.push(setTimeout(despues, 5200));
  }

  function empezarLlamada() {
    segundos = 0;
    $("reloj").textContent = "00:00";
    clearInterval(reloj);
    reloj = setInterval(function () {
      segundos++;
      var m = Math.floor(segundos / 60), s = segundos % 60;
      $("reloj").textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);
    $("t-n3").textContent = "Eres " + m4.p.cara + " " + m4.p.nombre;
    var pasos = $("pasos");
    pasos.innerHTML = "";
    m4.preguntas.forEach(function () { pasos.appendChild(el("span")); });
    mostrar("llamada");
    preguntar();
  }

  function preguntar() {
    var q = m4.preguntas[m4.paso];
    $("pregunta").textContent = q.pregunta;
    $("aviso").textContent = "";
    $("aviso").className = "aviso";
    $("pasos").querySelectorAll("span").forEach(function (s, i) {
      s.className = i < m4.paso ? "hecho" : i === m4.paso ? "ahora" : "";
    });
    var opciones = $("opciones");
    var arm = $("llamada-armador");
    opciones.innerHTML = "";
    arm.innerHTML = "";
    $("espera").hidden = true;
    hablar(q.pregunta + (q.ayuda ? " " + q.ayuda : ""));

    if (q.colgar) { esperarEnLinea(q); return; }

    if (q.direccion) {
      // La dirección que se da puede no ser la casa del personaje (p. ej. la del vecino)
      var donde = m4.h.lugar ? m4.h.lugar(m4.p) : m4.p;
      $("tu-turno").textContent = q.ayuda || "Arma tu dirección, pieza por pieza:";
      // La casa siempre a la vista, para buscar ahí las pistas de la dirección
      if (q.casaTitulo) arm.appendChild(el("p", "mini-casa-titulo", q.casaTitulo));
      var casa = el("div", "mini-casa");
      casa.appendChild(casaHTML(donde, false));
      arm.appendChild(casa);
      var lugar = el("div");
      arm.appendChild(lugar);
      armador(lugar, donde, window.PARTES_DIRECCION.map(function (x) { return x.clave; }), $("aviso"), function (errores) {
        if (errores === 0) m4.bien++;
        $("aviso").textContent = "¡Bien dicho!";
        $("aviso").className = "aviso es-bien";
        hablar(direccionEnVoz(donde));
        setTimeout(avanzar, 3200);
      });
      return;
    }

    $("tu-turno").textContent = "Tú dices…";
    var primerIntento = true;
    revolver(q.opciones).forEach(function (o) {
      var b = el("button", "opcion");
      b.type = "button";
      b.appendChild(el("span", "ico", o.emoji)).setAttribute("aria-hidden", "true");
      b.appendChild(el("span", "txt", o.texto));
      b.addEventListener("click", function () {
        if (o.bien) {
          if (primerIntento) m4.bien++;
          sonido.bien();
          b.classList.add("correcta");
          opciones.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
          $("aviso").textContent = "¡Bien dicho!";
          $("aviso").className = "aviso es-bien";
          hablar(o.texto);
          setTimeout(avanzar, 1800);
        } else {
          primerIntento = false;
          sonido.casi();
          b.classList.add("incorrecta");
          b.disabled = true;
          $("aviso").textContent = o.pista;
          $("aviso").className = "aviso es-casi";
          hablar(o.pista);
        }
      });
      opciones.appendChild(b);
    });
  }

  // 4) Regla de oro: el botón de colgar está ahí, pero solo se cuelga cuando la operadora lo dice
  function esperarEnLinea(q) {
    var permiso = false;
    var colgoAntes = false;
    var espera = $("espera");
    var boton = $("colgar");
    $("tu-turno").textContent = "Escucha a la operadora…";
    espera.hidden = false;
    espera.classList.remove("permiso");
    $("pregunta").textContent = q.pregunta;
    var frases = m4.h.espera;
    var t = 3200;
    frases.forEach(function (frase, i) {
      m4.timers.push(setTimeout(function () {
        $("pregunta").textContent = frase;
        if (i === frases.length - 1) {
          permiso = true;
          espera.classList.add("permiso");
          $("aviso").textContent = "Ahora sí: toca el botón rojo para colgar";
          $("aviso").className = "aviso es-bien";
        }
        if (i === frases.length - 2) sonido.sirena();
        hablar(frase);
      }, t));
      t += 3400;
    });
    boton.onclick = function () {
      if (!permiso) {
        colgoAntes = true;
        sonido.casi();
        sacudir(boton);
        var msg = "¡Todavía no! Si cuelgas, la operadora ya no te puede ayudar. Espera a que te diga";
        $("aviso").textContent = msg;
        $("aviso").className = "aviso es-casi";
        hablar(msg);
        return;
      }
      boton.onclick = null;
      espera.hidden = true;
      m4.reglaDeOro = !colgoAntes;
      if (m4.reglaDeOro) {
        m4.bien++;
        sonido.fiesta();
        $("aviso").textContent = "⭐ ¡Regla de oro! Esperaste hasta que te dijeron";
        $("aviso").className = "aviso es-bien";
        hablar("¡Regla de oro! Esperaste hasta que te dijeron que podías colgar");
      } else {
        sonido.bien();
        $("aviso").textContent = "Colgaste a tiempo. La próxima, espera desde el principio";
        $("aviso").className = "aviso es-bien";
      }
      m4.timers.push(setTimeout(avanzar, 2400));
    };
  }

  function avanzar() {
    m4.paso++;
    if (m4.paso < m4.preguntas.length) { preguntar(); return; }
    clearInterval(reloj);
    $("llega-texto").textContent = m4.h.llega(m4.p);
    document.querySelector(".calle .ambulancia").textContent = m4.h.ayuda;
    mostrar("llega");
    sonido.sirena();
    hablar("¡La ayuda llegó! Hiciste una llamada de héroe.");
  }
  $("llega-seguir").addEventListener("click", function () {
    var total = m4.preguntas.length;
    ganar("llamada", "Contestaste " + m4.bien + " de " + total + " a la primera" + (m4.reglaDeOro ? " · ⭐ Regla de oro" : ""));
  });
  $("repetir-op").addEventListener("click", function () { hablar($("pregunta").textContent); });

  // ---------- Tarjeta de héroe (para imprimir en blanco) ----------
  var volverDeTarjeta = "mapa";
  function abrirTarjeta() {
    volverDeTarjeta = pantallaActual;
    mostrar("tarjeta");
    hablar("Imprime tu tarjeta de héroe y llénala a mano, en casa, con tu familia.");
  }
  $("abrir-tarjeta").addEventListener("click", abrirTarjeta);
  $("final-tarjeta").addEventListener("click", abrirTarjeta);
  $("imprimir").addEventListener("click", function () { window.print(); });
  $("tarjeta-volver").addEventListener("click", function () {
    if (volverDeTarjeta === "final") mostrar("final"); else irAlMapa();
  });
  $("final-mapa").addEventListener("click", irAlMapa);

  // ---------- Inicio ----------
  $("empezar").addEventListener("click", function () { ctx(); irAlMapa(); });
})();
