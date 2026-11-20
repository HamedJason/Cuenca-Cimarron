<script setup>
// Mi cimarrón: editor del avatar, tienda de cosméticos y retos para ganar Cimacoins.
// El arte se genera con src/avatar/art.js (kit de avatares) y las reglas de la
// tienda con src/avatar/economy.js. El saldo es el mismo de todo el sitio.
// Visitantes: cartera y avatar en este navegador. Alumnos con sesión: en su cuenta
// (ver composables/useCimacoins.js y docs/avatar-cimarron.md).
import { computed, ref, nextTick, watch } from "vue";
import Icon from "../components/Icon.vue";
import {
  catalog,
  sections,
  defaults,
  find,
  normalize,
  assemble,
  svg,
  kits,
  newKits,
  kitCategories,
  secretKit,
} from "../avatar/art.js";
import {
  owns,
  kitOffer,
  itemOffer,
  rewardItems,
  activities,
  activityPattern,
  activityClaimed,
  foundClues,
  signals,
} from "../avatar/economy.js";
import {
  wallet as baseWallet,
  isTeacherAvatar,
  canCustomize,
  siteRewards,
  isClaimed,
  localDay,
  isAccountWallet,
  savedAvatar,
  saveAvatar,
  buy as buyTarget,
  completeChallenge,
  revealSecret,
} from "../composables/useCimacoins";
import { student, teacher, progress } from "../composables/useStudent";

// El docente tiene todas las piezas desbloqueadas y no usa monedas.
const allItems = Object.entries(catalog).flatMap(([group, c]) => c.items.map((item) => `${group}/${item.id}`));
const wallet = computed(() =>
  isTeacherAvatar.value ? { ...baseWallet.value, coins: 0, owned: allItems, angelic: true } : baseWallet.value,
);
// Solo se puede llevar puesto lo que ya es tuyo; lo demás vuelve a la pieza inicial.
const available = (candidate) =>
  Object.fromEntries(
    Object.entries(normalize(candidate)).map(([group, id]) => [
      group,
      owns(wallet.value, group, id) ? id : defaults[group],
    ]),
  );

const equipped = ref(available(savedAvatar()));
// Al entrar o salir de la cuenta del alumno se muestra el avatar de esa cartera.
watch(
  () => [isAccountWallet.value, student.value?.id, isTeacherAvatar.value],
  () => {
    if (isTeacherAvatar.value) mode.value = "coleccion";
    pending.value = null;
    equipped.value = available(savedAvatar());
  },
);
const mode = ref(isTeacherAvatar.value ? "coleccion" : "tienda");
const pending = ref(null);
const sectionIcons = { eyes: "face", helmet: "helmet", shirt: "shirt", backpack: "backpack", landscape: "landscape", kits: "kit" };
const kitSection = sections.findIndex((section) => section.icon === "kits");
const currentSection = ref(kitSection);
const currentGroup = ref("nuevos");
const rarity = ref("");
const status = ref("");
let statusTimer;
function notify(message) {
  clearTimeout(statusTimer);
  status.value = message;
  statusTimer = setTimeout(() => (status.value = ""), 3200);
}

const coins = computed(() => wallet.value.coins);
const isKitGroup = computed(() => !catalog[currentGroup.value]);
const pendingKit = computed(() => pending.value?.kit && kits.find((kit) => kit.id === pending.value.kit));
const preview = computed(() =>
  pendingKit.value
    ? pendingKit.value.state
    : pending.value
      ? { ...equipped.value, [pending.value.group]: pending.value.id }
      : equipped.value,
);
const stageSvg = computed(() => svg(assemble(preview.value)));
const stageEffect = computed(() => normalize(preview.value).efecto);

function commit(next) {
  pending.value = null;
  equipped.value = available(next);
  saveAvatar(equipped.value).then((ok) => {
    if (!ok) notify(isAccountWallet.value ? "No se pudo guardar tu cimarrón. Revisa tu internet." : "Este navegador no deja guardar tu avatar.");
  });
}

// --- Navegación ---
function chooseSection(i) {
  currentSection.value = i;
  currentGroup.value = sections[i].groups[0];
  if (mode.value === "coleccion" && i === kitSection) currentGroup.value = "todos";
}
function setMode(next) {
  mode.value = next;
  pending.value = null;
  rarity.value = "";
  if (next !== "retos") chooseSection(kitSection);
  if (next === "tienda") currentGroup.value = "nuevos";
}
const groupLabel = (id) => catalog[id]?.name ?? kitCategories[id];

