'use strict';

/**
 * gameEngine.js — Motor principal del juego "Misión Extintor"
 * Depende de: fireData.js (EXTINGUISHERS, SCENARIOS, FIRE_CLASSES)
 *             uiManager.js (UI, AudioManager)
 */

// ─────────────────────────────────────────────────────────────────────────────
// CALIBRACIÓN DE COLISIONES Y EXTINCIÓN (Constantes de Jugabilidad)
// ─────────────────────────────────────────────────────────────────────────────
const MIN_HITBOX_WIDTH     = 110; // Ancho mínimo de hitbox_base (desacoplado de lo visual)
const MIN_HITBOX_HEIGHT    = 65;  // Alto mínimo de hitbox_base
const SPRAY_RADIUS         = 45;  // Radio de aspersión del chorro con ratón (AoE)
const SPRAY_RADIUS_TOUCH   = 60;  // Radio de aspersión ampliado para pantallas táctiles
const EXTINGUISH_THRESHOLD = 8;   // Umbral de remate automático (Snap-to-Zero al bajar del 8%)

class GameEngine {
  /**
   * @param {HTMLCanvasElement} canvas  - Elemento canvas del juego
   * @param {AudioContext}      audioCtx - Contexto de audio Web API (opcional)
   */
  constructor(canvas, audioCtx) {
    // Referencia al canvas y contexto 2D
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Contexto de audio (opcional, AudioManager gestiona el sonido principal)
    this.audioCtx = audioCtx;

    // Posición del puntero en el canvas
    this.pointerPos = { x: canvas.width / 2, y: canvas.height / 2 };

    // Radio de aspersión dinámico y estado de interacción táctil
    this.isTouch = false;
    this.currentSprayRadius = SPRAY_RADIUS;

    // Flags de impacto del chorro en tiempo real
    this.isHittingBase = false;
    this.isHittingTop  = false;

    // Estado del remate automático (Snap-to-Zero)
    this.snapToZero = false;
    this.snapStartTime = 0;
    this.snapStartIntensity = 0;

    // Sistema de partículas dinámico (fuego, chispas, humo, vapor blanco)
    this.particles = [];

    // Historial de posiciones X del puntero para detección de barrido
    this._pointerHistory = [];

    // Estado completo del juego
    this.state = {
      phase: 'idle',           // 'identify'|'select'|'prepare'|'combat'|'victory'|'defeat'
      scenarioIndex: 0,
      fireIntensity: 100,       // 0–100: nivel de intensidad del fuego
      extinguisherCharge: 100,  // 0–100: carga restante del extintor
      timeLeft: 30,             // segundos restantes en la fase de combate
      selectedExtinguisher: null,
      pinPulled: false,         // ¿se jaló el pasador (pin)?
      tape: {                   // Indicadores T-A-P-E del extintor
        T: false,  // Tirar el seguro
        A: false,  // Apuntar a la base
        P: false,  // Presionar la manija
        E: false,  // Esparcir en barrido
      },
      diagnosisAttempts: 0,    // Intentos erróneos de diagnóstico
      selectAttempts: 0,       // Intentos erróneos de selección
      baseHits: 0,             // Fotogramas apuntando a la base
      topHits: 0,              // Fotogramas apuntando a las llamas
      sweepDetected: false,    // ¿Se realizó el barrido horizontal?
      lastPointerX: null,
      sweepDistance: 0,
      shooting: false,         // ¿El jugador está descargando el extintor?
      animFrame: null,         // ID del requestAnimationFrame activo
      timerInterval: null,     // ID del setInterval del cronómetro
    };

    // Inicializar eventos de puntero en el canvas
    this._pointerEventsAttached = false;
    this.setupPointerEvents();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDERIZADO DEL CANVAS Y ESCENA
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Dibuja la escena completa en el canvas.
   * @param {object} scenario - Objeto escenario de SCENARIOS
   */
  renderScene(scenario) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    if (!scenario || !scenario.visualConfig) return;
    const cfg = scenario.visualConfig;

    // Limpiar el canvas y pintar el fondo del escenario
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = cfg.bgColor || '#111827';
    ctx.fillRect(0, 0, W, H);

    // Dibujar los elementos visuales de la escena (muebles, estufa, regleta, etc.)
    this._drawElements(cfg.elements, W, H);

    // Obtener los hitboxes calculados con tamaño mínimo desacoplado
    const boxes = this._getHitboxes();

    // Dibujar el fuego dinámico y partículas en cada foco de incendio
    for (const fp of cfg.firePoints) {
      this._drawFire(fp, boxes);
    }

    // Dibujar hitboxes de depuración en modo combate (contornos sutiles)
    if (this.state.phase === 'combat' && boxes) {
      this._drawHitboxes(boxes);
    }

    // Dibujar la mira/retícula cuando estamos en fase de combate
    if (this.state.phase === 'combat') {
      this._drawReticle();

      // Dibujar el chorro del extintor si se está disparando y el pin fue retirado
      if (this.state.shooting && this.state.tape.P) {
        this._drawStream();
      }
    }
  }

