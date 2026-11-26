'use strict';

// ============================================================
// uiManager.js — Gestión de interfaz y audio para "Misión Extintor"
// Depende de: fireData.js (EXTINGUISHERS, SCENARIOS, FIRE_CLASSES)
// Debe cargarse antes de: gameEngine.js
// Expone: window.AudioManager, window.UI
// ============================================================

// ============================================================
// CLASE AudioManagerService — Audio sintético con Web Audio API
// ============================================================
class AudioManagerService {
  constructor() {
    /** @type {AudioContext|null} Contexto de audio, creado en primer gesto del usuario */
    this.ctx = null;
    /** @type {AudioBufferSourceNode|null} Fuente de ruido para el crepitar del fuego */
    this.fireNode = null;
    /** @type {GainNode|null} Nodo de ganancia del fuego */
    this.fireGain = null;
    /** @type {BiquadFilterNode|null} Filtro del fuego */
    this.fireFilter = null;
    /** @type {AudioBufferSourceNode|null} Fuente de ruido para el extintor */
    this.extNode = null;
  }

  // ----------------------------------------------------------
  // _init — Crea el AudioContext de forma diferida (tras gesto)
  // ----------------------------------------------------------
  _init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('AudioManager: Web Audio API no disponible.', e);
    }
  }

  // ----------------------------------------------------------
  // _makeNoiseBuffer — Genera un buffer de ruido blanco
  // @param {number} duracion — duración en segundos
  // ----------------------------------------------------------
  _makeNoiseBuffer(duracion) {
    const muestras = Math.ceil(this.ctx.sampleRate * duracion);
    const buffer = this.ctx.createBuffer(1, muestras, this.ctx.sampleRate);
    const datos = buffer.getChannelData(0);
    for (let i = 0; i < muestras; i++) {
      datos[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // ----------------------------------------------------------
  // playPinClick — Clic metálico corto al quitar el pasador
  // ----------------------------------------------------------
  playPinClick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // ----------------------------------------------------------
  // playExtinguisherSound — Silbido del extintor en uso
  // @param {boolean} activo — true: iniciar, false: detener
  // ----------------------------------------------------------
  playExtinguisherSound(activo) {
    if (!this.ctx) return;

    if (activo) {
      // Detener si ya estaba activo
      if (this.extNode) {
        try { this.extNode.stop(); } catch (_) {}
        this.extNode.disconnect();
        this.extNode = null;
      }

      const fuente = this.ctx.createBufferSource();
      fuente.buffer = this._makeNoiseBuffer(2);
      fuente.loop = true;

      const filtro = this.ctx.createBiquadFilter();
      filtro.type = 'bandpass';
      filtro.frequency.value = 2000;
      filtro.Q.value = 0.5;

      const ganancia = this.ctx.createGain();
      ganancia.gain.value = 0.3;

      fuente.connect(filtro);
      filtro.connect(ganancia);
      ganancia.connect(this.ctx.destination);
      fuente.start();

      this.extNode = fuente;
    } else {
      // Detener el ruido del extintor
      if (this.extNode) {
        try { this.extNode.stop(); } catch (_) {}
        this.extNode.disconnect();
        this.extNode = null;
      }
    }
  }

  // ----------------------------------------------------------
  // playFireCrackle — Crepitar del fuego, según intensidad
  // @param {number} intensidad — 0 a 100
  // ----------------------------------------------------------
  playFireCrackle(intensidad) {
    if (!this.ctx) return;
    const normalizado = Math.max(0, Math.min(100, intensidad)) / 100;

    // Si ya está corriendo, solo ajustar parámetros
    if (this.fireNode && this.fireGain && this.fireFilter) {
      this.fireFilter.frequency.setTargetAtTime(300 + normalizado * 2000, this.ctx.currentTime, 0.1);
      this.fireGain.gain.setTargetAtTime(normalizado * 0.5, this.ctx.currentTime, 0.1);
      return;
    }

    // Crear nodos si no existen
    const fuente = this.ctx.createBufferSource();
    fuente.buffer = this._makeNoiseBuffer(3);
    fuente.loop = true;

    const filtro = this.ctx.createBiquadFilter();
    filtro.type = 'lowpass';
    filtro.frequency.value = 300 + normalizado * 2000;

    const ganancia = this.ctx.createGain();
    ganancia.gain.value = normalizado * 0.5;

    fuente.connect(filtro);
    filtro.connect(ganancia);
    ganancia.connect(this.ctx.destination);
    fuente.start();

    this.fireNode = fuente;
    this.fireFilter = filtro;
    this.fireGain = ganancia;
  }

  // ----------------------------------------------------------
  // playDangerAlert — Alarma de dos tonos ante peligro
  // ----------------------------------------------------------
  playDangerAlert() {
    if (!this.ctx) return;
    const frecuencias = [880, 440];
    const duracion = 0.3;

    frecuencias.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const inicio = this.ctx.currentTime + i * duracion;

      osc.type = 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.5, inicio);
      gain.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(inicio);
      osc.stop(inicio + duracion);
    });
  }

  // ----------------------------------------------------------
  // playVictoryJingle — Arpegio ascendente de victoria
  // C4-E4-G4-C5, onda cuadrada, 0.15s cada nota
  // ----------------------------------------------------------
  playVictoryJingle() {
    if (!this.ctx) return;
    // Frecuencias: C4=261.63, E4=329.63, G4=392, C5=523.25
    const notas = [261.63, 329.63, 392.00, 523.25];
    const durNota = 0.15;

    notas.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const inicio = this.ctx.currentTime + i * durNota;

      osc.type = 'square';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.3, inicio);
      gain.gain.exponentialRampToValueAtTime(0.001, inicio + durNota);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(inicio);
      osc.stop(inicio + durNota);
    });
  }

  // ----------------------------------------------------------
  // stopAll — Detiene y desconecta todos los nodos activos
  // ----------------------------------------------------------
  stopAll() {
    // Detener fuego
    if (this.fireNode) {
      try { this.fireNode.stop(); } catch (_) {}
      this.fireNode.disconnect();
      this.fireNode = null;
      this.fireGain = null;
      this.fireFilter = null;
    }
    // Detener extintor
    if (this.extNode) {
      try { this.extNode.stop(); } catch (_) {}
      this.extNode.disconnect();
      this.extNode = null;
    }
  }
}