// --- Miniaturas (se guardan para no volver a dibujarlas) ---
const thumbs = new Map();
const tallHats = ["mago", "capucha", "audifonos", "astronauta", "chef", "caballero", "lunar", "casco-espacial"];
function itemThumb(groupId, item) {
  const key = `${groupId}/${item.id}`;
  if (!thumbs.has(key)) {
    const group = catalog[groupId];
    const view =
      item.view ?? (groupId === "cabeza" && !tallHats.includes(item.id) ? "255 37 514 279" : group.view);
    thumbs.set(key, item.art ? svg(item.art, view, 88) : "");
  }
  return thumbs.get(key);
}
function kitThumb(kit) {
  const key = `kit/${kit.id}`;
  if (!thumbs.has(key)) thumbs.set(key, svg(assemble(kit.state, { layerIds: false }), "0 0 1024 1024", 160));
  return thumbs.get(key);
}

const priceLabel = (offer, reward) => {
  if (offer.owned) return { cls: "owned", text: "Es tuyo" };
  if (offer.price === null) return { cls: "reward", text: reward ? "Premio del sitio" : "Por desbloquear" };
  return { cls: "", text: `${offer.price}` };
};

const options = computed(() => {
  const group = catalog[currentGroup.value];
  if (!group) return [];
  const w = wallet.value;
  return group.items
    .filter((item) =>
      mode.value === "coleccion"
        ? owns(w, group.id, item.id)
        : (item.rarity !== "Secreto" || w.angelic) && (!rarity.value || item.rarity === rarity.value),
    )
    .map((item) => {
      const offer = itemOffer(group.id, item.id, w);
      const selected = pending.value
        ? pending.value.group === group.id && pending.value.id === item.id
        : equipped.value[group.id] === item.id;
      return {
        item,
        selected,
        scene: /^(fondo|marco|efecto)$/.test(group.id) && item.art,
        badge: priceLabel(offer, rewardItems[`${group.id}/${item.id}`]),
      };
    });
});
const activeKit = computed(() =>
  kits.find((kit) => Object.entries(kit.state).every(([group, id]) => equipped.value[group] === id)),
);
const kitOptions = computed(() => {
  const w = wallet.value;
  const list = currentGroup.value === "nuevos"
    ? newKits
    : kits.filter((kit) => currentGroup.value === "todos" || kit.category === currentGroup.value);
  return list
    .filter((kit) => (kit.category !== "secreto" || w.angelic) && (mode.value === "tienda" || kitOffer(kit, w).owned))
    .map((kit) => ({
      kit,
      selected: pending.value ? pending.value.kit === kit.id : activeKit.value?.id === kit.id,
      badge: priceLabel(kitOffer(kit, w), false),
    }));
});
const currentLabel = computed(() =>
  isKitGroup.value
    ? activeKit.value ? `Llevas · ${activeKit.value.name}` : "Combinación personalizada"
    : `Llevas · ${find(currentGroup.value, equipped.value[currentGroup.value])?.name}`,
);

function pickItem(id) {
  const group = currentGroup.value;
  if (owns(wallet.value, group, id)) commit({ ...equipped.value, [group]: id });
  else pending.value = { group, id };
}
function pickKit(kit) {
  if (kitOffer(kit, wallet.value).owned) {
    commit(kit.state);
    notify(`Kit aplicado · ${kit.name}`);
  } else pending.value = { kit: kit.id };
}

// --- Oferta de lo que estás probando ---
const offer = computed(() => {
  if (!pending.value) return null;
  const w = wallet.value;
  const kit = pendingKit.value;
  const result = kit ? kitOffer(kit, w) : itemOffer(pending.value.group, pending.value.id, w);
  const name = kit?.name ?? find(pending.value.group, pending.value.id)?.name;
  const rewardId = !kit && rewardItems[`${pending.value.group}/${pending.value.id}`];
  let detail;
  if (result.price === null)
    detail = rewardId
      ? `Se gana en el sitio: ${siteRewards[rewardId]?.label.toLowerCase()}.`
      : "Se desbloquea con un secreto.";
  else if (result.price <= w.coins) detail = kit ? "Incluye 20 % de descuento en las piezas que te faltan." : "Puedes comprarlo y ponértelo.";
  else detail = `Te faltan ${result.price - w.coins} Cimacoins.`;
  return { ...result, name, detail, canBuy: result.price !== null && result.price <= w.coins };
});
const buying = ref(false);
async function buy() {
  const target = pending.value;
  if (!target || buying.value) return;
  const state = pendingKit.value?.state ?? { ...equipped.value, [target.group]: target.id };
  buying.value = true;
  const result = await buyTarget(target);
  buying.value = false;
  if (result.ok) {
    commit(state);
    notify("¡Listo! Ya es parte de tu colección.");
  } else notify(result.message || "Revisa tu saldo o tu colección.");
}

function reset() {
  commit(defaults);
  notify("Volviste al cimarrón inicial.");
}
const take = (items) => items[Math.floor(Math.random() * items.length)].id;
function randomize() {
  const w = wallet.value;
  const next = Object.fromEntries(
    Object.values(catalog).map((group) => [group.id, take(group.items.filter((item) => owns(w, group.id, item.id)))]),
  );
  next.marco = "ninguno";
  if (Math.random() > 0.25) next.efecto = "ninguno";
  if (next.torso !== "verde") next.chaleco = "ninguno";
  commit(next);
  notify("Nueva combinación.");
}

