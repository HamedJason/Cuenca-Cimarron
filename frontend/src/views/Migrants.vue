<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import { emergency } from "../data";
import {
  callSteps,
  cardFields,
  kit,
  languages,
  migrantSources,
  numbers,
  phrases,
  rainSteps,
  rights,
  teacherFacts,
  teacherTips,
  ui,
} from "../migrantGuide";

// Para todas las familias: español o creole haitiano.
// /migrantes?lang=ht abre en creole (para compartir por WhatsApp);
// la última elección se recuerda en este navegador.
const route = useRoute();
const router = useRouter();
const KEY = "cuenca.migrantes.lang";
function savedLang() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
const isLang = (value) => languages.some((item) => item.id === value);
const lang = ref(isLang(route.query.lang) ? route.query.lang : savedLang() || "es");
if (!isLang(lang.value)) lang.value = "es";
function setLang(id) {
  lang.value = id;
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* sin almacenamiento: solo dura esta visita */
  }
  router.replace({ query: id === "es" ? {} : { lang: id } });
}
watch(
  () => route.query.lang,
  (value) => {
    if (isLang(value)) lang.value = value;
  },
);
const t = (key) => ui[key][lang.value];
const other = computed(() => (lang.value === "es" ? "ht" : "es"));
const telHref = (number) => `tel:${number.replace(/\s/g, "")}`;

// Pronunciación de las frases con la voz del navegador, si tiene
const canSpeak = ref(false);
onMounted(() => {
  canSpeak.value = "speechSynthesis" in window;
});
function speak(text) {
  if (!canSpeak.value) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/…/g, ""));
  utterance.lang = "es-MX";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

// Tarjeta: se puede llenar en pantalla. Lo escrito solo vive en esta página
// (no se guarda ni se envía), por eso es un ref simple y no localStorage.
const card = ref(Object.fromEntries(cardFields.map((field) => [field.id, ""])));
const filled = computed(
  () => cardFields.filter((field) => card.value[field.id].trim()).length,
);
const cardDone = computed(() => filled.value === cardFields.length);
function clearCard() {
  for (const field of cardFields) card.value[field.id] = "";
}
// La tarjeta entra con una animación cuando aparece en pantalla
const cardEl = ref(null);
const cardShown = ref(false);
onMounted(() => {
  if (!("IntersectionObserver" in window)) {
    cardShown.value = true;
    return;
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        cardShown.value = true;
        observer.disconnect();
      }
    },
    { threshold: 0.25 },
  );
  if (cardEl.value) observer.observe(cardEl.value);
});

