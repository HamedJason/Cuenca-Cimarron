<script setup>
// Los objetos de la lista caen dentro de la mochila; se dibujan entre la
// parte de atrás y el frente para que parezca que entran.
import { ref } from "vue";
import { useCanvasScene, rand } from "../composables/useCanvasScene";

const canvas = ref(null);

const shapes = {
  bottle(ctx, s) {
    ctx.fillStyle = "rgba(120,190,255,0.85)";
    ctx.beginPath();
    ctx.roundRect(-s * 0.22, -s * 0.36, s * 0.44, s * 0.82, s * 0.12);
    ctx.fill();
    ctx.fillStyle = "#1e6fd9";
    ctx.fillRect(-s * 0.22, -s * 0.02, s * 0.44, s * 0.48);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-s * 0.22, s * 0.06, s * 0.44, s * 0.16);
    ctx.fillStyle = "#0b4fa8";
    ctx.beginPath();
    ctx.roundRect(-s * 0.12, -s * 0.5, s * 0.24, s * 0.16, 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(-s * 0.15, -s * 0.3, s * 0.06, s * 0.6);
  },
  can(ctx, s) {
    ctx.fillStyle = "#b8c2c8";
    ctx.fillRect(-s * 0.26, -s * 0.3, s * 0.52, s * 0.6);
    ctx.fillStyle = "#d9480f";
    ctx.fillRect(-s * 0.26, -s * 0.18, s * 0.52, s * 0.36);
    ctx.fillStyle = "#ffd8a8";
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dfe5e8";
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.3, s * 0.26, s * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9aa5ab";
    ctx.beginPath();
    ctx.ellipse(0, s * 0.3, s * 0.26, s * 0.08, 0, 0, Math.PI);
    ctx.fill();
  },
  firstaid(ctx, s) {
    ctx.strokeStyle = "#b3121f";
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.roundRect(-s * 0.14, -s * 0.38, s * 0.28, s * 0.16, 3);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#d9dfe2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-s * 0.4, -s * 0.28, s * 0.8, s * 0.58, s * 0.1);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#d62828";
    ctx.fillRect(-s * 0.06, -s * 0.2, s * 0.12, s * 0.42);
    ctx.fillRect(-s * 0.21, -s * 0.05, s * 0.42, s * 0.12);
  },
  flashlight(ctx, s, t) {
    ctx.fillStyle = `rgba(255,236,150,${0.35 + Math.sin(t * 12) * 0.08})`;
    ctx.beginPath();
    ctx.moveTo(s * 0.42, -s * 0.12);
    ctx.lineTo(s * 0.95, -s * 0.34);
    ctx.lineTo(s * 0.95, s * 0.34);
    ctx.lineTo(s * 0.42, s * 0.12);
    ctx.fill();
    ctx.fillStyle = "#f2b705";
    ctx.beginPath();
    ctx.roundRect(-s * 0.45, -s * 0.1, s * 0.6, s * 0.2, s * 0.06);
    ctx.fill();
    ctx.fillStyle = "#b07a00";
    ctx.beginPath();
    ctx.moveTo(s * 0.12, -s * 0.12);
    ctx.lineTo(s * 0.42, -s * 0.18);
    ctx.lineTo(s * 0.42, s * 0.18);
    ctx.lineTo(s * 0.12, s * 0.12);
    ctx.fill();
    ctx.fillStyle = "#fff7c2";
    ctx.fillRect(s * 0.4, -s * 0.16, s * 0.05, s * 0.32);
    ctx.fillStyle = "#1c2621";
    ctx.fillRect(-s * 0.2, -s * 0.13, s * 0.1, s * 0.05);
  },
  radio(ctx, s, t) {
    ctx.strokeStyle = "#3d2370";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s * 0.22, -s * 0.24);
    ctx.lineTo(s * 0.4, -s * 0.6);
    ctx.stroke();
    ctx.fillStyle = "#6a3fb5";
    ctx.beginPath();
    ctx.roundRect(-s * 0.42, -s * 0.26, s * 0.84, s * 0.54, s * 0.1);
    ctx.fill();
    ctx.fillStyle = "#3d2370";
    for (let i = 0; i < 3; i += 1)
      for (let j = 0; j < 3; j += 1) {
        ctx.beginPath();
        ctx.arc(-s * 0.26 + i * s * 0.1, -s * 0.1 + j * s * 0.1, s * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.fillStyle = "#f2edff";
    ctx.fillRect(s * 0.04, -s * 0.14, s * 0.3, s * 0.12);
    ctx.fillStyle = "#d62828";
    ctx.fillRect(s * 0.1 + Math.sin(t * 2) * s * 0.08, -s * 0.14, 1.5, s * 0.12);
    ctx.fillStyle = "#f2edff";
    ctx.beginPath();
    ctx.arc(s * 0.22, s * 0.12, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
  },
  docs(ctx, s) {
    ctx.fillStyle = "#ffffff";
    ctx.save();
    ctx.rotate(-0.08);
    ctx.fillRect(-s * 0.28, -s * 0.34, s * 0.56, s * 0.66);
    ctx.strokeStyle = "#9aa7a0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 4; i += 1) {
      ctx.moveTo(-s * 0.18, -s * 0.18 + i * s * 0.12);
      ctx.lineTo(s * 0.18, -s * 0.18 + i * s * 0.12);
    }
    ctx.stroke();
    ctx.fillStyle = "#0f7c86";
    ctx.fillRect(-s * 0.18, -s * 0.3, s * 0.2, s * 0.06);
    ctx.restore();
    ctx.fillStyle = "rgba(180,225,235,0.35)";
    ctx.strokeStyle = "rgba(15,124,134,0.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(-s * 0.36, -s * 0.42, s * 0.72, s * 0.84, s * 0.06);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#0f7c86";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 0.36, -s * 0.34);
    ctx.lineTo(s * 0.36, -s * 0.34);
    ctx.stroke();
  },
  whistle(ctx, s) {
    ctx.fillStyle = "#f76707";
    ctx.beginPath();
    ctx.arc(-s * 0.08, s * 0.04, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-s * 0.08, -s * 0.18, s * 0.46, s * 0.2);
    ctx.fillStyle = "#1c2621";
    ctx.beginPath();
    ctx.arc(-s * 0.08, s * 0.04, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c2410c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-s * 0.36, -s * 0.12, s * 0.1, 0, Math.PI * 2);
    ctx.stroke();
  },
  batteries(ctx, s) {
    for (const dx of [-s * 0.16, s * 0.16]) {
      ctx.fillStyle = "#2b8a3e";
      ctx.fillRect(dx - s * 0.12, -s * 0.3, s * 0.24, s * 0.6);
      ctx.fillStyle = "#1c2621";
      ctx.fillRect(dx - s * 0.12, s * 0.12, s * 0.24, s * 0.18);
      ctx.fillStyle = "#c9d1d4";
      ctx.fillRect(dx - s * 0.05, -s * 0.37, s * 0.1, s * 0.07);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(dx - s * 0.03, -s * 0.16, s * 0.06, s * 0.14);
      ctx.fillRect(dx - s * 0.07, -s * 0.12, s * 0.14, s * 0.06);
    }
  },
  blanket(ctx, s) {
    const colors = ["#3b5bdb", "#5c7cfa", "#3b5bdb"];
    colors.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.roundRect(-s * 0.4, -s * 0.3 + i * s * 0.2, s * 0.8, s * 0.2, s * 0.08);
      ctx.fill();
    });
    ctx.strokeStyle = "#edf2ff";
    ctx.lineWidth = 1.4;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(-s * 0.34, -s * 0.06);
    ctx.lineTo(s * 0.34, -s * 0.06);
    ctx.moveTo(-s * 0.34, s * 0.14);
    ctx.lineTo(s * 0.34, s * 0.14);
    ctx.stroke();
    ctx.setLineDash([]);
  },
};
const kinds = Object.keys(shapes);

