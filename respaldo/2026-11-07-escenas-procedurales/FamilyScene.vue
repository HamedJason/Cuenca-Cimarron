<script setup>
// Familia procedural en el punto de encuentro: papá señala el letrero o
// saluda, mamá revisa el plan y va palomeando cada punto, los niños brincan
// cuando les da la gana y el perro corre entre ellos. Cada quien respira,
// parpadea y decide qué hacer con su propio reloj, así que la escena nunca
// se repite igual.
import { ref } from "vue";
import { useCanvasScene, rand, pick, smoothNoise } from "../composables/useCanvasScene";

const canvas = ref(null);
const approach = (v, target, k, dt) => v + (target - v) * Math.min(1, k * dt);

function createScene() {
  let W = 0;
  let H = 0;
  let groundY = 0;
  let people = [];
  let dog = null;
  let clouds = [];
  let sign = null;
  let planClock = 0;
  const G = 900;

  function makePerson(o) {
    return {
      h: o.h,
      x: o.x,
      skin: o.skin,
      shirt: o.shirt,
      pants: o.pants,
      hair: o.hair,
      hairStyle: o.hairStyle,
      role: o.role,
      y: 0,
      vy: 0,
      squash: 0,
      squashV: 0,
      armL: [-0.15, -0.1],
      armR: [0.15, 0.1],
      head: 0,
      blink: 0,
      nextBlink: rand(1, 4),
      state: "idle",
      timer: rand(1, 3),
      phase: rand(0, 6),
    };
  }

  function limb(ctx, x, y, a1, a2, len, width, color) {
    const ex = x + Math.sin(a1) * len;
    const ey = y + Math.cos(a1) * len;
    const hx = ex + Math.sin(a1 + a2) * len;
    const hy = ey + Math.cos(a1 + a2) * len;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    return { x: hx, y: hy };
  }

  function drawPerson(ctx, p, t) {
    const h = p.h;
    const sy = 1 - p.squash;
    const sx = 1 + p.squash * 0.6;
    const footY = groundY - p.y;
    const legLen = h * 0.36;
    const airborne = p.y > 1;
    const breathe = Math.sin(t * 2.2 + p.phase) * 0.012;

    // Sombra: se encoge cuando brinca.
    const shadow = Math.max(0.35, 1 - p.y / 60);
    ctx.fillStyle = "rgba(0,60,30,0.18)";
    ctx.beginPath();
    ctx.ellipse(p.x, groundY + 2, h * 0.16 * shadow, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, footY);
    ctx.scale(sx, sy * (1 + breathe));

    // Piernas: se doblan en el aire.
    const tuck = airborne ? 0.5 : 0;
    const hipY = -legLen * (airborne ? 0.92 : 1);
    limb(ctx, -h * 0.05, hipY, tuck * 0.6, -tuck * 1.2, legLen / 2, h * 0.075, p.pants);
    limb(ctx, h * 0.05, hipY, -tuck * 0.6, tuck * 1.2, legLen / 2, h * 0.075, p.pants);

    // Torso.
    const tw = h * 0.24;
    const th = h * 0.34;
    const top = hipY - th;
    ctx.fillStyle = p.shirt;
    ctx.beginPath();
    ctx.roundRect(-tw / 2, top, tw, th + 2, [tw * 0.4, tw * 0.4, 6, 6]);
    ctx.fill();

    // Brazos.
    const shoulderY = top + h * 0.05;
    const armLen = h * 0.15;
    const armW = h * 0.062;
    const handL = limb(ctx, -tw * 0.42, shoulderY, p.armL[0], p.armL[1], armLen, armW, p.shirt);
    const handR = limb(ctx, tw * 0.42, shoulderY, p.armR[0], p.armR[1], armLen, armW, p.shirt);
    ctx.fillStyle = p.skin;
    for (const hand of [handL, handR]) {
      ctx.beginPath();
      ctx.arc(hand.x, hand.y, armW * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // El plan de mamá: una hoja que se va palomeando.
    if (p.role === "mom") {
      const px = (handL.x + handR.x) / 2;
      const py = (handL.y + handR.y) / 2 - h * 0.1;
      const pw = h * 0.2;
      const ph = h * 0.25;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.08 + p.head * 0.3);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#c9d3cc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 2);
      ctx.fill();
      ctx.stroke();
      const done = Math.floor(planClock / 1.4);
      for (let i = 0; i < 3; i += 1) {
        const ly = -ph / 2 + ph * (0.28 + i * 0.26);
        ctx.strokeStyle = "#c9d3cc";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-pw * 0.05, ly);
        ctx.lineTo(pw * 0.36, ly);
        ctx.stroke();
        ctx.strokeStyle = "#9aa7a0";
        ctx.lineWidth = 1;
        ctx.strokeRect(-pw * 0.38, ly - pw * 0.11, pw * 0.22, pw * 0.22);
        if (i < done) {
          ctx.strokeStyle = "#00723f";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-pw * 0.36, ly);
          ctx.lineTo(-pw * 0.28, ly + pw * 0.08);
          ctx.lineTo(-pw * 0.12, ly - pw * 0.14);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Cabeza.
    const r = h * 0.11;
    const hx = 0;
    const hy = top - r * 0.95;
    ctx.save();
    ctx.translate(hx, hy);
    ctx.rotate(p.head);
    ctx.fillStyle = p.skin;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = p.hair;
    ctx.beginPath();
    if (p.hairStyle === "long") {
      ctx.arc(0, -r * 0.1, r * 1.08, Math.PI * 0.95, Math.PI * 2.05);
      ctx.lineTo(r * 1.08, r * 0.9);
      ctx.lineTo(r * 0.7, r * 0.9);
      ctx.lineTo(r * 0.75, 0);
      ctx.lineTo(-r * 0.75, 0);
      ctx.lineTo(-r * 0.7, r * 0.9);
      ctx.lineTo(-r * 1.08, r * 0.9);
    } else if (p.hairStyle === "pony") {
      ctx.arc(0, -r * 0.1, r * 1.05, Math.PI, Math.PI * 2);
      ctx.moveTo(r * 0.9, -r * 0.4);
      ctx.ellipse(
        r * 1.25,
        -r * 0.1 + Math.sin(t * 6 + p.phase) * (airborne ? 3 : 0.6),
        r * 0.35,
        r * 0.6,
        0.4,
        0,
        Math.PI * 2,
      );
    } else {
      ctx.arc(0, -r * 0.15, r * 1.02, Math.PI * 1.02, Math.PI * 1.98);
    }
    ctx.fill();
    // Ojos que parpadean y sonrisa.
    const eyeH = Math.max(0.3, 1 - p.blink) * r * 0.16;
    ctx.fillStyle = "#1c2621";
    for (const ex of [-r * 0.36, r * 0.36]) {
      ctx.beginPath();
      ctx.ellipse(ex, r * 0.08, r * 0.1, eyeH, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#1c2621";
    ctx.lineWidth = Math.max(1, r * 0.1);
    ctx.beginPath();
    const open = airborne ? 0.55 : 0.35;
    ctx.arc(0, r * 0.32, r * open, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = "rgba(230,90,90,0.25)";
    for (const cx of [-r * 0.6, r * 0.6]) {
      ctx.beginPath();
      ctx.arc(cx, r * 0.4, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.restore();
  }

  function updatePerson(p, dt, t) {
    p.nextBlink -= dt;
    if (p.nextBlink < 0) {
      p.blink = 1;
      p.nextBlink = rand(1.8, 5);
    }
    p.blink = Math.max(0, p.blink - dt * 7);

    // Salto con gravedad y un rebote elástico al caer.
    if (p.y > 0 || p.vy > 0) {
      p.vy -= G * dt;
      p.y += p.vy * dt;
      if (p.y <= 0) {
        p.y = 0;
        p.squashV += -p.vy * 0.006;
        p.vy = 0;
        if (dog && Math.abs(dog.x - p.x) < 60) dog.hopSoon = rand(0.05, 0.25);
      }
    }
    p.squashV += (-p.squash * 260 - p.squashV * 14) * dt;
    p.squash += p.squashV * dt;

    p.timer -= dt;
    const idleL = [-0.12 - Math.sin(t * 1.3 + p.phase) * 0.05, -0.15];
    const idleR = [0.12 + Math.sin(t * 1.3 + p.phase) * 0.05, 0.15];
    let targetL = idleL;
    let targetR = idleR;
    let head = smoothNoise(t * 0.5, p.phase) * 0.08;

    if (p.role === "dad") {
      if (p.timer < 0) {
        p.state = p.state === "idle" ? pick(["wave", "point"]) : "idle";
        p.timer = p.state === "idle" ? rand(1.2, 2.6) : rand(1.6, 2.4);
      }
      if (p.state === "wave") {
        targetR = [2.5, -0.5 + Math.sin(t * 9) * 0.45];
      } else if (p.state === "point") {
        targetL = [-1.6, -0.05];
        head = 0.22;
      }
    } else if (p.role === "mom") {
      planClock += dt;
      if (planClock > 5.6) planClock = 0;
      // Sostiene el plan; al palomear, la mano derecha da un golpecito.
      const tick = planClock % 1.4 < 0.25 ? 0.25 : 0;
      targetL = [0.3, 1.9];
      targetR = [-0.3 + tick, -1.9];
      head = -0.12 + Math.sin(t * 0.8 + p.phase) * 0.05;
    } else {
      if (p.timer < 0 && p.y === 0) {
        p.vy = Math.sqrt(2 * G * rand(10, p.h * 0.32));
        p.squashV -= 2.2;
        p.timer = rand(1.4, 4.5);
      }
      if (p.y > 1) {
        targetL = [2.6, 0.2];
        targetR = [-2.6, -0.2];
      }
    }
    const k = 10;
    p.armL = [approach(p.armL[0], targetL[0], k, dt), approach(p.armL[1], targetL[1], k, dt)];
    p.armR = [approach(p.armR[0], targetR[0], k, dt), approach(p.armR[1], targetR[1], k, dt)];
    p.head = approach(p.head, head, 6, dt);
  }

  function updateDog(d, dt, t) {
    d.timer -= dt;
    if (d.timer < 0) {
      d.target = rand(d.min, d.max);
      d.timer = rand(1.5, 3.5);
    }
    const dx = d.target - d.x;
    const running = Math.abs(dx) > 3;
    const speed = running ? Math.sign(dx) * Math.min(90, Math.abs(dx) * 3 + 20) : 0;
    d.vx = approach(d.vx, speed, 6, dt);
    d.x += d.vx * dt;
    if (Math.abs(d.vx) > 4) d.face = Math.sign(d.vx);
    d.gait += Math.abs(d.vx) * dt * 0.22;
    if (d.hopSoon !== null) {
      d.hopSoon -= dt;
      if (d.hopSoon <= 0 && d.y === 0) {
        d.vy = Math.sqrt(2 * G * rand(14, 26));
        d.hopSoon = null;
      }
    }
    if (d.y > 0 || d.vy > 0) {
      d.vy -= G * dt;
      d.y += d.vy * dt;
      if (d.y <= 0) {
        d.y = 0;
        d.vy = 0;
      }
    }
    d.wag = Math.sin(t * (running ? 22 : 14)) * (running ? 0.5 : 0.35);
    d.pant = Math.sin(t * 9) * 0.5 + 0.5;
  }

  function drawDog(ctx, d) {
    const s = d.size;
    ctx.fillStyle = "rgba(0,60,30,0.18)";
    ctx.beginPath();
    ctx.ellipse(d.x, groundY + 2, s * 0.9 * Math.max(0.4, 1 - d.y / 50), 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.translate(d.x, groundY - d.y);
    ctx.scale(d.face, 1);
    const body = "#a0663a";
    const dark = "#6f4322";
    // Patas con ciclo de carrera.
    const legY = -s * 0.42;
    const swing = Math.abs(d.vx) > 4 ? 0.6 : 0;
    const legs = [
      [-s * 0.5, Math.sin(d.gait) * swing],
      [-s * 0.3, Math.sin(d.gait + Math.PI) * swing],
      [s * 0.35, Math.sin(d.gait + Math.PI) * swing],
      [s * 0.55, Math.sin(d.gait) * swing],
    ];
    ctx.strokeStyle = dark;
    ctx.lineWidth = s * 0.14;
    ctx.lineCap = "round";
    for (const [lx, a] of legs) {
      ctx.beginPath();
      ctx.moveTo(lx, legY);
      ctx.lineTo(lx + Math.sin(a) * s * 0.42, legY + Math.cos(a) * s * 0.42);
      ctx.stroke();
    }
    // Cola.
    ctx.save();
    ctx.translate(-s * 0.72, -s * 0.62);
    ctx.rotate(-0.9 + d.wag);
    ctx.strokeStyle = body;
    ctx.lineWidth = s * 0.13;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-s * 0.2, -s * 0.25, -s * 0.05, -s * 0.5);
    ctx.stroke();
    ctx.restore();
    // Cuerpo.
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.62, s * 0.8, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c98a55";
    ctx.beginPath();
    ctx.ellipse(s * 0.1, -s * 0.5, s * 0.45, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    // Cabeza, oreja que rebota y lengua.
    const hx = s * 0.85;
    const hy = -s * 0.98 - (d.vy > 0 ? 2 : 0);
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(hx, hy, s * 0.34, 0, Math.PI * 2);
    ctx.ellipse(hx + s * 0.32, hy + s * 0.1, s * 0.22, s * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.ellipse(
      hx - s * 0.14,
      hy + s * 0.08,
      s * 0.11,
      s * 0.26,
      0.3 + d.vy * 0.004 + Math.sin(d.gait) * 0.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.fillStyle = "#1c2621";
    ctx.beginPath();
    ctx.arc(hx + s * 0.08, hy - s * 0.06, s * 0.055, 0, Math.PI * 2);
    ctx.arc(hx + s * 0.52, hy + s * 0.04, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e5677a";
    ctx.beginPath();
    ctx.ellipse(hx + s * 0.34, hy + s * 0.28 + d.pant * s * 0.05, s * 0.07, s * 0.1 + d.pant * s * 0.04, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSign(ctx) {
    const { x, size } = sign;
    const postH = size * 1.9;
    ctx.fillStyle = "#7c8a82";
    ctx.fillRect(x - 2, groundY - postH, 4, postH);
    const sx = x - size / 2;
    const sy = groundY - postH - size * 0.5;
    ctx.fillStyle = "#00723f";
    ctx.beginPath();
    ctx.roundRect(sx, sy, size, size, 4);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(sx + 3, sy + 3, size - 6, size - 6, 2);
    ctx.stroke();
    // Cuatro flechas hacia el centro: el símbolo del punto de reunión.
    const cx = x;
    const cy = sy + size / 2;
    const a = size * 0.13;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 4; i += 1) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i * Math.PI) / 2 + Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.16);
      ctx.lineTo(-a, -size * 0.16 - a);
      ctx.lineTo(a, -size * 0.16 - a);
      ctx.fill();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
  }

  return {
    init(w, h) {
      W = w;
      H = h;
      groundY = h * 0.9;
      const adult = Math.min(h * 0.62, w * 0.3);
      people = [
        makePerson({ role: "dad", x: w * 0.3, h: adult, skin: "#8d5524", shirt: "#0b4fa8", pants: "#23395b", hair: "#2b1d14", hairStyle: "short" }),
        makePerson({ role: "mom", x: w * 0.46, h: adult * 0.95, skin: "#e0ac69", shirt: "#d62828", pants: "#003d24", hair: "#4a2c17", hairStyle: "long" }),
        makePerson({ role: "kid", x: w * 0.6, h: adult * 0.68, skin: "#c68642", shirt: "#dd971a", pants: "#23395b", hair: "#1c1410", hairStyle: "short" }),
        makePerson({ role: "kid", x: w * 0.72, h: adult * 0.56, skin: "#f1c27d", shirt: "#00723f", pants: "#6a3fb5", hair: "#6b3e1e", hairStyle: "pony" }),
      ];
      dog = {
        x: w * 0.86,
        y: 0,
        vx: 0,
        vy: 0,
        size: adult * 0.24,
        min: w * 0.66,
        max: w * 0.93,
        target: w * 0.86,
        timer: rand(0.5, 2),
        face: -1,
        gait: 0,
        wag: 0,
        pant: 0,
        hopSoon: null,
      };
      sign = { x: w * 0.11, size: Math.min(34, h * 0.2) };
      clouds = Array.from({ length: 3 }, (_, i) => ({
        x: rand(0, w) + i * 40,
        y: rand(h * 0.1, h * 0.3),
        r: rand(10, 16),
        v: rand(5, 10),
      }));
    },

    step(dt, t) {
      for (const c of clouds) {
        c.x += c.v * dt;
        if (c.x - c.r * 3 > W) c.x = -c.r * 3;
      }
      for (const p of people) updatePerson(p, dt, t);
      updateDog(dog, dt, t);
    },

    draw(ctx, w, h, t) {
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, "#cfe8ff");
      sky.addColorStop(1, "#fff6e0");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      // Sol que late despacio.
      const sr = h * 0.11 + Math.sin(t * 1.5) * 1.5;
      ctx.fillStyle = "rgba(255,200,60,0.25)";
      ctx.beginPath();
      ctx.arc(w * 0.88, h * 0.2, sr * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffc83d";
      ctx.beginPath();
      ctx.arc(w * 0.88, h * 0.2, sr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (const c of clouds) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.arc(c.x + c.r, c.y + 3, c.r * 0.8, 0, Math.PI * 2);
        ctx.arc(c.x - c.r, c.y + 4, c.r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
      // Lomas al fondo y pasto.
      ctx.fillStyle = "#b9dcc4";
      ctx.beginPath();
      ctx.moveTo(-10, groundY);
      for (let x = -10; x <= w + 10; x += 10)
        ctx.lineTo(x, groundY - 22 - Math.sin(x * 0.018 + 1) * 10 - Math.sin(x * 0.05) * 4);
      ctx.lineTo(w + 10, groundY);
      ctx.fill();
      ctx.fillStyle = "#7cc28f";
      ctx.fillRect(-10, groundY, w + 20, h - groundY + 10);
      ctx.strokeStyle = "#5aa870";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 4; x < w; x += 13) {
        const sway = Math.sin(t * 2 + x * 0.2) * 1.2;
        ctx.moveTo(x, groundY + 1);
        ctx.lineTo(x - 2 + sway, groundY - 4);
        ctx.moveTo(x + 2, groundY + 1);
        ctx.lineTo(x + 3 + sway, groundY - 5);
      }
      ctx.stroke();

      drawSign(ctx);
      // De atrás hacia adelante: adultos, niños y el perro.
      for (const p of people) drawPerson(ctx, p, t);
      drawDog(ctx, dog);
    },
  };
}

useCanvasScene(canvas, createScene, { warmup: 2 });
</script>
<template>
  <canvas
    ref="canvas"
    class="scene-canvas family-canvas"
    role="img"
    aria-label="Animación: una familia de cuatro y su perro en su punto de encuentro; mamá palomea el plan y papá señala el letrero"
  ></canvas>
</template>
