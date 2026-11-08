<script setup>
// Viento, lluvia, calor y frío para el título de El Niño. Usan azar y ruido
// suave en vez de ciclos fijos para que no se note la repetición.
import { ref } from "vue";
import {
  useCanvasScene,
  rand,
  smoothNoise,
} from "../composables/useCanvasScene";

const props = defineProps({
  kind: { type: String, required: true },
  label: { type: String, required: true },
});
const canvas = ref(null);

function windScene() {
  let W, H;
  let gust = 0;
  const blades = [];
  const leaves = [];
  const trails = [];
  return {
    init(w, h) {
      W = w;
      H = h;
      for (let x = 0; x < w; x += 4)
        blades.push({ x: x + rand(-1, 1), h: rand(6, 14), p: rand(0, 6) });
    },
    step(dt, t) {
      gust = 0.55 + 0.45 * smoothNoise(t * 0.8, 1.3);
      if (Math.random() < dt * (2 + gust * 4))
        leaves.push({
          x: -8,
          y: rand(H * 0.15, H * 0.7),
          vx: rand(60, 120),
          ph: rand(0, 6),
          a: 0,
          c: Math.random() < 0.5 ? "#e9a23b" : "#6cbf5a",
        });
      if (Math.random() < dt * (3 + gust * 5))
        trails.push({
          x: -40,
          y: rand(H * 0.1, H * 0.75),
          l: rand(26, 60),
          life: 1,
        });
      for (const l of leaves) {
        l.x += l.vx * (0.6 + gust) * dt;
        l.y += Math.sin(t * 4 + l.ph) * 22 * dt;
        l.a += dt * 7;
      }
      for (const tr of trails) {
        tr.x += 190 * (0.6 + gust) * dt;
        tr.life -= dt * 0.9;
      }
      for (let i = leaves.length - 1; i >= 0; i -= 1)
        if (leaves[i].x > W + 10) leaves.splice(i, 1);
      for (let i = trails.length - 1; i >= 0; i -= 1)
        if (trails[i].life <= 0) trails.splice(i, 1);
    },
    draw(ctx, w, h, t) {
      ctx.fillStyle = "#e3f2ff";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(30,111,217,0.55)";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      for (const tr of trails) {
        ctx.globalAlpha = Math.max(0, tr.life);
        ctx.beginPath();
        ctx.moveTo(tr.x, tr.y);
        ctx.quadraticCurveTo(tr.x + tr.l * 0.5, tr.y - 4, tr.x + tr.l, tr.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const bend = gust * 0.28 + Math.sin(t * 3) * 0.03;
      ctx.save();
      ctx.translate(w * 0.24, h - 10);
      ctx.rotate(bend * 0.4);
      ctx.fillStyle = "#7a4a24";
      ctx.fillRect(-3, -h * 0.42, 6, h * 0.42);
      ctx.translate(0, -h * 0.42);
      ctx.rotate(bend * 0.6);
      ctx.fillStyle = "#2f9e5b";
      ctx.beginPath();
      ctx.ellipse(
        0,
        -h * 0.12,
        h * 0.2 + bend * 6,
        h * 0.17,
        bend,
        0,
        Math.PI * 2,
      );
      ctx.ellipse(-h * 0.12, -h * 0.02, h * 0.13, h * 0.11, 0, 0, Math.PI * 2);
      ctx.ellipse(h * 0.14, -h * 0.02, h * 0.13, h * 0.11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      for (const l of leaves) {
        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate(l.a);
        ctx.fillStyle = l.c;
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = "#9fd3a8";
      ctx.fillRect(0, h - 10, w, 10);
      ctx.strokeStyle = "#3f9a5a";
      ctx.lineWidth = 1.5;
      for (const b of blades) {
        const lean = (gust * 0.9 + Math.sin(t * 5 + b.p) * 0.15) * b.h;
        ctx.beginPath();
        ctx.moveTo(b.x, h - 10);
        ctx.quadraticCurveTo(
          b.x + lean * 0.3,
          h - 10 - b.h * 0.6,
          b.x + lean,
          h - 10 - b.h * 0.8,
        );
        ctx.stroke();
      }
    },
  };
}

function rainScene() {
  let W, H;
  const drops = [];
  const splashes = [];
  const ripples = [];
  let cloudX = 0;
  return {
    init(w, h) {
      W = w;
      H = h;
    },
    step(dt, t) {
      cloudX = Math.sin(t * 0.3) * 8;
      const rate = 40 + 25 * smoothNoise(t * 0.5, 2.1);
      for (let i = 0; i < rate * dt; i += 1)
        drops.push({
          x: rand(W * 0.12, W * 0.88) + cloudX,
          y: H * 0.42,
          v: rand(170, 240),
          l: rand(5, 10),
        });
      for (const d of drops) {
        d.y += d.v * dt;
        d.x -= d.v * 0.12 * dt;
      }
      for (let i = drops.length - 1; i >= 0; i -= 1) {
        const d = drops[i];
        if (d.y > H - 10) {
          for (let k = 0; k < 2; k += 1)
            splashes.push({
              x: d.x,
              y: H - 10,
              vx: rand(-30, 30),
              vy: rand(-60, -30),
              life: 1,
            });
          if (Math.random() < 0.25) ripples.push({ x: d.x, r: 1, life: 1 });
          drops.splice(i, 1);
        }
      }
      for (const s of splashes) {
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vy += 300 * dt;
        s.life -= dt * 3;
      }
      for (const r of ripples) {
        r.r += 14 * dt;
        r.life -= dt * 1.4;
      }
      for (let i = splashes.length - 1; i >= 0; i -= 1)
        if (splashes[i].life <= 0) splashes.splice(i, 1);
      for (let i = ripples.length - 1; i >= 0; i -= 1)
        if (ripples[i].life <= 0) ripples.splice(i, 1);
    },
    draw(ctx, w, h) {
      ctx.fillStyle = "#cfe4ff";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b6d0ea";
      ctx.fillRect(0, h - 10, w, 10);
      ctx.strokeStyle = "#1e6fd9";
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      for (const d of drops) {
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.l * 0.12, d.y - d.l);
        ctx.stroke();
      }
      ctx.fillStyle = "#1e6fd9";
      for (const s of splashes) {
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(30,111,217,0.6)";
      ctx.lineWidth = 1;
      for (const r of ripples) {
        ctx.globalAlpha = Math.max(0, r.life);
        ctx.beginPath();
        ctx.ellipse(r.x, h - 5, r.r, r.r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#8aa9c4";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const cx = w / 2 + cloudX;
      const cy = h * 0.3;
      ctx.ellipse(cx - w * 0.18, cy + 4, w * 0.16, h * 0.14, 0, 0, Math.PI * 2);
      ctx.ellipse(cx, cy - 4, w * 0.2, h * 0.19, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + w * 0.2, cy + 4, w * 0.15, h * 0.13, 0, 0, Math.PI * 2);
      ctx.fill();
    },
  };
}

function heatScene() {
  let W, H;
  let temp = 0.5;
  const waves = [];
  return {
    init(w, h) {
      W = w;
      H = h;
      for (let i = 0; i < 5; i += 1)
        waves.push({
          x: rand(w * 0.1, w * 0.62),
          y: rand(0, h),
          v: rand(14, 24),
        });
    },
    step(dt, t) {
      temp = 0.6 + 0.35 * smoothNoise(t * 0.35, 0.4);
      for (const wv of waves) {
        wv.y -= wv.v * dt;
        if (wv.y < -20) {
          wv.y = H + 10;
          wv.x = rand(W * 0.1, W * 0.62);
        }
      }
    },
    draw(ctx, w, h, t) {
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, "#fff6dc");
      bg.addColorStop(1, "#ffe0a8");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const sx = w * 0.32;
      const sy = h * 0.4;
      const R = h * 0.17 * (1 + Math.sin(t * 2.2) * 0.05);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(t * 0.25);
      ctx.strokeStyle = "#ffb703";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      for (let i = 0; i < 10; i += 1) {
        const a = (i / 10) * Math.PI * 2;
        const len = R * (0.55 + 0.2 * Math.sin(t * 3 + i));
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * (R + 4), Math.sin(a) * (R + 4));
        ctx.lineTo(Math.cos(a) * (R + 4 + len), Math.sin(a) * (R + 4 + len));
        ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = "#ffb703";
      ctx.beginPath();
      ctx.arc(sx, sy, R, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(226,71,15,0.35)";
      ctx.lineWidth = 2;
      for (const wv of waves) {
        ctx.beginPath();
        for (let k = 0; k <= 20; k += 1) {
          const y = wv.y + k * 1.4;
          const x = wv.x + Math.sin(k * 0.6 + t * 6) * 3;
          if (k) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      thermometer(ctx, w, h, temp, "#e5383b", "#c2410c");
    },
  };
}

function coldScene() {
  let W, H;
  const flakes = [];
  let snow = 0;
  let temp = 0.2;
  return {
    init(w, h) {
      W = w;
      H = h;
      for (let i = 0; i < 26; i += 1) flakes.push(newFlake(true));
    },
    step(dt, t) {
      temp = 0.18 + 0.08 * smoothNoise(t * 0.4, 3.3);
      for (const f of flakes) {
        f.y += f.v * dt;
        f.x +=
          Math.sin(t * f.f + f.p) * 10 * dt + smoothNoise(t * 0.6, 5) * 6 * dt;
        f.a += dt * f.spin;
        if (f.y > H - 8 - snow) {
          snow = Math.min(12, snow + 0.08);
          Object.assign(f, newFlake(false));
        }
      }
      if (snow >= 12) snow = 3;
    },
    draw(ctx, w, h) {
      ctx.fillStyle = "#eef4ff";
      ctx.fillRect(0, 0, w, h);
      for (const f of flakes) flake(ctx, f);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h - 6 - snow);
      for (let x = 0; x <= w; x += 12)
        ctx.quadraticCurveTo(x + 6, h - 9 - snow, x + 12, h - 6 - snow);
      ctx.lineTo(w, h);
      ctx.fill();
      thermometer(ctx, w, h, temp, "#1e6fd9", "#1e6fd9");
    },
  };
  function newFlake(anywhere) {
    return {
      x: rand(0, W * 0.72),
      y: anywhere ? rand(0, H) : -6,
      v: rand(14, 30),
      r: rand(2, 4.5),
      f: rand(1, 2.5),
      p: rand(0, 6),
      a: rand(0, 6),
      spin: rand(-1.5, 1.5),
    };
  }
}

function flake(ctx, f) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.a);
  ctx.strokeStyle = "#5aa9e6";
  ctx.lineWidth = 1.2;
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i += 1) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(-f.r, 0);
    ctx.lineTo(f.r, 0);
    ctx.stroke();
  }
  ctx.restore();
}

function thermometer(ctx, w, h, level, fill, border) {
  const x = w * 0.8;
  const top = h * 0.12;
  const bottom = h * 0.72;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - 7, top, 14, bottom - top + 6, 7);
  ctx.fill();
  ctx.stroke();
  const ly = bottom - (bottom - top - 6) * level;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x - 3, ly, 6, bottom - ly + 4, 3);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, bottom + 10, 10, 0, Math.PI * 2);
  ctx.fill();
}

const scenes = {
  wind: windScene,
  rain: rainScene,
  heat: heatScene,
  cold: coldScene,
};
useCanvasScene(canvas, scenes[props.kind]);
</script>
<template>
  <li :class="['wx', `wx-${kind}`]">
    <canvas
      ref="canvas"
      class="scene-canvas wx-canvas"
      aria-hidden="true"
    ></canvas>
    <span>{{ label }}</span>
  </li>
</template>
