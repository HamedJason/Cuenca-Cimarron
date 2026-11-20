<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { motionAllowed } from "../composables/useCanvasScene";

// Línea de agua bajo el encabezado. El trazo se calcula al ancho real en cada cuadro
// (nada se estira ni se escala), así se ve nítido en cualquier pantalla y zoom.
// Son dos ondas que corren a distinta velocidad y en sentido contrario, y su altura sube y baja:
// la forma cambia todo el tiempo, como el agua.
const H = 12;
const BASE = 7;
const wrap = ref(null);
const line = ref(null);
const fill = ref(null);
const svg = ref(null);
let width = 0;
let frame = 0;
let observer = null;
let classObserver = null;
let media = null;
let start = 0;

function shape(t) {
  const a1 = 2.4 + 0.9 * Math.sin(t * 0.55);
  const a2 = 1.3 + 0.6 * Math.sin(t * 0.37 + 1.7);
  const k1 = (Math.PI * 2) / 520;
  const k2 = (Math.PI * 2) / 290;
  const step = 8;
  let d = "";
  for (let x = 0; x <= width + step; x += step) {
    const y = BASE + a1 * Math.sin(k1 * (x - 58 * t)) + a2 * Math.sin(k2 * (x + 31 * t) + 0.8);
    d += `${d ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(2)}`;
  }
  return d;
}

function draw(t) {
  if (!width || !line.value) return;
  const d = shape(t);
  line.value.setAttribute("d", d);
  fill.value.setAttribute("d", `M0 0${d.replace(/^M/, "L")}L${width + 8} 0Z`);
}

function tick(now) {
  draw((now - start) / 1000);
  frame = requestAnimationFrame(tick);
}

function sync() {
  if (typeof requestAnimationFrame !== "function") return draw(0);
  cancelAnimationFrame(frame);
  frame = 0;
  if (motionAllowed()) frame = requestAnimationFrame(tick);
  else draw(0);
}

function resize() {
  width = Math.ceil(wrap.value.getBoundingClientRect().width);
  svg.value.setAttribute("viewBox", `0 0 ${width} ${H}`);
  svg.value.setAttribute("width", width);
  if (!width) return;
  draw(frame ? (performance.now() - start) / 1000 : 0);
}

onMounted(() => {
  start = performance.now();
  // Sin ResizeObserver (navegadores muy viejos) se mide una vez y al cambiar el tamaño de la ventana
  if ("ResizeObserver" in window) {
    observer = new ResizeObserver(resize);
    observer.observe(wrap.value);
  } else {
    window.addEventListener("resize", resize);
  }
  resize();
  classObserver = new MutationObserver(sync);
  classObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  media?.addEventListener?.("change", sync);
  sync();
});

onBeforeUnmount(() => {
  if (frame) cancelAnimationFrame(frame);
  observer?.disconnect();
  window.removeEventListener("resize", resize);
  classObserver?.disconnect();
  media?.removeEventListener?.("change", sync);
});
</script>

<template>
  <div ref="wrap" class="header-wave-wrap" aria-hidden="true">
    <svg ref="svg" class="header-wave" :height="H" preserveAspectRatio="none">
      <path ref="fill" class="hw-fill" />
      <path ref="line" class="hw-front" />
    </svg>
  </div>
</template>