// --- Descargas ---
function download(blob, extension) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = `mi-cimarron.${extension}`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
const currentSvg = () => new Blob([svg(assemble(equipped.value))], { type: "image/svg+xml;charset=utf-8" });
const exporting = ref(false);
async function downloadPng() {
  exporting.value = true;
  const url = URL.createObjectURL(currentSvg());
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1024;
    canvas.getContext("2d").drawImage(image, 0, 0, 1024, 1024);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG");
    download(blob, "png");
  } catch {
    notify("No se pudo crear la imagen. Intenta con SVG.");
  } finally {
    URL.revokeObjectURL(url);
    exporting.value = false;
  }
}

// --- Retos (memoria de señales) y secreto ---
const signalIcons = { cloud: "cloud", drop: "drop", sun: "sun", star: "star", bolt: "bolt", hill: "hill" };
const game = ref(null);
const gameHeading = ref(null);
const activityCards = computed(() =>
  activities.map((activity) => ({
    activity,
    claimed: activityClaimed(wallet.value, activity.id, localDay()),
    length: activity.pattern?.length ?? 7,
  })),
);
const clues = computed(() => foundClues(wallet.value));
const showStar = computed(() => !wallet.value.angelic && clues.value.length === 3);
async function focusGame() {
  await nextTick();
  gameHeading.value?.focus({ preventScroll: true });
}
function startActivity(id) {
  const activity = activities.find((a) => a.id === id);
  const day = localDay();
  const pattern = activityPattern(activity, day);
  game.value = { id, activity, day, pattern, length: pattern.length, phase: "memorize", answer: [], error: "", result: "" };
  focusGame();
}
function openSecret() {
  game.value = { id: "secreto", length: 3, phase: "answer", answer: [], error: "", result: "" };
  mode.value = "retos";
  focusGame();
}
function addSignal(id) {
  if (game.value.answer.length < game.value.length) game.value.answer.push(id);
  game.value.error = "";
}
async function submitGame() {
  const attempt = game.value;
  if (attempt.id === "secreto") {
    if (await revealSecret(attempt.answer)) {
      commit(secretKit.state);
      attempt.result = "¡Encontraste al Cimarrón Angelical! Todas sus piezas ya son tuyas.";
    } else attempt.error = "Las señales no encajan. Revisa los números de los fragmentos.";
    return;
  }
  if (attempt.id === "diario" && attempt.day !== localDay()) {
    startActivity(attempt.id);
    notify("El reto diario cambió. Memoriza la nueva secuencia.");
    return;
  }
  const correct = attempt.pattern.every((signal, i) => signal === attempt.answer[i]);
  if (!correct) {
    attempt.error = "Ese orden no coincide. Borra e inténtalo, o vuelve a mirar.";
    return;
  }
  if (await completeChallenge(attempt.id, attempt.answer, attempt.day)) {
    attempt.result = `¡Ganaste ${attempt.activity.coins} Cimacoins!`;
    if (attempt.activity.clue) attempt.result += " También encontraste un fragmento de constelación.";
  } else attempt.result = "¡Correcto! Ya habías recibido el premio de este reto.";
  focusGame();
}

// Cómo ganar en el sitio: lista para que los niños sepan dónde buscar
const siteGoals = computed(() => {
  const groups = [
    { title: "Abre cada juego", ids: Object.keys(siteRewards).filter((id) => id.startsWith("juego-")), to: "/juegos" },
    { title: "Termina cada juego", ids: Object.keys(siteRewards).filter((id) => id.startsWith("termino-")), to: "/juegos" },
    { title: "Completa las listas", ids: ["mochila-lista", "plan-listo", "botiquin-listo"], to: "/informacion" },
    { title: "Visita todas las secciones", ids: ["explorador"], to: "/" },
    { title: "Monedas escondidas", ids: Object.keys(siteRewards).filter((id) => id.startsWith("moneda-")), to: "/informacion" },
    { title: "Visita del día", ids: ["visita-diaria"], to: "/" },
  ];
  return groups.map((group) => ({
    ...group,
    done: group.ids.filter((id) => isClaimed(id)).length,
    total: group.ids.length,
    coins: group.ids.reduce((sum, id) => sum + siteRewards[id].coins, 0),
  }));
});
</script>

