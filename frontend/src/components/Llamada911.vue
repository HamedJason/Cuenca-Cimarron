<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import Icon from "./Icon.vue";
import AnimClip from "./AnimClip.vue";
import SecretCoin from "./SecretCoin.vue";
import { call911, callGuide, emergencyQuiz, games } from "../data";

// Guía de la llamada: un paso a la vez con su animación
const step = ref(0);
const current = computed(() => callGuide[step.value]);
const isLast = computed(() => step.value === callGuide.length - 1);
function go(i) {
  step.value = (i + callGuide.length) % callGuide.length;
}
function onKey(event) {
  if (event.key === "ArrowRight") go(step.value + 1);
  if (event.key === "ArrowLeft" && step.value > 0) go(step.value - 1);
}

// ¿Es una emergencia? Sí o No con respuesta inmediata
const qi = ref(0);
const answer = ref(null);
const hits = ref(0);
const finished = ref(false);
const question = computed(() => emergencyQuiz[qi.value]);
const right = computed(() => answer.value !== null && answer.value === question.value.yes);
function pick(yes) {
  if (answer.value !== null) return;
  answer.value = yes;
  if (yes === question.value.yes) hits.value += 1;
}
function nextQuestion() {
  if (qi.value === emergencyQuiz.length - 1) {
    finished.value = true;
    return;
  }
  qi.value += 1;
  answer.value = null;
}
function restartQuiz() {
  qi.value = 0;
  answer.value = null;
  hits.value = 0;
  finished.value = false;
}

// Aprende tu dirección: solo se guarda en este navegador, nunca en el servidor
const ADDRESS_KEY = "cuenca.miDireccion";
const address = reactive({ calle: "", numero: "", colonia: "", cerca: "" });
try {
  Object.assign(address, JSON.parse(localStorage.getItem(ADDRESS_KEY) || "{}"));
} catch {
  // Sin almacenamiento la tarjeta funciona igual, solo no se recuerda
}
watch(address, (value) => {
  try {
    if (Object.values(value).some((v) => v.trim())) localStorage.setItem(ADDRESS_KEY, JSON.stringify(value));
    else localStorage.removeItem(ADDRESS_KEY);
  } catch {
    // Igual que arriba
  }
});
const sentence = computed(() => {
  const parts = [];
  if (address.calle.trim()) parts.push(`Vivo en la calle ${address.calle.trim()}`);
  if (address.numero.trim()) parts.push(`número ${address.numero.trim()}`);
  if (address.colonia.trim()) parts.push(`colonia ${address.colonia.trim()}`);
  if (address.cerca.trim()) parts.push(`cerca de ${address.cerca.trim()}`);
  return parts.join(", ");
});
const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window;
const speaking = ref(false);
function sayIt() {
  if (!canSpeak || !sentence.value) return;
  window.speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(sentence.value);
  voice.lang = "es-MX";
  voice.rate = 0.9;
  voice.onend = () => (speaking.value = false);
  voice.onerror = () => (speaking.value = false);
  speaking.value = true;
  window.speechSynthesis.speak(voice);
}
function clearAddress() {
  Object.assign(address, { calle: "", numero: "", colonia: "", cerca: "" });
}
onBeforeUnmount(() => {
  if (canSpeak) window.speechSynthesis.cancel();
});

const practice = games.find((game) => game.id === "alerta-911");
</script>

