<script setup>
import SecretCoin from "../components/SecretCoin.vue";
import { onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Icon from "../components/Icon.vue";
import PointsTag from "../components/PointsTag.vue";
import MascotGuide from "../components/MascotGuide.vue";
import { openLesson } from "../composables/useLesson";
import {
  agencies,
  call911,
  games,
  helpLines,
  lessons,
  risks,
  whoToCall,
} from "../data";

// Información: los temas abren su ventana en lugar de otra página.
// /informacion?tema=mochila abre directo esa ventana (enlaces viejos y compartidos).
// /informacion?ver=dependencias baja a "Quién te ayuda y en qué";
// ?ver=911 baja a "Cómo llamar bien al 911"; ?ver=numeros, a los números.
const route = useRoute();
const router = useRouter();
function openFromQuery(tema) {
  if (!tema) return;
  openLesson(String(tema));
  router.replace({ query: {} });
}
const anchors = {
  dependencias: "quien-te-ayuda",
  911: "buen-uso-911",
  numeros: "numeros",
};
function scrollFromQuery(ver) {
  const id = anchors[ver];
  if (!id) return;
  // Después de que el router sube la página y se acomodan las imágenes de arriba
  setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  }, 700);
}
const practice = games.find((game) => game.id === "alerta-911");
// Líneas de ayuda que no son ya una dependencia del directorio (088, Línea de la Vida, 079)
const extraLines = helpLines.filter(
  (line) => !agencies.some((agency) => agency.phones.includes(line.number)),
);
// Se espera al montaje para que la ventana (en App.vue) ya exista.
onMounted(() => {
  openFromQuery(route.query.tema);
  scrollFromQuery(route.query.ver);
});
watch(() => route.query.tema, openFromQuery);
watch(() => route.query.ver, scrollFromQuery);
const telHref = (number) => `tel:${number.replace(/\s/g, "")}`;
const officialLinks = [
  { label: "Directorio oficial del Ayuntamiento", href: "https://www.tijuana.gob.mx/emergencias/" },
  { label: "Seguridad Pública y denuncia anónima", href: "https://policia.tijuana.gob.mx/contacto.aspx" },
  { label: "Protección Civil Tijuana", href: "https://proteccioncivil.tijuana.gob.mx/" },
  { label: "Bomberos Tijuana", href: "https://bomberos.tijuana.gob.mx/" },
];
</script>
<template>
  <div class="page info-page">
    <header class="gm-hero info-hero">
      <div class="gm-hero-copy">
        <span class="gm-kicker"><Icon name="book" :size="20" /> Lo esencial</span>
        <h1>El Niño en Tijuana</h1>
        <p>Qué es, qué riesgos trae a tu colonia y cómo prepararte en familia</p>
        <ul class="gm-chips">
          <li><Icon name="book" :size="18" /> {{ lessons.length }} temas</li>
          <li><Icon name="people" :size="18" /> Para toda la familia</li>
          <li class="gm-chip-link">
            <RouterLink to="/migrantes?lang=ht" lang="ht"
              ><Icon name="book" :size="18" /> Enfòmasyon an kreyòl</RouterLink
            >
          </li>
        </ul>
      </div>
      <div class="info-hero-art">
        <img
          src="/assets/images/hero-el-nino.webp"
          alt="Ilustración de Tijuana durante la lluvia, con una ruta segura y artículos de emergencia"
          width="960"
          height="540"
        />
      </div>
    </header>

    <section aria-labelledby="titulo-temas" class="gm-section">
      <span class="cc-silhouette gm-bg-sil gm-bg-sil-1" aria-hidden="true"></span>
      <div class="gm-section-head">
        <h2 id="titulo-temas" class="section-title">Aprende lo esencial</h2>
      </div>
      <div class="gm-grid info-grid">
        <article
          v-for="(lesson, i) in lessons"
          :key="lesson.id"
          :class="['gm-card', 'cc-watermark', `tone-${lesson.tone}`]"
          :style="{ '--i': i }"
        >
          <div class="gm-art">
            <img
              :src="lesson.image"
              :alt="lesson.alt"
              width="480"
              height="270"
              :loading="i === 0 ? 'eager' : 'lazy'"
            />
            <span class="gm-number" aria-hidden="true">{{ i + 1 }}</span>
            <span class="gm-badge" aria-hidden="true"
              ><Icon :name="lesson.icon" :size="26"
            /></span>
          </div>
          <div class="gm-body">
            <PointsTag :activity-key="`lectura-${lesson.id}`" />
            <h3>{{ lesson.title }}</h3>
            <button
              class="button primary cta info-open"
              type="button"
              @click="openLesson(lesson.id)"
            >
              <Icon name="book" :size="22" /> Ver información
            </button>
          </div>
        </article>
      </div>
    </section>

    <section aria-labelledby="titulo-riesgos" class="section-space">
      <div class="section-head">
        <div>
          <h2 id="titulo-riesgos" class="section-title">
            Qué puede pasar en Tijuana
          </h2>
          <PointsTag />
        </div>
        <a
          class="button secondary"
          href="https://proteccioncivil.tijuana.gob.mx/"
          target="_blank"
          rel="noopener"
          ><Icon name="external" :size="18" /> Protección Civil Tijuana</a
        >
      </div>
      <div class="advice-grid">
        <article
          v-for="risk in risks"
          :key="risk.title"
          :class="['advice-card', 'info-card', `tone-${risk.tone}`]"
        >
          <span class="advice-icon" aria-hidden="true"
            ><Icon :name="risk.icon" :size="32"
          /></span>
          <strong>{{ risk.title }}</strong>
          <span>{{ risk.text }}</span>
        </article>
      </div>
    </section>

    <section aria-labelledby="titulo-lecturas" class="section-space">
      <div class="info-play cc-watermark lessons-invite">
        <div>
          <h2 id="titulo-lecturas" class="section-title">Lecturas cortas</h2>
          <p>Un tema en un minuto, con una pregunta al final. Riesgos, plan familiar y mochila</p>
        </div>
        <RouterLink to="/aprende" class="button primary"
          ><Icon name="book" :size="22" /> Empezar a leer</RouterLink
        >
      </div>
    </section>

    <section aria-labelledby="titulo-jugar" class="section-space">
      <div class="info-play cc-watermark">
        <MascotGuide :size="130" bubble="¡Practica conmigo!" />
        <div>
          <h2 id="titulo-jugar" class="section-title">Aprende jugando</h2>
          <p>Pon a prueba lo que aprendiste</p>
        </div>
        <RouterLink to="/juegos" class="button primary cta"
          ><Icon name="gamepad" :size="22" /> Ver los juegos</RouterLink
        >
      </div>
    </section>

    <section id="buen-uso-911" aria-labelledby="titulo-911" class="section-space agencies call-911">
      <div class="gm-section-head">
        <h2 id="titulo-911" class="section-title">Cómo llamar bien al 911</h2>
        <p class="section-lead">Una llamada clara hace que la ayuda llegue antes</p>
      </div>

      <div class="call-stats">
        <p v-for="stat in call911.stats" :key="stat.value" class="call-stat">
          <strong>{{ stat.value }}</strong>
          <span>{{ stat.label }}</span>
        </p>
        <a class="call-stats-source" :href="call911.statsSource" target="_blank" rel="noopener"
          ><Icon name="external" :size="14" /> C5 Baja California, abril de 2025</a
        >
      </div>

      <ul class="call-chips">
        <li v-for="fact in call911.facts" :key="fact.title">
          <Icon :name="fact.icon" :size="18" /> {{ fact.title }}
        </li>
      </ul>

      <ol class="call-steps call-steps-short">
        <li v-for="(step, i) in call911.steps" :key="step.title">
          <span class="call-step-n" aria-hidden="true">{{ i + 1 }}</span>
          <strong>{{ step.title }}</strong>
        </li>
      </ol>

      <details class="call-more">
        <summary>Qué no hacer, qué enseñarle a tus hijos y qué hacer si no puedes hablar</summary>
        <div class="call-columns">
          <div class="call-box call-dont">
            <h3><Icon name="close" :size="22" /> No uses el 911 para…</h3>
            <ul>
              <li v-for="item in call911.dont" :key="item">{{ item }}</li>
            </ul>
          </div>
          <div class="call-box call-kids">
            <h3><Icon name="people" :size="22" /> Enséñale a tus hijos</h3>
            <ul>
              <li v-for="item in call911.kids" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
        <div class="call-silent">
          <span class="health-icon" aria-hidden="true"><Icon name="phone" :size="24" /></span>
          <div>
            <strong>{{ call911.silent.title }}</strong>
            <p>{{ call911.silent.text }}</p>
          </div>
          <a class="button secondary" :href="call911.silent.url" target="_blank" rel="noopener"
            ><Icon name="external" :size="18" /> Ver la app</a
          >
        </div>
      </details>

      <div v-if="practice" class="call-practice">
        <p><strong>Practica antes de que pase</strong></p>
        <SecretCoin id="moneda-911" class="page-coin" />
        <a class="button primary cta" :href="practice.href" target="_blank" rel="noopener"
          ><Icon name="gamepad" :size="22" /> Jugar Alerta 911</a
        >
      </div>
    </section>

    <section id="numeros" aria-labelledby="titulo-quien-llamo" class="section-space agencies">
      <div class="gm-section-head">
        <h2 id="titulo-quien-llamo" class="section-title">¿A quién le llamo?</h2>
        <p class="section-lead">Busca lo que está pasando y toca el número</p>
      </div>
      <ul class="who-list">
        <li v-for="row in whoToCall" :key="row.situation" :class="{ 'is-911': row.number === '911' }">
          <span class="who-situation">{{ row.situation }}</span>
          <a
            class="who-call"
            :href="telHref(row.number)"
            :aria-label="`${row.situation}: llamar a ${row.who}, ${row.number}`"
            ><Icon name="phone" :size="16" />
            <span class="who-number">{{ row.number }}</span>
            <span class="who-name">{{ row.who }}</span></a
          >
        </li>
      </ul>

      <h3 id="quien-te-ayuda" class="call-subtitle directory-title">Directorio</h3>
      <div class="agency-grid directory-grid">
        <article
          v-for="agency in agencies"
          :id="`dependencia-${agency.id}`"
          :key="agency.id"
          :class="['agency-card', `agency-${agency.theme}`]"
        >
          <header class="agency-head">
            <span class="agency-icon" aria-hidden="true"
              ><Icon :name="agency.icon" :size="24"
            /></span>
            <h4>{{ agency.name }}</h4>
            <span class="agency-phones">
              <a
                v-for="number in agency.phones"
                :key="number"
                class="agency-call"
                :href="telHref(number)"
                :aria-label="`Llamar a ${agency.name}, ${number}`"
                ><Icon name="phone" :size="16" /> {{ number }}</a
              >
            </span>
          </header>
          <details class="agency-more">
            <summary>Cuándo llamarles</summary>
            <p class="agency-what">{{ agency.what }}</p>
            <ul class="agency-when">
              <li v-for="item in agency.callWhen" :key="item">
                <Icon name="check" :size="18" /> {{ item }}
              </li>
            </ul>
            <p v-if="agency.detail" class="agency-detail">{{ agency.detail }}</p>
            <p class="agency-not">
              <Icon name="info" :size="18" /> <span>{{ agency.notFor }}</span>
            </p>
            <a
              v-if="agency.source"
              class="agency-source"
              :href="agency.source"
              target="_blank"
              rel="noopener"
              ><Icon name="external" :size="16" /> Sitio oficial</a
            >
          </details>
        </article>
        <article
          v-for="line in extraLines"
          :key="line.id"
          :class="['agency-card', `agency-${line.theme}`]"
        >
          <header class="agency-head">
            <span class="agency-icon" aria-hidden="true"><Icon :name="line.icon" :size="24" /></span>
            <h4>{{ line.name }}</h4>
            <span class="agency-phones">
              <a
                class="agency-call"
                :href="telHref(line.number)"
                :aria-label="`Llamar a ${line.name}, ${line.number}${line.note ? ', ' + line.note : ''}`"
                ><Icon name="phone" :size="16" /> {{ line.number }}</a
              >
              <span v-if="line.note" class="help-note">{{ line.note }}</span>
            </span>
          </header>
          <details class="agency-more">
            <summary>Para qué sirve</summary>
            <p class="agency-what">{{ line.what }}</p>
          </details>
        </article>
      </div>
      <div class="official-links">
        <a
          v-for="link in officialLinks"
          :key="link.href"
          class="button secondary"
          :href="link.href"
          target="_blank"
          rel="noopener"
          ><Icon name="external" :size="18" /> {{ link.label }}</a
        >
      </div>
    </section>
  </div>
</template>