  /**
   * Dibuja los elementos decorativos del escenario (rectángulos, elipses).
   * @param {Array}  elements - Array de objetos de elementos visuales
   * @param {number} W        - Ancho del canvas
   * @param {number} H        - Alto del canvas
   */
  _drawElements(elements, W, H) {
    if (!elements || !elements.length) return;
    const ctx = this.ctx;

    for (const el of elements) {
      ctx.save();
      ctx.fillStyle = el.color || '#888';

      if (el.type === 'rect') {
        ctx.fillRect(el.x, el.y, el.w, el.h);

        if (el.label) {
          ctx.fillStyle = 'rgba(255,255,255,0.65)';
          ctx.font = '600 11px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(el.label, el.x + el.w / 2, el.y + el.h / 2 + 4);
        }
      } else if (el.type === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(
          el.x,
          el.y,
          el.w / 2,
          el.h / 2,
          0, 0, Math.PI * 2
        );
        ctx.fill();

        if (el.label) {
          ctx.fillStyle = 'rgba(255,255,255,0.65)';
          ctx.font = '600 11px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText(el.label, el.x, el.y + 4);
        }
      }

      ctx.restore();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SISTEMA DE PARTÍCULAS Y ANIMACIÓN DINÁMICA DE FUEGO
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Dibuja el fuego con sistema de partículas, gradiente térmico y resplandor.
   * @param {{x:number, y:number, r:number}} fp - Foco del fuego
   * @param {{base:{x,y,w,h}, top:{x,y,w,h}}} [boxes] - Hitboxes activos
   */
  _drawFire(fp, boxes) {
    const ctx = this.ctx;
    const intensity = this.state.fireIntensity / 100; // 0.0 – 1.0
    const t = performance.now() / 1000;

    // Si el fuego está completamente extinguido y no hay partículas residuales, salir
    if (intensity <= 0 && this.particles.length === 0) return;

    ctx.save();

    // ── 1. RESPLANDOR AMBIENTAL (GLOW) CÁLIDO ────────────────────────────────
    if (intensity > 0) {
      const flickerPulse = 1 + Math.sin(t * 8) * 0.08 + Math.cos(t * 13) * 0.04;
      const glowRadius = Math.max(20, (fp.r * 2.6 * flickerPulse) * intensity);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const glowGrad = ctx.createRadialGradient(
        fp.x, fp.y - 10, 0,
        fp.x, fp.y - 10, glowRadius
      );
      glowGrad.addColorStop(0.0, `rgba(255, 140, 20, ${(0.42 * intensity).toFixed(3)})`);
      glowGrad.addColorStop(0.4, `rgba(239, 68, 68, ${(0.18 * intensity).toFixed(3)})`);
      glowGrad.addColorStop(1.0, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(fp.x, fp.y - 10, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // ── 2. GENERACIÓN DE PARTÍCULAS DINÁMICAS ────────────────────────────────
    if (intensity > 0) {
      // Cantidad de partículas proporcional a la intensidad del conato
      const spawnRate = Math.ceil(4 * intensity);
      const baseSpan = Math.max(MIN_HITBOX_WIDTH * 0.5, fp.r * 1.4 * intensity);

      for (let i = 0; i < spawnRate; i++) {
        const pX = fp.x + (Math.random() - 0.5) * baseSpan;
        const pY = fp.y + (Math.random() - 0.5) * 8;
        this._spawnFlameParticle(pX, pY, intensity);
      }

      // Generar chispas/brasas ascendentes de forma aleatoria
      if (Math.random() < 0.35 * intensity) {
        this._spawnSparkParticle(fp, baseSpan);
      }

      // Si arde libremente (sin impacto del extintor), emitir humo oscuro en la parte superior
      if (!this.isHittingBase && Math.random() < 0.25 * intensity) {
        this._spawnSmokeParticle(fp, intensity);
      }
    }

    // Si el extintor está impactando la base, emitir partículas densas de vapor blanco
    if (this.state.shooting && this.state.pinPulled && this.isHittingBase && boxes) {
      const steamCount = this.snapToZero ? 5 : 3;
      this._emitSteam(boxes.base, steamCount);
    }

    // ── 3. ACTUALIZAR Y DIBUJAR PARTÍCULAS ACTIVAS ───────────────────────────
    this._updateAndDrawParticles(ctx);

    // ── 4. NÚCLEO TÉRMICO VISUAL DE LA BASE (INDICADOR DE OBJETIVO) ───────────
    if (intensity > 0) {
      const corePulse = 1 + Math.sin(t * 12) * 0.1;
      const coreW = Math.max(30, (fp.r * 1.1 * corePulse) * intensity);
      const coreH = Math.max(14, (fp.r * 0.45 * corePulse) * intensity);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const coreGrad = ctx.createRadialGradient(
        fp.x, fp.y - 2, 0,
        fp.x, fp.y - 2, coreW
      );
      coreGrad.addColorStop(0.0, `rgba(255, 255, 255, ${(0.95 * intensity).toFixed(2)})`);
      coreGrad.addColorStop(0.3, `rgba(254, 240, 138, ${(0.85 * intensity).toFixed(2)})`);
      coreGrad.addColorStop(0.7, `rgba(249, 115, 22, ${(0.45 * intensity).toFixed(2)})`);
      coreGrad.addColorStop(1.0, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.ellipse(fp.x, fp.y - 2, coreW, coreH, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Genera una partícula de llama con gradiente térmico por capas.
   */
  _spawnFlameParticle(x, y, intensity) {
    const maxLife = 0.45 + Math.random() * 0.35; // 0.45s a 0.8s
    this.particles.push({
      type: 'flame',
      x,
      y,
      vx: (Math.random() - 0.5) * 1.4,
      vy: -(2.5 + Math.random() * 3.5) * (0.6 + intensity * 0.5),
      radius: (10 + Math.random() * 12) * Math.max(0.4, intensity),
      age: 0,
      maxLife,
      turbulence: 1.2 + Math.random() * 1.8,
      freq: 8 + Math.random() * 6,
      seed: Math.random() * Math.PI * 2,
    });
  }

  /**
   * Genera una partícula de chispa/brasa ascendente.
   */
  _spawnSparkParticle(fp, baseSpan) {
    this.particles.push({
      type: 'spark',
      x: fp.x + (Math.random() - 0.5) * baseSpan * 0.8,
      y: fp.y - 5,
      vx: (Math.random() - 0.5) * 2.8,
      vy: -(3.5 + Math.random() * 4.0),
      radius: 1.5 + Math.random() * 1.8,
      age: 0,
      maxLife: 0.5 + Math.random() * 0.6,
      flickerFreq: 15 + Math.random() * 15,
    });
  }

  /**
   * Genera humo oscuro cuando el fuego arde libremente.
   */
  _spawnSmokeParticle(fp, intensity) {
    const riseH = fp.r * 1.8 * intensity;
    this.particles.push({
      type: 'smoke',
      x: fp.x + (Math.random() - 0.5) * (fp.r * 0.8),
      y: fp.y - riseH,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -(1.4 + Math.random() * 1.6),
      radius: 10 + Math.random() * 8,
      maxRadius: 28 + Math.random() * 16,
      age: 0,
      maxLife: 1.0 + Math.random() * 0.8,
    });
  }

  /**
   * Genera partículas de vapor blanco y polvo extintor al impactar la base.
   * @param {{x:number, y:number, w:number, h:number}} baseBox
   * @param {number} count
   */
  _emitSteam(baseBox, count = 3) {
    for (let i = 0; i < count; i++) {
      const x = baseBox.x + Math.random() * baseBox.w;
      const y = baseBox.y + baseBox.h * 0.3 + Math.random() * (baseBox.h * 0.7);
      // Dispersión lateral amplia para confirmar impacto visual
      const sideDir = Math.random() < 0.5 ? -1 : 1;
      this.particles.push({
        type: 'steam',
        x,
        y,
        vx: sideDir * (2.5 + Math.random() * 6.5),
        vy: -(1.0 + Math.random() * 3.5),
        radius: 12 + Math.random() * 10,
        maxRadius: 36 + Math.random() * 20,
        age: 0,
        maxLife: 0.45 + Math.random() * 0.35,
      });
    }
  }

  /**
   * Ráfaga final de vapor blanco denso al activarse el umbral de remate (Snap-to-Zero).
   * @param {{x:number, y:number, w:number, h:number}} baseBox
   * @param {number} count
   */
  _emitSteamBurst(baseBox, count = 40) {
    for (let i = 0; i < count; i++) {
      const x = baseBox.x + Math.random() * baseBox.w;
      const y = baseBox.y + Math.random() * baseBox.h;
      const angle = Math.random() * Math.PI * 2;
      const speed = 3.0 + Math.random() * 8.0;
      this.particles.push({
        type: 'steam',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: -Math.abs(Math.sin(angle) * speed) - 1.5,
        radius: 14 + Math.random() * 12,
        maxRadius: 45 + Math.random() * 25,
        age: 0,
        maxLife: 0.6 + Math.random() * 0.5,
      });
    }
  }

  /**
   * Actualiza la física y dibuja todas las partículas activas.
   * @param {CanvasRenderingContext2D} ctx
   */
  _updateAndDrawParticles(ctx) {
    const dt = 1 / 60; // aprox 16.6ms por fotograma
    const alive = [];

    for (const p of this.particles) {
      p.age += dt;
      if (p.age >= p.maxLife) continue;

      const progress = p.age / p.maxLife; // 0.0 -> 1.0

      if (p.type === 'flame') {
        // Movimiento ondulatorio (turbulencia horizontal sinusoidal)
        p.x += p.vx + Math.sin(p.age * p.freq + p.seed) * p.turbulence;
        p.y += p.vy;

        const currentR = p.radius * (1 - progress * 0.45);
        if (currentR <= 0) continue;

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // ── GRADIENTE TÉRMICO POR CAPAS ──
        let colCenter, colOuter;
        if (progress < 0.22) {
          // Capa 1: Base / Núcleo — Blanco y amarillo brillante
          const a = (1 - progress / 0.22 * 0.15).toFixed(2);
          colCenter = `rgba(255, 255, 255, ${a})`;
          colOuter  = `rgba(254, 240, 138, ${(a * 0.8).toFixed(2)})`;
        } else if (progress < 0.62) {
          // Capa 2: Cuerpo medio — Naranja intenso
          const normP = (progress - 0.22) / 0.40;
          const a = (0.85 * (1 - normP * 0.3)).toFixed(2);
          colCenter = `rgba(249, 115, 22, ${a})`;
          colOuter  = `rgba(234, 88, 12, ${(a * 0.6).toFixed(2)})`;
        } else {
          // Capa 3: Puntas — Rojo vivo que se desvanece
          const normP = (progress - 0.62) / 0.38;
          const a = Math.max(0, 0.65 * (1 - normP)).toFixed(2);
          colCenter = `rgba(220, 38, 38, ${a})`;
          colOuter  = `rgba(185, 28, 28, 0)`;
        }

        const radGrad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, currentR
        );
        radGrad.addColorStop(0, colCenter);
        radGrad.addColorStop(1, colOuter);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (p.type === 'spark') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy *= 0.98;

        const sparkAlpha = Math.max(0, 1 - progress);
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(254, 240, 138, ${sparkAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (p.type === 'smoke') {
        p.x += p.vx;
        p.y += p.vy;
        p.radius += (p.maxRadius - p.radius) * 0.04;

        const smokeAlpha = Math.max(0, 0.32 * (1 - progress));
        ctx.save();
        ctx.fillStyle = `rgba(60, 64, 75, ${smokeAlpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else if (p.type === 'steam') {
        // Vapor blanco denso del extintor
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95; // Fricción con el aire
        p.vy *= 0.96;
        p.radius += (p.maxRadius - p.radius) * 0.08;

        const steamAlpha = Math.max(0, 0.75 * (1 - progress));
        ctx.save();
        const steamGrad = ctx.createRadialGradient(
          p.x, p.y, 0,
          p.x, p.y, p.radius
        );
        steamGrad.addColorStop(0.0, `rgba(255, 255, 255, ${steamAlpha.toFixed(2)})`);
        steamGrad.addColorStop(0.5, `rgba(224, 242, 254, ${(steamAlpha * 0.6).toFixed(2)})`);
        steamGrad.addColorStop(1.0, 'rgba(224, 242, 254, 0)');

        ctx.fillStyle = steamGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      alive.push(p);
    }

    this.particles = alive;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MECÁNICA DE COLISIONES, HITBOXES Y ÁREA DE EFECTO (AoE)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Devuelve los rectángulos de los hitboxes con desacoplamiento visual:
   * Regla 1: Aunque las llamas se reduzcan, la base nunca es menor a
   * MIN_HITBOX_WIDTH x MIN_HITBOX_HEIGHT centrada en el foco.
   * @returns {{ base: {x,y,w,h}, top: {x,y,w,h} } | null}
   */
  _getHitboxes() {
    const scenario = this._currentScenario();
    if (!scenario || !scenario.visualConfig || !scenario.visualConfig.firePoints.length) {
      return null;
    }

    const fp = scenario.visualConfig.firePoints[0];
    const intensity = this.state.fireIntensity / 100;

    // Dimensiones escalares brutas según intensidad
    const rawBaseW = fp.r * 2.2 * Math.max(0.2, intensity);
    const rawBaseH = fp.r * 0.9 * Math.max(0.2, intensity);

    // ── REGLA 1: TAMAÑO MÍNIMO DE HITBOX (DESACOPLADO DE LO VISUAL) ───────────
    const baseW = Math.max(rawBaseW, MIN_HITBOX_WIDTH);
    const baseH = Math.max(rawBaseH, MIN_HITBOX_HEIGHT);

    // Centrado en el foco del conato (fp.x, fp.y)
    const baseX = fp.x - baseW / 2;
    const baseY = fp.y - baseH * 0.75;

    // Hitbox superior (cuerpo y punta de las llamas)
    const topW = Math.max(rawBaseW * 1.1, MIN_HITBOX_WIDTH * 0.95);
    const topH = Math.max(fp.r * 2.4 * intensity, 65);
    const topX = fp.x - topW / 2;
    const topY = baseY - topH;

    return {
      base: { x: baseX, y: baseY, w: baseW, h: baseH },
      top:  { x: topX,  y: topY,  w: topW,  h: topH  },
    };
  }

  /**
   * Regla 2: Radio de Dispersión del Chorro (Área de Efecto / AoE)
   * Evalúa la colisión como un círculo de aspersión contra una caja rectangular.
   * @param {{x: number, y: number, r: number}} circle - Círculo de aspersión
   * @param {{x: number, y: number, w: number, h: number}} box - Caja rectangular
   * @returns {boolean}
   */
  _circleIntersectsBox(circle, box) {
    if (!box) return false;
    const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.w));
    const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.h));
    const distX = circle.x - closestX;
    const distY = circle.y - closestY;
    return (distX * distX + distY * distY) <= (circle.r * circle.r);
  }

  /**
   * Dibuja los hitboxes de depuración en pantalla para retroalimentación didáctica.
   * @param {{base:{x,y,w,h}, top:{x,y,w,h}}} boxes
   */
  _drawHitboxes(boxes) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.22;

    // hitbox_base — verde (zona correcta)
    ctx.strokeStyle = this.isHittingBase ? '#22c55e' : '#00ff88';
    ctx.lineWidth = this.isHittingBase ? 3 : 2;
    ctx.strokeRect(boxes.base.x, boxes.base.y, boxes.base.w, boxes.base.h);

    // hitbox_top — rojo (zona incorrecta)
    ctx.strokeStyle = this.isHittingTop ? '#f97316' : '#ff4444';
    ctx.lineWidth = this.isHittingTop ? 3 : 2;
    ctx.strokeRect(boxes.top.x, boxes.top.y, boxes.top.w, boxes.top.h);

    ctx.restore();
  }

  /**
   * Dibuja la mira con retroalimentación visual del área de efecto (AoE).
   */
  _drawReticle() {
    const ctx = this.ctx;
    const { x, y } = this.pointerPos;
    const r = this.currentSprayRadius;

    ctx.save();

    // ── Halo del Radio de Dispersión (AoE) ───────────────────────────────────
    let aoeColor = 'rgba(255, 255, 255, 0.25)';
    if (this.state.shooting && this.state.pinPulled) {
      if (this.isHittingBase) {
        aoeColor = 'rgba(34, 197, 94, 0.7)'; // Verde impacto base
      } else if (this.isHittingTop) {
        aoeColor = 'rgba(249, 115, 22, 0.7)'; // Naranja alerta llamas
      } else {
        aoeColor = 'rgba(96, 165, 250, 0.45)'; // Azul descarga libre
      }
    }

    ctx.strokeStyle = aoeColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // ── Mira central clásica ────────────────────────────────────────────────
    ctx.strokeStyle = this.isHittingBase ? '#4ade80' : 'rgba(255,255,255,0.95)';
    ctx.lineWidth = 2;

    // Círculo central
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.stroke();

    // Brazos de la cruz
    const arm = 24;
    const gap = 5;
    // horizontal
    ctx.beginPath();
    ctx.moveTo(x - arm, y); ctx.lineTo(x - gap, y);
    ctx.moveTo(x + gap, y); ctx.lineTo(x + arm, y);
    // vertical
    ctx.moveTo(x, y - arm); ctx.lineTo(x, y - gap);
    ctx.moveTo(x, y + gap); ctx.lineTo(x, y + arm);
    ctx.stroke();

    // Punto central
    ctx.fillStyle = this.isHittingBase ? '#22c55e' : 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Dibuja el chorro del extintor con apertura en abanico según el radio de aspersión.
   */
  _drawStream() {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    const { x: tx, y: ty } = this.pointerPos;

    // Origen: centro inferior del canvas (boquilla del extintor)
    const sx = W / 2;
    const sy = H;

    // Punto de control para curvatura natural
    const cpx = (sx + tx) / 2 + (Math.random() - 0.5) * 8;
    const cpy = (sy + ty) / 2 - 50;

    ctx.save();

    // Chorro principal
    const streamGrad = ctx.createLinearGradient(sx, sy, tx, ty);
    streamGrad.addColorStop(0,   'rgba(240, 249, 255, 0.95)');
    streamGrad.addColorStop(0.6, 'rgba(186, 230, 253, 0.7)');
    streamGrad.addColorStop(1,   'rgba(255, 255, 255, 0.3)');

    // Halo exterior
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cpx, cpy, tx, ty);
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.35)';
    ctx.lineWidth = 18;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Núcleo presurizado
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cpx, cpy, tx, ty);
    ctx.strokeStyle = streamGrad;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Cono de polvo en el punto de impacto
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * this.currentSprayRadius;
      const px = tx + Math.cos(angle) * dist;
      const py = ty + Math.sin(angle) * dist;

      ctx.beginPath();
      ctx.arc(px, py, 2 + Math.random() * 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(224, 242, 254, 0.6)';
      ctx.fill();
    }

    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // BUCLE DE COMBATE ACTIVO Y CONTROL DE EXTINCIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Inicia el bucle de animación de combate con requestAnimationFrame.
   */
  startCombatLoop() {
    if (this.state.animFrame) {
      cancelAnimationFrame(this.state.animFrame);
      this.state.animFrame = null;
    }

    const scenario = this._currentScenario();

    const loop = () => {
      // 1. Renderizar la escena en cada fotograma
      this.renderScene(scenario);

      const boxes = this._getHitboxes();

      if (this.state.shooting && this.state.pinPulled) {
        // Drenar la carga del extintor
        this.state.extinguisherCharge = Math.max(
          0,
          this.state.extinguisherCharge - 0.4
        );

        // Evaluar colisión con el área de aspersión del chorro (AoE)
        if (boxes) {
          const sprayCircle = {
            x: this.pointerPos.x,
            y: this.pointerPos.y,
            r: this.currentSprayRadius
          };

          const hitBase = this._circleIntersectsBox(sprayCircle, boxes.base);
          const hitTop  = !hitBase && this._circleIntersectsBox(sprayCircle, boxes.top);

          this.isHittingBase = hitBase;
          this.isHittingTop  = hitTop;

          if (hitBase) {
            // ✅ Chorro impacta la BASE del fuego
            let reduction = 0.65;

            // Bono de barrido (×2.0) si el jugador realiza el movimiento continuo de lado a lado
            if (this.state.sweepDetected) {
              reduction *= 2.0;
            }

            this.state.fireIntensity = Math.max(0, this.state.fireIntensity - reduction);
            this.state.baseHits++;
            this.state.tape.A = true;

            // Ocultar alerta de mal apuntado
            if (typeof UI !== 'undefined') UI.showAimAlert(false);

            // ── REGLA 3: UMBRAL DE REMATE AUTOMÁTICO (SNAP-TO-ZERO) ──────────
            // Al bajar del 8% aplicando el chorro a la base, se remata a 0% en 0.25s
            if (this.state.fireIntensity > 0 && this.state.fireIntensity <= EXTINGUISH_THRESHOLD) {
              if (!this.snapToZero) {
                this.snapToZero = true;
                this.snapStartTime = performance.now();
                this.snapStartIntensity = this.state.fireIntensity;
                // Liberar ráfaga final de vapor blanco
                this._emitSteamBurst(boxes.base, 45);
              }
            }

          } else if (hitTop) {
            // ❌ Chorro impacta en las llamas superiores (sin reducción)
            this.state.topHits++;
            if (typeof UI !== 'undefined') UI.showAimAlert(true);
          } else {
            // Fuera de área
            if (typeof UI !== 'undefined') UI.showAimAlert(false);
          }
        }

        // Sonido de descarga presurizada
        this.playExtinguisherSound(true);
      } else {
        this.isHittingBase = false;
        this.isHittingTop  = false;
        this.playExtinguisherSound(false);
      }

      // Transición progresiva del remate automático (Snap-to-Zero)
      if (this.snapToZero && boxes) {
        const elapsed = performance.now() - this.snapStartTime;
        const progress = Math.min(1.0, elapsed / 250); // 0.25 segundos
        this.state.fireIntensity = Math.max(0, this.snapStartIntensity * (1.0 - progress));
        this._emitSteam(boxes.base, 3);

        if (progress >= 1.0 || this.state.fireIntensity <= 0) {
          this.state.fireIntensity = 0;
          this.snapToZero = false;
        }
      }

      // Audio del fuego proporcional a la intensidad
      this.playFireCrackle(this.state.fireIntensity);

      // Verificar condición de victoria
      if (this.state.fireIntensity <= 0) {
        this.endPhase('victory');
        return;
      }

      // Verificar condición de derrota
      if (this.state.extinguisherCharge <= 0 || this.state.timeLeft <= 0) {
        this.endPhase('defeat');
        return;
      }

      // Continuar el bucle de animación
      this.state.animFrame = requestAnimationFrame(loop);
    };

    this.state.animFrame = requestAnimationFrame(loop);

    // Cronómetro de cuenta regresiva (30s)
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }

    this.state.timerInterval = setInterval(() => {
      if (this.state.phase !== 'combat') return;
      this.state.timeLeft = Math.max(0, this.state.timeLeft - 1);
    }, 1000);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // EVENTOS DEL PUNTERO (POINTER EVENTS: TOUCH & MOUSE)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Configura los eventos unificados de puntero en el canvas.
   */
  setupPointerEvents() {
    if (this._pointerEventsAttached) return;
    this._pointerEventsAttached = true;
    const canvas = this.canvas;

    // ── pointerdown: comenzar a presionar la manija ──────────────────────────
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();

      // Si no ha quitado el seguro y estamos en preparación, advertir
      if (!this.state.pinPulled && this.state.phase === 'prepare') {
        if (typeof window.AudioManager !== 'undefined' && typeof window.AudioManager.playDangerAlert === 'function') {
          window.AudioManager.playDangerAlert();
        }
        if (typeof UI !== 'undefined' && typeof UI.showToast === 'function') {
          UI.showToast('¡Primero tira del seguro para liberar la manija!', 'warning');
        }
        return;
      }

      canvas.setPointerCapture(e.pointerId);
      this.state.shooting = true;
      this.state.tape.P = true; // Presionar manija
      this._updatePointerPos(e);
    });

    // ── pointermove: apuntado continuo y detección de barrido ────────────────
    canvas.addEventListener('pointermove', (e) => {
      e.preventDefault();
      const prevX = this.pointerPos.x;
      this._updatePointerPos(e);

      if (this.state.phase === 'combat') {
        this._trackSweep(prevX);

        // Sugerencia de barrido si lleva tiempo apuntando a la base sin barrer
        if (!this.state.sweepDetected && this.state.baseHits > 35) {
          if (typeof UI !== 'undefined') UI.showSweepTip(true);
        }
      }
    });

    // ── pointerup: liberar la manija de descarga ─────────────────────────────
    canvas.addEventListener('pointerup', (e) => {
      e.preventDefault();
      this.state.shooting = false;
    });

    canvas.addEventListener('pointercancel', () => {
      this.state.shooting = false;
    });
  }

  /**
   * Actualiza la posición del puntero y calibra el radio de aspersión.
   * @param {PointerEvent} e
   */
  _updatePointerPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;

    this.pointerPos = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };

    // Detectar pantalla táctil para aplicar SPRAY_RADIUS_TOUCH (60px)
    this.isTouch = (e.pointerType === 'touch');
    this.currentSprayRadius = this.isTouch ? SPRAY_RADIUS_TOUCH : SPRAY_RADIUS;
  }

  /**
   * Rastrea el desplazamiento horizontal para activar el bono de barrido (x2.0).
   * @param {number} prevX
   */
  _trackSweep(prevX) {
    const currentX = this.pointerPos.x;
    const delta = Math.abs(currentX - prevX);

    this.state.sweepDistance += delta;
    this._pointerHistory.push(currentX);

    if (this._pointerHistory.length > 60) {
      this._pointerHistory.shift();
    }

    if (this._pointerHistory.length >= 10) {
      const minX = Math.min(...this._pointerHistory);
      const maxX = Math.max(...this._pointerHistory);

      const boxes = this._getHitboxes();
      const overBase = boxes && this._circleIntersectsBox({
        x: this.pointerPos.x,
        y: this.pointerPos.y,
        r: this.currentSprayRadius
      }, boxes.base);

      // Si barre más de 80px sobre la base, activar bono permanente
      if ((maxX - minX) > 80 && overBase && !this.state.sweepDetected) {
        this.state.sweepDetected = true;
        this.state.tape.E = true; // Esparcir en barrido

        if (typeof UI !== 'undefined') UI.showSweepTip(false);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // OPERACIÓN DEL SEGURO (PASO 1 DE T.A.P.E.)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Ejecuta la acción de retirar el seguro metálico del extintor.
   */
  pullPin() {
    if (this.state.pinPulled) return;

    this.state.pinPulled = true;
    this.state.tape.T = true; // [T] Tirar seguro

    this._playPinClick();

    // Transición directa al combate activo
    this.startPhase('combat');
    this.startCombatLoop();
  }

  /**
   * Vincula la argolla interactiva del seguro.
   * @param {HTMLElement} pinElement
   */
  setupPinInteraction(pinElement) {
    if (!pinElement) return;
    const pullHandler = () => this.pullPin();
    pinElement.addEventListener('click',     pullHandler);
    pinElement.addEventListener('pointerup', pullHandler);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AUDIO SINTETIZADO
  // ─────────────────────────────────────────────────────────────────────────────

  playExtinguisherSound(active) {
    if (typeof window.AudioManager !== 'undefined' &&
        typeof window.AudioManager.playExtinguisherSound === 'function') {
      window.AudioManager.playExtinguisherSound(active);
    }
  }

  playFireCrackle(intensity) {
    if (typeof window.AudioManager !== 'undefined' &&
        typeof window.AudioManager.playFireCrackle === 'function') {
      window.AudioManager.playFireCrackle(intensity);
    }
  }

  _playPinClick() {
    if (typeof window.AudioManager !== 'undefined' &&
        typeof window.AudioManager.playPinClick === 'function') {
      window.AudioManager.playPinClick();
      return;
    }

    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(700, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.12);
    } catch (_) {}
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FASES Y MÉTRICAS
  // ─────────────────────────────────────────────────────────────────────────────

  startPhase(name) {
    this.state.phase = name;
    if (typeof UI !== 'undefined' && typeof UI.showPhase === 'function') {
      UI.showPhase(name, this._currentScenario());
    }
  }

  endPhase(result) {
    if (this.state.animFrame) {
      cancelAnimationFrame(this.state.animFrame);
      this.state.animFrame = null;
    }

    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
      this.state.timerInterval = null;
    }

    this.playExtinguisherSound(false);
    this.playFireCrackle(0);

    this.state.phase = result;

    if (typeof UI !== 'undefined' && typeof UI.showResult === 'function') {
      UI.showResult(result, this.getMetrics());
    }
  }

  getMetrics() {
    const { baseHits, topHits, extinguisherCharge, diagnosisAttempts, selectAttempts, sweepDetected } = this.state;
    const totalHits = baseHits + topHits;
    const accuracy  = totalHits > 0 ? (baseHits / totalHits) * 100 : 0;

    return {
      accuracy:          Math.round(accuracy * 10) / 10,
      baseRatio:         Math.round(accuracy * 10) / 10,
      chargeLeft:        Math.round(extinguisherCharge * 10) / 10,
      diagnosisAttempts,
      selectAttempts,
      sweepBonus:        sweepDetected,
    };
  }

  loadScenario(index) {
    if (this.state.animFrame) {
      cancelAnimationFrame(this.state.animFrame);
    }
    if (this.state.timerInterval) {
      clearInterval(this.state.timerInterval);
    }

    this._pointerHistory = [];
    this.particles = [];
    this.snapToZero = false;
    this.isHittingBase = false;
    this.isHittingTop = false;

    this.state = {
      phase: 'idle',
      scenarioIndex: index,
      fireIntensity: 100,
      extinguisherCharge: 100,
      timeLeft: 30,
      selectedExtinguisher: null,
      pinPulled: false,
      tape: { T: false, A: false, P: false, E: false },
      diagnosisAttempts: 0,
      selectAttempts: 0,
      baseHits: 0,
      topHits: 0,
      sweepDetected: false,
      lastPointerX: null,
      sweepDistance: 0,
      shooting: false,
      animFrame: null,
      timerInterval: null,
    };

    const scenario = this._currentScenario();
    if (!scenario) return;

    this.renderScene(scenario);
    this.startPhase('identify');
  }

  nextScenario() {
    const total = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.length : 1;
    const nextIndex = (this.state.scenarioIndex + 1) % total;
    this.loadScenario(nextIndex);
  }

  _currentScenario() {
    if (typeof SCENARIOS === 'undefined') return null;
    return SCENARIOS[this.state.scenarioIndex] || null;
  }
}

// Exponer en window
window.GameEngine = GameEngine;