<template>
  <section id="buen-uso-911" aria-labelledby="titulo-911" class="section-space call-911 c911">
    <div class="gm-section-head">
      <h2 id="titulo-911" class="section-title">Tu llamada al 911, paso a paso</h2>
    </div>

    <div class="c911-guide" role="group" aria-roledescription="carrusel" aria-label="Pasos de la llamada al 911" @keydown="onKey">
      <AnimClip :key="step" :name="`llamada-paso-${step + 1}`" class="c911-clip" :label="current.alt" />
      <div class="c911-step" aria-live="polite">
        <span class="c911-n" aria-hidden="true">{{ step + 1 }}</span>
        <p class="c911-count">Paso {{ step + 1 }} de {{ callGuide.length }}</p>
        <h3>{{ current.title }}</h3>
        <p class="c911-line">{{ current.text }}</p>
      </div>
      <div class="c911-controls">
        <button class="button secondary c911-prev" type="button" :disabled="step === 0" @click="go(step - 1)">
          <Icon name="chevronLeft" :size="20" /> Anterior
        </button>
        <div class="c911-dots">
          <button
            v-for="(item, i) in callGuide"
            :key="item.title"
            type="button"
            :class="['c911-dot', { 'is-on': i === step }]"
            :aria-label="`Paso ${i + 1}: ${item.title}`"
            :aria-current="i === step ? 'step' : undefined"
            @click="go(i)"
          ></button>
        </div>
        <button class="button primary c911-next" type="button" @click="go(step + 1)">
          <template v-if="isLast"><Icon name="reset" :size="20" /> Otra vez</template>
          <template v-else>Siguiente <Icon name="chevron" :size="20" /></template>
        </button>
      </div>
    </div>

    <div class="c911-cards">
      <article class="c911-card c911-quiz">
        <h3><Icon name="bell" :size="26" /> ¿Es una emergencia?</h3>
        <template v-if="!finished">
          <div class="c911-quiz-q">
            <span class="c911-bigicon" aria-hidden="true"><Icon :name="question.icon" :size="56" /></span>
            <p>{{ question.text }}</p>
          </div>
          <div class="c911-quiz-buttons">
            <button
              type="button"
              :class="['c911-yes', { 'is-picked': answer === true }]"
              :disabled="answer !== null"
              @click="pick(true)"
            >
              <Icon name="phone" :size="24" /> Sí, llamo
            </button>
            <button
              type="button"
              :class="['c911-no', { 'is-picked': answer === false }]"
              :disabled="answer !== null"
              @click="pick(false)"
            >
              <Icon name="close" :size="24" /> No
            </button>
          </div>
          <div v-if="answer !== null" :class="['c911-feedback', right ? 'is-right' : 'is-wrong']" role="status">
            <Icon :name="right ? 'check' : 'info'" :size="22" />
            <span v-if="question.yes">{{ right ? "¡Muy bien! Llama al 911" : "Sí es. Llama al 911" }}</span>
            <span v-else>{{ right ? "¡Muy bien! No es una emergencia" : "No es una emergencia. No llames" }}</span>
            <button class="button secondary" type="button" @click="nextQuestion">Siguiente</button>
          </div>
          <p class="c911-score">{{ qi + 1 }} de {{ emergencyQuiz.length }}</p>
        </template>
        <div v-else class="c911-done" role="status">
          <span class="c911-bigicon is-star" aria-hidden="true"><Icon name="star" :size="56" /></span>
          <p>Acertaste {{ hits }} de {{ emergencyQuiz.length }}</p>
          <button class="button primary" type="button" @click="restartQuiz">
            <Icon name="reset" :size="20" /> Jugar otra vez
          </button>
        </div>
      </article>

      <article class="c911-card c911-wait">
        <h3><Icon name="hourglass" :size="26" /> No cuelgues</h3>
        <div class="c911-line-up" aria-hidden="true">
          <span class="is-you"><Icon name="phone" :size="30" /></span>
          <span><Icon name="phone" :size="24" /></span>
          <span><Icon name="phone" :size="24" /></span>
          <span><Icon name="phone" :size="24" /></span>
        </div>
        <p>Si cuelgas, vuelves al final de la fila. Espera aunque tarden</p>
      </article>

      <article class="c911-card c911-address">
        <h3><Icon name="home" :size="26" /> Aprende tu dirección</h3>
        <div class="c911-fields">
          <label><span>Calle</span><input v-model="address.calle" type="text" autocomplete="off" maxlength="60" /></label>
          <label><span>Número</span><input v-model="address.numero" type="text" inputmode="numeric" autocomplete="off" maxlength="12" /></label>
          <label><span>Colonia</span><input v-model="address.colonia" type="text" autocomplete="off" maxlength="60" /></label>
          <label
            ><span>Algo que se ve cerca</span
            ><input v-model="address.cerca" type="text" autocomplete="off" maxlength="60" placeholder="Una tienda o un parque"
          /></label>
        </div>
        <p v-if="sentence" class="c911-say">“{{ sentence }}”</p>
        <p v-else class="c911-say is-empty">Llénala y practica decirla en voz alta</p>
        <div class="c911-address-actions">
          <button v-if="canSpeak" class="button primary" type="button" :disabled="!sentence || speaking" @click="sayIt">
            <Icon name="speaker" :size="20" /> Escúchala
          </button>
          <button v-if="sentence" class="button secondary" type="button" @click="clearAddress">
            <Icon name="reset" :size="20" /> Borrar
          </button>
        </div>
        <p class="c911-private"><Icon name="eyeOff" :size="16" /> Se queda solo en este aparato</p>
      </article>

      <div class="c911-side">
      <RouterLink to="/directorio" class="c911-card c911-directory">
        <span class="c911-bigicon" aria-hidden="true"><Icon name="contacts" :size="64" /></span>
        <span class="c911-directory-title">Directorio</span>
        <span>Todos los números de emergencia</span>
      </RouterLink>

      <article class="c911-card c911-silent">
        <h3><Icon name="phone" :size="26" /> Si no puedes hablar</h3>
        <p>Usa el chat de la app 911 Móvil BC</p>
        <a class="button secondary" :href="call911.silent.url" target="_blank" rel="noopener"
          ><Icon name="external" :size="18" /> Ver la app</a
        >
      </article>
      </div>
    </div>

    <div v-if="practice" class="call-practice">
      <p><strong>Practica antes de que pase</strong></p>
      <SecretCoin id="moneda-911" class="page-coin" />
      <a class="button primary cta" :href="practice.href" target="_blank" rel="noopener"
        ><Icon name="gamepad" :size="22" /> Jugar Alerta 911</a
      >
    </div>
  </section>
</template>