function createScene() {
  let W = 0;
  let H = 0;
  let bag = null;
  const items = [];
  let queue = [];
  let nextSpawn = 0.2;
  let squash = 0;
  let squashV = 0;
  let lid = 0;
  let lidV = 0;
  const G = 420;

  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function spawn() {
    if (!queue.length) queue = shuffle(kinds);
    const kind = queue.pop();
    const fromLeft = Math.random() < 0.5;
    const x = fromLeft ? rand(0, W * 0.25) : rand(W * 0.75, W);
    const y = rand(-20, -8);
    const up = rand(30, 110);
    const targetX = bag.cx + rand(-bag.w * 0.2, bag.w * 0.2);
    const targetY = bag.mouth;
    // Velocidad horizontal para que caiga justo en la boca de la mochila.
    const dy = targetY - y;
    const time = (up + Math.sqrt(up * up + 2 * G * dy)) / G;
    items.push({
      kind,
      x,
      y,
      vx: (targetX - x) / time,
      vy: -up,
      a: rand(-0.6, 0.6),
      va: rand(-5, 5),
      size: rand(30, 36),
      inside: false,
    });
  }

  return {
    init(w, h) {
      W = w;
      H = h;
      const bw = Math.min(w * 0.62, 150);
      const bh = h * 0.52;
      bag = {
        cx: w / 2,
        w: bw,
        h: bh,
        bottom: h - 6,
        mouth: h - 6 - bh,
      };
    },

    step(dt) {
      nextSpawn -= dt;
      if (nextSpawn <= 0) {
        spawn();
        nextSpawn = rand(0.7, 1.3);
      }
      for (const it of items) {
        it.vy += G * dt;
        it.x += it.vx * dt;
        it.y += it.vy * dt;
        it.a += it.va * dt;
        if (!it.inside && it.y > bag.mouth && it.vy > 0) {
          it.inside = true;
          it.vx *= 0.2;
          it.va *= 0.4;
          squashV += 1.6 + it.size * 0.02;
          lidV -= 6;
        }
        if (it.inside && it.y > bag.bottom - 10) it.dead = true;
      }
      for (let i = items.length - 1; i >= 0; i -= 1)
        if (items[i].dead) items.splice(i, 1);
      squashV += (-squash * 240 - squashV * 12) * dt;
      squash += squashV * dt;
      lidV += (-lid * 120 - lidV * 7) * dt;
      lid += lidV * dt;
    },

    draw(ctx, w, h, t) {
      const { cx, w: bw, h: bh, bottom, mouth } = bag;
      const drawItem = (it) => {
        ctx.save();
        ctx.translate(it.x, it.y);
        ctx.rotate(it.a);
        shapes[it.kind](ctx, it.size, t);
        ctx.restore();
      };

      ctx.fillStyle = "rgba(0,61,36,0.14)";
      ctx.beginPath();
      ctx.ellipse(cx, bottom + 2, bw * 0.55 * (1 + squash * 0.4), 5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(cx, bottom);
      ctx.scale(1 + squash * 0.35, 1 - squash * 0.5);
      ctx.translate(-cx, -bottom);

      ctx.save();
      ctx.translate(cx, mouth);
      ctx.rotate(-0.12 + lid * 0.04);
      ctx.fillStyle = "#b9780c";
      ctx.beginPath();
      ctx.moveTo(-bw * 0.47, 0);
      ctx.bezierCurveTo(-bw * 0.47, -bh * 0.55, bw * 0.47, -bh * 0.55, bw * 0.47, 0);
      ctx.fill();
      ctx.strokeStyle = "#8a5806";
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(-bw * 0.4, -2);
      ctx.bezierCurveTo(-bw * 0.4, -bh * 0.46, bw * 0.4, -bh * 0.46, bw * 0.4, -2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      ctx.fillStyle = "#5c3a04";
      ctx.beginPath();
      ctx.ellipse(cx, mouth, bw * 0.48, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Los objetos que ya entraron quedan detrás del frente.
      for (const it of items) if (it.inside) drawItem(it);

      ctx.save();
      ctx.translate(cx, bottom);
      ctx.scale(1 + squash * 0.35, 1 - squash * 0.5);
      ctx.translate(-cx, -bottom);
      const left = cx - bw / 2;
      const right = cx + bw / 2;
      const rr = bw * 0.26;
      ctx.fillStyle = "#dd971a";
      ctx.beginPath();
      ctx.moveTo(left, mouth);
      ctx.ellipse(cx, mouth, bw / 2, 11, 0, Math.PI, 0, true);
      ctx.lineTo(right, bottom - rr);
      ctx.quadraticCurveTo(right, bottom, right - rr, bottom);
      ctx.lineTo(left + rr, bottom);
      ctx.quadraticCurveTo(left, bottom, left, bottom - rr);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(120,70,0,0.18)";
      ctx.beginPath();
      ctx.moveTo(right - bw * 0.12, mouth + 9);
      ctx.lineTo(right, mouth);
      ctx.lineTo(right, bottom - rr);
      ctx.quadraticCurveTo(right, bottom, right - rr, bottom);
      ctx.quadraticCurveTo(right - bw * 0.1, bottom - bh * 0.4, right - bw * 0.12, mouth + 9);
      ctx.fill();
      ctx.strokeStyle = "#b9780c";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(cx, mouth, bw / 2 - 2, 10, 0, Math.PI, 0, true);
      ctx.stroke();
      for (const sx of [left + bw * 0.16, right - bw * 0.16 - 9]) {
        ctx.fillStyle = "#003d24";
        ctx.beginPath();
        ctx.roundRect(sx, mouth + 12, 9, bh * 0.5, 3);
        ctx.fill();
        ctx.fillStyle = "#c9d1d4";
        ctx.fillRect(sx - 1.5, mouth + 12 + bh * 0.34, 12, 6);
      }
      const py = bottom - bh * 0.46;
      ctx.fillStyle = "#f1b546";
      ctx.beginPath();
      ctx.roundRect(cx - bw * 0.3, py, bw * 0.6, bh * 0.38, [14, 14, bw * 0.18, bw * 0.18]);
      ctx.fill();
      ctx.strokeStyle = "#8a5806";
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(cx - bw * 0.24, py + 8);
      ctx.lineTo(cx + bw * 0.24, py + 8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.save();
      ctx.translate(cx + bw * 0.12, py + 8);
      ctx.rotate(Math.sin(t * 2.4) * 0.25 + squashV * 0.08);
      ctx.fillStyle = "#003d24";
      ctx.beginPath();
      ctx.roundRect(-2.5, 0, 5, 12, 2);
      ctx.fill();
      ctx.restore();
      ctx.restore();

      for (const it of items) if (!it.inside) drawItem(it);
    },
  };
}

useCanvasScene(canvas, createScene, { warmup: 1.5 });
</script>
<template>
  <canvas
    ref="canvas"
    class="scene-canvas backpack-canvas"
    role="img"
    aria-label="Animación: agua, comida, botiquín, lámpara, radio, documentos, silbato, pilas y cobija entran a una mochila"
  ></canvas>
</template>
