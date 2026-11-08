import { onBeforeUnmount, onMounted } from "vue";

// Escena en <canvas>: { init(w, h), step(dt, t), draw(ctx, w, h, t) }.
// Se pausa fuera de pantalla, con motion-off y con reducir movimiento.
export function motionAllowed() {
  if (typeof window === "undefined") return false;
  const reduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  )?.matches;
  return !reduced && !document.documentElement.classList.contains("motion-off");
}

export function useCanvasScene(canvasRef, createScene, { warmup = 3 } = {}) {
  let ctx = null;
  let scene = null;
  let frame = 0;
  let last = 0;
  let time = 0;
  let width = 0;
  let height = 0;
  let visible = false;
  let resizeObserver = null;
  let intersectionObserver = null;
  let classObserver = null;

  function resize() {
    const canvas = canvasRef.value;
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scene = createScene();
    scene.init(width, height);
    // Simula unos segundos para no arrancar con la escena vacía.
    for (let i = 0; i < warmup * 30; i += 1) {
      time += 1 / 30;
      scene.step(1 / 30, time, width, height);
    }
    render();
  }

  function render() {
    if (!ctx || !scene) return;
    ctx.clearRect(0, 0, width, height);
    scene.draw(ctx, width, height, time);
  }

  function loop(now) {
    frame = 0;
    if (!visible || !scene) return;
    const dt = Math.min((now - (last || now)) / 1000, 1 / 20);
    last = now;
    if (motionAllowed()) {
      time += dt;
      scene.step(dt, time, width, height);
      render();
    }
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (!frame) {
      last = 0;
      frame = requestAnimationFrame(loop);
    }
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  onMounted(() => {
    const canvas = canvasRef.value;
    if (!canvas) return;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      ctx = null;
    }
    if (!ctx) return;
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    intersectionObserver = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible) start();
      else stop();
    });
    intersectionObserver.observe(canvas);
    classObserver = new MutationObserver(render);
    classObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  });

  onBeforeUnmount(() => {
    stop();
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    classObserver?.disconnect();
  });
}

export const rand = (min, max) => min + Math.random() * (max - min);
export const pick = (list) => list[Math.floor(Math.random() * list.length)];
export function smoothNoise(t, seed = 0) {
  return (
    Math.sin(t * 0.9 + seed) * 0.5 +
    Math.sin(t * 2.3 + seed * 1.7) * 0.3 +
    Math.sin(t * 5.1 + seed * 2.9) * 0.2
  );
}