// Imprime solo la tarjeta
function printCard() {
  document.documentElement.classList.add("printing-card");
  const done = () => {
    document.documentElement.classList.remove("printing-card");
    window.removeEventListener("afterprint", done);
  };
  window.addEventListener("afterprint", done);
  window.print();
}
</script>
<template>
  <div class="page migrants-page" :lang="lang">
    <header class="gm-hero migrants-hero">
      <div class="gm-hero-copy">
        <span class="gm-kicker"><Icon name="people" :size="20" /> {{ t("kicker") }}</span>
        <h1>{{ t("title") }}</h1>
        <p>{{ t("lead") }}</p>
        <div class="lang-switch" role="group" :aria-label="t('chooseLanguage')">
          <button
            v-for="item in languages"
            :key="item.id"
            type="button"
            :lang="item.id"
            :class="['lang-option', { active: lang === item.id }]"
            :aria-pressed="lang === item.id"
            @click="setLang(item.id)"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
      <div class="info-hero-art">
        <img
          src="/assets/images/hero-el-nino.webp"
          alt=""
          width="960"
          height="540"
        />
      </div>
    </header>

    <section aria-labelledby="titulo-derechos" class="section-space">
      <div class="gm-section-head">
        <h2 id="titulo-derechos" class="section-title">{{ t("rightsTitle") }}</h2>
        <p class="section-lead">{{ t("rightsLead") }}</p>
      </div>
      <ul class="migrant-rights">
        <li v-for="right in rights" :key="right.icon" class="health-tip">
          <span class="health-icon" aria-hidden="true"><Icon :name="right.icon" :size="24" /></span>
          <strong>{{ right[lang].title }}</strong>
          <span>{{ right[lang].text }}</span>
        </li>
      </ul>
    </section>

    <section aria-labelledby="titulo-llamar" class="section-space">
      <h2 id="titulo-llamar" class="section-title">{{ t("callTitle") }}</h2>
      <ol class="call-steps migrant-steps">
        <li v-for="(step, i) in callSteps" :key="i">
          <span class="call-step-n" aria-hidden="true">{{ i + 1 }}</span>
          <span>{{ step[lang] }}</span>
        </li>
      </ol>
      <a class="button primary cta migrant-911" href="tel:911"
        ><Icon name="phone" :size="24" /> 911</a
      >
    </section>

    <section aria-labelledby="titulo-frases" class="section-space">
      <div class="gm-section-head">
        <h2 id="titulo-frases" class="section-title">{{ t("phrasesTitle") }}</h2>
        <p class="section-lead">{{ t("phrasesLead") }}</p>
      </div>
      <ul class="phrase-list">
        <li v-for="phrase in phrases" :key="phrase.es">
          <div>
            <strong lang="es">{{ phrase.es }}</strong>
            <span lang="ht">{{ phrase.ht }}</span>
          </div>
          <button
            v-if="canSpeak"
            type="button"
            class="phrase-listen"
            :aria-label="`${t('listen')}: ${phrase.es}`"
            @click="speak(phrase.es)"
          >
            <Icon name="radio" :size="18" /> {{ t("listen") }}
          </button>
        </li>
      </ul>
    </section>

    <section aria-labelledby="titulo-lluvia" class="section-space">
      <h2 id="titulo-lluvia" class="section-title">{{ t("rainTitle") }}</h2>
      <div class="migrant-rain">
        <article v-for="step in rainSteps" :key="step.icon" class="migrant-rain-card">
          <h3><Icon :name="step.icon" :size="26" /> {{ step[lang].title }}</h3>
          <ul>
            <li v-for="item in step[lang].items" :key="item">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>

    <section aria-labelledby="titulo-botiquin" class="section-space">
      <div class="gm-section-head">
        <h2 id="titulo-botiquin" class="section-title">{{ t("kitTitle") }}</h2>
        <p class="section-lead">{{ t("kitLead") }}</p>
      </div>
      <ul class="migrant-kit">
        <li v-for="item in kit" :key="item.es">
          <Icon name="medical" :size="18" />
          <span>
            <strong>{{ item[lang] }}</strong>
            <small :lang="other">{{ item[other] }}</small>
          </span>
        </li>
      </ul>
    </section>

    <section aria-labelledby="titulo-numeros-m" class="section-space">
      <h2 id="titulo-numeros-m" class="section-title">{{ t("numbersTitle") }}</h2>
      <div class="migrant-numbers">
        <a
          v-for="item in numbers"
          :key="item.number"
          :href="telHref(item.number)"
          :class="['migrant-number', { 'is-911': item.number === '911' }]"
        >
          <Icon :name="item.icon" :size="26" />
          <strong>{{ item.number }}</strong>
          <span>{{ item[lang] }}</span>
        </a>
      </div>
      <details class="migrant-shelters">
        <summary><Icon name="home" :size="20" /> {{ t("shelters") }}</summary>
        <ul>
          <li v-for="shelter in emergency.shelters" :key="shelter.name">
            <strong>{{ shelter.name }}</strong>
            <span>{{ shelter.address }}</span>
          </li>
        </ul>
        <a :href="emergency.sheltersUrl" target="_blank" rel="noopener"
          ><Icon name="external" :size="16" /> proteccioncivil.tijuana.gob.mx</a
        >
      </details>
    </section>

    <section aria-labelledby="titulo-tarjeta" class="section-space migrant-card-section">
      <div class="gm-section-head">
        <h2 id="titulo-tarjeta" class="section-title">{{ t("cardTitle") }}</h2>
        <p class="section-lead">{{ t("cardLead") }}</p>
        <p class="migrant-card-hint"><Icon name="spark" :size="18" /> {{ t("cardHint") }}</p>
      </div>

      <div
        class="migrant-card-progress"
        role="status"
        :class="{ done: cardDone }"
      >
        <span class="migrant-card-bar" aria-hidden="true"
          ><span :style="{ width: `${(filled / cardFields.length) * 100}%` }"></span
        ></span>
        <span v-if="cardDone" class="migrant-card-done"
          ><Icon name="check" :size="18" /> {{ t("cardDone") }}</span
        >
        <span v-else>{{ filled }} / {{ cardFields.length }} {{ t("cardProgress") }}</span>
      </div>

      <div ref="cardEl" :class="['migrant-card', { shown: cardShown, complete: cardDone }]">
        <div class="migrant-card-head">
          <span>Si hay peligro llama al · Si gen danje rele</span>
          <a href="tel:911" class="migrant-card-911" aria-label="Llamar al 911">911</a>
        </div>
        <div class="migrant-card-fields">
          <label
            v-for="(field, i) in cardFields"
            :key="field.id"
            :class="['migrant-card-row', { 'is-filled': card[field.id].trim() }]"
            :style="{ '--i': i }"
          >
            <span class="migrant-card-label"
              ><Icon :name="field.icon" :size="16" class="migrant-card-icon" />
              <span
                >{{ field.es }} <span lang="ht" class="migrant-card-ht">/ {{ field.ht }}</span></span
              ></span
            >
            <span class="migrant-card-input">
              <input
                v-model="card[field.id]"
                type="text"
                autocomplete="off"
                maxlength="80"
                :aria-label="lang === 'es' ? field.es : field.ht"
                :list="field.list ? 'refugios-tarjeta' : undefined"
              />
              <Icon name="check" :size="16" class="migrant-card-ok" />
            </span>
          </label>
        </div>
        <datalist id="refugios-tarjeta">
          <option v-for="shelter in emergency.shelters" :key="shelter.name" :value="shelter.name" />
        </datalist>
        <p class="migrant-card-foot">
          Protección Civil · Pwoteksyon Sivil: 664 683 9112 — Línea de la Vida · Liy Lavi: 800 911 2000
        </p>
      </div>

      <div class="migrant-card-actions">
        <button
          type="button"
          :class="['button', 'primary', 'cta', 'migrant-print', { ready: cardDone }]"
          @click="printCard"
        >
          <Icon name="print" :size="22" /> {{ t("print") }}
        </button>
        <button v-if="filled" type="button" class="button secondary" @click="clearCard">
          <Icon name="reset" :size="20" /> {{ t("clear") }}
        </button>
      </div>
      <p class="migrant-card-privacy"><Icon name="eye" :size="16" /> {{ t("cardPrivacy") }}</p>
    </section>

    <section aria-labelledby="titulo-maestros" class="section-space migrant-teachers" lang="es">
      <div class="gm-section-head">
        <h2 id="titulo-maestros" class="section-title">Para maestras y maestros</h2>
        <p class="section-lead">
          Cómo usar esta página con alumnos que llegan de Haití y de otros países
        </p>
      </div>
      <div class="call-stats migrant-facts">
        <p v-for="fact in teacherFacts" :key="fact.value" class="call-stat">
          <strong>{{ fact.value }}</strong>
          <span>{{ fact.label }}</span>
        </p>
      </div>
      <ul class="migrant-tips">
        <li v-for="tip in teacherTips" :key="tip">
          <Icon name="check" :size="18" /> <span>{{ tip }}</span>
        </li>
      </ul>
      <div class="official-links">
        <a
          v-for="source in migrantSources"
          :key="source.href"
          class="button secondary"
          :href="source.href"
          target="_blank"
          rel="noopener"
          ><Icon name="external" :size="18" /> {{ source.label }}</a
        >
        <RouterLink class="button secondary" to="/informacion"
          ><Icon name="book" :size="18" /> {{ t("more") }}</RouterLink
        >
      </div>
    </section>
  </div>
</template>