<template>
  <div v-if="!canCustomize" class="wrap av-page">
    <header class="av-intro">
      <div>
        <h1 class="page-title">Mi cimarrón</h1>
        <p class="section-lead">Tu propio cimarrón, con ropa, cascos y fondos que ganas con Cimacoins</p>
      </div>
    </header>
    <div class="av-gate">
      <p>Para tener tu cimarrón y ganar Cimacoins entra con el código de tu grupo. Pídeselo a tu maestra o maestro</p>
      <div class="av-gate-actions">
        <RouterLink to="/unirse" class="button primary">Entrar a mi grupo</RouterLink>
        <RouterLink to="/juegos" class="button secondary">Ir a los juegos</RouterLink>
      </div>
      <p class="small muted-text">Los juegos y la información están abiertos para todos, sin cuenta</p>
    </div>
  </div>
  <div v-else class="wrap av-page">
    <header class="av-intro">
      <div>
        <h1 class="page-title">Mi cimarrón</h1>
        <p v-if="!isTeacherAvatar" class="section-lead">Gana Cimacoins jugando y explorando, y viste a tu cimarrón como quieras</p>
        <p v-if="isTeacherAvatar" class="av-account">
          <Icon name="star" :size="18" />Como docente tienes todas las piezas desbloqueadas. Arma tu cimarrón como quieras
        </p>
        <p v-else-if="isAccountWallet" class="av-account">
          <Icon name="star" :size="18" />Tu cimarrón se guarda en tu grupo. Cada actividad que terminas te da Cimacoins
        </p>
        <p v-else class="av-account">
          Tu cimarrón se guarda en este navegador.
          <RouterLink to="/unirse">Entra con el código de tu grupo</RouterLink> para ganar Cimacoins con tus actividades
          y llevar tu cimarrón a cualquier equipo
        </p>
      </div>
      <p v-if="!isTeacherAvatar" class="av-wallet" aria-live="polite">
        <Icon name="coin" :size="22" /><strong>{{ coins.toLocaleString("es-MX") }}</strong> Cimacoins
      </p>
    </header>

    <nav v-if="!isTeacherAvatar" class="av-modes" aria-label="Secciones de Mi cimarrón">
      <button
        v-for="m in [{ id: 'coleccion', label: 'Mi colección' }, { id: 'tienda', label: 'Tienda' }, { id: 'retos', label: 'Ganar monedas' }]"
        :key="m.id"
        type="button"
        :aria-pressed="mode === m.id"
        @click="setMode(m.id)"
      >
        {{ m.label }}
      </button>
    </nav>

    <div class="av-workspace">
      <section class="av-preview" aria-labelledby="av-preview-title">
        <div class="av-preview-head">
          <h2 id="av-preview-title">Tu avatar</h2>
          <button class="av-quiet" type="button" @click="reset"><Icon name="reset" :size="16" /> Reiniciar</button>
        </div>
        <div class="av-stage-wrap">
          <div
            class="av-stage"
            :data-effect="stageEffect"
            role="img"
            :aria-label="pending ? 'Vista previa de lo que estás probando' : 'Tu cimarrón'"
            v-html="stageSvg"
          />
          <button
            v-if="showStar"
            class="av-star"
            type="button"
            aria-label="Examinar el destello"
            @click="openSecret"
          >
            <Icon name="star" :size="20" />
          </button>
        </div>
        <div v-if="offer" class="av-offer" role="status">
          <div>
            <strong>Probando · {{ offer.name }}</strong>
            <p>{{ offer.detail }}</p>
          </div>
          <div class="av-offer-actions">
            <button v-if="offer.price !== null" type="button" class="av-buy" :disabled="!offer.canBuy || buying" @click="buy">
              <Icon name="coin" :size="16" /> Comprar · {{ offer.price }}
            </button>
            <button v-else type="button" class="av-buy" @click="setMode('retos')">Cómo ganarlo</button>
            <button type="button" class="av-cancel" @click="pending = null">Quitar</button>
          </div>
        </div>
        <div class="av-actions">
          <button class="button secondary" type="button" @click="randomize"><Icon name="shuffle" :size="18" /> Al azar</button>
          <button class="button primary" type="button" :disabled="exporting" @click="downloadPng">
            <Icon name="download" :size="18" /> Descargar
          </button>
        </div>
        <button class="av-quiet av-svg" type="button" @click="download(currentSvg(), 'svg')">Descargar en SVG</button>
      </section>

      <section class="av-editor" aria-labelledby="av-editor-title">
        <h2 id="av-editor-title" class="sr-only">
          {{ { coleccion: "Mi colección", tienda: "Tienda", retos: "Ganar monedas" }[mode] }}
        </h2>

        <template v-if="mode !== 'retos'">
          <nav class="av-sections" aria-label="Categorías">
            <button
              v-for="(section, i) in sections"
              :key="section.name"
              type="button"
              class="av-tab"
              :aria-pressed="i === currentSection"
              @click="chooseSection(i)"
            >
              <Icon :name="sectionIcons[section.icon]" :size="18" />{{ section.name }}
            </button>
          </nav>
          <div class="av-body">
            <div class="av-groups" aria-label="Tipos de piezas">
              <button
                v-for="id in sections[currentSection].groups.filter((g) => mode === 'tienda' || g !== 'nuevos')"
                :key="id"
                type="button"
                class="av-chip"
                :aria-pressed="id === currentGroup"
                @click="currentGroup = id"
              >
                {{ groupLabel(id) }}
              </button>
              <label v-if="mode === 'tienda' && !isKitGroup" class="av-rarity">
                Rareza
                <select v-model="rarity">
                  <option value="">Todas</option>
                  <option>Común</option><option>Poco común</option><option>Raro</option><option>Épico</option><option>Legendario</option>
                </select>
              </label>
            </div>
            <p class="av-current">{{ currentLabel }}</p>

            <div v-if="isKitGroup" class="av-options av-kits">
              <button
                v-for="{ kit, selected, badge } in kitOptions"
                :key="kit.id"
                type="button"
                class="av-option"
                :aria-pressed="selected"
                @click="pickKit(kit)"
              >
                <span v-if="selected" class="av-check"><Icon name="check" :size="12" /></span>
                <span class="av-art scene" aria-hidden="true" v-html="kitThumb(kit)" />
                <span class="av-name">{{ kit.name }}</span>
                <span :class="['av-price', badge.cls]"><Icon v-if="!badge.cls" name="coin" :size="12" />{{ badge.text }}</span>
              </button>
              <p v-if="!kitOptions.length" class="av-empty">
                Aquí aparecen los kits completos que ya tienes. Pruébalos en la Tienda.
              </p>
            </div>
            <div v-else class="av-options">
              <button
                v-for="{ item, selected, scene, badge } in options"
                :key="item.id"
                type="button"
                class="av-option"
                :aria-pressed="selected"
                @click="pickItem(item.id)"
              >
                <span v-if="selected" class="av-check"><Icon name="check" :size="12" /></span>
                <span :class="['av-art', { scene }]" aria-hidden="true">
                  <span v-if="item.swatch" class="av-swatch" :style="{ background: item.swatch }" />
                  <span v-else-if="item.art" v-html="itemThumb(currentGroup, item)" />
                  <Icon v-else name="blank" :size="24" />
                </span>
                <span class="av-name">{{ item.name }}</span>
                <span v-if="item.rarity" :class="['av-rarity-tag', `r-${item.rarity.replace(' ', '-').toLowerCase()}`]">{{ item.rarity }}</span>
                <span :class="['av-price', badge.cls]"><Icon v-if="!badge.cls" name="coin" :size="12" />{{ badge.text }}</span>
              </button>
              <p v-if="!options.length" class="av-empty">
                {{ mode === "tienda" ? "No hay piezas de esta rareza aquí." : "Todavía no tienes piezas de este tipo. Búscalas en la Tienda." }}
              </p>
            </div>
          </div>
        </template>

        <div v-else class="av-body">
          <div v-if="game" class="av-game">
            <h3 ref="gameHeading" tabindex="-1">{{ game.id === "secreto" ? "Constelación escondida" : game.activity.name }}</h3>
            <template v-if="game.result">
              <p class="av-result">{{ game.result }}</p>
              <div class="av-game-actions">
                <button class="av-chip" type="button" @click="game = null">Volver a los retos</button>
                <button v-if="game.id !== 'secreto'" class="av-chip" type="button" @click="startActivity(game.id)">Practicar otra vez</button>
              </div>
            </template>
            <template v-else-if="game.phase === 'memorize'">
              <p>Memoriza las señales de izquierda a derecha. Cuando estés listo, escóndelas y repite el orden.</p>
              <div class="av-signals" aria-label="Secuencia a memorizar">
                <span v-for="(s, i) in game.pattern" :key="i" class="av-signal"><Icon :name="signalIcons[s]" :size="16" />{{ signals[s] }}</span>
              </div>
              <div class="av-game-actions">
                <button class="button primary" type="button" @click="game.phase = 'answer'">Ya me lo sé</button>
                <button class="av-chip" type="button" @click="game = null">Salir</button>
              </div>
            </template>
            <template v-else>
              <p>{{ game.id === "secreto" ? "Pon los fragmentos en el orden de la constelación." : "Repite las señales en el mismo orden." }}</p>
              <div class="av-signals" aria-label="Elige una señal">
                <button v-for="(name, id) in signals" :key="id" type="button" class="av-signal is-choice" @click="addSignal(id)">
                  <Icon :name="signalIcons[id]" :size="16" />{{ name }}
                </button>
              </div>
              <div class="av-signals av-answer" aria-label="Tu secuencia" aria-live="polite">
                <span v-for="(s, i) in game.answer" :key="i" class="av-signal"><Icon :name="signalIcons[s]" :size="16" />{{ signals[s] }}</span>
                <span v-if="!game.answer.length" class="av-signal is-empty">Toca una señal</span>
              </div>
              <p v-if="game.error" class="av-error" role="alert">{{ game.error }}</p>
              <div class="av-game-actions">
                <button class="button primary" type="button" :disabled="game.answer.length !== game.length" @click="submitGame">Comprobar</button>
                <button class="av-chip" type="button" @click="game.answer = []">Borrar</button>
                <button v-if="game.id !== 'secreto'" class="av-chip" type="button" @click="game.phase = 'memorize'; game.answer = []">Volver a mirar</button>
              </div>
            </template>
          </div>

          <template v-else>
            <h3 class="av-subtitle">En el sitio</h3>
            <ul class="av-goals">
              <li v-for="goal in siteGoals" :key="goal.title" :class="{ done: goal.done === goal.total }">
                <RouterLink :to="goal.to">
                  <strong>{{ goal.title }}</strong>
                  <span>{{ goal.done }}/{{ goal.total }}</span>
                </RouterLink>
                <span class="av-price"><Icon name="coin" :size="12" />hasta {{ goal.coins }}</span>
              </li>
            </ul>
            <p class="av-hint">
              Las monedas escondidas brillan un poco. Búscalas dentro de los temas de Información y en otras páginas.
            </p>

            <h3 class="av-subtitle">Retos de memoria</h3>
            <div class="av-activities">
              <article v-for="{ activity, claimed, length } in activityCards" :key="activity.id" class="av-activity">
                <h4>{{ activity.name }}</h4>
                <p>{{ length }} señales · {{ activity.id === "diario" ? "cambia cada día" : "premio la primera vez" }}</p>
                <span :class="['av-price', { owned: claimed }]">
                  <template v-if="claimed">Premio recibido</template>
                  <template v-else><Icon name="coin" :size="12" />+{{ activity.coins }}</template>
                </span>
                <button class="av-chip" type="button" @click="startActivity(activity.id)">{{ claimed ? "Practicar" : "Jugar" }}</button>
              </article>
            </div>
            <div v-if="clues.length" class="av-clues">
              <h4>Fragmentos de constelación · {{ clues.length }}/3</h4>
              <p v-if="wallet.angelic">La constelación está completa. El conjunto ya es tuyo.</p>
              <p v-else-if="clues.length === 3">Tienes los tres fragmentos. Busca un destello cerca de tu avatar.</p>
              <p v-else>Termina más retos para encontrar los demás.</p>
              <div class="av-signals">
                <span v-for="clue in clues" :key="clue.place" class="av-signal">
                  {{ clue.place }} · <Icon :name="signalIcons[clue.signal]" :size="16" />{{ signals[clue.signal] }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </section>
    </div>
    <p v-if="status" class="av-status" role="status">{{ status }}</p>
    <p v-if="!isAccountWallet && !isTeacherAvatar" class="av-note small muted-text">
      Tus monedas y tu avatar se guardan solo en este navegador. Si borras los datos del navegador o
      usas otro dispositivo, empiezas de nuevo.
    </p>
  </div>
</template>

<style>
.av-page { padding-block: 28px 56px; }
.av-intro { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 18px; }
.av-intro .section-lead { margin-top: 6px; }
.av-wallet { display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 999px; background: var(--gold-tint); border: 2px solid var(--uabc-gold); color: var(--gold-text); font-weight: 700; margin: 0; }
.av-account { margin: 6px 0 0; font-size: 0.95rem; color: var(--muted); }
.av-account svg { vertical-align: -3px; margin-right: 4px; }
.av-wallet strong { font-size: 1.35rem; color: var(--title); }
.av-gate { display: grid; gap: 14px; max-width: 640px; padding: 24px; border: 2px solid var(--edge); border-radius: var(--radius-card); background: var(--green-tint); box-shadow: 0 4px 0 var(--shadow); }
.av-gate > p:first-child { font-size: 1.15rem; color: var(--ink); }
.av-gate-actions { display: flex; flex-wrap: wrap; gap: 12px; }
.av-modes { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.av-modes button { font: inherit; font-weight: 700; padding: 10px 16px; border-radius: 999px; border: 2px solid var(--line); background: var(--surface); color: var(--ink); cursor: pointer; min-height: 44px; }
.av-modes button[aria-pressed="true"] { background: var(--uabc-green); border-color: var(--uabc-green); color: #fff; }
.av-workspace { display: grid; grid-template-columns: minmax(280px, .8fr) minmax(0, 1.2fr); gap: 20px; align-items: start; }
.av-preview, .av-editor { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-card, 18px); box-shadow: var(--shadow); }
.av-preview { padding: 16px; position: sticky; top: 90px; }
.av-preview-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.av-preview-head h2 { margin: 0; font-family: var(--font-heading); color: var(--title); font-size: 1.6rem; }
.av-quiet { border: 0; background: none; color: var(--muted); font: inherit; font-size: .85rem; font-weight: 700; display: inline-flex; gap: 6px; align-items: center; cursor: pointer; padding: 6px 4px; }
.av-quiet:hover { color: var(--uabc-green); text-decoration: underline; }
.av-svg { display: flex; margin: 8px auto 0; }
.av-stage-wrap { position: relative; }
.av-stage { aspect-ratio: 1; border-radius: 14px; overflow: hidden; border: 1px solid var(--line); background-color: #f6f5ed; background-image: conic-gradient(#e9eae1 25%, transparent 0 50%, #e9eae1 0 75%, transparent 0); background-size: 24px 24px; }
.av-stage > svg { width: 100%; height: 100%; display: block; }
.av-star { position: absolute; right: 12%; top: 13%; width: 36px; height: 36px; border-radius: 50%; border: 1px solid #eed9aa; background: #fff5d6; color: #927337; box-shadow: 0 0 16px #fff3b6; display: grid; place-items: center; cursor: pointer; animation: av-twinkle 2.4s ease-in-out infinite; }
.av-offer { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: center; margin-top: 10px; padding: 10px 12px; border-radius: 12px; background: var(--gold-tint); border: 1px solid var(--uabc-gold); }
.av-offer strong { font-size: .9rem; color: var(--title); }
.av-offer p { margin: 2px 0 0; font-size: .8rem; color: var(--gold-text); }
.av-offer-actions { display: flex; flex-direction: column; gap: 4px; align-items: stretch; }
.av-buy { font: inherit; font-weight: 800; font-size: .85rem; border-radius: 8px; border: 0; padding: 9px 12px; background: var(--uabc-green); color: #fff; cursor: pointer; display: inline-flex; gap: 6px; align-items: center; justify-content: center; }
.av-buy:disabled { opacity: .5; cursor: not-allowed; }
.av-cancel { font: inherit; font-size: .8rem; border: 0; background: none; color: var(--gold-text); text-decoration: underline; cursor: pointer; }
.av-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
.av-actions .button { width: 100%; justify-content: center; }
.av-sections { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); border-bottom: 1px solid var(--line); padding: 0 10px; }
.av-tab { font: inherit; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 12px 2px 10px; border: 0; border-bottom: 3px solid transparent; background: none; color: var(--muted); font-size: .8rem; font-weight: 700; cursor: pointer; min-height: 44px; }
.av-tab[aria-pressed="true"] { color: var(--uabc-green); border-bottom-color: var(--uabc-green); }
.av-body { padding: 16px 18px 20px; }
.av-groups { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-bottom: 10px; }
.av-chip { font: inherit; font-size: .85rem; font-weight: 700; padding: 8px 12px; min-height: 38px; border-radius: 9px; border: 1px solid var(--line); background: var(--paper); color: var(--ink); cursor: pointer; }
.av-chip[aria-pressed="true"] { background: var(--green-tint); border-color: var(--uabc-green); color: var(--title); }
.av-rarity { margin-left: auto; display: flex; gap: 6px; align-items: center; font-size: .8rem; font-weight: 700; color: var(--muted); }
.av-rarity select { font: inherit; padding: 6px; border-radius: 8px; border: 1px solid var(--line); background: var(--paper); color: var(--ink); }
.av-current { margin: 0 0 10px; font-size: .85rem; font-weight: 700; color: var(--muted); }
.av-options { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 9px; }
.av-kits { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.av-option { position: relative; font: inherit; display: flex; flex-direction: column; text-align: left; padding: 5px; border-radius: 12px; border: 1px solid var(--line); background: var(--paper); color: var(--ink); cursor: pointer; min-width: 0; }
.av-option:hover { border-color: var(--uabc-green); }
.av-option[aria-pressed="true"] { border-color: var(--uabc-green); box-shadow: inset 0 0 0 1px var(--uabc-green); background: var(--green-tint); }
.av-art { height: 70px; border-radius: 8px; background: #f0eee3; display: grid; place-items: center; overflow: hidden; color: #76867a; }
.av-kits .av-art { height: auto; aspect-ratio: 1; }
.av-art > span, .av-art > span > svg, .av-art > svg { width: 100%; height: 100%; display: block; }
.av-art > span > svg { padding: 6px; box-sizing: border-box; }
.av-art.scene > span > svg, .av-kits .av-art > svg { padding: 0; }
.av-swatch { width: 44px !important; height: 44px !important; border-radius: 50%; border: 2px solid #3b2314; box-shadow: inset -6px -5px 0 #3b231426, inset 5px 5px 0 #ffffff56; }
.av-name { font-size: .78rem; font-weight: 800; line-height: 1.2; margin: 6px 3px 2px; overflow-wrap: anywhere; }
.av-rarity-tag { margin: 0 3px 2px; font-size: .68rem; font-weight: 800; color: var(--muted); }
.r-poco-común { color: #2d795c; } .r-raro { color: #20419a; } .r-épico { color: #634697; } .r-legendario { color: #855608; } .r-secreto { color: #873764; }
.av-price { align-self: flex-start; margin: 3px; padding: 3px 7px; border-radius: 6px; background: #f5e9bf; color: #674d12; font-size: .72rem; font-weight: 800; display: inline-flex; gap: 4px; align-items: center; }
.av-price.owned { background: #e2efdc; color: #2f5d3e; }
.av-price.reward { background: #eae4f1; color: #60477b; }
.av-check { position: absolute; z-index: 1; right: 8px; top: 8px; width: 20px; height: 20px; border-radius: 50%; background: var(--uabc-green); color: #fff; display: grid; place-items: center; }
.av-empty { grid-column: 1 / -1; padding: 14px; border: 1px dashed var(--line); border-radius: 10px; color: var(--muted); margin: 0; }
.av-subtitle { font-family: var(--font-heading); color: var(--title); font-size: 1.4rem; margin: 0 0 10px; }
.av-subtitle + .av-goals { margin-top: 0; }
.av-goals { list-style: none; padding: 0; margin: 0 0 8px; display: grid; gap: 6px; }
.av-goals li { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 10px; border: 1px solid var(--line); background: var(--paper); }
.av-goals li.done { opacity: .65; }
.av-goals a { flex: 1; display: flex; justify-content: space-between; gap: 8px; color: var(--ink); text-decoration: none; }
.av-goals a:hover strong { text-decoration: underline; }
.av-goals a span { color: var(--muted); font-weight: 700; }
.av-hint { font-size: .85rem; color: var(--muted); margin: 0 0 20px; }
.av-activities { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.av-activity { padding: 12px; border-radius: 11px; border: 1px solid var(--line); background: var(--paper); display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.av-activity h4, .av-clues h4 { margin: 0; font-family: var(--font-heading); font-size: 1.2rem; color: var(--title); }
.av-activity p, .av-clues p, .av-game p { margin: 0; color: var(--muted); font-size: .85rem; }
.av-clues, .av-game { margin-top: 12px; padding: 14px; border-radius: 12px; border: 1px solid var(--line); background: var(--paper); }
.av-game { margin-top: 0; }
.av-game h3 { margin: 0 0 8px; font-family: var(--font-heading); font-size: 1.5rem; color: var(--title); }
.av-signals { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 12px; }
.av-signal { font: inherit; display: inline-flex; align-items: center; gap: 6px; padding: 8px 10px; border-radius: 8px; background: var(--green-tint); border: 1px solid var(--line); color: var(--title); font-size: .85rem; font-weight: 800; }
.av-signal.is-choice { cursor: pointer; min-height: 44px; }
.av-signal.is-empty { background: none; border-style: dashed; color: var(--muted); }
.av-answer { min-height: 40px; }
.av-game-actions { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 14px; align-items: center; }
.av-result { font-weight: 800; color: var(--title) !important; font-size: 1rem !important; }
.av-error { color: #a0303f !important; font-weight: 700; margin-top: 10px !important; }
.av-status { position: fixed; z-index: 30; left: 50%; bottom: 20px; transform: translateX(-50%); background: var(--title); color: var(--paper); padding: 10px 16px; border-radius: 10px; font-weight: 700; margin: 0; max-width: calc(100% - 32px); text-align: center; }
.av-note { margin-top: 18px; }
.av-stage #efecto { animation: av-appear .3s ease; }
.av-stage[data-effect="lluvia"] #efecto { animation: av-rain 1.4s linear infinite; }
.av-stage[data-effect="brillo"] #efecto, .av-stage[data-effect="aura"] #efecto { animation: av-twinkle 2.4s ease-in-out infinite; }
@keyframes av-appear { from { opacity: 0; } }
@keyframes av-rain { 0% { transform: translate(11px, -20px); opacity: .2; } 40% { opacity: .87; } 100% { transform: translate(-11px, 20px); opacity: .2; } }
@keyframes av-twinkle { 0%, 100% { opacity: .6; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .av-stage *, .av-star { animation: none !important; } }
:root[data-theme="dark"] .av-art { background: #2a352f; }
:root[data-theme="dark"] .av-price { background: #4a3d17; color: #f5dc9b; }
:root[data-theme="dark"] .av-price.owned { background: #24402f; color: #bfe3c9; }
:root[data-theme="dark"] .av-price.reward { background: #3b3049; color: #ddcdf0; }
@media (max-width: 760px) {
  .av-workspace { grid-template-columns: minmax(0, 1fr); }
  .av-preview { position: sticky; top: 64px; z-index: 5; padding: 10px; display: grid; grid-template-columns: 132px 1fr; gap: 6px 12px; align-items: start; }
  .av-preview-head { grid-column: 2; margin: 0; }
  .av-preview-head h2 { font-size: 1.2rem; }
  .av-stage-wrap { grid-column: 1; grid-row: 1 / span 3; }
  .av-offer, .av-actions { grid-column: 2; margin: 0; }
  .av-offer { grid-template-columns: 1fr; padding: 8px; }
  .av-actions { grid-template-columns: 1fr; gap: 6px; }
  .av-actions .button { padding-inline: 8px; font-size: .85rem; min-height: 40px; }
  .av-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .av-modes button { padding: 8px 4px; font-size: .85rem; }
  .av-svg { display: none; }
  .av-tab { font-size: .7rem; }
  .av-body { padding: 12px; }
  .av-options { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .av-kits { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .av-activities { grid-template-columns: 1fr; }
  .av-rarity { margin-left: 0; }
}
</style>