// Instancia global del manejador de audio
const AudioManager = new AudioManagerService();
window.AudioManager = AudioManager;

// ============================================================
// HUDUpdater — Actualiza el HUD cada 100ms durante combate
// ============================================================
const HUDUpdater = {
  /** @type {number|null} ID del intervalo activo */
  _intervalo: null,

  /** Inicia las actualizaciones periódicas del HUD */
  start() {
    if (this._intervalo !== null) return;
    this._intervalo = setInterval(() => {
      window.UI.updateHUD();
    }, 100);
  },

  /** Detiene las actualizaciones del HUD */
  stop() {
    if (this._intervalo !== null) {
      clearInterval(this._intervalo);
      this._intervalo = null;
    }
  }
};

// ============================================================
// UI — Gestión completa de la interfaz del juego
// ============================================================
const UI = {
  /** @type {Object} Pantallas cacheadas del DOM */
  screens: {},

  /** @type {Object|null} Referencia al motor del juego, asignada desde main */
  engine: null,

  // ----------------------------------------------------------
  // init — Carga el DOM y enlaza eventos
  // ----------------------------------------------------------
  init() {
    // Cachear pantallas principales
    UI.screens['#screen-intro']    = document.querySelector('#screen-intro');
    UI.screens['#screen-scenario'] = document.querySelector('#screen-scenario');
    UI.screens['#screen-result']   = document.querySelector('#screen-result');

    // Botón "Iniciar" en la pantalla de introducción
    const btnStart = document.querySelector('#btn-start');
    if (btnStart) {
      btnStart.addEventListener('click', () => UI.startGame());
    }

    // Botón "Repetir" en la pantalla de resultados
    const btnRepeat = document.querySelector('#btn-repeat');
    if (btnRepeat) {
      btnRepeat.addEventListener('click', () => UI.startGame());
    }

    // Botón "Siguiente escenario" en la pantalla de resultados
    const btnNext = document.querySelector('#btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => UI.nextScenario());
    }
  },

  // ----------------------------------------------------------
  // showScreen — Oculta todas las pantallas y muestra la indicada
  // @param {string} id — selector CSS de la pantalla destino
  // ----------------------------------------------------------
  showScreen(id) {
    Object.values(UI.screens).forEach(pantalla => {
      if (pantalla) pantalla.classList.remove('active');
    });
    const destino = UI.screens[id];
    if (destino) destino.classList.add('active');
  },

  // ----------------------------------------------------------
  // startGame — Arranca o reinicia el juego desde el principio
  // ----------------------------------------------------------
  startGame() {
    AudioManager._init();
    HUDUpdater.stop();
    UI.showScreen('#screen-scenario');
    UI.engine.loadScenario(0);
  },

  // ----------------------------------------------------------
  // nextScenario — Avanza al siguiente escenario
  // ----------------------------------------------------------
  nextScenario() {
    if (!UI.engine) return;
    const idx = (UI.engine.state.scenarioIndex || 0) + 1;
    if (idx < SCENARIOS.length) {
      UI.showScreen('#screen-scenario');
      UI.engine.loadScenario(idx);
    } else {
      // No hay más escenarios: volver al inicio
      UI.showScreen('#screen-intro');
    }
  },

  // ----------------------------------------------------------
  // showPhase — Actualiza el overlay de fase según la etapa actual
  // @param {string} fase — 'identify'|'select'|'prepare'|'combat'|'victory'|'defeat'
  // @param {Object} [scenario] — escenario actual (necesario en algunas fases)
  // ----------------------------------------------------------
  showPhase(fase, scenario) {
    const sc = scenario || (UI.engine && typeof UI.engine._currentScenario === 'function' ? UI.engine._currentScenario() : null);

    // Actualizar barra de título del escenario
    if (sc) {
      const numElem = document.getElementById('scenario-number');
      const titleElem = document.getElementById('scenario-title-text');
      if (numElem) {
        const idx = (UI.engine && UI.engine.state) ? UI.engine.state.scenarioIndex : 0;
        const total = (typeof SCENARIOS !== 'undefined') ? SCENARIOS.length : 4;
        numElem.textContent = `Escenario ${idx + 1} / ${total}`;
      }
      if (titleElem) {
        titleElem.textContent = sc.title;
      }
    }

    const overlay = document.querySelector('.phase-overlay');
    if (!overlay) return;

    // Limpiar contenido previo
    overlay.innerHTML = '';
    overlay.classList.remove('hidden');

    switch (fase) {
      case 'identify':
        if (document.getElementById('msg')) document.getElementById('msg').textContent = 'Fase 1: Diagnóstico de la Fuente. ¿Qué material está ardiendo?';
        UI._renderIdentifyPhase(overlay, sc);
        break;

      case 'select':
        if (document.getElementById('msg')) document.getElementById('msg').textContent = 'Fase 2: Selecciona en el gabinete el extintor correcto para esta Clase.';
        overlay.classList.add('hidden'); // el gabinete se muestra aparte
        UI.renderExtinguisherCabinet(sc);
        break;

      case 'prepare':
        if (document.getElementById('msg')) document.getElementById('msg').textContent = 'Fase 3: ¡Tira del seguro amarillo metálico para desbloquear la manija!';
        UI.showPinInstruction();
        break;

      case 'combat':
        if (document.getElementById('msg')) document.getElementById('msg').textContent = 'Fase 4: Apunta a la BASE del fuego y realiza barrido continuo de lado a lado.';
        overlay.classList.add('hidden');
        UI.showHUD();
        break;

      case 'victory':
      case 'defeat':
        // La pantalla de resultado se gestiona por showResult
        break;

      default:
        console.warn('showPhase: fase desconocida:', fase);
    }
  },

  // ----------------------------------------------------------
  // _renderIdentifyPhase — Renderiza los botones de clase de fuego
  // @param {HTMLElement} contenedor
  // @param {Object} scenario
  // ----------------------------------------------------------
  _renderIdentifyPhase(contenedor, scenario) {
    const titulo = document.createElement('h2');
    titulo.textContent = '🔥 Fase 1: Diagnóstico de la Fuente';
    titulo.className = 'phase-title';
    contenedor.appendChild(titulo);

    if (scenario && scenario.context) {
      const contexto = document.createElement('p');
      contexto.className = 'phase-subtitle';
      contexto.innerHTML = `⚠️ <strong>Situación:</strong> ${scenario.context}`;
      contenedor.appendChild(contexto);
    }

    const subtitulo = document.createElement('p');
    subtitulo.textContent = 'Identifica qué material se está quemando para determinar la Clase de Fuego:';
    subtitulo.style.fontSize = '0.9rem';
    subtitulo.style.color = 'var(--text-muted)';
    subtitulo.style.marginBottom = '0.75rem';
    contenedor.appendChild(subtitulo);

    const grid = document.createElement('div');
    grid.className = 'fire-class-grid';

    // Crear un botón por cada clase de fuego (A, B, C, K)
    Object.entries(FIRE_CLASSES).forEach(([clave, datos]) => {
      const btn = document.createElement('button');
      btn.className = 'btn-fire-class';
      btn.dataset.clase = clave;
      btn.innerHTML = `
        <span class="fire-class-icon">${datos.icon}</span>
        <span class="fire-class-label">Clase ${clave}</span>
        <span class="fire-class-name">${datos.name}</span>
      `;
      btn.addEventListener('click', () => {
        UI.handleDiagnosisChoice(clave, scenario);
      });
      grid.appendChild(btn);
    });

    contenedor.appendChild(grid);

    // Área de mensaje de error (se rellena si hay respuesta incorrecta)
    const errorMsg = document.createElement('p');
    errorMsg.className = 'phase-error hidden';
    errorMsg.setAttribute('role', 'alert');
    contenedor.appendChild(errorMsg);
  },

  // ----------------------------------------------------------
  // handleDiagnosisChoice — Evalúa la elección de clase de fuego
  // @param {string} claseElegida
  // @param {Object} scenario
  // ----------------------------------------------------------
  handleDiagnosisChoice(claseElegida, scenario) {
    if (claseElegida === scenario.fireClass) {
      // Respuesta correcta: destello verde y avanzar
      const btn = document.querySelector(`.btn-fire-class[data-clase="${claseElegida}"]`);
      if (btn) {
        btn.classList.add('correct-flash');
        setTimeout(() => btn.classList.remove('correct-flash'), 600);
      }
      setTimeout(() => {
        if (UI.engine) UI.engine.startPhase('select');
      }, 400);
    } else {
      // Respuesta incorrecta: mostrar mensaje de error educativo
      if (UI.engine && UI.engine.state) {
        UI.engine.state.diagnosisAttempts = (UI.engine.state.diagnosisAttempts || 0) + 1;
      }
      const infoErr = FIRE_CLASSES[claseElegida];
      const errorMsg = document.querySelector('.phase-error');
      if (errorMsg) {
        errorMsg.innerHTML = `❌ La <strong>Clase ${claseElegida}</strong> es para <em>${infoErr ? infoErr.name : 'otros materiales'}</em>.<br>Revisa la situación: <em>${scenario.context}</em>`;
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 4500);
      }
      // Efecto de sacudida en el botón equivocado
      const btnMalo = document.querySelector(`.btn-fire-class[data-clase="${claseElegida}"]`);
      if (btnMalo) {
        btnMalo.classList.add('shake');
        setTimeout(() => btnMalo.classList.remove('shake'), 400);
      }
    }
  },

  // ----------------------------------------------------------
  // handleExtinguisherChoice — Evalúa la elección del extintor
  // @param {string} extId
  // @param {Object} scenario
  // ----------------------------------------------------------
  handleExtinguisherChoice(extId, scenario) {
    const ext = EXTINGUISHERS.find(e => e.id === extId);
    if (!ext) return;

    const tarjeta = document.querySelector(`.ext-card[data-ext-id="${extId}"]`);

    // Verificar si el extintor genera una reacción peligrosa
    if (ext.dangerReactions && ext.dangerReactions[scenario.fireClass]) {
      // Alerta de peligro
      AudioManager.playDangerAlert();
      if (tarjeta) tarjeta.classList.add('danger');

      if (UI.engine && UI.engine.state) {
        UI.engine.state.selectAttempts = (UI.engine.state.selectAttempts || 0) + 1;
      }

      UI.showModal(
        '⚠️ ¡PELIGRO!',
        `<p class="danger-message">${ext.dangerReactions[scenario.fireClass]}</p>
         <p>Elige otro extintor adecuado para este tipo de fuego.</p>`,
        () => {
          if (tarjeta) tarjeta.classList.remove('danger');
        }
      );
      return;
    }

    // Verificar si es un extintor aceptable
    if (scenario.acceptableExtinguishers && scenario.acceptableExtinguishers.includes(extId)) {
      if (UI.engine && UI.engine.state) {
        UI.engine.state.selectedExtinguisher = ext;
      }

      if (extId === scenario.bestExtinguisher) {
        UI.showToast('⭐ ¡Elección óptima! Es el extintor ideal para este fuego.', 'success');
      } else {
        UI.showToast(`✔️ Extintor aceptable. Funcionará, aunque ${scenario.bestExtinguisher !== extId
          ? 'no es el más eficiente para este tipo de fuego.'
          : 'es óptimo.'}`, 'warning');
      }

      if (tarjeta) tarjeta.classList.add('selected');
      setTimeout(() => {
        if (UI.engine) UI.engine.startPhase('prepare');
      }, 500);
    } else {
      // Extintor no recomendado (no peligroso pero ineficaz)
      if (UI.engine && UI.engine.state) {
        UI.engine.state.selectAttempts = (UI.engine.state.selectAttempts || 0) + 1;
      }
      UI.showToast('❌ Este extintor no es adecuado para este tipo de fuego. Intenta con otro.', 'danger');
      if (tarjeta) {
        tarjeta.classList.add('shake');
        setTimeout(() => tarjeta.classList.remove('shake'), 400);
      }
    }
  },

  // ----------------------------------------------------------
  // showPinInstruction — Instrucción animada de extracción del pasador
  // ----------------------------------------------------------
  showPinInstruction() {
    const overlay = document.querySelector('.phase-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <h2 class="phase-title">🔧 Paso 1: Tira del seguro (T.A.P.E.)</h2>
      <p class="phase-subtitle">Tira del pasador amarillo para desbloquear la manija de descarga</p>
      <div class="pin-instruction-wrapper">
        <svg class="pin-svg" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg"
             role="img" aria-label="Válvula y seguro del extintor" id="pin-ring-svg">
          <!-- Cuerpo del extintor -->
          <rect x="70" y="70" width="60" height="130" rx="10" fill="#dc2626"/>
          <!-- Válvula base -->
          <rect x="80" y="45" width="40" height="25" rx="5" fill="#374151"/>
          
          <!-- Manija de palanca / gatillo (superior) -->
          <g id="pin-manija" cursor="pointer" class="interactive-lever" aria-label="Manija de descarga">
            <path d="M 85 45 L 135 25 L 140 32 L 95 48 Z" fill="#9ca3af" stroke="#6b7280" stroke-width="1"/>
            <rect x="88" y="22" width="40" height="8" rx="3" fill="#cbd5e1"/>
            <text x="110" y="18" text-anchor="middle" fill="#94a3b8" font-size="8" font-family="system-ui">Manija</text>
          </g>

          <!-- Manija fija inferior -->
          <rect x="88" y="52" width="35" height="7" rx="3" fill="#6b7280"/>

          <!-- Manguera -->
          <path d="M130 110 Q160 110 160 145" stroke="#1f2937" stroke-width="7" fill="none" stroke-linecap="round"/>
          
          <!-- Pasador / anillo amarillo de seguridad (elemento interactivo) -->
          <g id="pin-anillo" class="pin-ring" cursor="pointer" role="button" tabindex="0" aria-label="Argolla del seguro — tira hacia la izquierda">
            <line x1="90" y1="36" x2="68" y2="36" stroke="#f59e0b" stroke-width="4"/>
            <circle cx="58" cy="36" r="12" fill="#fef3c7" stroke="#f59e0b" stroke-width="4"/>
            <circle cx="58" cy="36" r="5" fill="#1e293b"/>
          </g>
          
          <!-- Flecha animada que indica la dirección de jalado -->
          <g class="pull-arrow">
            <line x1="58" y1="36" x2="20" y2="36" stroke="#22c55e" stroke-width="3"
                  stroke-dasharray="5,3" class="arrow-line"/>
            <polygon points="12,36 24,30 24,42" fill="#22c55e" class="arrow-head"/>
          </g>
          
          <!-- Etiqueta informativa -->
          <text x="100" y="165" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="system-ui">
            EXTINTOR
          </text>
          <text x="100" y="180" text-anchor="middle" fill="#fecaca" font-size="8" font-family="system-ui">
            SEGURO PUESTO
          </text>
        </svg>
        <p class="pin-hint">👉 Haz clic o desliza el <strong>anillo amarillo</strong> para retirarlo</p>
      </div>
    `;

    // Vincular interacción
    const anillo = document.getElementById('pin-anillo');
    const manija = document.getElementById('pin-manija');

    if (anillo) {
      const activarPin = (e) => {
        if (e) e.stopPropagation();
        AudioManager.playPinClick();
        if (UI.engine) UI.engine.pullPin();
      };
      anillo.addEventListener('click', activarPin);
      anillo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') activarPin(e);
      });
    }

    if (manija) {
      manija.addEventListener('click', (e) => {
        e.stopPropagation();
        AudioManager.playDangerAlert();
        UI.showToast('¡Primero tira del seguro para liberar la manija!', 'warning');
        manija.classList.add('shake');
        setTimeout(() => manija.classList.remove('shake'), 400);
      });
    }
  },

  // ----------------------------------------------------------
  // showHUD — Muestra el HUD e inicia las actualizaciones
  // ----------------------------------------------------------
  showHUD() {
    const hud = document.querySelector('.hud');
    if (hud) hud.classList.add('active');

    // Iniciar el actualizador periódico
    HUDUpdater.start();
  },

  // ----------------------------------------------------------
  // updateHUD — Refresca todos los indicadores del HUD
  // ----------------------------------------------------------
  updateHUD() {
    if (!UI.engine || !UI.engine.state) return;
    const estado = UI.engine.state;

    // Barra de intensidad del fuego
    const barraFuego = document.querySelector('.hud-fire-bar');
    if (barraFuego) {
      const pct = Math.max(0, Math.min(100, estado.fireIntensity || 0));
      barraFuego.style.width = `${pct}%`;
      barraFuego.setAttribute('aria-valuenow', pct);
    }

    // Barra de carga del extintor
    const barraCarga = document.querySelector('.hud-charge-bar');
    if (barraCarga) {
      const pct = Math.max(0, Math.min(100, estado.extinguisherCharge || 0));
      barraCarga.style.width = `${pct}%`;
      barraCarga.setAttribute('aria-valuenow', pct);
    }

    // Contador de tiempo
    const timer = document.querySelector('.hud-timer');
    if (timer) {
      const seg = Math.ceil(Math.max(0, estado.timeLeft || 0));
      timer.textContent = seg;
      // Pulso de alerta cuando quedan ≤10 segundos
      timer.classList.toggle('danger-pulse', seg <= 10);
    }

    // Insignias T-A-P-E (pasos del método TAPE)
    const pasos = ['T', 'A', 'P', 'E'];
    const tapeEstado = estado.tape || {};
    pasos.forEach(letra => {
      const badge = document.getElementById(`tape-${letra}`) || document.querySelector(`.tape-badge[data-step="${letra}"]`);
      if (!badge) return;
      const isDone = Boolean(tapeEstado[letra]);
      badge.classList.toggle('done', isDone);
      badge.classList.toggle('active', !isDone && (
        (letra === 'T' && estado.phase === 'prepare') ||
        (letra === 'A' && tapeEstado.T && !tapeEstado.A) ||
        (letra === 'P' && tapeEstado.A && !tapeEstado.P) ||
        (letra === 'E' && tapeEstado.P && !tapeEstado.E)
      ));
    });
  },

  // ----------------------------------------------------------
  // showAimAlert — Muestra u oculta la alerta de puntería
  // @param {boolean} mostrar
  // ----------------------------------------------------------
  showAimAlert(mostrar) {
    const alerta = document.getElementById('aim-alert') || document.querySelector('.aim-alert');
    if (alerta) {
      alerta.classList.toggle('hidden', !mostrar);
    }
  },

  // ----------------------------------------------------------
  // showSweepTip — Muestra u oculta el consejo de barrido
  // @param {boolean} mostrar
  // ----------------------------------------------------------
  showSweepTip(mostrar) {
    const consejo = document.getElementById('sweep-tip') || document.querySelector('.sweep-tip');
    if (consejo) {
      consejo.classList.toggle('hidden', !mostrar);
    }
  },

  // ----------------------------------------------------------
  // showToast — Muestra una notificación temporal (3s)
  // @param {string} mensaje
  // @param {'success'|'warning'|'danger'} tipo
  // ----------------------------------------------------------
  showToast(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.setAttribute('role', 'status');
    toast.textContent = mensaje;

    // Botón de cierre manual
    const cerrar = document.createElement('button');
    cerrar.className = 'toast-close';
    cerrar.textContent = '×';
    cerrar.setAttribute('aria-label', 'Cerrar notificación');
    cerrar.addEventListener('click', () => toast.remove());
    toast.appendChild(cerrar);

    document.body.appendChild(toast);

    // Disparar animación de entrada
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    // Eliminar tras 3 segundos
    setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3000);
  },

  // ----------------------------------------------------------
  // showModal — Muestra un cuadro de diálogo modal
  // @param {string} titulo
  // @param {string} cuerpoHTML — HTML del contenido del modal
  // @param {Function} [alCerrar] — callback al cerrar
  // ----------------------------------------------------------
  showModal(titulo, cuerpoHTML, alCerrar) {
    // Eliminar modal anterior si existe
    const anterior = document.querySelector('.modal-overlay');
    if (anterior) anterior.remove();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    const caja = document.createElement('div');
    caja.className = 'modal-box';

    const encabezado = document.createElement('div');
    encabezado.className = 'modal-header';

    const h3 = document.createElement('h3');
    h3.textContent = titulo;

    const btnCerrar = document.createElement('button');
    btnCerrar.className = 'modal-close';
    btnCerrar.textContent = '×';
    btnCerrar.setAttribute('aria-label', 'Cerrar');

    encabezado.appendChild(h3);
    encabezado.appendChild(btnCerrar);

    const cuerpo = document.createElement('div');
    cuerpo.className = 'modal-body';
    cuerpo.innerHTML = cuerpoHTML;

    caja.appendChild(encabezado);
    caja.appendChild(cuerpo);
    overlay.appendChild(caja);
    document.body.appendChild(overlay);

    // Lógica de cierre
    const cerrar = () => {
      overlay.classList.remove('modal-visible');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      if (typeof alCerrar === 'function') alCerrar();
    };

    btnCerrar.addEventListener('click', cerrar);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrar();
    });

    // Tecla Escape para cerrar
    const manejarEscape = (e) => {
      if (e.key === 'Escape') {
        cerrar();
        document.removeEventListener('keydown', manejarEscape);
      }
    };
    document.addEventListener('keydown', manejarEscape);

    // Disparar animación de entrada
    requestAnimationFrame(() => overlay.classList.add('modal-visible'));
  },

  // ----------------------------------------------------------
  // showResult — Muestra la pantalla de resultados
  // @param {'victory'|'defeat'} resultado
  // @param {Object} metricas — { accuracy, baseRatio, chargeLeft, sweepBonus,
  //                              diagnosisAttempts, selectAttempts }
  // ----------------------------------------------------------
  showResult(resultado, metricas) {
    HUDUpdater.stop();
    AudioManager.stopAll();

    if (resultado === 'victory') {
      AudioManager.playVictoryJingle();
    }

    // Calcular calificación
    const { accuracy = 0, diagnosisAttempts = 0, selectAttempts = 0 } = metricas || {};
    let calificacion;
    if (accuracy >= 80 && diagnosisAttempts === 0 && selectAttempts === 0) {
      calificacion = { texto: '🏅 Brigadista Experto', clase: 'grade-expert' };
    } else if (accuracy >= 50) {
      calificacion = { texto: '📋 En Entrenamiento', clase: 'grade-training' };
    } else {
      calificacion = { texto: '📚 Requiere Práctica', clase: 'grade-practice' };
    }

    // Tabla de referencia rápida
    const tablaRef = `
      <table class="ref-table" aria-label="Referencia rápida de extintores por clase">
        <thead>
          <tr>
            <th>Clase</th>
            <th>Tipo de fuego</th>
            <th>Extintor recomendado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>A</strong></td>
            <td>Sólidos (madera, papel, tela)</td>
            <td>Agua / PQS</td>
          </tr>
          <tr>
            <td><strong>B</strong></td>
            <td>Líquidos inflamables</td>
            <td>CO₂ / PQS</td>
          </tr>
          <tr>
            <td><strong>C</strong></td>
            <td>Equipos eléctricos</td>
            <td>CO₂ (nunca agua)</td>
          </tr>
          <tr>
            <td><strong>K</strong></td>
            <td>Aceites de cocina</td>
            <td>Tipo K / Wet Chemical</td>
          </tr>
        </tbody>
      </table>
    `;

    // Tarjetas de métricas institucionales (Cuenca Cimarrona)
    const metricasHTML = `
      <div class="metrics-grid">
        <div class="stat-box cool">
          <span class="stat-label">Precisión de tiro</span>
          <span class="big-number">${Math.round(metricas.accuracy || 0)}%</span>
        </div>
        <div class="stat-box warm">
          <span class="stat-label">Disparos en la base</span>
          <span class="big-number">${Math.round(metricas.baseRatio || 0)}%</span>
        </div>
        <div class="stat-box cool">
          <span class="stat-label">Carga restante</span>
          <span class="big-number">${Math.round(metricas.chargeLeft || 0)}%</span>
        </div>
        <div class="stat-box warm ${metricas.sweepBonus ? 'active-alert' : ''}">
          <span class="stat-label">Movimiento de barrido</span>
          <span class="big-number">${metricas.sweepBonus ? '✔️ Sí' : '❌ No'}</span>
        </div>
      </div>
    `;

    // Construir pantalla de resultado
    const pantalla = UI.screens['#screen-result'];
    if (pantalla) {
      pantalla.innerHTML = `
        <div class="result-container">
          <div class="result-header ${resultado === 'victory' ? 'result-victory' : 'result-defeat'}">
            <h1 class="result-title">
              ${resultado === 'victory' ? '🎉 ¡Fuego extinguido!' : '💥 Misión fallida'}
            </h1>
            <p class="result-grade ${calificacion.clase}">${calificacion.texto}</p>
          </div>

          <section class="result-section">
            <h2>📊 Métricas de desempeño</h2>
            ${metricasHTML}
          </section>

          <section class="result-section">
            <h2>📖 Referencia rápida de extintores</h2>
            ${tablaRef}
          </section>

          <div class="result-actions actions">
            <button id="btn-repeat" class="btn secondary">🔄 Repetir Escenario</button>
            <button id="btn-next" class="btn">➡️ Siguiente Escenario</button>
          </div>
        </div>
      `;

      // Re-enlazar botones (el innerHTML los reinicia)
      const btnRep = pantalla.querySelector('#btn-repeat');
      if (btnRep) btnRep.addEventListener('click', () => UI.startGame());

      const btnNxt = pantalla.querySelector('#btn-next');
      if (btnNxt) btnNxt.addEventListener('click', () => UI.nextScenario());
    }

    UI.showScreen('#screen-result');

    // Avisa a Cuenca Cimarrona que se apagó el fuego, para sumar puntos (cuenca-puntos.js)
    // Si no se apagó también terminó la partida: se pide la opinión sin sumar puntos
    if (resultado === 'victory' && window.CuencaPuntos) window.CuencaPuntos.terminar('alto-al-fuego');
    else if (window.CuencaPuntos && window.CuencaPuntos.opinar) window.CuencaPuntos.opinar();
  },

  // ----------------------------------------------------------
  // renderExtinguisherCabinet — Construye el gabinete de extintores
  // @param {Object} scenario — escenario activo
  // ----------------------------------------------------------
  renderExtinguisherCabinet(scenario) {
    const overlay = document.querySelector('.phase-overlay');
    if (!overlay) return;

    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <h2 class="phase-title">🧯 Selecciona el extintor correcto</h2>
      <p class="phase-subtitle">Elige el extintor adecuado para este tipo de fuego.</p>
      <div class="ext-cabinet" role="list" aria-label="Gabinete de extintores"></div>
    `;

    const gabinete = overlay.querySelector('.ext-cabinet');

    EXTINGUISHERS.forEach(ext => {
      const tarjeta = document.createElement('div');
      tarjeta.className = 'ext-card';
      tarjeta.dataset.extId = ext.id;
      tarjeta.setAttribute('role', 'listitem');
      tarjeta.setAttribute('tabindex', '0');
      tarjeta.setAttribute('aria-label', `Extintor: ${ext.name}`);

      tarjeta.innerHTML = `
        <div class="ext-icon" style="color:${ext.color}">
          ${ext.svgIcon}
        </div>
        <div class="ext-info">
          <span class="ext-name">${ext.name}</span>
          <span class="ext-label">${ext.label}</span>
        </div>
      `;

      // Evento de clic
      const elegir = () => UI.handleExtinguisherChoice(ext.id, scenario);
      tarjeta.addEventListener('click', elegir);
      tarjeta.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') elegir();
      });

      gabinete.appendChild(tarjeta);
    });
  }
};

// Exponer UI de forma global
window.UI = UI;
