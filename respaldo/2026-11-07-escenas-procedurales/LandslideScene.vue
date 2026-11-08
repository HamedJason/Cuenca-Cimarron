<script setup>
// Deslave procedural de borde a borde: la ladera, el cielo y el suelo se
// salen del lienzo para que nunca se vea una figura cortada. La lluvia
// satura la ladera; antes de cada desprendimiento la cicatriz y los árboles
// tiemblan, luego bajan piedras y lodo con gravedad, rebotan en el terreno
// irregular, levantan polvo y se acumulan abajo, cada vez más cerca de la
// casa. El montón se asienta despacio y el ciclo nunca se repite igual.
import { ref } from "vue";
import { useCanvasScene, rand, smoothNoise } from "../composables/useCanvasScene";

const canvas = ref(null);

function createScene() {
  let W = 0;
  let H = 0;
  let groundY = 0;
  let A, B, u, nOut, length, slopeAngle;
  const rocks = [];
  const settled = [];
  const dust = [];
  const drops = [];
  const splashes = [];
  let pile = [];
  const BIN = 4;
  let nextBurst = 1.2;
  let shake = 0;
  let speckles = [];
  let trees = [];
  let tufts = [];
  let clouds = [];
  let hillSeed = rand(0, 100);

  const bump = (s) =>
    Math.sin(s * 0.08) * 2.2 + Math.sin(s * 0.21 + 1.3) * 1.3;

  function at(s, n) {
    return {
      x: A.x + u.x * s + nOut.x * n,
      y: A.y + u.y * s + nOut.y * n,
    };
  }

  // Altura del suelo plano (con el montón de lodo encima).
  function pileAt(x) {
    const i = Math.floor(x / BIN);
    return pile[i] || 0;
  }

  function surfaceY(x) {
    if (x <= B.x) return groundY - pileAt(x);
    const t = (x - B.x) / (A.x - B.x);
    return B.y + (A.y - B.y) * t;
  }

  function polygon(r) {
    const sides = Math.floor(rand(5, 9));
    return Array.from({ length: sides }, (_, i) => {
      const a = (i / sides) * Math.PI * 2 + rand(-0.2, 0.2);
      const k = rand(0.68, 1.15);
      return [Math.cos(a) * r * k, Math.sin(a) * r * k * 0.85];
    });
  }

  function spawn(kind, s0 = rand(4, 26)) {
    const big = kind === "rock";
    const mud = kind === "mud";
    const r = big ? rand(3.5, 8.5) : mud ? rand(2.2, 4) : rand(1, 2.2);
    const light = big ? rand(24, 36) : rand(30, 44);
    rocks.push({
      mode: "slope",
      s: s0,
      n: rand(0, 5),
      vs: rand(6, 22),
      vn: rand(-2, 12),
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r,
      a: rand(0, 6.28),
      shape: polygon(r),
      mud,
      color: mud
        ? `hsla(${rand(24, 30)}, 45%, ${rand(28, 36)}%, 0.9)`
        : `hsl(${rand(20, 34)}, ${rand(28, 48)}%, ${light}%)`,
      dead: false,
    });
  }

  function puff(x, y, size, n = 3) {
    for (let i = 0; i < n; i += 1)
      dust.push({
        x: x + rand(-4, 4),
        y: y + rand(-3, 1),
        r: size * rand(0.5, 1.1),
        vx: rand(-16, 8),
        vy: rand(-14, -3),
        life: 1,
      });
  }

  function addToPile(x, amount) {
    const c = Math.floor(x / BIN);
    for (let k = -4; k <= 4; k += 1) {
      const i = c + k;
      if (i < 0 || i >= pile.length) continue;
      pile[i] = Math.min(26, pile[i] + amount * Math.exp(-(k * k) / 6));
    }
  }

  return {
    init(w, h) {
      W = w;
      H = h;
      groundY = h * 0.86;
      A = { x: w * 0.94, y: h * 0.08 };
      B = { x: w * 0.36, y: groundY };
      const dx = B.x - A.x;
      const dy = B.y - A.y;
      length = Math.hypot(dx, dy);
      u = { x: dx / length, y: dy / length };
      nOut = { x: u.y, y: -u.x };
      if (nOut.y > 0) nOut = { x: -nOut.x, y: -nOut.y };
      slopeAngle = Math.atan2(dy, -dx);
      pile = new Array(Math.ceil(w / BIN) + 2).fill(0);
      speckles = Array.from({ length: 110 }, () => {
        const s = rand(0, length * 0.8);
        return {
          s,
          n: -rand(1, 13 + (1 - s / length) * 10),
          r: rand(0.5, 1.8),
          l: rand(16, 36),
        };
      });
      trees = [
        { s: length * 0.82, h: 26, tilt: 0, phase: rand(0, 6) },
        { s: length * 0.93, h: 20, tilt: 0, phase: rand(0, 6) },
        { s: length * 0.38, h: 18, tilt: 0, phase: rand(0, 6), loose: true },
      ];
      tufts = [];
      for (let s = length * 0.76; s < length; s += rand(5, 9))
        tufts.push({ slope: true, s, h: rand(3, 6), lean: rand(-0.4, 0.2) });
      for (let x = -6; x < B.x; x += rand(6, 11))
        tufts.push({ slope: false, x, h: rand(3, 6), lean: rand(-0.3, 0.3) });
      clouds = Array.from({ length: 5 }, (_, i) => ({
        x: (i / 5) * (w + 160) - 80,
        y: rand(-6, h * 0.1),
        r: rand(22, 34),
        v: rand(4, 9),
      }));
      for (let i = 0; i < 70; i += 1)
        drops.push({
          x: rand(-40, w + 40),
          y: rand(-h, h),
          l: rand(7, 14),
          v: rand(240, 340),
          front: Math.random() < 0.4,
        });
      hillSeed = rand(0, 100);
    },

    step(dt, t) {
      for (const c of clouds) {
        c.x -= c.v * dt;
        if (c.x < -100) c.x = W + 100;
      }
      for (const d of drops) {
        d.y += d.v * dt;
        d.x -= d.v * 0.22 * dt;
        if (d.y > surfaceY(d.x)) {
          if (Math.random() < 0.5)
            splashes.push({ x: d.x, y: surfaceY(d.x), life: 1 });
          d.y = rand(-40, -10);
          d.x = rand(-20, W * 1.25);
        }
      }
      for (const sp of splashes) sp.life -= dt * 4;
      for (let i = splashes.length - 1; i >= 0; i -= 1)
        if (splashes[i].life <= 0) splashes.splice(i, 1);

      // Goteo constante y, cada tanto, un desprendimiento grande.
      if (Math.random() < dt * 7) spawn("grain");
      if (Math.random() < dt * 2) spawn("mud");
      nextBurst -= dt;
      shake = nextBurst < 0.7 ? 1 - nextBurst / 0.7 : 0;
      if (nextBurst <= 0) {
        const count = Math.floor(rand(10, 22));
        for (let i = 0; i < count; i += 1) {
          const roll = Math.random();
          spawn(roll < 0.4 ? "rock" : roll < 0.75 ? "mud" : "grain");
        }
        const p = at(10, 2);
        puff(p.x, p.y, 8, 6);
        nextBurst = rand(2.4, 4.4);
      }

      const g = 300;
      const along = g * Math.sin(slopeAngle);
      for (const r of rocks) {
        if (r.mode === "slope") {
          r.vs += along * dt;
          r.vs *= 1 - (r.mud ? 0.9 : 0.5) * dt;
          r.vn -= g * Math.cos(slopeAngle) * dt;
          r.s += r.vs * dt;
          r.n += r.vn * dt;
          const ground = bump(r.s);
          if (r.n < ground) {
            r.n = ground;
            if (r.vn < -30 && r.r > 3) {
              const p = at(r.s, r.n);
              puff(p.x, p.y, r.r * 0.9, 2);
            }
            r.vn = r.mud
              ? 0
              : Math.abs(r.vn) * (r.r > 3 ? 0.45 : 0.25) +
                rand(0, r.vs * 0.1);
            r.vs *= r.mud ? 0.98 : 0.95;
          }
          r.a += ((r.mud ? 0.2 : 1) * (r.vs / r.r) * dt) / 1.2;
          if (r.s >= length) {
            const p = at(r.s, r.n + r.r);
            r.mode = "flat";
            r.x = p.x;
            r.y = p.y;
            r.vx = r.vs * u.x;
            r.vy = r.vs * u.y * 0.3;
          }
        } else {
          r.vy += g * dt;
          r.x += r.vx * dt;
          r.y += r.vy * dt;
          const floor = groundY - pileAt(r.x) - r.r * 0.7;
          if (r.y > floor) {
            r.y = floor;
            if (r.vy > 40 && r.r > 3) puff(r.x, r.y + r.r, r.r, 2);
            r.vy = r.mud ? 0 : -r.vy * 0.3;
            r.vx *= r.mud ? 0.86 : 0.9;
          }
          r.vx *= 1 - 1.4 * dt;
          r.a += (r.vx / r.r) * dt * 0.8;
          // Se detiene: pasa a formar parte del montón.
          if (Math.abs(r.vx) < 10 && Math.abs(r.vy) < 20 && r.y >= floor - 1) {
            addToPile(r.x, r.r * (r.mud ? 0.5 : 0.32));
            if (!r.mud && r.r > 3 && settled.length < 40)
              settled.push({ ...r, life: 1 });
            r.dead = true;
          }
          if (r.x < -30) r.dead = true;
        }
      }
      for (let i = rocks.length - 1; i >= 0; i -= 1)
        if (rocks[i].dead) rocks.splice(i, 1);

      // El montón se asienta y se lava poco a poco con la lluvia.
      for (let i = 0; i < pile.length; i += 1)
        pile[i] = Math.max(0, pile[i] - dt * (0.25 + pile[i] * 0.02));
      for (const s of settled) {
        s.life -= dt * 0.12;
        s.y = groundY - pileAt(s.x) - s.r * 0.5;
      }
      for (let i = settled.length - 1; i >= 0; i -= 1)
        if (settled[i].life <= 0) settled.splice(i, 1);

      for (const d of dust) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        d.vy += 5 * dt;
        d.r += 9 * dt;
        d.life -= dt * 0.85;
      }
      for (let i = dust.length - 1; i >= 0; i -= 1)
        if (dust[i].life <= 0) dust.splice(i, 1);

      for (const tr of trees)
        tr.tilt =
          Math.sin(t * 1.4 + tr.phase) * 0.05 +
          smoothNoise(t * 0.7, tr.phase) * 0.04 +
          shake * (tr.loose ? 0.1 : 0.04) * Math.sin(t * 38 + tr.phase);
    },

    draw(ctx, w, h, t) {
      // Cielo de tormenta.
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, "#7d97ab");
      sky.addColorStop(1, "#c9d8e2");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Cerros lejanos con perfil irregular, de borde a borde.
      const hills = [
        ["#9db9a6", 0.5, 0.012, 18],
        ["#86aa90", 0.62, 0.02, 12],
      ];
      for (const [color, base, freq, amp] of hills) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-10, h);
        for (let x = -10; x <= w + 10; x += 8) {
          const y =
            h * base +
            Math.sin(x * freq + hillSeed) * amp +
            Math.sin(x * freq * 2.7 + hillSeed * 2) * amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w + 10, h);
        ctx.fill();
      }

      // Nubes de lluvia.
      ctx.fillStyle = "rgba(96,116,132,0.55)";
      for (const c of clouds) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.arc(c.x + c.r * 0.9, c.y + 4, c.r * 0.8, 0, Math.PI * 2);
        ctx.arc(c.x - c.r * 0.9, c.y + 6, c.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      const rain = (front) => {
        ctx.strokeStyle = front
          ? "rgba(235,244,255,0.75)"
          : "rgba(235,244,255,0.4)";
        ctx.lineWidth = front ? 1.2 : 1;
        ctx.beginPath();
        for (const d of drops) {
          if (d.front !== front) continue;
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.l * 0.22, d.y - d.l);
        }
        ctx.stroke();
      };
      rain(false);

      // Suelo plano y cuerpo de la ladera; ambos se salen del lienzo.
      ctx.fillStyle = "#4f8f55";
      ctx.fillRect(-10, groundY, w + 20, h - groundY + 10);
      const far = at(-length, 0);
      ctx.fillStyle = "#4f8f55";
      ctx.beginPath();
      ctx.moveTo(B.x, h + 10);
      ctx.lineTo(B.x, B.y);
      for (let i = 0; i <= 40; i += 1) {
        const s = length - (i / 40) * length;
        const p = at(s, bump(s));
        ctx.lineTo(p.x, p.y);
      }
      ctx.lineTo(far.x, far.y);
      ctx.lineTo(w + 40, -40);
      ctx.lineTo(w + 40, h + 10);
      ctx.fill();

      // Franja de tierra expuesta: gruesa arriba, se adelgaza abajo.
      const jitter = shake ? Math.sin(t * 60) * shake * 1.2 : 0;
      const earth = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
      earth.addColorStop(0, "#6e4320");
      earth.addColorStop(1, "#946032");
      ctx.fillStyle = earth;
      ctx.beginPath();
      const steps = 44;
      const end = length * 0.8;
      for (let i = 0; i <= steps; i += 1) {
        const s = -14 + (i / steps) * (end + 14);
        const p = at(s, bump(s) + 0.5);
        if (i === 0) ctx.moveTo(p.x + jitter, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      for (let i = steps; i >= 0; i -= 1) {
        const s = -14 + (i / steps) * (end + 14);
        const depth = 24 * (1 - s / end) + 3 + Math.sin(s * 0.17) * 2;
        const p = at(s, -Math.max(0, depth));
        ctx.lineTo(p.x, p.y);
      }
      ctx.fill();
      for (const sp of speckles) {
        const p = at(sp.s, sp.n);
        ctx.fillStyle = `hsl(28, 38%, ${sp.l}%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, sp.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Cicatriz oscura de donde se desprende el material.
      const sc = at(6, 0);
      ctx.fillStyle = "#3d2412";
      ctx.beginPath();
      ctx.moveTo(sc.x - 10 + jitter, sc.y + 6);
      ctx.quadraticCurveTo(sc.x + 2, sc.y - 14, sc.x + 22 + jitter, sc.y - 10);
      ctx.quadraticCurveTo(sc.x + 10, sc.y + 2, sc.x + 6 + jitter, sc.y + 16);
      ctx.closePath();
      ctx.fill();

      // Pasto en la parte firme de la ladera y en el llano.
      ctx.strokeStyle = "#3f7d45";
      ctx.lineWidth = 1.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (const tf of tufts) {
        const base = tf.slope
          ? at(tf.s, bump(tf.s))
          : { x: tf.x, y: groundY - pileAt(tf.x) };
        const sway = Math.sin(t * 2 + base.x * 0.1) * 1.2;
        for (const off of [-2, 0, 2]) {
          ctx.moveTo(base.x + off, base.y + 1);
          ctx.lineTo(base.x + off + tf.lean * 4 + sway, base.y - tf.h);
        }
      }
      ctx.stroke();

      // Árboles; tiemblan antes de cada desprendimiento.
      for (const tr of trees) {
        const base = at(tr.s, bump(tr.s));
        ctx.save();
        ctx.translate(base.x, base.y + 1);
        ctx.rotate(tr.tilt + (tr.loose ? -0.25 : 0));
        ctx.fillStyle = "#5b3a1e";
        ctx.fillRect(-1.6, -tr.h * 0.55, 3.2, tr.h * 0.55);
        ctx.fillStyle = tr.loose ? "#3e8a4f" : "#2f7a46";
        ctx.beginPath();
        ctx.arc(0, -tr.h * 0.72, tr.h * 0.32, 0, Math.PI * 2);
        ctx.arc(-tr.h * 0.22, -tr.h * 0.54, tr.h * 0.24, 0, Math.PI * 2);
        ctx.arc(tr.h * 0.22, -tr.h * 0.54, tr.h * 0.24, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.beginPath();
        ctx.arc(-tr.h * 0.1, -tr.h * 0.82, tr.h * 0.13, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Casa al pie del cerro: lo que está en riesgo.
      const hx = w * 0.07;
      const hw = Math.min(64, w * 0.17);
      const hh = hw * 0.62;
      ctx.fillStyle = "#f3e6cc";
      ctx.fillRect(hx, groundY - hh, hw, hh + 2);
      ctx.fillStyle = "#b5432a";
      ctx.beginPath();
      ctx.moveTo(hx - 6, groundY - hh + 1);
      ctx.lineTo(hx + hw / 2, groundY - hh - hw * 0.4);
      ctx.lineTo(hx + hw + 6, groundY - hh + 1);
      ctx.fill();
      ctx.fillStyle = "#6b4423";
      ctx.fillRect(hx + hw * 0.18, groundY - hh * 0.62, hw * 0.2, hh * 0.62);
      const glow = 0.75 + Math.sin(t * 3.1) * 0.05;
      ctx.fillStyle = `rgba(255,214,102,${glow})`;
      ctx.fillRect(hx + hw * 0.55, groundY - hh * 0.72, hw * 0.28, hh * 0.32);
      ctx.strokeStyle = "#6b4423";
      ctx.lineWidth = 1;
      ctx.strokeRect(hx + hw * 0.55, groundY - hh * 0.72, hw * 0.28, hh * 0.32);

      // Montón de lodo en el llano, delante de la casa.
      ctx.fillStyle = "#7a4e26";
      ctx.beginPath();
      ctx.moveTo(-10, groundY + 1);
      for (let i = 0; i < pile.length; i += 1) {
        const x = i * BIN;
        if (x > B.x + 6) break;
        ctx.lineTo(x, groundY - pile[i] + 1);
      }
      ctx.lineTo(B.x + 6, groundY + 1);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.fillRect(-10, groundY, B.x + 16, 2);

      const drawRock = (r, alpha = 1) => {
        const p = r.mode === "slope" ? at(r.s, r.n + r.r * 0.8) : r;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(r.a);
        ctx.fillStyle = r.color;
        ctx.beginPath();
        r.shape.forEach(([x, y], i) =>
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
        );
        ctx.closePath();
        ctx.fill();
        if (r.r > 3 && !r.mud) {
          ctx.fillStyle = "rgba(255,255,255,0.18)";
          ctx.beginPath();
          ctx.arc(-r.r * 0.3, -r.r * 0.3, r.r * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "rgba(0,0,0,0.18)";
          ctx.beginPath();
          ctx.arc(r.r * 0.3, r.r * 0.3, r.r * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      };
      for (const s of settled) drawRock(s, Math.min(1, s.life * 2));
      for (const r of rocks) drawRock(r);

      for (const d of dust) {
        ctx.fillStyle = `rgba(186,146,104,${d.life * 0.42})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rain(true);
      ctx.strokeStyle = "rgba(235,244,255,0.7)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const sp of splashes) {
        const k = 1 - sp.life;
        ctx.moveTo(sp.x - 1, sp.y);
        ctx.lineTo(sp.x - 2 - k * 3, sp.y - 2 - k * 2);
        ctx.moveTo(sp.x + 1, sp.y);
        ctx.lineTo(sp.x + 2 + k * 3, sp.y - 2 - k * 2);
      }
      ctx.stroke();
    },
  };
}

useCanvasScene(canvas, createScene, { warmup: 6 });
</script>
<template>
  <canvas
    ref="canvas"
    class="scene-canvas landslide-canvas"
    role="img"
    aria-label="Animación: con la lluvia, tierra y piedras se desprenden de una ladera y se acumulan junto a una casa"
  ></canvas>
</template>
